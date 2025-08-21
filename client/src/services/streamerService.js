// Streamer validation service
class StreamerService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://multitwitch-plus-g6tirkx5d-serhrays-projects.vercel.app/api'
      : 'http://localhost:5001/api';
  }

  // Validate if streamer exists and is online
  async validateStreamer(channelName) {
    try {
      const response = await fetch(`${this.baseUrl}/twitch/validate-streamer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: channelName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating streamer:', error);
      throw error;
    }
  }

  // Search for streamers
  async searchStreamers(query) {
    try {
      const response = await fetch(`${this.baseUrl}/twitch/search-channels?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching streamers:', error);
      throw error;
    }
  }

  // Get stream info
  async getStreamInfo(channelName) {
    try {
      const response = await fetch(`${this.baseUrl}/twitch/stream-info?channel=${encodeURIComponent(channelName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting stream info:', error);
      throw error;
    }
  }
}

const streamerServiceInstance = new StreamerService();
export default streamerServiceInstance;
