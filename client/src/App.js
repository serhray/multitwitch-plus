import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import StreamGrid from './components/StreamGrid';
import SimplifiedChat from './components/SimplifiedChat';
import IndividualChat from './components/IndividualChat';
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

const ChatContainer = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const AdContainer = styled.div`
  height: 250px;
  margin-top: 15px;
`;

const InfoSection = styled.div`
  width: 100%;
  margin-top: 50px;
  padding: 40px 20px;
  background: rgba(0, 0, 0, 0.1);
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0;
  margin-left: 20px;
`;

const InfoCardSobre = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  align-self: flex-end;
  margin-right: 20px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const InfoTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;

const InfoContent = styled.div`
  color: white;
  line-height: 1.6;

  p {
    margin: 0 0 15px 0;
  }

  ul {
    margin: 15px 0;
    padding-left: 20px;
  }

  li {
    margin: 8px 0;
  }
`;

const InfoStep = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 15px 0;
  gap: 15px;
`;

const StepNumber = styled.div`
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

const StepText = styled.p`
  margin: 0;
  color: white;
  font-size: 14px;
  line-height: 1.5;
`;

const FAQItem = styled.div`
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid #9146ff;
`;

const FAQQuestion = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
  color: #00f5ff;
`;

const FAQAnswer = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
`;

const SocialSection = styled.div`
  margin-top: 30px;
  padding: 30px 20px;
  background: rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SocialContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 40px;
  padding: 0 20px;
`;

const SocialLink = styled.a`
  display: inline-block;
  padding: 15px 25px;
  background: linear-gradient(45deg, #1da1f2, #0d8bd9);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(29, 161, 242, 0.4);
    background: linear-gradient(45deg, #0d8bd9, #0a6bb3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContactEmail = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

function App() {
  const [streams, setStreams] = useState([]);
  const [focusedStream, setFocusedStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [layoutMode, setLayoutMode] = useState('1/3'); // '1/3' or '2/2'
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

  const handleLayoutModeToggle = () => {
    setLayoutMode(prev => prev === '1/3' ? '2/2' : '1/3');
  };

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
  };

  const handleStreamRemove = (streamId) => {
    const updatedStreams = streams.filter(stream => stream.id !== streamId);
    setStreams(updatedStreams);
    
    // If the removed stream was focused, focus on the first remaining stream
    if (focusedStream === streamId) {
      if (updatedStreams.length > 0) {
        setFocusedStream(updatedStreams[0].id);
      } else {
        setFocusedStream(null);
      }
    }
    
    // Update selected channel for individual chat if needed
    if (selectedChannel && streams.find(s => s.id === streamId)?.channel === selectedChannel) {
      if (updatedStreams.length > 0) {
        setSelectedChannel(updatedStreams[0].channel);
      } else {
        setSelectedChannel(null);
      }
    }
  };

  const handleStreamFocus = (streamId) => {
    setFocusedStream(streamId);
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
            layoutMode={layoutMode}
            onLayoutModeToggle={handleLayoutModeToggle}
          />
          
          <Routes>
                        <Route path="/" element={
              <>
                <MainContent>
                  <StreamSection>
                    <StreamGrid 
                      streams={streams}
                      focusedStream={focusedStream}
                      onStreamFocus={handleStreamFocus}
                      socket={socket}
                      currentRoom={currentRoom}
                      layoutMode={layoutMode}
                      onStreamRemove={handleStreamRemove}
                    />
                  </StreamSection>
                  
                  <ChatSection>
                    <ChatContainer>
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
                    </ChatContainer>
                    
                    {/* Ad below chat */}
                    <AdContainer>
                      <AdSidebar 
                        slot={process.env.REACT_APP_ADSENSE_SIDEBAR_SLOT || "0987654321"}
                        isPremium={false}
                      />
                    </AdContainer>
                  </ChatSection>
                </MainContent>
                
                {/* Informações da página principal - abaixo de tudo */}
                <InfoSection>
                  <InfoContainer>
                    <InfoCard>
                      <InfoTitle>📖 Como Usar</InfoTitle>
                      <InfoContent>
                        <InfoStep>
                          <StepNumber>1</StepNumber>
                          <StepText>Adicione streams digitando o nome do streamer no campo de busca</StepText>
                        </InfoStep>
                        <InfoStep>
                          <StepNumber>2</StepNumber>
                          <StepText>Escolha entre os layouts 1/3 (uma stream grande + duas pequenas) ou 2/2 (duas streams iguais)</StepText>
                        </InfoStep>
                        <InfoStep>
                          <StepNumber>3</StepNumber>
                          <StepText>Passe o mouse sobre uma stream e clique no X para removê-la</StepText>
                        </InfoStep>
                      </InfoContent>
                    </InfoCard>
                    
                    <InfoCardSobre>
                      <InfoTitle>👤 Sobre</InfoTitle>
                      <InfoContent>
                        <p>O <strong>MultiTwitch+</strong> é uma ferramenta gratuita que permite assistir múltiplas streams do Twitch simultaneamente em uma única tela.</p>
                        <p>Desenvolvido com foco na experiência do usuário, oferece recursos como:</p>
                        <ul>
                          <li>🎯 Layouts flexíveis (1/3 e 2/2)</li>
                          <li>🏷️ Sistema de tags por canal</li>
                          <li>😀 Suporte a emotes do Twitch</li>
                        </ul>
                        <p>Este projeto foi criado para melhorar a experiência de quem gosta de acompanhar múltiplos streamers ao mesmo tempo, especialmente durante eventos e maratonas de gaming.</p>
                      </InfoContent>
                    </InfoCardSobre>
                    
                    <InfoCard>
                      <InfoTitle>❓ FAQ</InfoTitle>
                      <InfoContent>
                        <FAQItem>
                          <FAQQuestion>🔄 Por que as streams resetam ao mudar layout?</FAQQuestion>
                          <FAQAnswer>Isso é um comportamento normal! Quando você muda o layout (1/3 para 2/2), o React recria os componentes StreamPlayer e reinicializa os embeds do Twitch. Isso acontece porque as dimensões e posicionamento mudam, exigindo uma nova configuração dos embeds.</FAQAnswer>
                        </FAQItem>
                        
                        <FAQItem>
                          <FAQQuestion>📺 Quantas streams posso assistir simultaneamente?</FAQQuestion>
                          <FAQAnswer>Você pode assistir até 4 streams ao mesmo tempo. O layout se ajusta automaticamente: 1 stream fica sozinha, 2+ streams usam o layout 1/3 (1 grande + 3 pequenas) ou 2/2 (4 do mesmo tamanho).</FAQAnswer>
                        </FAQItem>
                        
                        <FAQItem>
                          <FAQQuestion>📱 O site funciona no celular?</FAQQuestion>
                          <FAQAnswer>O MultiTwitch+ funciona em dispositivos móveis, mas a experiência não é ideal devido ao tamanho das telas. As streams ficam muito pequenas e difíceis de visualizar. Recomendamos usar em desktop para a melhor experiência, onde você pode aproveitar todos os recursos e layouts disponíveis.</FAQAnswer>
                        </FAQItem>
                      </InfoContent>
                    </InfoCard>
                  </InfoContainer>
                </InfoSection>
                
                {/* Links Sociais */}
                <SocialSection>
                  <SocialContainer>
                    <SocialLink href="https://x.com/clips_alanzoka" target="_blank" rel="noopener noreferrer">
                      🎬 Visite minha página de clipes no Twitter
                    </SocialLink>
                    <ContactEmail>
                      📧 clipszoka04@gmail.com
                    </ContactEmail>
                  </SocialContainer>
                </SocialSection>
              </>
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
