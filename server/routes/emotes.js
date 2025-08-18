const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get BTTV emotes for a specific channel
router.get('/bttv/:channel', async (req, res) => {
  try {
    const { channel } = req.params;
    
    // First get channel ID from Twitch API
    const twitchResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${channel}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`
      }
    });

    if (!twitchResponse.data.data || twitchResponse.data.data.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const channelId = twitchResponse.data.data[0].id;

    // Get BTTV emotes for the channel
    const bttvResponse = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`);
    
    const emotes = {
      channelEmotes: bttvResponse.data.channelEmotes || [],
      sharedEmotes: bttvResponse.data.sharedEmotes || []
    };

    // Format emotes for frontend
    const formattedEmotes = [
      ...emotes.channelEmotes.map(emote => ({
        id: emote.id,
        name: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        type: 'bttv-channel'
      })),
      ...emotes.sharedEmotes.map(emote => ({
        id: emote.id,
        name: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        type: 'bttv-shared'
      }))
    ];

    res.json({
      channel,
      channelId,
      emotes: formattedEmotes,
      count: formattedEmotes.length
    });

  } catch (error) {
    console.error('Error fetching BTTV emotes:', error);
    if (error.response && error.response.status === 404) {
      res.json({
        channel: req.params.channel,
        emotes: [],
        count: 0,
        message: 'No BTTV emotes found for this channel'
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch BTTV emotes' });
    }
  }
});

// Get global BTTV emotes
router.get('/bttv/global', async (req, res) => {
  try {
    const response = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
    
    const formattedEmotes = response.data.map(emote => ({
      id: emote.id,
      name: emote.code,
      url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
      type: 'bttv-global'
    }));

    res.json({
      emotes: formattedEmotes,
      count: formattedEmotes.length
    });

  } catch (error) {
    console.error('Error fetching global BTTV emotes:', error);
    res.status(500).json({ error: 'Failed to fetch global BTTV emotes' });
  }
});

// Get Twitch global emotes
router.get('/twitch/global', async (req, res) => {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/chat/emotes/global', {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`
      }
    });

    const formattedEmotes = response.data.data.map(emote => ({
      id: emote.id,
      name: emote.name,
      url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
      type: 'twitch-global'
    }));

    res.json({
      emotes: formattedEmotes,
      count: formattedEmotes.length
    });

  } catch (error) {
    console.error('Error fetching Twitch global emotes:', error);
    res.status(500).json({ error: 'Failed to fetch Twitch global emotes' });
  }
});

// Get all emotes for channels (Twitch + BTTV)
router.post('/all', async (req, res) => {
  try {
    const { channels } = req.body;
    
    if (!channels || !Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels array is required' });
    }

    const allEmotes = {
      twitch: [],
      bttv: []
    };

    // Get global emotes
    try {
      const [twitchGlobal, bttvGlobal] = await Promise.all([
        axios.get('https://api.twitch.tv/helix/chat/emotes/global', {
          headers: {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`
          }
        }),
        axios.get('https://api.betterttv.net/3/cached/emotes/global')
      ]);

      allEmotes.twitch = twitchGlobal.data.data.map(emote => ({
        id: emote.id,
        name: emote.name,
        url: `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`,
        type: 'twitch-global',
        channel: 'global'
      }));

      allEmotes.bttv = bttvGlobal.data.map(emote => ({
        id: emote.id,
        name: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        type: 'bttv-global',
        channel: 'global'
      }));

    } catch (globalError) {
      console.error('Error fetching global emotes:', globalError);
    }

    // Get channel-specific BTTV emotes
    for (const channel of channels) {
      try {
        const response = await axios.get(`http://localhost:${process.env.PORT || 5001}/api/emotes/bttv/${channel}`);
        if (response.data.emotes) {
          allEmotes.bttv.push(...response.data.emotes.map(emote => ({
            ...emote,
            channel
          })));
        }
      } catch (channelError) {
        console.log(`No BTTV emotes found for channel: ${channel}`);
      }
    }

    res.json({
      channels,
      emotes: allEmotes,
      totalCount: allEmotes.twitch.length + allEmotes.bttv.length
    });

  } catch (error) {
    console.error('Error fetching all emotes:', error);
    res.status(500).json({ error: 'Failed to fetch emotes' });
  }
});

module.exports = router;
