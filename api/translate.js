// Translation API endpoint for Vercel
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, body, query } = req;
  
  try {
    if (method === 'POST') {
      const { text, targetLang = 'pt' } = body || {};
      
      if (!text) {
        return res.status(400).json({ error: 'Text parameter required' });
      }

      // Mock translation for now - in production use Google Translate API
      const translations = {
        'hello': 'olá',
        'hi': 'oi', 
        'good': 'bom',
        'amazing': 'incrível',
        'stream': 'stream',
        'chat': 'chat'
      };

      const lowerText = text.toLowerCase();
      const translated = translations[lowerText] || text;

      res.json({
        originalText: text,
        translatedText: translated,
        targetLanguage: targetLang,
        confidence: 0.95
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Translation API error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
};
