import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const CreatorCard = styled(motion.div)`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const Input = styled.input`
  padding: 15px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #9146ff;
    box-shadow: 0 0 20px rgba(145, 70, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 15px 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    border-color: #9146ff;
    box-shadow: 0 0 20px rgba(145, 70, 255, 0.3);
  }
`;

const ChannelList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const ChannelTag = styled.div`
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  
  &:hover {
    opacity: 0.7;
  }
`;

const SettingsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
`;

const SettingsTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #9146ff;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button`
  flex: 1;
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CreateButton = styled(Button)`
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(145, 70, 255, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

function RoomCreator({ onRoomCreate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomName: '',
    channels: [],
    currentChannel: '',
    allowVoting: true,
    autoFocus: true,
    chatTranslation: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddChannel = (e) => {
    e.preventDefault();
    const channel = formData.currentChannel.trim().toLowerCase();
    if (channel && !formData.channels.includes(channel)) {
      setFormData(prev => ({
        ...prev,
        channels: [...prev.channels, channel],
        currentChannel: ''
      }));
    }
  };

  const handleRemoveChannel = (channelToRemove) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.filter(channel => channel !== channelToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/rooms/create', {
        roomName: formData.roomName,
        channels: formData.channels,
        creatorId: 'user-' + Date.now(), // In real app, use actual user ID
        settings: {
          allowVoting: formData.allowVoting,
          autoFocus: formData.autoFocus,
          chatTranslation: formData.chatTranslation
        }
      });

      if (response.data.success) {
        onRoomCreate(response.data.room);
        navigate('/');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Erro ao criar sala. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Container>
      <CreatorCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>🏠 Criar Nova Sala</Title>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Nome da Sala</Label>
            <Input
              type="text"
              name="roomName"
              placeholder="Ex: Assistindo os melhores streamers"
              value={formData.roomName}
              onChange={handleInputChange}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Adicionar Streamers</Label>
            <Input
              type="text"
              name="currentChannel"
              placeholder="Nome do streamer (ex: gaules, cellbit)"
              value={formData.currentChannel}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChannel(e)}
            />
            {formData.channels.length > 0 && (
              <ChannelList>
                {formData.channels.map((channel) => (
                  <ChannelTag key={channel}>
                    {channel}
                    <RemoveButton onClick={() => handleRemoveChannel(channel)}>
                      ×
                    </RemoveButton>
                  </ChannelTag>
                ))}
              </ChannelList>
            )}
          </InputGroup>

          <SettingsGroup>
            <SettingsTitle>⚙️ Configurações da Sala</SettingsTitle>
            
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="allowVoting"
                name="allowVoting"
                checked={formData.allowVoting}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="allowVoting">
                Permitir votação para stream principal
              </CheckboxLabel>
            </CheckboxGroup>

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="autoFocus"
                name="autoFocus"
                checked={formData.autoFocus}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="autoFocus">
                Foco automático por atividade
              </CheckboxLabel>
            </CheckboxGroup>

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="chatTranslation"
                name="chatTranslation"
                checked={formData.chatTranslation}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="chatTranslation">
                Tradução automática do chat
              </CheckboxLabel>
            </CheckboxGroup>
          </SettingsGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel}>
              Cancelar
            </CancelButton>
            <CreateButton 
              type="submit" 
              disabled={!formData.roomName.trim() || isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Sala'}
            </CreateButton>
          </ButtonGroup>
        </Form>
      </CreatorCard>
    </Container>
  );
}

export default RoomCreator;
