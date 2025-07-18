import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Tag, Users, Building, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { name: t('navigation.petMap'), href: '/pet-map', icon: MapPin },
    { name: t('navigation.events'), href: '/events', icon: Calendar },
    { name: t('navigation.deals'), href: '/deals', icon: Tag },
    { name: t('navigation.packs'), href: '/packs', icon: Users },
    { name: 'Sitters', href: '/find-sitter', icon: UserCheck },
  ];

  const isActive = (href: string) => {
    if (href === '/find-sitter') {
      return location.pathname === href || location.pathname.startsWith('/sitter/') || 
             location.pathname === '/become-sitter' || location.pathname === '/my-bookings';
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
                  ? item.href === '/find-sitter' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Icon className="w-7 h-7 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;