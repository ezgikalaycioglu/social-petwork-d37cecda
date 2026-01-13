import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, PawPrint, Users, User, HandHeart, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: featureFlags } = useFeatureFlags();

  const allNavItems = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home, tourId: 'dashboard' },
    { name: 'Social', href: '/social', icon: PawPrint, tourId: 'social' },
    { name: 'Sitters', href: '/find-sitter', icon: HandHeart, tourId: 'sitters' },
    { name: t('navigation.business'), href: '/business', icon: Building2, tourId: 'business', requiresBusiness: true },
    { name: t('navigation.packs'), href: '/packs/discover', icon: Users, tourId: 'packs' },
    { name: t('navigation.profile'), href: '/profile', icon: User, tourId: 'profile' },
  ];

  // Filter nav items based on feature flags
  const navItems = allNavItems.filter(item => {
    if (item.requiresBusiness && !featureFlags?.business_section_enabled) {
      return false;
    }
    return true;
  });

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[1000] block xl:hidden">
      <nav className="flex h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              data-tour={item.tourId}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 min-h-[44px] min-w-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5 hover:opacity-90'
              }`}
            >
              <div className="transition-transform duration-150">
                <Icon 
                  className={`w-6 h-6 mb-1 ${active ? 'scale-105' : ''}`} 
                  aria-hidden="true" 
                />
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;