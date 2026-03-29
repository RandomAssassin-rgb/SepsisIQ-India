import React from 'react';

export const CaduceusIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Central Staff */}
    <line x1="12" y1="4" x2="12" y2="22" />
    
    {/* Wings */}
    <path d="M12 6c-3-2-7-1-8 2 0 3 4 4 8 2" />
    <path d="M12 6c3-2 7-1 8 2 0 3-4 4-8 2" />
    
    {/* Entwined Snakes */}
    <path d="M9 10c0 0-1 1-1 3s2 4 4 4 4-2 4-4-1-3-1-3" />
    <path d="M9 16c0 0-1 1-1 3s2 3 4 3 4-1 4-3-1-3-1-3" />
    
    {/* Top Knob */}
    <circle cx="12" cy="4" r="1" fill="currentColor" />
  </svg>
);
