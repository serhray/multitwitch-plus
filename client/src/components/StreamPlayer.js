import React, { useEffect, useRef, useState } from 'react';
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

const RemoveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 59, 48, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: bold;
  opacity: 0;
  z-index: 10;

  ${PlayerContainer}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 59, 48, 1);
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
  }
`;

function StreamPlayer({ stream, isFocused, onVote, votes, showVoteButton, layoutMode, onStreamRemove }) {
  const playerRef = useRef(null);
  const embedRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadTwitchEmbed = () => {
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
        muted: false,
        volume: 1
      });

      embedRef.current = embed;

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        setIsLoaded(true);
        const player = embed.getPlayer();
        if (player) {
          player.setVolume(1);
          player.setMuted(false);
        }
      });
    } else {
      // Fallback: create iframe manually
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.twitch.tv/?channel=${stream.channel}&parent=${window.location.hostname}&autoplay=true&muted=false`;
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
  };

  useEffect(() => {
    if (stream && stream.isLive && stream.channel) {
      loadTwitchEmbed();
    }
  }, [stream, layoutMode, isFocused]);

  const handleRemoveStream = (e) => {
    e.stopPropagation();
    if (onStreamRemove) {
      onStreamRemove(stream.id);
    }
  };

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
      
      {onStreamRemove && (
        <RemoveButton 
          onClick={handleRemoveStream}
          title="Remover stream"
        >
          ✕
        </RemoveButton>
      )}
    </PlayerContainer>
  );
}

export default StreamPlayer;
