import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import StreamGrid from './components/StreamGrid';
import SimplifiedChat from './components/SimplifiedChat';
import IndividualChat from './components/IndividualChat';
import AudioController from './components/AudioController';
import AdSidebar from './components/AdSidebar';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import io from 'socket.io-client';

const AppContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
  gap: 20px;
  padding: 20px;
  flex: 1;
`;

const StreamSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  min-height: 0;
  background: transparent;
`;

const ChatSection = styled.div`
  width: 350px;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

function App() {
  const [streams, setStreams] = useState([]);
  const [focusedStream, setFocusedStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [audioSettings, setAudioSettings] = useState({
    masterVolume: 1.0,
    focusedVolume: 1.0,
    secondaryVolume: 0.3,
    autoFocus: false
  });
  const [layoutMode, setLayoutMode] = useState('normal');
  const [showLogin, setShowLogin] = useState(false);
  const [chatMode, setChatMode] = useState('unified');
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Socket.IO connection for local development
  useEffect(() => {
    // Check if we're in local development (has localhost in URL)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
      const newSocket = io('http://localhost:5001');
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, []);


  const handleStreamAdd = (channelName) => {
    const newStream = {
      id: Date.now(),
      channel: channelName,
      isLive: true
    };
    setStreams(prev => [...prev, newStream]);
    
    if (!focusedStream) {
      setFocusedStream(newStream.id);
    }
    
    // Set first channel as default for individual chat
    if (!selectedChannel) {
      setSelectedChannel(channelName);
    }
  };

  const handleChatModeToggle = () => {
    setChatMode(prev => prev === 'unified' ? 'individual' : 'unified');
    
    // Set default channel when switching to individual mode
    if (chatMode === 'unified' && streams.length > 0 && !selectedChannel) {
      setSelectedChannel(streams[0].channel);
    }
  };

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
  };

  const handleStreamRemove = (streamId) => {
    setStreams(streams.filter(stream => stream.id !== streamId));
    // If the removed stream was focused, focus on the first remaining stream
    if (focusedStream === streamId && streams.length > 1) {
      const remainingStreams = streams.filter(stream => stream.id !== streamId);
      if (remainingStreams.length > 0) {
        setFocusedStream(remainingStreams[0].id);
      } else {
        setFocusedStream(null);
      }
    }
  };

  const handleRoomCreate = (roomData) => {
    setCurrentRoom(roomData);
    if (socket) {
      socket.emit('join-room', roomData.id);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <AppContainer>
          <Header 
            onStreamAdd={handleStreamAdd}
            currentRoom={currentRoom}
            onRoomCreate={handleRoomCreate}
            onLoginClick={() => setShowLogin(true)}
            streams={streams}
            onChatModeToggle={handleChatModeToggle}
            chatMode={chatMode}
          />
          
          <Routes>
            <Route path="/" element={
              <MainContent>
                <StreamSection>
                  <StreamGrid 
                    streams={streams}
                    focusedStream={focusedStream}
                    onStreamFocus={setFocusedStream}
                    socket={socket}
                    currentRoom={currentRoom}
                    layoutMode={layoutMode}
                  />
                  <AudioController 
                    streams={streams}
                    focusedStream={focusedStream}
                    settings={audioSettings}
                    onSettingsChange={setAudioSettings}
                    onStreamRemove={handleStreamRemove}
                    onLayoutModeChange={setLayoutMode}
                  />
                </StreamSection>
                
                <ChatSection>
                  {chatMode === 'unified' ? (
                    <SimplifiedChat 
                      streams={streams}
                      currentRoom={currentRoom}
                      socket={socket}
                    />
                  ) : (
                    <IndividualChat 
                      streams={streams}
                      selectedChannel={selectedChannel}
                      onChannelChange={handleChannelChange}
                      socket={socket}
                    />
                  )}
                  
                  {/* Ad below chat */}
                  <AdSidebar 
                    slot={process.env.REACT_APP_ADSENSE_SIDEBAR_SLOT || "0987654321"}
                    isPremium={false}
                  />
                </ChatSection>
              </MainContent>
            } />
            
          </Routes>

          <Login 
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
          />
        </AppContainer>
      </Router>
    </AuthProvider>
  );
}

export default App;
