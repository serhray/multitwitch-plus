import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const AdContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: ${props => props.margin || '10px 0'};
  min-height: ${props => props.height || '90px'};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.isPremium && `
    display: none;
  `}
`;

const AdPlaceholder = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  text-align: center;
  padding: 20px;
`;

function AdBanner({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  style = {},
  height = '90px',
  margin = '10px 0',
  isPremium = false 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    if (isPremium) return;

    try {
      // Initialize AdSense ad
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [isPremium]);

  if (isPremium) {
    return null;
  }

  return (
    <AdContainer height={height} margin={margin} isPremium={isPremium}>
      {slot ? (
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            ...style
          }}
          data-ad-client={process.env.REACT_APP_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXXX"}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        />
      ) : (
        <AdPlaceholder>
          📢 Espaço publicitário
          <br />
          <small>Configure seu AdSense ID</small>
        </AdPlaceholder>
      )}
    </AdContainer>
  );
}

export default AdBanner;
