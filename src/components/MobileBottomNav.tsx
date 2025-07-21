import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, Users, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Discover', href: '/discover', icon: Search },
    { name: 'Create Post', href: '/create-post', icon: Plus, isSpecial: true },
    { name: 'Packs', href: '/packs', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (href === '/packs') {
      return location.pathname.startsWith('/packs');
    }
    return location.pathname === href;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t border-border shadow-lg z-50 block md:hidden">
      <nav className="flex h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                item.isSpecial
                  ? 'text-primary-foreground bg-primary hover:bg-primary/90 mx-2 my-1 rounded-full'
                  : active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-accent'
              }`}
            >
              <Icon className={`${item.isSpecial ? 'w-6 h-6' : 'w-5 h-5'} mb-1`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;