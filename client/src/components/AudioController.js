import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ControllerContainer = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ControllerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  background: linear-gradient(45deg, #9146ff, #00f5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(45deg, #9146ff, #00f5ff)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 20px;
  color: white;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 8px;

  &:hover {
    transform: translateY(-1px);
  }
`;


const VolumeSection = styled.div`
  margin-bottom: 20px;
`;

const VolumeLabel = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.8);
`;

const VolumeSlider = styled.input`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  outline: none;
  margin-bottom: 10px;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(145, 70, 255, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(145, 70, 255, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.2);
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 12px rgba(145, 70, 255, 0.4);
  }

  &::-moz-range-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    border: none;
  }
`;

const VolumeValue = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  float: right;
`;

const StreamVolumeList = styled.div`
  max-height: 250px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StreamVolumeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const StreamName = styled.div`
  font-size: 14px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FocusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.focused ? '#00ff88' : 'rgba(255, 255, 255, 0.3)'};
`;

const StreamControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StreamSlider = styled.input`
  width: 80px;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(145, 70, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(145, 70, 255, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 3px 8px rgba(145, 70, 255, 0.3);
  }

  &::-moz-range-track {
    height: 6px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    border: none;
  }
`;

const RemoveButton = styled.button`
  background: rgba(255, 59, 48, 0.8);
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: bold;

  &:hover {
    background: rgba(255, 59, 48, 1);
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
  }
`;

const ActivityIndicator = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 8px;
  border-left: 3px solid #00ff88;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
`;

function AudioController({ streams, focusedStream, onStreamRemove }) {
  const [audioLevels, setAudioLevels] = useState({});
  const [mutedStreams, setMutedStreams] = useState(new Set());
  const [volumes, setVolumes] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);

  const [streamVolumes, setStreamVolumes] = useState({});
  const [activityDetection, setActivityDetection] = useState(null);
  const [layoutMode, setLayoutMode] = useState('normal');

  useEffect(() => {
    // Initialize stream volumes
    const initialVolumes = {};
    streams.forEach(stream => {
      initialVolumes[stream.id] = stream.id === focusedStream ? 1 : 0.3;
    });
    setStreamVolumes(initialVolumes);
  }, [streams, focusedStream]);

  useEffect(() => {
    // Simulate audio activity detection
    if (true && streams.length > 0) {
      const interval = setInterval(() => {
        // Mock activity detection - in real app, this would analyze audio levels
        const activeStream = streams[Math.floor(Math.random() * streams.length)];
        if (Math.random() > 0.8) { // 20% chance of activity detection
          setActivityDetection({
            stream: activeStream.channel,
            reason: 'High audio activity detected',
            timestamp: new Date()
          });
          
          // Auto-focus after 2 seconds
          setTimeout(() => {
            setActivityDetection(null);
          }, 2000);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [streams]);

  const handleMasterVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolumes(prev => ({
      ...prev,
      masterVolume: value
    }));
  };

  const handleFocusedVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolumes(prev => ({
      ...prev,
      focusedVolume: value
    }));
  };

  const handleBackgroundVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolumes(prev => ({
      ...prev,
      backgroundVolume: value
    }));
  };

  const handleStreamVolumeChange = (streamId, volume) => {
    setStreamVolumes(prev => ({
      ...prev,
      [streamId]: volume
    }));
  };

  const toggleAutoFocus = () => {
    setVolumes(prev => ({
      ...prev,
      autoFocus: !prev.autoFocus
    }));
  };

  const handleRemoveStream = (streamId) => {
    if (onStreamRemove) {
      onStreamRemove(streamId);
    }
  };

  const toggleLayoutMode = () => {
    // Only normal mode available now
    setLayoutMode('normal');
    if (true) {
      console.log('Layout mode changed to normal');
    }
  };

  return (
    <ControllerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ControllerHeader>
        <Title>🎵 Controle de Áudio Inteligente</Title>
        <ToggleButton 
          active={volumes.autoFocus}
          onClick={toggleAutoFocus}
        >
          Auto-Focus {volumes.autoFocus ? 'ON' : 'OFF'}
        </ToggleButton>
      </ControllerHeader>


      <VolumeSection>
        <VolumeLabel>
          Volume Master
          <VolumeValue>{Math.round((volumes.masterVolume || 0.5) * 100)}%</VolumeValue>
        </VolumeLabel>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumes.masterVolume || 0.5}
          onChange={handleMasterVolumeChange}
        />
      </VolumeSection>

      <VolumeSection>
        <VolumeLabel>
          Volume do Stream Principal
          <VolumeValue>{Math.round((volumes.focusedVolume || 0.8) * 100)}%</VolumeValue>
        </VolumeLabel>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumes.focusedVolume || 0.8}
          onChange={handleFocusedVolumeChange}
        />
      </VolumeSection>

      <VolumeSection>
        <VolumeLabel>
          Volume dos Streams Secundários
          <VolumeValue>{Math.round((volumes.backgroundVolume || 0.3) * 100)}%</VolumeValue>
        </VolumeLabel>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volumes.backgroundVolume || 0.3}
          onChange={handleBackgroundVolumeChange}
        />
      </VolumeSection>

      {streams.length > 0 && (
        <VolumeSection>
          <VolumeLabel>
            📺 Gerenciar Streams
            <VolumeValue>{streams.length} stream{streams.length !== 1 ? 's' : ''}</VolumeValue>
          </VolumeLabel>
          <StreamVolumeList>
            {streams.map(stream => (
              <StreamVolumeItem key={stream.id}>
                <StreamName>
                  <FocusIndicator focused={stream.id === focusedStream} />
                  {stream.channel}
                </StreamName>
                <StreamControls>
                  <StreamSlider
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={streamVolumes[stream.id] || 0.5}
                    onChange={(e) => handleStreamVolumeChange(stream.id, parseFloat(e.target.value))}
                  />
                  <RemoveButton 
                    onClick={() => handleRemoveStream(stream.id)}
                    title="Remover stream"
                  >
                    ✕
                  </RemoveButton>
                </StreamControls>
              </StreamVolumeItem>
            ))}
          </StreamVolumeList>
        </VolumeSection>
      )}

      {activityDetection && (
        <ActivityIndicator>
          🔊 {activityDetection.reason} em <strong>{activityDetection.stream}</strong>
        </ActivityIndicator>
      )}
    </ControllerContainer>
  );
}

export default AudioController;
