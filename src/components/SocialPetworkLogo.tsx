
import React from 'react';

interface SocialPetworkLogoProps {
  className?: string;
  size?: number;
}

const SocialPetworkLogo = ({ className = "w-24 h-24", size = 96 }: SocialPetworkLogoProps) => {
  return (
    <img 
      src="/lovable-uploads/bed53e0f-52d4-45b8-ae07-fcb1a7eeabb8.png"
      alt="PawCult Logo"
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default SocialPetworkLogo;
