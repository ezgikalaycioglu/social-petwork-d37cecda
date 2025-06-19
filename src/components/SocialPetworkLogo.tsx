
import React from 'react';

interface SocialPetworkLogoProps {
  className?: string;
  size?: number;
}

const SocialPetworkLogo = ({ className = "w-24 h-24", size = 96 }: SocialPetworkLogoProps) => {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Circular background */}
        <circle cx="48" cy="48" r="46" fill="#f0fdf4" stroke="#16a34a" strokeWidth="4"/>
        
        {/* First dog (top, orange) */}
        <g transform="translate(24, 16)">
          {/* Body */}
          <ellipse cx="24" cy="20" rx="18" ry="12" fill="#fb923c"/>
          {/* Head */}
          <circle cx="24" cy="8" r="10" fill="#fb923c"/>
          {/* Ears */}
          <ellipse cx="18" cy="4" rx="3" ry="6" fill="#ea580c"/>
          <ellipse cx="30" cy="4" rx="3" ry="6" fill="#ea580c"/>
          {/* Eyes */}
          <circle cx="21" cy="7" r="1.5" fill="#1f2937"/>
          <circle cx="27" cy="7" r="1.5" fill="#1f2937"/>
          {/* Nose */}
          <ellipse cx="24" cy="10" rx="1" ry="1.5" fill="#1f2937"/>
          {/* Tail */}
          <ellipse cx="40" cy="18" rx="8" ry="3" fill="#fb923c" transform="rotate(30 40 18)"/>
          {/* Paws */}
          <circle cx="16" cy="30" r="3" fill="#ea580c"/>
          <circle cx="32" cy="30" r="3" fill="#ea580c"/>
        </g>
        
        {/* Second dog (bottom, blue, rotated 180 degrees) */}
        <g transform="translate(72, 80) rotate(180)">
          {/* Body */}
          <ellipse cx="24" cy="20" rx="18" ry="12" fill="#3b82f6"/>
          {/* Head */}
          <circle cx="24" cy="8" r="10" fill="#3b82f6"/>
          {/* Ears */}
          <ellipse cx="18" cy="4" rx="3" ry="6" fill="#1d4ed8"/>
          <ellipse cx="30" cy="4" rx="3" ry="6" fill="#1d4ed8"/>
          {/* Eyes */}
          <circle cx="21" cy="7" r="1.5" fill="#1f2937"/>
          <circle cx="27" cy="7" r="1.5" fill="#1f2937"/>
          {/* Nose */}
          <ellipse cx="24" cy="10" rx="1" ry="1.5" fill="#1f2937"/>
          {/* Tail */}
          <ellipse cx="40" cy="18" rx="8" ry="3" fill="#3b82f6" transform="rotate(30 40 18)"/>
          {/* Paws */}
          <circle cx="16" cy="30" r="3" fill="#1d4ed8"/>
          <circle cx="32" cy="30" r="3" fill="#1d4ed8"/>
        </g>
        
        {/* Social network dots */}
        <circle cx="48" cy="24" r="2" fill="#16a34a"/>
        <circle cx="72" cy="48" r="2" fill="#16a34a"/>
        <circle cx="48" cy="72" r="2" fill="#16a34a"/>
        <circle cx="24" cy="48" r="2" fill="#16a34a"/>
        
        {/* Connecting lines for social aspect */}
        <line x1="48" y1="26" x2="70" y2="46" stroke="#16a34a" strokeWidth="1" opacity="0.6"/>
        <line x1="70" y1="50" x2="50" y2="70" stroke="#16a34a" strokeWidth="1" opacity="0.6"/>
        <line x1="46" y1="70" x2="26" y2="50" stroke="#16a34a" strokeWidth="1" opacity="0.6"/>
        <line x1="26" y1="46" x2="46" y2="26" stroke="#16a34a" strokeWidth="1" opacity="0.6"/>
      </svg>
    </div>
  );
};

export default SocialPetworkLogo;
