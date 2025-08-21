import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  border-radius: ${props => props.isFocused ? '15px' : '10px'};
  overflow: hidden;
`;

const TwitchEmbed = styled.div`
  width: 100%;
  height: 100%;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const OfflineOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  gap: 15px;
`;

const OfflineIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`;


const AudioControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${PlayerContainer}:hover & {
    opacity: 1;
  }
`;

const AudioButton = styled.button`
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(145, 70, 255, 0.8);
    transform: scale(1.1);
  }
`;

const VolumeSlider = styled.input`
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  
  ${PlayerContainer}:hover & {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(145, 70, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 3px 12px rgba(145, 70, 255, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.2);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(45deg, #9146ff, #00f5ff);
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(145, 70, 255, 0.4);
  }

  &::-moz-range-track {
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    border: none;
  }
`;


function StreamPlayer({ stream, isFocused, onVote, votes, showVoteButton, layoutMode }) {
  const playerRef = useRef(null);
  const [volume, setVolume] = useState(isFocused ? 1 : 0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadTwitchEmbed = useCallback(() => {
    if (playerRef.current && window.Twitch && window.Twitch.Embed) {
      // Clear previous embed
      playerRef.current.innerHTML = '';
      
      // Determine layout based on mode and focus
      let embedLayout = 'video';
      let embedWidth = '100%';
      let embedHeight = '100%';
      
      const embed = new window.Twitch.Embed(playerRef.current, {
        width: embedWidth,
        height: embedHeight,
        channel: stream.channel,
        layout: embedLayout,
        autoplay: true,
        muted: isMuted,
        volume: volume
      });

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        setIsLoaded(true);
        const player = embed.getPlayer();
        if (player) {
          player.setVolume(volume);
          player.setMuted(isMuted);
        }
      });
    } else {
      // Fallback: create iframe manually
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.twitch.tv/?channel=${stream.channel}&parent=${window.location.hostname}&autoplay=true&muted=${isMuted}`;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      if (playerRef.current) {
        playerRef.current.innerHTML = '';
        playerRef.current.appendChild(iframe);
        setIsLoaded(true);
      }
    }
  }, [stream, layoutMode, isFocused, isMuted, volume]);

  useEffect(() => {
    if (stream && stream.isLive && stream.channel) {
      loadTwitchEmbed();
    }
  }, [stream, layoutMode, isFocused, loadTwitchEmbed]);

  useEffect(() => {
    // Adjust volume based on focus
    setVolume(isFocused ? 1 : 0.3);
  }, [isFocused]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    // Update Twitch player volume if available
    if (window.Twitch && playerRef.current) {
      const embed = playerRef.current.querySelector('iframe');
      if (embed) {
        // Send message to iframe (if same origin)
        try {
          embed.contentWindow.postMessage({
            type: 'setVolume',
            volume: newVolume
          }, '*');
        } catch (e) {
          console.log('Cannot control iframe volume due to CORS');
        }
      }
    }
  };

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (isLoaded) {
      loadTwitchEmbed(); // Reload with new mute state
    }
  }, [isLoaded, loadTwitchEmbed]);

  // Safe guards for stream availability
  if (!stream || !stream.channel) {
    return (
      <PlayerContainer isFocused={isFocused}>
        <OfflineOverlay>
          <OfflineIcon>📺</OfflineIcon>
          <div>Stream não disponível</div>
        </OfflineOverlay>
      </PlayerContainer>
    );
  }

  if (!stream.isLive) {
    return (
      <PlayerContainer isFocused={isFocused}>
        <OfflineOverlay>
          <OfflineIcon>😴</OfflineIcon>
          <div>
            <h3>{stream.channel}</h3>
            <p>Stream offline</p>
          </div>
        </OfflineOverlay>
      </PlayerContainer>
    );
  }

  return (
    <PlayerContainer isFocused={isFocused}>
      <TwitchEmbed ref={playerRef} />

      <AudioControls>
        <AudioButton onClick={toggleMute}>
          {isMuted ? '🔇' : '🔊'}
        </AudioButton>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
        />
      </AudioControls>

    </PlayerContainer>
  );
}

export default StreamPlayer;
