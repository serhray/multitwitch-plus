import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';

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

const LogoContainer = styled.div`
  position: relative;
`;

const Logo = styled.button`
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1001;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:hover span {
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 0;
  min-width: 200px;
  z-index: 9999;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transform: translateY(${props => props.show ? '0' : '-10px'});
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
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

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NavSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
`;

const RoomInfo = styled.div`
  background: rgba(145, 70, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ff88;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

function Header({ onStreamAdd, currentRoom, onRoomCreate, onLoginClick, streams, onChatModeToggle, chatMode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleAddStream = async () => {
    if (searchQuery.trim()) {
      try {
        // For now, add stream directly without API validation
        // API validation can be added later when backend is fully configured
        onStreamAdd(searchQuery.trim());
        setSearchQuery('');
      } catch (error) {
        console.error('Error adding streamer:', error);
        alert('Erro ao adicionar streamer');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddStream();
    }
  };

  const handleLogoClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleHomeClick = () => {
    navigate('/');
    setShowDropdown(false);
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      logout();
    } else if (onLoginClick) {
      onLoginClick();
    }
    setShowDropdown(false);
  };

  const handleTutorialClick = () => {
    // TODO: Implementar página de tutorial
    alert('Tutorial: 1) Digite o nome do streamer 2) Clique em "Adicionar Stream" 3) Ajuste o volume no controle de áudio 4) Use o modo Game Focus para focar na gameplay!');
    setShowDropdown(false);
  };

  // Fechar dropdown ao clicar fora ou trocar janela
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    const handleWindowBlur = () => {
      setShowDropdown(false);
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('blur', handleWindowBlur);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showDropdown]);

  return (
    <HeaderContainer>
      <LogoContainer ref={dropdownRef}>
        <Logo onClick={handleLogoClick}>
          <span>Multitwitch+</span>
        </Logo>
        <DropdownMenu show={showDropdown}>
          <DropdownItem onClick={handleHomeClick}>
            🏠 Página Inicial
          </DropdownItem>
          <DropdownItem onClick={handleLoginClick}>
            {isAuthenticated ? '🚪 Logout' : '🔐 Login'}
          </DropdownItem>
          <DropdownItem onClick={handleTutorialClick}>
            📚 Como usar
          </DropdownItem>
        </DropdownMenu>
      </LogoContainer>
      
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
  );
}

export default Header;
