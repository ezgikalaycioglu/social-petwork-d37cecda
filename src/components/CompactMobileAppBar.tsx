import React from 'react';
import { MapPin } from 'lucide-react';
import { useLocation as useLocationHook } from '@/hooks/useLocation';
import { SocialPetworkLogo } from './SocialPetworkLogo';
import MobileMoreMenu from './MobileMoreMenu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const CompactMobileAppBar = () => {
  const { city, hasPermission, loading } = useLocationHook();

  const getLocationText = () => {
    if (loading) return 'Loading...';
    if (!hasPermission) return 'Location off';
    return city || 'Unknown';
  };

  const getLocationTooltip = () => {
    if (!hasPermission) {
      return 'Location access is currently disabled. Enable it in your browser settings to see nearby pets.';
    }
    if (city) {
      return `You are in ${city}`;
    }
    return 'Location detected';
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left: Location */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0 flex-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{getLocationText()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{getLocationTooltip()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Center: Logo */}
        <div className="flex-shrink-0 mx-2">
          <SocialPetworkLogo className="h-8 w-8" />
        </div>

        {/* Right: Menu */}
        <div className="flex justify-end flex-1">
          <MobileMoreMenu />
        </div>
      </div>
    </div>
  );
};

export default CompactMobileAppBar;
