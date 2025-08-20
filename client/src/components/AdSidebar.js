import React from 'react';
import AdSense from './AdSense';

function AdSidebar({ 
  slot, 
  isPremium = false, 
  height = '250px',
  format = 'rectangle',
  responsive = true,
  style = {}
}) {
  return (
    <AdSense
      slot={slot}
      format={format}
      responsive={responsive}
      style={{ height, ...style }}
      isPremium={isPremium}
    />
  );
}

export default AdSidebar;
