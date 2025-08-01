import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, PawPrint, Settings, Plus, MapPin, Calendar, Users as UsersIcon, Building2, Tag } from 'lucide-react';
import MobileMoreMenu from './MobileMoreMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation as useUserLocation } from '@/hooks/useLocation';
import { useReadyToPlay } from '@/contexts/ReadyToPlayContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SocialPetworkLogo from './SocialPetworkLogo';

const MobileTopNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { loading: locationLoading, coordinates, error: locationError } = useUserLocation();
  const { isReady } = useReadyToPlay();

  if (!user) {
    return null;
  }

  const getLocationTooltipContent = () => {
    if (locationLoading) return "Getting your location...";
    if (locationError) return "Enable location access for the full pet map experience.";
    if (isReady) return "Location Enabled. You're sharing your location with other pets.";
    return "Location disabled. Toggle 'ready to play' to share your location with other pets.";
  };

  const handleLocationClick = () => {
    const content = getLocationTooltipContent();
    toast({
      title: isReady ? "Location Enabled" : "Location Disabled",
      description: content,
      variant: isReady ? "default" : "destructive",
    });
  };

  const renderContent = () => {
    // Home tab - Logo centered, Notifications right
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                   <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <div className="absolute right-0">
            <MobileMoreMenu />
          </div>
        </div>
      );
    }

    // Social tab - Location icon left, logo center
    if (location.pathname === '/discover' || location.pathname === '/pet-social' || 
        location.pathname === '/events' || location.pathname === '/pet-map' || location.pathname === '/social') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                   <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
           <SocialPetworkLogo />
           <div className="absolute right-0">
             <MobileMoreMenu />
           </div>
         </div>
      );
    }

    // Packs tab - Location icon left, logo center, Create pack right
    if (location.pathname.startsWith('/packs')) {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                   <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <div className="absolute right-0">
            <MobileMoreMenu />
          </div>
        </div>
      );
    }

    // Businesses and Deals tab - Location icon left, navigation center
    if (location.pathname === '/deals' || location.pathname === '/business-dashboard') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                   <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <nav className="flex space-x-1 overflow-x-auto">
            <Link
              to="/business-dashboard"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                location.pathname === '/business-dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Businesses
            </Link>
            <Link
              to="/deals"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                location.pathname === '/deals'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Deals
            </Link>
           </nav>
           <div className="absolute right-0">
             <MobileMoreMenu />
           </div>
         </div>
      );
    }

    // Profile tab - Location icon left, logo center, Settings right
    if (location.pathname === '/profile' || location.pathname === '/my-pets' || 
        location.pathname === '/settings') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                   <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <div className="absolute right-0">
            <MobileMoreMenu />
          </div>
        </div>
      );
    }

    // Default - Location icon left, logo center
    return (
      <div className="flex items-center justify-center w-full relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute left-0 p-2 cursor-pointer" onClick={handleLocationClick}>
                <MapPin className={`w-6 h-6 ${isReady ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </TooltipTrigger>
              <TooltipContent side="bottom" className="block md:hidden">
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
          </Tooltip>
         </TooltipProvider>
         <SocialPetworkLogo />
         <div className="absolute right-0">
           <MobileMoreMenu />
         </div>
       </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50 block xl:hidden">
      <div className="flex h-20 px-4 items-center">{/* Increased height from h-16 to h-20 for more logo space */}
        {renderContent()}
      </div>
    </div>
  );
};

export default MobileTopNav;