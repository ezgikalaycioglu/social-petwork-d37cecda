import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PawPrint, Users, MapPin, Calendar, Gift, Building, Settings, User, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SocialPetworkLogo from './SocialPetworkLogo';
import AuthButton from './AuthButton';

const DesktopSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Pets', href: '/my-pets', icon: PawPrint },
    { name: 'Social', href: '/pet-social', icon: Users },
    { name: 'Find Friends', href: '/find-friends', icon: Heart },
    { name: 'Map', href: '/pet-map', icon: MapPin },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Deals', href: '/deals', icon: Gift },
    { name: 'Packs', href: '/packs', icon: Users },
    { name: 'Business', href: '/business-dashboard', icon: Building },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <SocialPetworkLogo className="h-8 w-auto" />
          <span className="text-lg font-bold text-green-600">Social Petwork</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/settings')
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;