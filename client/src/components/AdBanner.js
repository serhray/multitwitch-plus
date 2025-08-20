import React from 'react';
import AdSense from './AdSense';

function AdBanner({ slot, isPremium = false }) {
  return (
    <AdSense
      slot={slot}
      format="horizontal"
      style={{ height: '90px' }}
      isPremium={isPremium}
    />
  );
}

export default AdBanner;
