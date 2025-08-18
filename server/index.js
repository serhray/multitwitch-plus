const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const TwitchChatService = require('./services/twitchChat');

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

// Middleware
app.use(cors());
app.use(express.json());
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

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
