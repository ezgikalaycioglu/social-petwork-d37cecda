import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageCircle, Plus, Settings, MoreHorizontal, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocialPetworkLogo from './SocialPetworkLogo';

const MobileTopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const currentPath = location.pathname;

  // Helper function to check if we're on a specific screen that needs back navigation
  const isSpecificScreen = () => {
    return currentPath.includes('/pack/') || 
           currentPath.includes('/profile/') || 
           currentPath.includes('/chat/') ||
           currentPath.includes('/post/');
  };

  // Render contextual top nav based on current route
  const renderTopNav = () => {
    // Specific screens with back navigation
    if (isSpecificScreen()) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold text-foreground">
              {currentPath.includes('/pack/') && 'Pack'}
              {currentPath.includes('/profile/') && 'Profile'}
              {currentPath.includes('/chat/') && 'Chat'}
              {currentPath.includes('/post/') && 'Post'}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="p-2">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      );
    }

    // Discover tab - Search bar
    if (currentPath === '/discover') {
      return (
        <div className="w-full px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search for pets, packs, or sitters..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      );
    }

    // Packs tab
    if (currentPath.startsWith('/packs')) {
      return (
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Packs</h1>
          <Link to="/packs/create">
            <Button variant="ghost" size="icon" className="p-2">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      );
    }

    // Profile tab
    if (currentPath === '/profile') {
      return (
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">My Profile</h1>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="p-2">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      );
    }

    // Home tab (default)
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SocialPetworkLogo className="h-8 w-auto" />
          <span className="text-lg font-bold text-primary">PawCult</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative p-2">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" className="p-2">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-background border-b border-border shadow-sm z-50 block md:hidden">
      <div className="px-4 py-3">
        {renderTopNav()}
      </div>
    </div>
  );
};

export default MobileTopNav;