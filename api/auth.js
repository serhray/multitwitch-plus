// Auth API endpoint for Vercel
const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { query, method } = req;
  
  try {
    // OAuth callback
    if (query.action === 'callback' && query.code) {
      const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code: query.code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.headers.origin || 'https://multitwitch-plus.vercel.app'}/api/auth?action=callback`
      });

      const { access_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Client-Id': TWITCH_CLIENT_ID
        }
      });

      const user = userResponse.data.data[0];
      
      // Create JWT
      const token = jwt.sign({
        id: user.id,
        login: user.login,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url
      }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user });
      return;
    }

    // Verify token
    if (query.action === 'verify' && req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
      } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
      }
      return;
    }

    // Login redirect
    if (query.action === 'login') {
      const redirectUri = `${req.headers.origin || 'https://multitwitch-plus.vercel.app'}/api/auth?action=callback`;
      const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user:read:email`;
      
      res.json({ authUrl });
      return;
    }

    res.status(400).json({ error: 'Invalid auth action' });
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
