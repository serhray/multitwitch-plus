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

const StreamEmbed = styled.div`
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

const PlatformBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${props => props.platform === 'kick' ? 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' : 'linear-gradient(135deg, #9146ff 0%, #772ce8 100%)'};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

const StreamInfo = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PlayerContainer}:hover & {
    opacity: 1;
  }
`;

const StreamTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StreamGame = styled.div`
  opacity: 0.8;
  font-size: 11px;
`;





function UnifiedStreamPlayer({ stream, isFocused, onVote, votes, showVoteButton, layoutMode, onStreamRemove }) {
  const playerRef = useRef(null);
  const embedRef = useRef(null);

  const loadTwitchEmbed = useCallback(() => {
    if (window.Twitch && window.Twitch.Embed) {
      const embed = new window.Twitch.Embed(playerRef.current, {
        width: '100%',
        height: '100%',
        channel: stream.channel,
        layout: 'video',
        autoplay: true,
        muted: false,
        volume: 1
      });

      embedRef.current = embed;
    } else {
      // Fallback: create iframe manually
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.twitch.tv/?channel=${stream.channel}&parent=${window.location.hostname}&autoplay=true&muted=false`;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      if (playerRef.current) {
        playerRef.current.appendChild(iframe);
      }
    }
  }, [stream.channel]);

  const loadKickEmbed = useCallback(() => {
    // Create Kick iframe (Kick doesn't support quality parameters via URL)
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.kick.com/${stream.channel}`;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.allow = 'autoplay; fullscreen';
    
    if (playerRef.current) {
      playerRef.current.appendChild(iframe);
    }
  }, [stream.channel]);

  const loadStreamEmbed = useCallback(() => {
    if (!playerRef.current) return;

    // Clear previous embed
    playerRef.current.innerHTML = '';
    
    if (stream.platform === 'kick') {
      loadKickEmbed();
    } else {
      loadTwitchEmbed();
    }
  }, [stream.platform, loadKickEmbed, loadTwitchEmbed]);

  useEffect(() => {
    if (stream && stream.isLive && stream.channel) {
      loadStreamEmbed();
    }
  }, [stream, layoutMode, isFocused, loadStreamEmbed]);

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
        <PlatformBadge platform={stream.platform || 'twitch'}>
          {stream.platform || 'twitch'}
        </PlatformBadge>
        <OfflineOverlay>
          <OfflineIcon>😴</OfflineIcon>
          <div>
            <h3>{stream.channel}</h3>
            <p>Stream offline</p>
          </div>
        </OfflineOverlay>
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

  return (
    <PlayerContainer isFocused={isFocused}>
      <PlatformBadge platform={stream.platform || 'twitch'}>
        {stream.platform || 'twitch'}
      </PlatformBadge>
      
      <StreamEmbed ref={playerRef} />
      
      {stream.stream && (
        <StreamInfo>
          <StreamTitle>{stream.stream.title}</StreamTitle>
          <StreamGame>{stream.stream.game}</StreamGame>
        </StreamInfo>
      )}
      
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

export default UnifiedStreamPlayer;
