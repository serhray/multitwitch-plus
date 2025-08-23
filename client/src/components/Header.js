import React, { useState } from 'react';
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

const Logo = styled.div`
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

const SupportButton = styled.button`
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    background: linear-gradient(45deg, #0056b3, #004085);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CoffeeIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '';
    width: 16px;
    height: 12px;
    background: white;
    border: 2px solid #333;
    border-radius: 0 0 8px 8px;
    position: relative;
  }
  
  &::after {
    content: '♥';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    color: #ff6b35;
    font-size: 10px;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
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

const PixModalContent = styled.div`
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  transform: scale(${props => props.show ? 1 : 0.9});
  transition: all 0.3s ease;
`;

const PixTitle = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 24px;
  background: linear-gradient(45deg, #00d4aa, #0099cc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const PixInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PixKey = styled.div`
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 10px;
  padding: 15px;
  margin: 15px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00d4aa;
  word-break: break-all;
`;

const PixCopyButton = styled.button`
  background: linear-gradient(45deg, #00d4aa, #0099cc);
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px 5px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 212, 170, 0.3);
  }
`;



const PixCloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px 5px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
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

function Header({ onStreamAdd, currentRoom, onRoomCreate, onLoginClick, streams, layoutMode, onLayoutModeToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [showPixModal, setShowPixModal] = useState(false);



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

  const handleSupportClick = () => {
    setShowPixModal(true);
  };

  const closePixModal = () => {
    setShowPixModal(false);
  };

  const copyPixKey = () => {
    const livePixUrl = 'https://livepix.gg/clipszoka';
    navigator.clipboard.writeText(livePixUrl).then(() => {
      showNotification('Link do LivePix copiado para a área de transferência!', 'success');
    }).catch(() => {
      showNotification('Erro ao copiar link do LivePix', 'error');
    });
  };

  const openLivePix = () => {
    window.open('https://livepix.gg/clipszoka', '_blank');
  };



  return (
    <>
      <HeaderContainer>
        <Logo>
          <span>Multitwitch+</span>
        </Logo>
        
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
          <SupportButton onClick={handleSupportClick}>
            <CoffeeIcon />
            Support me
          </SupportButton>
          
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

      {/* Modal PIX */}
      <ModalOverlay show={showPixModal} onClick={closePixModal}>
        <PixModalContent show={showPixModal} onClick={(e) => e.stopPropagation()}>
          <PixTitle>Apoie o Projeto</PixTitle>
          
          <PixInfo>
            <p style={{ color: 'white', margin: '0 0 15px 0' }}>
              Se você gostou do MultiTwitch+ e quer apoiar o desenvolvimento, 
              considere fazer uma doação via PIX!
            </p>

          </PixInfo>

          <div style={{ margin: '20px 0' }}>
            <p style={{ color: 'white', margin: '0 0 10px 0', fontWeight: 'bold' }}>
              Chave PIX:
            </p>
            <PixKey>
              https://livepix.gg/clipszoka
            </PixKey>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <PixCopyButton onClick={copyPixKey}>
              📋 Copiar Link
            </PixCopyButton>
            <PixCopyButton onClick={openLivePix}>
              🔗 Abrir LivePix
            </PixCopyButton>
            <PixCloseButton onClick={closePixModal}>
              ✕ Fechar
            </PixCloseButton>
          </div>
        </PixModalContent>
      </ModalOverlay>
    </>
  );
}

export default Header;
