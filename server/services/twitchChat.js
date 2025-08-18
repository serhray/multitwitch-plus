const tmi = require('tmi.js');

class TwitchChatService {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.connectedChannels = new Set();
    this.channelUsers = new Map(); // Track users in rooms per channel
  }

  // Initialize TMI client
  initializeClient() {
    if (this.client) {
      return this.client;
    }

    this.client = new tmi.Client({
      connection: {
        secure: true,
        reconnect: true
      },
      identity: {
        username: 'justinfan' + Math.floor(Math.random() * 100000), // Anonymous user
        password: undefined
      },
      channels: []
    });

    this.setupEventHandlers();
    return this.client;
  }

  // Setup event handlers for TMI client
  setupEventHandlers() {
    this.client.on('connected', (addr, port) => {
      console.log(`Connected to Twitch IRC at ${addr}:${port}`);
    });

    this.client.on('disconnected', (reason) => {
      console.log(`Disconnected from Twitch IRC: ${reason}`);
    });

    this.client.on('join', (channel, username, self) => {
      if (self) {
        console.log(`Joined channel: ${channel}`);
        this.connectedChannels.add(channel.slice(1)); // Remove # from channel name
      }
    });

    this.client.on('part', (channel, username, self) => {
      if (self) {
        console.log(`Left channel: ${channel}`);
        this.connectedChannels.delete(channel.slice(1));
      }
    });

    // Main message handler
    this.client.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignore own messages

      const channelName = channel.slice(1); // Remove # from channel name
      
      const chatMessage = {
        id: tags.id || Date.now() + Math.random(),
        username: tags['display-name'] || tags.username,
        message: message,
        channel: channelName,
        timestamp: new Date(parseInt(tags['tmi-sent-ts']) || Date.now()),
        color: tags.color || this.getRandomColor(),
        badges: this.parseBadges(tags.badges),
        emotes: this.parseEmotes(tags.emotes, message),
        isSubscriber: tags.subscriber === '1',
        isModerator: tags.mod === '1',
        isVip: tags.vip === '1',
        userType: tags['user-type'] || 'viewer'
      };

      // Emit to all users watching this channel
      this.io.emit('twitch-chat-message', chatMessage);
      
      console.log(`[${channelName}] ${chatMessage.username}: ${message}`);
      console.log('Emitting twitch-chat-message:', JSON.stringify(chatMessage, null, 2));
    });

    this.client.on('error', (err) => {
      console.error('TMI Client Error:', err);
    });
  }

  // Connect to Twitch IRC
  async connect() {
    if (!this.client) {
      this.initializeClient();
    }

    try {
      await this.client.connect();
      console.log('TMI Client connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to Twitch IRC:', error);
      return false;
    }
  }

  // Join a channel
  async joinChannel(channelName) {
    if (!this.client) {
      await this.connect();
    }

    const normalizedChannel = channelName.toLowerCase().replace('#', '');
    
    if (this.connectedChannels.has(normalizedChannel)) {
      console.log(`Already connected to channel: ${normalizedChannel}`);
      return true;
    }

    try {
      await this.client.join(normalizedChannel);
      console.log(`Attempting to join channel: ${normalizedChannel}`);
      return true;
    } catch (error) {
      console.error(`Failed to join channel ${normalizedChannel}:`, error);
      return false;
    }
  }

  // Leave a channel
  async leaveChannel(channelName) {
    if (!this.client) return false;

    const normalizedChannel = channelName.toLowerCase().replace('#', '');
    
    if (!this.connectedChannels.has(normalizedChannel)) {
      return true; // Already not connected
    }

    try {
      await this.client.part(normalizedChannel);
      console.log(`Left channel: ${normalizedChannel}`);
      return true;
    } catch (error) {
      console.error(`Failed to leave channel ${normalizedChannel}:`, error);
      return false;
    }
  }

  // Get list of connected channels
  getConnectedChannels() {
    return Array.from(this.connectedChannels);
  }

  // Parse badges from Twitch tags
  parseBadges(badgesString) {
    if (!badgesString || typeof badgesString !== 'string') return [];
    
    return badgesString.split(',').map(badge => {
      const [name, version] = badge.split('/');
      return { name, version };
    });
  }

  // Parse emotes from Twitch tags
  parseEmotes(emotesString, message) {
    if (!emotesString || typeof emotesString !== 'string') return [];
    
    const emotesMap = new Map();
    const emoteData = emotesString.split('/');
    
    emoteData.forEach(emote => {
      const [emoteId, positions] = emote.split(':');
      const positionList = positions.split(',');
      
      if (!emotesMap.has(emoteId)) {
        emotesMap.set(emoteId, {
          id: emoteId,
          positions: []
        });
      }
      
      positionList.forEach(position => {
        emotesMap.get(emoteId).positions.push(position);
      });
    });
    
    return Array.from(emotesMap.values());
  }

  // Generate random color for users without color
  getRandomColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#00D2D3', '#FF9F43', '#10AC84', '#EE5A24'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Disconnect from all channels
  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnect();
        this.connectedChannels.clear();
        console.log('Disconnected from Twitch IRC');
      } catch (error) {
        console.error('Error disconnecting from Twitch IRC:', error);
      }
    }
  }
}

module.exports = TwitchChatService;
