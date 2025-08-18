import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  min-height: 500px;
`;

const ChatHeader = styled.div`
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ChatSettings = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SettingButton = styled.button`
  background: ${props => props.active ? 'rgba(145, 70, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 15px;
  color: white;
  padding: 5px 10px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(145, 70, 255, 0.5);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  max-height: 100%;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(145, 70, 255, 0.5);
    border-radius: 3px;
  }
`;

const Message = styled(motion.div)`
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid ${props => props.channelColor || '#9146ff'};
  font-size: 13px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
  opacity: 0.8;
`;

const Username = styled.span`
  font-weight: bold;
  color: ${props => props.color || '#00f5ff'};
`;

const ChannelTag = styled.span`
  background: ${props => props.color || '#9146ff'};
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
`;

const MessageText = styled.div`
  color: white;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const TranslatedText = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin-top: 4px;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
`;

const MessageInput = styled.div`
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #9146ff;
    box-shadow: 0 0 10px rgba(145, 70, 255, 0.3);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  border: none;
  border-radius: 20px;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  gap: 10px;
`;

const channelColors = ['#ff7675', '#74b9ff', '#00b894', '#fdcb6e', '#e17055', '#a29bfe', '#fd79a8', '#6c5ce7'];

// Generate consistent color for a channel
const getChannelColor = (channelName) => {
  if (!channelName) return '#9146ff';
  
  // Create a simple hash from channel name
  let hash = 0;
  for (let i = 0; i < channelName.length; i++) {
    hash = channelName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to pick consistent color from array
  const colorIndex = Math.abs(hash) % channelColors.length;
  return channelColors[colorIndex];
};

function UnifiedChat({ streams, socket, currentRoom }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [settings, setSettings] = useState({
    showTranslations: true,
    showEmotes: true,
    showChannelTags: true,
    autoScroll: true
  });
  const [translations, setTranslations] = useState({});
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [emoteData, setEmoteData] = useState({});
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevChannelsRef = useRef([]);
  const scrollTimeoutRef = useRef(null);

  // Translate message function
  const translateMessage = async (text, messageId) => {
    try {
      console.log('Translating message:', text, 'ID:', messageId);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          targetLanguage: 'pt'
        })
      });
      
      const data = await response.json();
      console.log('Translation response:', data);
      if (response.ok) {
        setTranslations(prev => ({
          ...prev,
          [messageId]: data.translated
        }));
      } else {
        console.error('Translation API error:', data);
      }
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Simple emote replacement for testing
  const parseEmotes = (text, emotes) => {
    if (!settings.showEmotes || !text) {
      return text;
    }

    console.log('Parsing emotes for text:', text, 'emotes:', emotes);
    
    // Simple text-based emote replacement for common Twitch emotes
    const commonEmotes = {
      'Kappa': 'https://static-cdn.jtvnw.net/emoticons/v1/25/1.0',
      'PogChamp': 'https://static-cdn.jtvnw.net/emoticons/v1/88/1.0',
      'OMEGALUL': 'https://static-cdn.jtvnw.net/emoticons/v1/583/1.0',
      'LUL': 'https://static-cdn.jtvnw.net/emoticons/v1/425618/1.0',
      '4Head': 'https://static-cdn.jtvnw.net/emoticons/v1/354/1.0',
      'EZ': 'https://static-cdn.jtvnw.net/emoticons/v1/143490/1.0',
      'MonkaS': 'https://cdn.betterttv.net/emote/56e9f494fff3cc5c35e5287e/1x',
      'POGGERS': 'https://cdn.betterttv.net/emote/58ae8407ff7b7276f8e594f2/1x'
    };

    let parsedText = text;
    
    // Replace common emotes
    Object.keys(commonEmotes).forEach(emoteName => {
      const regex = new RegExp(`\\b${emoteName}\\b`, 'g');
      if (parsedText.includes(emoteName)) {
        console.log('Replacing emote:', emoteName);
        parsedText = parsedText.replace(regex, 
          `<img src="${commonEmotes[emoteName]}" alt="${emoteName}" class="chat-emote" style="height: 20px; vertical-align: middle; margin: 0 2px;" />`
        );
      }
    });

    console.log('Final parsed text:', parsedText);
    return parsedText;
  };

  // Get channels from streams (normalized lowercase, no falsy values)
  const channels = streams
    .map(stream => (stream.channel || '').toLowerCase())
    .filter(Boolean);

  // Load emotes for current channels
  useEffect(() => {
    if (channels.length > 0) {
      console.log('Loading emotes for channels:', channels);
      fetch('/api/emotes?type=all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channels })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Loaded emotes data:', data);
        setEmoteData(data.emotes || {});
      })
      .catch(error => {
        console.error('Error loading emotes:', error);
      });
    }
  }, [channels]);

  useEffect(() => {
    if (!socket) return;
      }

      const newMessage = {
        id: `${messageData.channel}-${messageData.id || Date.now()}`,
        username: messageData.username,
        message: messageData.message,
        channel: messageData.channel,
        timestamp: messageData.timestamp || new Date().toISOString(),
        color: messageData.color || '#ffffff',
        badges: messageData.badges || [],
        emotes: messageData.emotes || {},
        isTranslated: false,
        originalMessage: messageData.message
      };
      console.log('Twitch Chat Status:', status);
    };

    // Remove existing listeners first
    socket.off('chat-message', handleRoomMessage);
    socket.off('twitch-chat-message', handleTwitchMessage);
    socket.off('twitch-chat-status', handleTwitchStatus);

    // Add new listeners
    socket.on('chat-message', handleRoomMessage);
    socket.on('twitch-chat-message', handleTwitchMessage);
    socket.on('twitch-chat-status', handleTwitchStatus);

    return () => {
      socket.off('chat-message', handleRoomMessage);
      socket.off('twitch-chat-message', handleTwitchMessage);
      socket.off('twitch-chat-status', handleTwitchStatus);
    };
  }, [socket, channels]);

  // Handle user scroll detection with debouncing
  const handleScroll = () => {
    if (!messagesContainerRef.current || !settings.autoScroll) return;
    
    const container = messagesContainerRef.current;
    const threshold = 20; // More generous threshold
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll detection to avoid false positives from auto-scroll
    scrollTimeoutRef.current = setTimeout(() => {
      const currentIsAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
      
      if (!currentIsAtBottom && !isUserScrolling) {
        setIsUserScrolling(true);
        console.log('User scrolled up - pausing auto-scroll');
      } else if (currentIsAtBottom && isUserScrolling) {
        setIsUserScrolling(false);
        console.log('Back at bottom - resuming auto-scroll');
      }
    }, 200); // Longer delay to avoid interference with smooth scrolling
  };

  useEffect(() => {
    if (settings.autoScroll && !isUserScrolling && messagesEndRef.current && messagesContainerRef.current) {
      console.log('Auto-scrolling to bottom - new message');
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, settings.autoScroll, isUserScrolling]);

  // Auto-join and leave Twitch chats based on current streams
  useEffect(() => {
    if (!socket) return;
    const prev = prevChannelsRef.current;
    const prevSet = new Set(prev);
    const curr = Array.from(new Set(channels));
    const currSet = new Set(curr);

    const toJoin = curr.filter(ch => !prevSet.has(ch));
    const toLeave = prev.filter(ch => !currSet.has(ch));

    toJoin.forEach(channel => {
      console.log(`Joining Twitch chat for: ${channel}`);
      socket.emit('join-twitch-chat', channel);
    });

    toLeave.forEach(channel => {
      console.log(`Leaving Twitch chat for: ${channel}`);
      socket.emit('leave-twitch-chat', channel);
    });

    prevChannelsRef.current = curr;
  }, [socket, channels]);

  // Cleanup on unmount: leave all joined channels
  useEffect(() => {
    return () => {
      if (socket && prevChannelsRef.current.length > 0) {
        prevChannelsRef.current.forEach(channel => {
          socket.emit('leave-twitch-chat', channel);
        });
      }
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && currentRoom && socket) {
      socket.emit('chat-message', {
        roomId: currentRoom.id,
        message: inputMessage,
        username: 'You',
        channel: 'room-chat'
      });
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleSetting = (setting) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [setting]: !prev[setting]
      };
      console.log(`Toggled ${setting}:`, newSettings[setting]);
      return newSettings;
    });
  };

  if (streams.length === 0) {
    return (
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>💬 Chat Unificado</ChatTitle>
        </ChatHeader>
        <EmptyState>
          <div>📝</div>
          <p>Adicione streams para ver o chat</p>
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>💬 Chat Unificado</ChatTitle>
        <ChatSettings>
          <SettingButton
            active={settings.showTranslations}
            onClick={() => toggleSetting('showTranslations')}
          >
            🌐 Tradução
          </SettingButton>
          <SettingButton
            active={settings.showChannelTags}
            onClick={() => toggleSetting('showChannelTags')}
          >
            🏷️ Tags
          </SettingButton>
          <SettingButton
            active={settings.showEmotes}
            onClick={() => toggleSetting('showEmotes')}
          >
            😀 Emotes
          </SettingButton>
          <SettingButton
            active={settings.autoScroll}
            onClick={() => {
              toggleSetting('autoScroll');
              if (!settings.autoScroll) {
                // If enabling auto-scroll, reset user scrolling state
                setIsUserScrolling(false);
                console.log('Auto-scroll enabled - resetting scroll state');
              }
            }}
          >
            📜 Auto-scroll {isUserScrolling ? '(pausado)' : ''}
          </SettingButton>
        </ChatSettings>
      </ChatHeader>

      <MessagesContainer ref={messagesContainerRef} onScroll={handleScroll}>
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              channelColor={message.channelColor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageHeader>
                <Username color={message.channelColor}>
                  {message.username}
                </Username>
                {settings.showChannelTags && (
                  <ChannelTag color={message.channelColor}>
                    {message.channel}
                  </ChannelTag>
                )}
              </MessageHeader>
              
              {settings.showEmotes ? (
                <MessageText 
                  dangerouslySetInnerHTML={{
                    __html: parseEmotes(message.message, message.emotes)
                  }}
                />
              ) : (
                <MessageText>{message.message}</MessageText>
              )}
              
              {settings.showTranslations && message.message && message.message.length > 5 && (
                <TranslatedText>
                  🌐 {translations[message.id] || 'Traduzindo...'}
                </TranslatedText>
              )}
            </Message>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {currentRoom && (
        <MessageInput>
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            Enviar
          </SendButton>
        </MessageInput>
      )}
    </ChatContainer>
  );
}

export default UnifiedChat;
