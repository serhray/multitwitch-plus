import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import UserProfile from './UserProfile';
import Notification from './Notification';

const HeaderContainer = styled.header`
  height: 80px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1000;
`;

const Logo = styled.button`
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  padding: 8px 12px;
  border-radius: 8px;
  position: relative;
  z-index: 1001;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(145, 70, 255, 0.3);
  }

  &:active {
    transform: scale(1.02);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 0;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 1002;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.show ? '0' : '-10px'});
  transition: all 0.3s ease;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: rgba(145, 70, 255, 0.2);
  }

  &:first-child {
    border-radius: 10px 10px 0 0;
  }

  &:last-child {
    border-radius: 0 0 10px 10px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transform: ${props => props.show ? 'scale(1)' : 'scale(0.9)'};
  transition: all 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: all 0.2s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FeatureSection = styled.div`
  margin-bottom: 25px;
`;

const FeatureTitle = styled.h3`
  color: #9146ff;
  margin: 0 0 10px 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  color: rgba(255, 255, 255, 0.7);
  margin: 10px 0;
  padding-left: 20px;
  line-height: 1.6;
`;

const FeatureListItem = styled.li`
  margin-bottom: 8px;
`;

const SearchSection = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
  max-width: 600px;
  margin: 0 30px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    border-color: #9146ff;
    box-shadow: 0 0 20px rgba(145, 70, 255, 0.3);
  }
`;

const AddButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(45deg, #666, #888);
    cursor: not-allowed;
    transform: none;
  }
`;

const LayoutButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(45deg, #ff6b6b, #ffa726);
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &::after {
    content: '▼';
    margin-left: 8px;
    font-size: 12px;
    opacity: 0.8;
  }
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
`;

function Header({ onStreamAdd, currentRoom, onRoomCreate, onLoginClick, streams, onChatModeToggle, chatMode, layoutMode, onLayoutModeToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddStream = async () => {
    if (!searchQuery.trim()) return;
    
    const channelName = searchQuery.trim();
    
    // Check if streamer is already added
    if (streams.some(stream => stream.channel.toLowerCase() === channelName.toLowerCase())) {
      showNotification('Este streamer já foi adicionado!', 'warning');
      return;
    }

    // Add stream directly (como funcionava antes)
    onStreamAdd(channelName);
    setSearchQuery('');
    showNotification(`Streamer "${channelName}" adicionado com sucesso!`, 'success');
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddStream();
    }
  };

  const handleLogoClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleTutorialClick = () => {
    setShowDropdown(false);
    setShowTutorial(true);
  };

  const handleAboutClick = () => {
    setShowDropdown(false);
    setShowAbout(true);
  };

  const handleFAQClick = () => {
    setShowDropdown(false);
    setShowFAQ(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const closeAbout = () => {
    setShowAbout(false);
  };

  const closeFAQ = () => {
    setShowFAQ(false);
  };

  return (
    <>
      <HeaderContainer>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <Logo onClick={handleLogoClick}>
            <span>Multitwitch+</span>
          </Logo>
          
          <DropdownMenu show={showDropdown}>
            <DropdownItem onClick={handleTutorialClick}>
              📖 Como Usar
            </DropdownItem>
            <DropdownItem onClick={handleAboutClick}>
              👨‍💻 Sobre
            </DropdownItem>
            <DropdownItem onClick={handleFAQClick}>
              ❓ FAQ
            </DropdownItem>
          </DropdownMenu>
        </div>
        
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Digite o nome do streamer para adicionar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <AddButton onClick={handleAddStream}>
            Adicionar Stream
          </AddButton>
          {streams && streams.length >= 2 && (
            <LayoutButton onClick={onLayoutModeToggle}>
              {layoutMode === '1/3' ? 'Layout 1/3' : 'Layout 2/2'}
            </LayoutButton>
          )}
        </SearchSection>

        <NavSection>
          {streams && streams.length >= 2 && (
            <AddButton onClick={onChatModeToggle}>
              {chatMode === 'unified' ? 'Alternar Chats' : 'Chat Unificado'}
            </AddButton>
          )}
          
          <UserProfile />
        </NavSection>
      </HeaderContainer>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ModalOverlay show={showTutorial} onClick={closeTutorial}>
        <ModalContent show={showTutorial} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>🎮 Como Usar o MultiTwitch+</ModalTitle>
            <CloseButton onClick={closeTutorial}>×</CloseButton>
          </ModalHeader>

          <FeatureSection>
            <FeatureTitle>📺 Adicionar Streams</FeatureTitle>
            <FeatureDescription>
              Adicione múltiplos streamers para assistir simultaneamente:
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>Digite o nome do streamer na barra de pesquisa</FeatureListItem>
              <FeatureListItem>Clique em "Adicionar Stream" ou pressione Enter</FeatureListItem>
              <FeatureListItem>O stream será carregado automaticamente</FeatureListItem>
            </FeatureList>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🎯 Focar em Streams</FeatureTitle>
            <FeatureDescription>
              Clique em qualquer stream para focar nele:
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>O stream focado fica em destaque na parte superior</FeatureListItem>
              <FeatureListItem>Streams secundários ficam na parte inferior</FeatureListItem>
              <FeatureListItem>Você pode alternar o foco a qualquer momento</FeatureListItem>
            </FeatureList>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🔄 Layouts Disponíveis</FeatureTitle>
            <FeatureDescription>
              Escolha entre diferentes layouts de visualização:
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem><strong>Layout 1/3:</strong> Stream principal grande + 3 pequenos</FeatureListItem>
              <FeatureListItem><strong>Layout 2/2:</strong> 4 streams do mesmo tamanho (2x2)</FeatureListItem>
              <FeatureListItem>O botão de layout aparece quando há 2+ streams</FeatureListItem>
              <FeatureListItem><em>OBS: mudar o layout ira reiniciar as streams.</em></FeatureListItem>
            </FeatureList>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🗑️ Remover Streams</FeatureTitle>
            <FeatureDescription>
              Para remover uma stream:
            </FeatureDescription>
            <FeatureList>
              <FeatureListItem>Passe o mouse sobre a stream</FeatureListItem>
              <FeatureListItem>Clique no botão "✕" vermelho que aparece</FeatureListItem>
              <FeatureListItem>A stream será removida imediatamente</FeatureListItem>
            </FeatureList>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🚀 Dicas Rápidas</FeatureTitle>
            <FeatureList>
              <FeatureListItem>Use nomes exatos dos streamers (ex: "pokimane", "xqc")</FeatureListItem>
              <FeatureListItem>O layout se ajusta automaticamente ao número de streams</FeatureListItem>
              <FeatureListItem>Você pode ter até 4 streams simultâneas</FeatureListItem>
              <FeatureListItem>O foco muda automaticamente quando você remove o stream principal</FeatureListItem>
            </FeatureList>
          </FeatureSection>
        </ModalContent>
      </ModalOverlay>

      <ModalOverlay show={showAbout} onClick={closeAbout}>
        <ModalContent show={showAbout} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>👨‍💻 Sobre o MultiTwitch+</ModalTitle>
            <CloseButton onClick={closeAbout}>×</CloseButton>
          </ModalHeader>

          <FeatureSection>
            <FeatureTitle>👋 Olá!</FeatureTitle>
            <FeatureDescription>
              Me chamo Sérgio, ou clipszoka do Twitter/X, faço edição de video a uns 3 anos, na grande maioria sendo do Alanzoka, e atualmente estou aprendendo(tentando) sobre programação, sendo a MultiTwitch+ o meu primeiro pequeno projeto, não esta perfeito mas funcional!
            </FeatureDescription>
            <FeatureDescription style={{ marginTop: '20px', fontStyle: 'italic', color: '#9146ff' }}>
              Espero que gostem!
            </FeatureDescription>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🎯 Sobre o Projeto</FeatureTitle>
            <FeatureDescription>
              O MultiTwitch+ é uma ferramenta que permite assistir múltiplas streams do Twitch simultaneamente, oferecendo uma experiência única para quem gosta de acompanhar vários streamers ao mesmo tempo.
            </FeatureDescription>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🚀 Tecnologias Utilizadas</FeatureTitle>
            <FeatureList>
              <FeatureListItem>React.js - Interface do usuário</FeatureListItem>
              <FeatureListItem>Node.js - Backend e APIs</FeatureListItem>
              <FeatureListItem>Socket.IO - Comunicação em tempo real</FeatureListItem>
              <FeatureListItem>Twitch API - Integração com streams</FeatureListItem>
              <FeatureListItem>Styled Components - Estilização</FeatureListItem>
            </FeatureList>
          </FeatureSection>
        </ModalContent>
      </ModalOverlay>

      <ModalOverlay show={showFAQ} onClick={closeFAQ}>
        <ModalContent show={showFAQ} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>❓ Perguntas Frequentes</ModalTitle>
            <CloseButton onClick={closeFAQ}>×</CloseButton>
          </ModalHeader>

          <FeatureSection>
            <FeatureTitle>🔄 Por que as streams resetam ao mudar layout?</FeatureTitle>
            <FeatureDescription>
              Isso é um comportamento normal! Quando você muda o layout (1/3 para 2/2), o React recria os componentes StreamPlayer e reinicializa os embeds do Twitch. Isso acontece porque as dimensões e posicionamento mudam, exigindo uma nova configuração dos embeds.
            </FeatureDescription>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>📺 Quantas streams posso assistir simultaneamente?</FeatureTitle>
            <FeatureDescription>
              Você pode assistir até 4 streams ao mesmo tempo. O layout se ajusta automaticamente: 1 stream fica sozinha, 2+ streams usam o layout 1/3 (1 grande + 3 pequenas) ou 2/2 (4 do mesmo tamanho).
            </FeatureDescription>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>📱 O site funciona no celular?</FeatureTitle>
            <FeatureDescription>
              O MultiTwitch+ funciona em dispositivos móveis, mas a experiência não é ideal devido ao tamanho das telas. As streams ficam muito pequenas e difíceis de visualizar. Recomendamos usar em desktop para a melhor experiência, onde você pode aproveitar todos os recursos e layouts disponíveis.
            </FeatureDescription>
          </FeatureSection>

          <FeatureSection>
            <FeatureTitle>🎯 Como otimizar minha experiência?</FeatureTitle>
            <FeatureDescription>
              Use nomes exatos dos streamers (ex: "pokimane", "xqc"), experimente diferentes layouts para encontrar o ideal, e aproveite o sistema de foco para destacar sua stream favorita. O foco muda automaticamente quando você remove o stream principal.
            </FeatureDescription>
          </FeatureSection>
        </ModalContent>
      </ModalOverlay>
    </>
  );
}

export default Header;
