import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const SidebarAdContainer = styled.div`
  width: 100%;
  min-height: 200px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  margin: 10px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => props.isPremium && `
    display: none;
  `}
`;

const AdLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
`;

const AdPlaceholder = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
`;

function AdSidebar({ slot, isPremium = false }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (isPremium) return;

    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense sidebar error:', error);
    }
  }, [isPremium]);

  if (isPremium) {
    return null;
  }

  return (
    <SidebarAdContainer isPremium={isPremium}>
      <AdLabel>Publicidade</AdLabel>
      {slot ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '300px',
            height: '250px'
          }}
          data-ad-client={process.env.REACT_APP_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXXX"}
          data-ad-slot={slot}
          data-ad-format="rectangle"
        />
      ) : (
        <AdPlaceholder>
          🎮 Gaming Gear
          <br />
          <small>Equipamentos para streamers</small>
          <br />
          <br />
          💻 Software Premium
          <br />
          <small>Ferramentas de streaming</small>
        </AdPlaceholder>
      )}
    </SidebarAdContainer>
  );
}

export default AdSidebar;
