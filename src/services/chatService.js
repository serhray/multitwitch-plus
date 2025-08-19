// Chat service for polling-based chat (serverless compatible)
class ChatService {
  constructor() {
    this.messages = [];
    this.channels = [];
    this.isPolling = false;
    this.pollInterval = null;
    this.listeners = [];
  }

  // Add message listener
  onMessage(callback) {
    this.listeners.push(callback);
  }

  // Remove message listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Emit message to all listeners
  emitMessage(message) {
    this.listeners.forEach(listener => listener(message));
  }

  // Connect to channels
  async connectToChannels(channelList) {
    this.channels = channelList;
    
    if (!this.isPolling) {
      this.startPolling();
    }
  }

  // Start polling for messages
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Poll every 2 seconds
    this.pollInterval = setInterval(async () => {
      await this.fetchMessages();
    }, 2000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
  }

  // Fetch messages from API
  async fetchMessages() {
    if (this.channels.length === 0) return;

    try {
      for (const channel of this.channels) {
        const response = await fetch(`/api/chat?action=messages&channel=${channel}`);
        const data = await response.json();
        
        if (data.messages) {
          data.messages.forEach(message => {
            // Check if message is new
            if (!this.messages.find(m => m.id === message.id)) {
              this.messages.push(message);
              this.emitMessage(message);
            }
          });
        }
      }

      // Keep only last 100 messages
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }

  // Send message (mock for now)
  async sendMessage(channel, message) {
    // In production, this would send to Twitch IRC
    console.log(`Sending to ${channel}:`, message);
    
    // Add as local message for demo
    const newMessage = {
      id: Date.now(),
      username: 'You',
      message: message,
      channel: channel,
      timestamp: new Date().toISOString(),
      color: '#9146ff'
    };
    
    this.messages.push(newMessage);
    this.emitMessage(newMessage);
  }

  // Get current messages
  getMessages() {
    return this.messages;
  }

  // Disconnect
  disconnect() {
    this.stopPolling();
    this.messages = [];
    this.channels = [];
    this.listeners = [];
  }
}

const chatServiceInstance = new ChatService();
export default chatServiceInstance;
