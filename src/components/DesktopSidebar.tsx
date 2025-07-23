import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, PawPrint, Users, MapPin, Calendar, Gift, Building, Settings, User, Heart, UserCheck, Search, Star, CalendarCheck, MessageSquare } from 'lucide-react';
import ContactUs from './ContactUs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import SocialPetworkLogo from './SocialPetworkLogo';
import AuthButton from './AuthButton';

const DesktopSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isContactOpen, setIsContactOpen] = React.useState(false);

  const navItems = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.myPets'), href: '/my-pets', icon: PawPrint },
    { name: t('navigation.petSocial'), href: '/pet-social', icon: Users },
    { name: t('navigation.petMap'), href: '/pet-map', icon: MapPin },
    { name: t('navigation.events'), href: '/events', icon: Calendar },
    { name: t('navigation.deals'), href: '/deals', icon: Gift },
    { name: t('navigation.packs'), href: '/packs/discover', icon: Users },
    { name: 'Pet Sitters', href: '/pet-sitters', icon: Search },
    { name: 'Business', href: '/business-dashboard', icon: Building },
  ];

  const isActive = (href: string) => {
    if (href === '/pet-sitters') {
      return location.pathname === href || 
             location.pathname.startsWith('/sitter/') ||
             location.pathname === '/become-sitter' ||
             location.pathname === '/my-bookings';
    }
    if (href === '/packs/discover') {
      return location.pathname.startsWith('/packs');
    }
    return location.pathname === href;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-40 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
          <SocialPetworkLogo className="h-8 w-auto" />
          <span className="text-lg font-bold text-primary">PawCult</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              isActive('/settings')
                ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>{t('navigation.settings')}</span>
          </Link>

          {/* Contact Us Link */}
          <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:text-green-600 hover:bg-green-50 w-full text-left">
                <MessageSquare className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
              </DialogHeader>
              <ContactUs onClose={() => setIsContactOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Auth Buttons */}
          <div className="pt-4">
            <AuthButton />
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
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
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;