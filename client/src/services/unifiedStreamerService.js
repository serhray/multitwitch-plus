class UnifiedStreamerService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5001/api'
      : 'https://multitwitch-plus-g6tirkx5d-serhrays-projects.vercel.app/api';
  }

  // Validate streamer on any platform
  async validateStreamer(channelName, platform = 'twitch') {
    try {
      const endpoint = platform === 'kick' ? '/kick/validate-streamer' : '/twitch/validate-streamer';
      const response = await fetch(`${this.baseUrl}${endpoint}?channel=${encodeURIComponent(channelName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error validating ${platform} streamer:`, error);
      throw error;
    }
  }

  // Search channels on any platform
  async searchChannels(query, platform = 'twitch') {
    try {
      const endpoint = platform === 'kick' ? '/kick/search-channels' : '/twitch/search-channels';
      const response = await fetch(`${this.baseUrl}${endpoint}?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error searching ${platform} channels:`, error);
      throw error;
    }
  }

  // Get stream info from any platform
  async getStreamInfo(channelName, platform = 'twitch') {
    try {
      const endpoint = platform === 'kick' ? '/kick/stream-info' : '/twitch/stream-info';
      const response = await fetch(`${this.baseUrl}${endpoint}?channel=${encodeURIComponent(channelName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error getting ${platform} stream info:`, error);
      throw error;
    }
  }

  // Get multiple streams info from any platform
  async getMultipleStreamsInfo(channels, platform = 'twitch') {
    try {
      const endpoint = platform === 'kick' ? '/kick/streams-info' : '/twitch/streams-info';
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channels })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error getting multiple ${platform} streams info:`, error);
      throw error;
    }
  }

  // Unified search across all platforms
  async searchAllPlatforms(query) {
    try {
      const [twitchResults, kickResults] = await Promise.allSettled([
        this.searchChannels(query, 'twitch'),
        this.searchChannels(query, 'kick')
      ]);

      const results = {
        twitch: twitchResults.status === 'fulfilled' ? twitchResults.value : { channels: [], total: 0 },
        kick: kickResults.status === 'fulfilled' ? kickResults.value : { channels: [], total: 0 }
      };

      return results;
    } catch (error) {
      console.error('Error searching all platforms:', error);
      throw error;
    }
  }

  // Unified stream info across all platforms
  async getStreamInfoAllPlatforms(channelName) {
    try {
      const [twitchInfo, kickInfo] = await Promise.allSettled([
        this.getStreamInfo(channelName, 'twitch'),
        this.getStreamInfo(channelName, 'kick')
      ]);

      // Return the first platform where the streamer exists and is live
      if (twitchInfo.status === 'fulfilled' && twitchInfo.value.isLive) {
        return twitchInfo.value;
      }
      
      if (kickInfo.status === 'fulfilled' && kickInfo.value.isLive) {
        return kickInfo.value;
      }

      // If neither is live, return the first one that exists
      if (twitchInfo.status === 'fulfilled') {
        return twitchInfo.value;
      }
      
      if (kickInfo.status === 'fulfilled') {
        return kickInfo.value;
      }

      throw new Error('Streamer não encontrado em nenhuma plataforma');
    } catch (error) {
      console.error('Error getting stream info from all platforms:', error);
      throw error;
    }
  }

  // Detect platform from channel name or user input
  detectPlatform(input) {
    const lowerInput = input.toLowerCase();
    
    // Check for platform indicators in the input
    if (lowerInput.includes('kick.com') || lowerInput.includes('kick/')) {
      return 'kick';
    }
    
    if (lowerInput.includes('twitch.tv') || lowerInput.includes('twitch/')) {
      return 'twitch';
    }

    // Default to twitch for backward compatibility
    return 'twitch';
  }

  // Clean channel name (remove platform URLs)
  cleanChannelName(input) {
    let cleaned = input.trim();
    
    // Remove platform URLs
    cleaned = cleaned.replace(/^https?:\/\/(www\.)?(kick\.com|twitch\.tv)\//, '');
    cleaned = cleaned.replace(/^(kick|twitch)\//, '');
    
    // Remove @ symbol if present
    cleaned = cleaned.replace(/^@/, '');
    
    return cleaned;
  }
}

export default new UnifiedStreamerService();

