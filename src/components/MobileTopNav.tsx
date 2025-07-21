import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, PawPrint, Settings, Plus, MapPin, Calendar, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SocialPetworkLogo from './SocialPetworkLogo';

const MobileTopNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return null;
  }

  const renderContent = () => {
    // Home tab - Logo left, Notifications right
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      return (
        <div className="flex items-center justify-between w-full">
          <SocialPetworkLogo />
          <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      );
    }

    // Discover tab - Pet Social, Events, Pet Map, Deals sections
    if (location.pathname === '/discover' || location.pathname === '/pet-social' || 
        location.pathname === '/events' || location.pathname === '/pet-map' || location.pathname === '/deals') {
      return (
        <div className="flex items-center justify-center w-full">
          <nav className="flex space-x-1">
            <Link
              to="/pet-social"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/pet-social'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Pet Social
            </Link>
            <Link
              to="/events"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/events'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Events
            </Link>
            <Link
              to="/pet-map"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/pet-map'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Pet Map
            </Link>
            <Link
              to="/deals"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

    // Packs tab - Title left, Create pack right
    if (location.pathname.startsWith('/packs')) {
      return (
        <div className="flex items-center justify-between w-full">
          <h1 className="text-lg font-semibold">Packs</h1>
          <Link to="/packs/create" className="p-2 hover:bg-gray-100 rounded-full">
            <Plus className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      );
    }

    // Profile tab - My Pets left, Settings right
    if (location.pathname === '/profile' || location.pathname === '/my-pets' || 
        location.pathname === '/settings') {
      return (
        <div className="flex items-center justify-between w-full">
          <Link to="/my-pets" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
            <PawPrint className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">My Pets</span>
          </Link>
          <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-full">
            <Settings className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      );
    }

    // Default - just show logo
    return (
      <div className="flex items-center justify-center w-full">
        <SocialPetworkLogo />
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50 block md:hidden">
      <div className="flex h-14 px-4 items-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default MobileTopNav;