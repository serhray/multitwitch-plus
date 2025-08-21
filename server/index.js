const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const TwitchChatService = require('./services/twitchChat');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'multitwitch-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;
// Force restart - updated

// Initialize Twitch Chat Service
const twitchChatService = new TwitchChatService(io);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https://api.twitch.tv", "https://id.twitch.tv"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      'https://your-domain.vercel.app'
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Import routes
const twitchRoutes = require('./routes/twitch');
const roomRoutes = require('./routes/rooms');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const emoteRoutes = require('./routes/emotes');

// Use routes
app.use('/api/twitch', twitchRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/emotes', emoteRoutes);
app.use('/auth', authRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for watch parties
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', socket.id);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  // Handle chat messages (room chat)
  socket.on('chat-message', (data) => {
    io.to(data.roomId).emit('chat-message', {
      id: `${socket.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message: data.message,
      username: data.username,
      timestamp: new Date(),
      channel: data.channel || 'room-chat'
    });
  });

  // Join Twitch channel chat
  socket.on('join-twitch-chat', async (channelName) => {
    try {
      await twitchChatService.connect();
      const success = await twitchChatService.joinChannel(channelName);
      socket.emit('twitch-chat-status', {
        channel: channelName,
        status: success ? 'connected' : 'failed',
        message: success ? `Connected to ${channelName} chat` : `Failed to connect to ${channelName} chat`
      });
    } catch (error) {
      console.error('Error joining Twitch chat:', error);
      socket.emit('twitch-chat-status', {
        channel: channelName,
        status: 'error',
        message: `Error connecting to ${channelName}: ${error.message}`
      });
    }
  });

  // Leave Twitch channel chat
  socket.on('leave-twitch-chat', async (channelName) => {
    try {
      const success = await twitchChatService.leaveChannel(channelName);
      socket.emit('twitch-chat-status', {
        channel: channelName,
        status: success ? 'disconnected' : 'failed',
        message: success ? `Disconnected from ${channelName} chat` : `Failed to disconnect from ${channelName} chat`
      });
    } catch (error) {
      console.error('Error leaving Twitch chat:', error);
    }
  });

  // Handle stream focus voting
  socket.on('vote-focus', (data) => {
    io.to(data.roomId).emit('vote-focus', {
      streamId: data.streamId,
      userId: socket.id
    });
  });

  // Handle audio control changes
  socket.on('audio-control', (data) => {
    io.to(data.roomId).emit('audio-control', {
      streamId: data.streamId,
      action: data.action, // 'focus', 'mute', 'volume'
      value: data.value
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize Twitch Chat Service on server start
twitchChatService.connect().then(() => {
  console.log('Twitch Chat Service initialized');
}).catch((error) => {
  console.error('Failed to initialize Twitch Chat Service:', error);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
