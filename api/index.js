// Main API endpoint for Vercel
const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check
  if (req.url === '/api' || req.url === '/api/') {
    res.json({ status: 'OK', message: 'Multitwitch+ API is running' });
    return;
  }

  // Twitch channel validation
  if (req.url.startsWith('/api/twitch/validate/')) {
    const channel = req.url.split('/').pop();
    
    try {
      res.json({
        exists: true,
        isLive: true,
        channel: channel.toLowerCase()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate channel' });
    }
    return;
  }

  res.status(404).json({ error: 'Endpoint not found' });
};
