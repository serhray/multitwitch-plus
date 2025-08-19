import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import chatService from '../services/chatService';
import io from 'socket.io-client';

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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  height: calc(100vh - 200px);
  max-height: 500px;
`;

const Message = styled(motion.div)`
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid ${props => props.userColor || '#9146ff'};
`;

const Username = styled.span`
  font-weight: bold;
  color: ${props => props.color || '#ffffff'};
  margin-right: 8px;
`;

const MessageText = styled.span`
  color: #ffffff;
`;

const ChannelTag = styled.span`
  background: rgba(145, 70, 255, 0.3);
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  margin-left: 8px;
`;

const UnifiedChat = ({ streams = [], socket }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Get channels from streams
  const channels = streams
    .map(stream => (stream.channel || '').toLowerCase())
    .filter(Boolean);

  // Detect if we're in local or production mode
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Setup real chat functionality
  useEffect(() => {
    if (channels.length === 0) {
      setMessages([]);
      return;
    }

    if (isLocal && socket) {
      // Use Socket.IO for local development
      const handleTwitchMessage = (messageData) => {
        const activeChannels = channels;
        const messageChannel = messageData.channel?.toLowerCase();
        
        if (!activeChannels.includes(messageChannel)) return;

        setMessages(prev => {
          if (prev.find(m => m.id === messageData.id)) return prev;
          const newMessages = [...prev, messageData];
          return newMessages.slice(-50);
        });
      };

      socket.on('twitch-chat-message', handleTwitchMessage);
      
      // Join channels
      channels.forEach(channel => {
        socket.emit('join-twitch-chat', channel);
      });

      // Add welcome message
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        username: 'Sistema',
        message: `Conectando ao chat de ${channels.join(', ')}...`,
        channel: 'sistema',
        timestamp: new Date().toISOString(),
        color: '#9146ff'
      };
      setMessages([welcomeMessage]);

      return () => {
        socket.off('twitch-chat-message', handleTwitchMessage);
        channels.forEach(channel => {
          socket.emit('leave-twitch-chat', channel);
        });
      };
    } else {
      // Production mode - use polling service
      chatService.connectToChannels(channels);

      const handleMessage = (message) => {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          const newMessages = [...prev, message];
          return newMessages.slice(-50);
        });
      };

      chatService.onMessage(handleMessage);

      // Add welcome message
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        username: 'Sistema',
        message: `Chat conectado para ${channels.join(', ')}`,
        channel: 'sistema',
        timestamp: new Date().toISOString(),
        color: '#9146ff'
      };
      setMessages([welcomeMessage]);

      return () => {
        chatService.removeListener(handleMessage);
      };
    }
  }, [channels, socket, isLocal]);

  // Remove auto-scroll to prevent page scrolling issues

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat Unificado</ChatTitle>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {channels.length} canais
        </div>
      </ChatHeader>
      
      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message) => (
            <Message
              key={message.id}
              userColor={message.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Username color={message.color}>
                {message.username}
              </Username>
              <MessageText>{message.message}</MessageText>
              <ChannelTag>#{message.channel}</ChannelTag>
            </Message>
          ))}
        </AnimatePresence>
        {messages.length === 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%', 
            color: '#888',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div>💬</div>
            <div>Adicione streams para ver o chat</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
    </ChatContainer>
  );
};

export default UnifiedChat;
