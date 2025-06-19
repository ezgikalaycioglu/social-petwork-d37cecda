
import React from 'react';

interface PawPinLogoProps {
  className?: string;
  size?: number;
}

const PawPinLogo = ({ className = "w-12 h-12", size = 48 }: PawPinLogoProps) => {
  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Map pin outline */}
        <path
          d="M24 2C17.372 2 12 7.372 12 14c0 8.5 12 30 12 30s12-21.5 12-30c0-6.628-5.372-12-12-12z"
          fill="#FFC107"
          stroke="#F57F17"
          strokeWidth="1.5"
        />
        
        {/* Paw print inside the pin */}
        <g transform="translate(24, 16)">
          {/* Main pad */}
          <ellipse cx="0" cy="2" rx="4" ry="3" fill="#F57F17"/>
          
          {/* Toe pads */}
          <circle cx="-2.5" cy="-2" r="1.5" fill="#F57F17"/>
          <circle cx="2.5" cy="-2" r="1.5" fill="#F57F17"/>
          <circle cx="-1" cy="-4" r="1.2" fill="#F57F17"/>
          <circle cx="1" cy="-4" r="1.2" fill="#F57F17"/>
        </g>
        
        {/* Small highlight on pin */}
        <ellipse cx="20" cy="8" rx="2" ry="3" fill="#FFEB3B" opacity="0.6"/>
      </svg>
    </div>
  );
};

export default PawPinLogo;
