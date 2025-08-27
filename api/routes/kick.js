const express = require('express');
const axios = require('axios');
const { query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateKickQuery = [
  query('channel').optional().isString(),
  query('q').optional().isString()
];

// Kick API base URL
const KICK_API_BASE = 'https://kick.com/api/v1';

// Helper function to make Kick API requests
const makeKickRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${KICK_API_BASE}${endpoint}`, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Kick API error:', error.message);
    throw error;
  }
};

// Validate if a Kick streamer exists and get basic info
router.get('/validate-streamer', validateKickQuery, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { channel } = req.query;
    
    if (!channel) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const channelData = await makeKickRequest(`/channels/${channel}`);
    
    if (!channelData) {
      return res.status(404).json({ 
        error: 'Streamer não encontrado',
        exists: false 
      });
    }

    res.json({
      success: true,
      exists: true,
      channel: {
        id: channelData.id,
        name: channelData.user.username,
        displayName: channelData.user.username,
        followers: channelData.followers_count,
        verified: channelData.verified,
        avatar: channelData.user.profile_pic,
        banner: channelData.user.banner_image,
        description: channelData.user.bio,
        platform: 'kick'
      }
    });

  } catch (error) {
    console.error('Kick validation error:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ 
        error: 'Streamer não encontrado',
        exists: false 
      });
    }

    res.status(500).json({ 
      error: 'Erro ao validar streamer',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

// Search Kick channels
router.get('/search-channels', validateKickQuery, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const searchData = await makeKickRequest('/search/channels', { query: q });
    
    const channels = searchData.data.map(channel => ({
      id: channel.id,
      name: channel.user.username,
      displayName: channel.user.username,
      followers: channel.followers_count,
      verified: channel.verified,
      avatar: channel.user.profile_pic,
      banner: channel.user.banner_image,
      description: channel.user.bio,
      platform: 'kick'
    }));

    res.json({
      success: true,
      channels,
      total: searchData.data.length
    });

  } catch (error) {
    console.error('Kick search error:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar canais',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

// Get Kick stream info
router.get('/stream-info', validateKickQuery, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { channel } = req.query;
    
    if (!channel) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const streamData = await makeKickRequest(`/channels/${channel}/stream`);
    
    if (!streamData || !streamData.livestream) {
      return res.json({
        success: true,
        isLive: false,
        channel: channel,
        platform: 'kick'
      });
    }

    const livestream = streamData.livestream;
    
    res.json({
      success: true,
      isLive: true,
      channel: channel,
      platform: 'kick',
      stream: {
        id: livestream.id,
        title: livestream.session_title,
        game: livestream.categories?.[0]?.name || 'Just Chatting',
        viewers: livestream.viewer_count,
        startedAt: livestream.created_at,
        thumbnail: livestream.thumbnail?.url,
        duration: livestream.duration,
        isMature: livestream.is_mature
      }
    });

  } catch (error) {
    console.error('Kick stream info error:', error);
    
    if (error.response && error.response.status === 404) {
      return res.json({
        success: true,
        isLive: false,
        channel: req.query.channel,
        platform: 'kick'
      });
    }

    res.status(500).json({ 
      error: 'Erro ao obter informações do stream',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

// Get multiple Kick streams info
router.post('/streams-info', async (req, res) => {
  try {
    const { channels } = req.body;
    
    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels array is required' });
    }

    const streamsInfo = [];
    
    for (const channel of channels) {
      try {
        const streamData = await makeKickRequest(`/channels/${channel}/stream`);
        
        if (streamData && streamData.livestream) {
          const livestream = streamData.livestream;
          streamsInfo.push({
            channel: channel,
            platform: 'kick',
            isLive: true,
            stream: {
              id: livestream.id,
              title: livestream.session_title,
              game: livestream.categories?.[0]?.name || 'Just Chatting',
              viewers: livestream.viewer_count,
              startedAt: livestream.created_at,
              thumbnail: livestream.thumbnail?.url,
              duration: livestream.duration,
              isMature: livestream.is_mature
            }
          });
        } else {
          streamsInfo.push({
            channel: channel,
            platform: 'kick',
            isLive: false
          });
        }
      } catch (error) {
        console.error(`Error fetching stream info for ${channel}:`, error);
        streamsInfo.push({
          channel: channel,
          platform: 'kick',
          isLive: false,
          error: 'Erro ao obter informações'
        });
      }
    }

    res.json({
      success: true,
      streams: streamsInfo
    });

  } catch (error) {
    console.error('Kick streams info error:', error);
    res.status(500).json({ 
      error: 'Erro ao obter informações dos streams',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor'
    });
  }
});

module.exports = router;

