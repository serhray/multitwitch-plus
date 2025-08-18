// Emotes API endpoint for Vercel
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

  const { query, body, method } = req;
  
  try {
    // Handle all emotes request
    if (query.type === 'all' && method === 'POST') {
      const { channels } = body || {};
      let allEmotes = {};

      // Get BTTV global emotes
      try {
        const globalResponse = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
        allEmotes.global = globalResponse.data.map(emote => ({
          id: emote.id,
          code: emote.code,
          url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
        }));
      } catch (error) {
        allEmotes.global = [];
      }

      // Get channel-specific emotes
      if (channels && Array.isArray(channels)) {
        for (const channel of channels) {
          try {
            const channelResponse = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${channel}`);
            allEmotes[channel] = [
              ...channelResponse.data.channelEmotes.map(emote => ({
                id: emote.id,
                code: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
              })),
              ...channelResponse.data.sharedEmotes.map(emote => ({
                id: emote.id,
                code: emote.code,
                url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
              }))
            ];
          } catch (error) {
            allEmotes[channel] = [];
          }
        }
      }

      res.json({ emotes: allEmotes });
      return;
    }

    // BTTV Global emotes
    if (query.type === 'bttv-global') {
      const response = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
      const emotes = response.data.map(emote => ({
        id: emote.id,
        code: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
      }));
      
      res.json({ emotes });
      return;
    }

    // BTTV Channel emotes
    if (query.type === 'bttv-channel' && query.channel) {
      try {
        const response = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${query.channel}`);
        const emotes = [
          ...response.data.channelEmotes.map(emote => ({
            id: emote.id,
            code: emote.code,
            url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
          })),
          ...response.data.sharedEmotes.map(emote => ({
            id: emote.id,
            code: emote.code,
            url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
          }))
        ];
        
        res.json({ emotes });
        return;
      } catch (error) {
        res.json({ emotes: [] });
        return;
      }
    }

    // Twitch Global emotes
    if (query.type === 'twitch-global') {
      res.json({ 
        emotes: [
          { id: '25', code: 'Kappa', url: 'https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0' },
          { id: '88', code: 'PogChamp', url: 'https://static-cdn.jtvnw.net/emoticons/v2/88/default/dark/1.0' },
          { id: '354', code: '4Head', url: 'https://static-cdn.jtvnw.net/emoticons/v2/354/default/dark/1.0' }
        ]
      });
      return;
    }

    res.status(400).json({ error: 'Invalid emote type or missing parameters' });
  } catch (error) {
    console.error('Emotes API error:', error);
    res.status(500).json({ error: 'Failed to fetch emotes' });
  }
};
