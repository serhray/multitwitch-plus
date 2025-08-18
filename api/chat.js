// Chat API endpoint for Vercel
const tmi = require('tmi.js');

let chatClient = null;
let connectedChannels = new Set();

// Initialize TMI client
function initChatClient() {
  if (!chatClient) {
    chatClient = new tmi.Client({
      options: { debug: false },
      connection: {
        reconnect: true,
        secure: true
      },
      channels: []
    });
  }
  return chatClient;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;
  
  try {
    if (method === 'GET' && query.action === 'connect') {
      const { channels } = query;
      
      if (!channels) {
        return res.status(400).json({ error: 'Channels parameter required' });
      }

      const channelList = channels.split(',').map(ch => ch.trim().toLowerCase());
      
      // For serverless, we'll return a success response
      // Real-time chat would need WebSocket or Server-Sent Events
      res.json({ 
        success: true, 
        message: 'Chat connection simulated',
        channels: channelList
      });
      return;
    }

    if (method === 'GET' && query.action === 'messages') {
      // Return mock messages for now
      res.json({
        messages: [
          {
            id: Date.now(),
            username: 'viewer1',
            message: 'Hello from chat!',
            channel: query.channel || 'general',
            timestamp: new Date().toISOString()
          }
        ]
      });
      return;
    }

    res.status(404).json({ error: 'Chat endpoint not found' });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
