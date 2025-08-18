const express = require('express');
const axios = require('axios');
const router = express.Router();

// Twitch API base URL
const TWITCH_API_URL = 'https://api.twitch.tv/helix';

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

// Get Twitch OAuth token
async function getAccessToken() {
  try {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const response = await axios.post('https://id.twitch.tv/oauth2/token', {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    });
    
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Twitch token:', error);
    throw error;
  }
}

// Legacy function for compatibility
async function getTwitchToken() {
  return await getAccessToken();
}

// Get stream information for multiple channels
router.post('/streams', async (req, res) => {
  try {
    const { channels } = req.body;
    const token = await getTwitchToken();
    
    const userLogins = channels.join('&user_login=');
    const response = await axios.get(`${TWITCH_API_URL}/streams?user_login=${userLogins}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    // Get user info for offline channels
    const userResponse = await axios.get(`${TWITCH_API_URL}/users?login=${userLogins}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const streamData = response.data.data.map(stream => ({
      id: stream.id,
      user_id: stream.user_id,
      user_login: stream.user_login,
      user_name: stream.user_name,
      game_id: stream.game_id,
      game_name: stream.game_name,
      type: stream.type,
      title: stream.title,
      viewer_count: stream.viewer_count,
      started_at: stream.started_at,
      language: stream.language,
      thumbnail_url: stream.thumbnail_url,
      tag_ids: stream.tag_ids,
      is_mature: stream.is_mature,
      is_live: true
    }));

    // Add offline channels
    const liveChannels = streamData.map(s => s.user_login);
    const offlineChannels = channels.filter(channel => !liveChannels.includes(channel));
    
    offlineChannels.forEach(channel => {
      const userInfo = userResponse.data.data.find(u => u.login === channel);
      if (userInfo) {
        streamData.push({
          user_id: userInfo.id,
          user_login: userInfo.login,
          user_name: userInfo.display_name,
          profile_image_url: userInfo.profile_image_url,
          is_live: false
        });
      }
    });

    res.json({ streams: streamData });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch stream data' });
  }
});

// Validate streamer and get status
router.get('/validate/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const token = await getAccessToken();

    // Get user info first
    const userResponse = await axios.get(`${TWITCH_API_URL}/users?login=${username}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.data.data.length) {
      return res.status(404).json({ 
        exists: false,
        isLive: false,
        error: 'não existe um streamer com esse nome'
      });
    }

    const user = userResponse.data.data[0];

    // Get stream info
    const streamResponse = await axios.get(`${TWITCH_API_URL}/streams?user_login=${username}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const streamData = streamResponse.data.data[0];
    const isLive = !!streamData;

    if (!isLive) {
      return res.status(400).json({
        exists: true,
        isLive: false,
        error: 'streamer não está online no momento',
        user: {
          login: user.login,
          display_name: user.display_name,
          profile_image_url: user.profile_image_url
        }
      });
    }

    res.json({
      exists: true,
      isLive: true,
      user: {
        id: user.id,
        login: user.login,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url
      },
      stream: {
        id: streamData.id,
        title: streamData.title,
        game_name: streamData.game_name,
        viewer_count: streamData.viewer_count,
        started_at: streamData.started_at,
        thumbnail_url: streamData.thumbnail_url?.replace('{width}', '320').replace('{height}', '180')
      }
    });
  } catch (error) {
    console.error('Error validating streamer:', error);
    res.status(500).json({ 
      exists: false,
      isLive: false,
      error: 'erro ao verificar streamer'
    });
  }
});

// Get individual stream info
router.get('/streams/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!accessToken) {
      await getAccessToken();
    }

    // Get user info first
    const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.data.data.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResponse.data.data[0];

    // Get stream info
    const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const streamData = streamResponse.data.data[0];
    
    const result = {
      user_id: user.id,
      user_name: user.login,
      display_name: user.display_name,
      profile_image_url: user.profile_image_url,
      is_live: !!streamData,
      viewer_count: streamData ? streamData.viewer_count : 0,
      game_name: streamData ? streamData.game_name : null,
      game_id: streamData ? streamData.game_id : null,
      title: streamData ? streamData.title : null,
      started_at: streamData ? streamData.started_at : null,
      thumbnail_url: streamData ? streamData.thumbnail_url?.replace('{width}', '320').replace('{height}', '180') : null,
      language: streamData ? streamData.language : user.broadcaster_type || 'pt',
      tag_ids: streamData ? streamData.tag_ids : []
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching stream info:', error);
    
    // Fallback to mock data if API fails
    const mockData = {
      user_name: req.params.username,
      display_name: req.params.username.charAt(0).toUpperCase() + req.params.username.slice(1),
      viewer_count: Math.floor(Math.random() * 50000) + 1000,
      game_name: ['Counter-Strike 2', 'League of Legends', 'Valorant', 'Just Chatting'][Math.floor(Math.random() * 4)],
      title: `${req.params.username} está jogando ao vivo!`,
      started_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
      is_live: Math.random() > 0.2,
      thumbnail_url: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${req.params.username}-320x180.jpg`,
      profile_image_url: `https://static-cdn.jtvnw.net/jtv_user_pictures/${req.params.username}-profile_image-300x300.png`
    };

    res.json(mockData);
  }
});

// Get chat messages for a channel (using Twitch IRC)
router.get('/chat/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    // This would typically connect to Twitch IRC
    // For now, return a placeholder response
    res.json({ 
      channel,
      messages: [],
      status: 'Chat connection would be established via WebSocket'
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat data' });
  }
});

// Get channel analytics and activity score
router.get('/analytics/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    const token = await getTwitchToken();
    
    // Get recent clips to determine activity
    const clipsResponse = await axios.get(`${TWITCH_API_URL}/clips?broadcaster_id=${channel}&first=20`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    // Calculate activity score based on clips, views, etc.
    const clips = clipsResponse.data.data;
    const activityScore = clips.reduce((score, clip) => {
      const age = (Date.now() - new Date(clip.created_at).getTime()) / (1000 * 60 * 60); // hours
      const viewScore = clip.view_count / Math.max(age, 1); // views per hour
      return score + viewScore;
    }, 0);

    res.json({
      channel,
      activityScore,
      recentClips: clips.length,
      topClip: clips[0] || null
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Search for streamers
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const token = await getTwitchToken();
    
    const response = await axios.get(`${TWITCH_API_URL}/search/channels?query=${encodeURIComponent(query)}&first=20`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    res.json({ channels: response.data.data });
  } catch (error) {
    console.error('Error searching channels:', error);
    res.status(500).json({ error: 'Failed to search channels' });
  }
});

module.exports = router;
