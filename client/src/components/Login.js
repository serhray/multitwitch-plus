import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const LoginContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const LoginModal = styled(motion.div)`
  background: rgba(20, 20, 30, 0.95);
  border-radius: 20px;
  padding: 40px;
  border: 2px solid rgba(145, 70, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 10px;
  font-size: 28px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
`;

const TwitchButton = styled.button`
  background: linear-gradient(45deg, #9146ff, #6441a4);
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto 20px;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(145, 70, 255, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 10px 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

function Login({ isOpen, onClose, onLogin }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleTwitchLogin = async () => {
    setIsLoading(true);
    
    try {
      // Redirecionar para o backend para iniciar OAuth
      const response = await fetch('/api/auth?action=login');
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <LoginContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <LoginModal
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Title>Entrar no Multitwitch+</Title>
        <Subtitle>
          Faça login com sua conta Twitch para acessar recursos personalizados,
          salvar suas configurações e sincronizar com seus streamers favoritos.
        </Subtitle>

        <TwitchButton onClick={handleTwitchLogin} disabled={isLoading}>
          <TwitchIcon />
          {isLoading ? 'Conectando...' : 'Entrar com Twitch'}
        </TwitchButton>

        <CloseButton onClick={onClose}>
          Cancelar
        </CloseButton>
      </LoginModal>
    </LoginContainer>
  );
}

export default Login;
