const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Configurações do Twitch OAuth
// Validate required environment variables
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';

// Validate required environment variables
if (!TWITCH_CLIENT_ID) throw new Error('TWITCH_CLIENT_ID environment variable is required');
if (!TWITCH_CLIENT_SECRET) throw new Error('TWITCH_CLIENT_SECRET environment variable is required');
if (!TWITCH_REDIRECT_URI) throw new Error('TWITCH_REDIRECT_URI environment variable is required');
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// Rota para iniciar o processo de autenticação
router.get('/twitch', (req, res) => {
  const scope = 'user:read:email chat:read';
  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(authUrl);
});

// Callback do Twitch OAuth
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${CLIENT_URL}?error=no_code`);
  }

  try {
    // Trocar código por token de acesso
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', {
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: TWITCH_REDIRECT_URI,
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Obter informações do usuário
    const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    });

    const userData = userResponse.data.data[0];

    // Criar JWT token
    const jwtToken = jwt.sign(
      {
        id: userData.id,
        login: userData.login,
        display_name: userData.display_name,
        email: userData.email,
        profile_image_url: userData.profile_image_url,
        access_token,
        refresh_token,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirecionar de volta para o frontend com o token
    res.redirect(`${CLIENT_URL}?token=${jwtToken}`);
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.redirect(`${CLIENT_URL}?error=auth_failed`);
  }
});

// Rota para verificar token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota para logout
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Revogar token no Twitch
    await axios.post(`https://id.twitch.tv/oauth2/revoke?client_id=${TWITCH_CLIENT_ID}&token=${decoded.access_token}`);
    
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro no logout' });
  }
});

module.exports = router;
