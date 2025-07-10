import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PawPrint, Users, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Pets', href: '/my-pets', icon: PawPrint },
    { name: 'Social', href: '/pet-social', icon: Users },
    { name: 'Map', href: '/pet-map', icon: MapPin },
    { name: 'Profile', href: '/settings', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40 block md:hidden">
      <nav className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                isActive(item.href)
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
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