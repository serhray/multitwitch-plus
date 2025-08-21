const express = require('express');
const axios = require('axios');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Simple translation function with basic patterns
async function translateMessage(text, targetLanguage = 'pt') {
  try {
    // Basic translation patterns for common gaming/streaming terms
    const translations = {
      'gg': 'boa partida',
      'wp': 'bem jogado',
      'lol': 'kkkkk',
      'omg': 'meu deus',
      'wtf': 'que isso',
      'nice': 'legal',
      'good': 'bom',
      'bad': 'ruim',
      'noob': 'iniciante',
      'pro': 'profissional',
      'ez': 'fácil',
      'hard': 'difícil',
      'win': 'vitória',
      'lose': 'derrota',
      'kill': 'abate',
      'death': 'morte',
      'stream': 'transmissão',
      'chat': 'bate-papo',
      'follow': 'seguir',
      'sub': 'inscrever'
    };

    let translatedText = text.toLowerCase();
    
    // Replace common terms
    Object.keys(translations).forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      translatedText = translatedText.replace(regex, translations[term]);
    });

    // If no translation occurred, return original with proper case
    if (translatedText === text.toLowerCase()) {
      translatedText = text;
    } else {
      // Capitalize first letter if translation occurred
      translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
    }

    return { 
      translatedText: translatedText,
      originalLanguage: 'en'
    };
  } catch (error) {
    console.error('Translation error:', error);
    return { translatedText: text, originalLanguage: 'unknown' };
  }
}

// Get unified chat messages for multiple channels
router.post('/unified', [
  body('channels').isArray({ min: 1, max: 10 }).withMessage('Channels must be an array with 1-10 items'),
  body('channels.*').isString().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Invalid channel name'),
  body('language').optional().isIn(['pt', 'en', 'es', 'fr', 'de']).withMessage('Invalid language'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { channels, language = 'pt' } = req.body;
    
    // In a real implementation, this would connect to Twitch IRC
    // For now, return mock data structure
    const unifiedChat = {
      channels,
      messages: [],
      connections: channels.map(channel => ({
        channel,
        status: 'connected',
        messageCount: 0
      })),
      settings: {
        translateEnabled: true,
        targetLanguage: language,
        showChannelTags: true
      }
    };

    res.json(unifiedChat);
  } catch (error) {
    console.error('Error setting up unified chat:', error);
    res.status(500).json({ error: 'Failed to setup unified chat' });
  }
});

// Translate a chat message
router.post('/translate', [
  body('message').isString().isLength({ min: 1, max: 500 }).escape().withMessage('Message must be 1-500 characters'),
  body('targetLanguage').optional().isIn(['pt', 'en', 'es', 'fr', 'de']).withMessage('Invalid target language'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { message, targetLanguage = 'pt' } = req.body;
    
    const translation = await translateMessage(message, targetLanguage);
    
    res.json({
      original: message,
      translated: translation.translatedText,
      originalLanguage: translation.originalLanguage,
      targetLanguage
    });
  } catch (error) {
    console.error('Error translating message:', error);
    res.status(500).json({ error: 'Failed to translate message' });
  }
});

// Get chat statistics for activity detection
router.get('/stats/:channel', [
  param('channel').isString().isLength({ min: 1, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Invalid channel name'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { channel } = req.params;
    
    // Mock chat activity data
    // In production, this would analyze real chat data
    const mockStats = {
      channel,
      messagesPerMinute: Math.floor(Math.random() * 50) + 10,
      uniqueUsers: Math.floor(Math.random() * 200) + 50,
      activityLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      topEmotes: ['Kappa', 'PogChamp', 'OMEGALUL', '5Head'],
      lastUpdated: new Date()
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Failed to fetch chat statistics' });
  }
});

// Filter chat messages by keywords or patterns
router.post('/filter', [
  body('messages').isArray({ max: 1000 }).withMessage('Messages must be an array with max 1000 items'),
  body('filters').isObject().withMessage('Filters must be an object'),
  body('filters.keywords').optional().isArray({ max: 50 }).withMessage('Keywords must be an array with max 50 items'),
  body('filters.keywords.*').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Each keyword must be 1-100 characters'),
  body('filters.minLength').optional().isInt({ min: 1, max: 500 }).withMessage('Min length must be 1-500'),
  handleValidationErrors
], (req, res) => {
  try {
    const { messages, filters } = req.body;
    
    const filteredMessages = messages.filter(message => {
      if (filters.hideCommands && message.text.startsWith('!')) {
        return false;
      }
      
      if (filters.keywords && filters.keywords.length > 0) {
        const hasKeyword = filters.keywords.some(keyword => 
          message.text.toLowerCase().includes(keyword.toLowerCase())
        );
        return filters.keywordMode === 'include' ? hasKeyword : !hasKeyword;
      }
      
      if (filters.minLength && message.text.length < filters.minLength) {
        return false;
      }
      
      return true;
    });

    res.json({
      originalCount: messages.length,
      filteredCount: filteredMessages.length,
      messages: filteredMessages
    });
  } catch (error) {
    console.error('Error filtering messages:', error);
    res.status(500).json({ error: 'Failed to filter messages' });
  }
});

module.exports = router;
