import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 100px;
  right: 20px;
  background: ${props => {
    switch (props.type) {
      case 'success':
        return 'linear-gradient(135deg, #00ff88, #00cc6a)';
      case 'error':
        return 'linear-gradient(135deg, #ff4757, #ff3742)';
      case 'warning':
        return 'linear-gradient(135deg, #ffa502, #ff9500)';
      default:
        return 'linear-gradient(135deg, #3742fa, #2f3542)';
    }
  }};
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 350px;
  z-index: 10000;
  font-size: 14px;
  line-height: 1.4;
`;

const NotificationIcon = styled.span`
  font-size: 18px;
  margin-right: 10px;
`;

const NotificationTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 15px;
`;

const NotificationMessage = styled.div`
  opacity: 0.9;
`;

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Sucesso!';
      case 'error':
        return 'Erro!';
      case 'warning':
        return 'Atenção!';
      default:
        return 'Informação';
    }
  };

  return (
    <AnimatePresence>
      <NotificationContainer
        type={type}
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={onClose}
        style={{ cursor: 'pointer' }}
      >
        <NotificationIcon>{getIcon()}</NotificationIcon>
        <div>
          <NotificationTitle>{getTitle()}</NotificationTitle>
          <NotificationMessage>{message}</NotificationMessage>
        </div>
      </NotificationContainer>
    </AnimatePresence>
  );
};

export default Notification;
