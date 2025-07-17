import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, PawPrint, Users, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileTopNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.myPets'), href: '/my-pets', icon: PawPrint },
    { name: t('navigation.petSocial'), href: '/pet-social', icon: Users },
    { name: t('navigation.findFriends'), href: '/find-friends', icon: Heart },
    { name: t('navigation.settings'), href: '/settings', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (!user) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50 block md:hidden">
      <nav className="flex h-14 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActive(item.href)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileTopNav;