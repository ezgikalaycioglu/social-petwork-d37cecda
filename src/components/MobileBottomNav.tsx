import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, Users, User, Heart, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Social', href: '/social', icon: Search },
    { name: 'Pet Sitters', href: '/find-sitter', icon: Heart },
    { name: 'Businesses', href: '/business', icon: Building2 },
    { name: 'Packs', href: '/packs/discover', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname === '/';
    }
    if (href === '/social') {
      return location.pathname === href || location.pathname === '/discover' || 
             location.pathname === '/pet-social' || location.pathname === '/events' || 
             location.pathname === '/pet-map';
    }
    if (href === '/packs/discover') {
      return location.pathname.startsWith('/packs');
    }
    if (href === '/business') {
      return location.pathname === href || location.pathname === '/deals' || 
             location.pathname === '/business-dashboard';
    }
    if (href === '/profile') {
      return location.pathname === href || location.pathname === '/my-pets' || 
             location.pathname === '/settings';
    }
    return location.pathname === href;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50 block md:hidden">
      <nav className="flex h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                isActive(item.href)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;