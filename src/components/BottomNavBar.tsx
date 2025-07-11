import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Plus, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Map', href: '/pet-map', icon: MapPin },
    { name: 'Create Post', href: '/create-post', icon: Plus, isSpecial: true },
    { name: 'Packs', href: '/packs', icon: Users },
    { name: 'Profile', href: '/settings', icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border shadow-lg z-50 block md:hidden">
      <nav className="flex h-24 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          if (item.isSpecial) {
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex-1 flex flex-col items-center justify-center py-2 px-1"
              >
                <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mb-1 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-primary">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavBar;