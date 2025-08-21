import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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

const ChannelSelector = styled.select`
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #9146ff;
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const ChatIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
`;

const ChatSelector = ({ streams = [] }) => {
  const [selectedChannel, setSelectedChannel] = useState('');

  // Get channels from streams
  const channels = streams
    .map(stream => (stream.channel || '').toLowerCase())
    .filter(Boolean);

  // Auto-select first channel when streams change
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    } else if (channels.length === 0) {
      setSelectedChannel('');
    }
  }, [channels, selectedChannel]);

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat</ChatTitle>
        <ChannelSelector
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
        >
          <option value="">Selecione um canal</option>
          {channels.map(channel => (
            <option key={channel} value={channel}>
              #{channel}
            </option>
          ))}
        </ChannelSelector>
      </ChatHeader>
      
      <MessagesContainer>
        {selectedChannel ? (
          <ChatIframe
            src={`https://www.twitch.tv/embed/${selectedChannel}/chat?parent=${window.location.hostname}`}
            title={`Chat de ${selectedChannel}`}
          />
        ) : (
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
            <div>Selecione um canal para participar do chat</div>
          </div>
        )}
      </MessagesContainer>
    </ChatContainer>
  );
};

export default ChatSelector;
