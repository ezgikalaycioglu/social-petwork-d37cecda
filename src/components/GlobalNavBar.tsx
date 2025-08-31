import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Home, PawPrint, Users, User, Settings, LogOut, Menu, X, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SocialPetworkLogo from './SocialPetworkLogo';
import AuthButton from './AuthButton';
import LanguageSwitcher from './LanguageSwitcher';

const GlobalNavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      // Navigate to top of landing page
      window.location.href = '/';
    }
  };

  const navItems = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.myPets'), href: '/my-pets', icon: PawPrint },
    { name: t('navigation.petSocial'), href: '/pet-social', icon: Users },
    { name: t('navigation.petMap'), href: '/pet-map', icon: MapPin },
  ];

  return (
    <nav className="bg-white shadow-lg border-b-2 border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <SocialPetworkLogo className="h-10 w-auto" />
              <span className="text-xl font-bold text-primary">PawCult</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link 
              to="/my-pets" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.myPets')}
            </Link>
            <Link 
              to="/pet-social" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.petSocial')}
            </Link>
            <Link 
              to="/deals" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.deals')}
            </Link>
            <Link 
              to="/events" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.events')}
            </Link>
            <Link 
              to="/pet-map" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.petMap')}
            </Link>
            <Link 
              to="/business-dashboard" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.business')}
            </Link>
            <Link 
              to="/pet-sitters" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {t('navigation.petSitters')}
            </Link>
            
            <LanguageSwitcher variant="compact" className="ml-2" />
            <AuthButton />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Settings Icon - Desktop */}
                <Link
                  to="/settings"
                  className="hidden md:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback className="bg-green-100 text-green-600">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Mobile Navigation Items */}
                    <div className="md:hidden">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.name} asChild>
                            <Link to={item.href} className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                    </div>

                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>{t('navigation.settings')}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('auth.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth">{t('auth.signIn')}</Link>
                </Button>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                  <Link to="/auth">{t('landing.hero.getStarted')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavBar;
