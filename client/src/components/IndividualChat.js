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

const ChannelSelector = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  
  option {
    background: #2d2d2d;
    color: white;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;

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

const MessageText = styled.div`
  color: white;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
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

// Generate consistent color for a user
const getUserColor = (username) => {
  if (!username) return '#00f5ff';
  
  const colors = ['#ff7675', '#74b9ff', '#00b894', '#fdcb6e', '#e17055', '#a29bfe', '#fd79a8', '#6c5ce7'];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

function IndividualChat({ streams, socket, selectedChannel, onChannelChange }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Filter messages for selected channel
  const channelMessages = messages.filter(msg => 
    msg.channel && msg.channel.toLowerCase() === selectedChannel?.toLowerCase()
  );

  // Setup basic chat display
  useEffect(() => {
    if (selectedChannel) {
      const welcomeMessage = {
        id: `welcome-${selectedChannel}-${Date.now()}`,
        username: 'Sistema',
        message: `Chat individual conectado para #${selectedChannel}`,
        channel: selectedChannel,
        timestamp: new Date().toISOString(),
        userColor: '#9146ff'
      };
      
      setMessages([welcomeMessage]);
    }
  }, [selectedChannel]);

  // Remove auto-scroll to prevent page scrolling issues

  // Clear messages when channel changes
  useEffect(() => {
    setMessages([]);
  }, [selectedChannel]);

  if (!streams || streams.length === 0) {
    return (
      <ChatContainer>
        <EmptyState>
          <div>📺</div>
          <div>Adicione streams para ver o chat</div>
        </EmptyState>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>💬 Chat Individual</ChatTitle>
        <ChannelSelector 
          value={selectedChannel || ''} 
          onChange={(e) => onChannelChange(e.target.value)}
        >
          {streams.map(stream => (
            <option key={stream.id} value={stream.channel}>
              {stream.channel}
            </option>
          ))}
        </ChannelSelector>
      </ChatHeader>

      <ChatMessages ref={messagesContainerRef}>
        {channelMessages.length === 0 ? (
          <EmptyState>
            <div>💬</div>
            <div>Aguardando mensagens de {selectedChannel}...</div>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {channelMessages.map((message, index) => (
              <Message
                key={`${message.id}-${index}`}
                channelColor={message.userColor}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MessageHeader>
                  <Username color={message.userColor}>
                    {message.username}
                  </Username>
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </MessageHeader>
                <MessageText 
                  dangerouslySetInnerHTML={{ 
                    __html: message.processedMessage || message.message 
                  }} 
                />
              </Message>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>
    </ChatContainer>
  );
}

export default IndividualChat;
