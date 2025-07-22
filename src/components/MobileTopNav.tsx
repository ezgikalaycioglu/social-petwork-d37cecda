import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, PawPrint, Settings, Plus, MapPin, Calendar, Users as UsersIcon, Building2, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation as useUserLocation } from '@/hooks/useLocation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SocialPetworkLogo from './SocialPetworkLogo';

const MobileTopNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { loading: locationLoading, coordinates, error: locationError } = useUserLocation();

  if (!user) {
    return null;
  }

  const getLocationTooltipContent = () => {
    if (locationLoading) return "Getting your location...";
    if (locationError) return "Enable location access for the full pet map experience.";
    if (coordinates) return "You can now find pets near you and share your location!";
    return "Enable location access for the full pet map experience.";
  };

  const renderContent = () => {
    // Home tab - Logo centered, Notifications right
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2">
                  <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <Link 
            to="/notifications" 
            className="absolute right-0 p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      );
    }

    // Social tab - Location icon left, logo center
    if (location.pathname === '/discover' || location.pathname === '/pet-social' || 
        location.pathname === '/events' || location.pathname === '/pet-map') {
      return (
        <div className="flex items-center justify-center w-full relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-0 p-2">
                  <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
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
                <div className="absolute left-0 p-2">
                  <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <Link 
            to="/packs/create" 
            className="absolute right-0 p-2 hover:bg-gray-100 rounded-full"
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </Link>
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
                <div className="absolute left-0 p-2">
                  <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
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
                <div className="absolute left-0 p-2">
                  <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getLocationTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SocialPetworkLogo />
          <Link 
            to="/settings" 
            className="absolute right-0 p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      );
    }

    // Default - Location icon left, logo center
    return (
      <div className="flex items-center justify-center w-full relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute left-0 p-2">
                <MapPin className={`w-6 h-6 ${coordinates ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getLocationTooltipContent()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <SocialPetworkLogo />
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50 block md:hidden">
      <div className="flex h-20 px-4 items-center">{/* Increased height from h-16 to h-20 for more logo space */}
        {renderContent()}
      </div>
    </div>
  );
};

export default MobileTopNav;