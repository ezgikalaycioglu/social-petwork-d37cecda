import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Plus, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BottomNavBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Map', href: '/pet-map', icon: MapPin },
    { name: 'Create', href: '/create-pet-profile', icon: Plus, isCreate: true },
    { name: 'Packs', href: '/packs', icon: Users },
    { name: 'Profile', href: '/settings', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.isCreate) {
            return (
              <Button
                key={item.name}
                asChild
                className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg"
              >
                <Link to={item.href}>
                  <Icon className="w-6 h-6" />
                </Link>
              </Button>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors ${
                active 
                  ? 'text-green-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon 
                className={`w-6 h-6 ${active ? 'fill-current' : ''}`} 
                strokeWidth={active ? 2 : 1.5}
              />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;