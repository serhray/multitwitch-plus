// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "https://multitwitch-plus.vercel.app"],
  credentials: true
}));

app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Multitwitch+ API is running' });
});

// Basic Twitch validation endpoint
app.get('/api/twitch/validate/:channel', async (req, res) => {
  const { channel } = req.params;
  
  try {
    // Simple validation - in production you'd call Twitch API
    res.json({
      exists: true,
      isLive: true,
      channel: channel.toLowerCase()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate channel' });
  }
});

// Export for Vercel
module.exports = app;
