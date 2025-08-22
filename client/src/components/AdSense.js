import React, { useEffect } from 'react';
import styled from 'styled-components';

const AdContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  min-height: ${props => props.height || '250px'};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  ${props => props.isPremium && `
    display: none;
  `}
`;

const AdSense = ({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  style = {},
  className = '',
  isPremium = false 
}) => {
  useEffect(() => {
    console.log('AdSense Debug:', {
      isPremium,
      enableAds: process.env.REACT_APP_ENABLE_ADS,
      clientId: process.env.REACT_APP_ADSENSE_CLIENT_ID,
      slot,
      format
    });

    // Only load ads if not premium and AdSense is enabled
    if (isPremium || !process.env.REACT_APP_ENABLE_ADS) {
      console.log('AdSense: Ads disabled or premium mode');
      return;
    }

    try {
      // Load AdSense script if not already loaded
      if (!window.adsbygoogle) {
        console.log('AdSense: Loading script...');
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.REACT_APP_ADSENSE_CLIENT_ID}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Push ad after script loads
      const timer = setTimeout(() => {
        if (window.adsbygoogle) {
          console.log('AdSense: Pushing ad...');
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } else {
          console.log('AdSense: Script not loaded yet');
        }
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [isPremium, slot, format]);

  // Don't render if premium or ads disabled
  if (isPremium || !process.env.REACT_APP_ENABLE_ADS || process.env.REACT_APP_PREMIUM_MODE === 'true') {
    console.log('AdSense: Not rendering ad');
    return null;
  }

  console.log('AdSense: Rendering ad container');
  return (
    <AdContainer className={className} isPremium={isPremium}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          ...style
        }}
        data-ad-client={process.env.REACT_APP_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </AdContainer>
  );
};

export default AdSense;
