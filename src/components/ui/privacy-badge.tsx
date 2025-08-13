import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, MapPin, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacyBadgeProps {
  type: 'location' | 'profile' | 'contact';
  level: 'public' | 'protected' | 'private';
  className?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ type, level, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'location':
        return <MapPin className="w-3 h-3 mr-1" />;
      case 'profile':
        return <Eye className="w-3 h-3 mr-1" />;
      case 'contact':
        return <Shield className="w-3 h-3 mr-1" />;
      default:
        return <Shield className="w-3 h-3 mr-1" />;
    }
  };

  const getVariant = () => {
    switch (level) {
      case 'public':
        return 'secondary';
      case 'protected':
        return 'outline';
      case 'private':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getText = () => {
    const typeText = type.charAt(0).toUpperCase() + type.slice(1);
    const levelText = level.charAt(0).toUpperCase() + level.slice(1);
    return `${typeText} ${levelText}`;
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn('text-xs flex items-center', className)}
    >
      {getIcon()}
      {getText()}
    </Badge>
  );
};