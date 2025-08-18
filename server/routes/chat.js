const express = require('express');
const axios = require('axios');
const router = express.Router();

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
router.post('/unified', async (req, res) => {
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
router.post('/translate', async (req, res) => {
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
router.get('/stats/:channel', async (req, res) => {
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
router.post('/filter', (req, res) => {
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
