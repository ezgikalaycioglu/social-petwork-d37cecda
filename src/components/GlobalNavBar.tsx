
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  PawPrint, 
  Plus, 
  Users, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const GlobalNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Signed out',
          description: 'You have been successfully signed out.',
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: PawPrint,
      description: 'My Pets'
    },
    {
      label: 'Add Pet',
      path: '/create-pet-profile',
      icon: Plus,
      description: 'New Pet'
    },
    {
      label: 'Pet Social',
      path: '/pet-social',
      icon: Users,
      description: 'Friends'
    },
    {
      label: 'My Pets',
      path: '/my-pets',
      icon: User,
      description: 'Manage'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navigationItems[0], mobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = isActivePath(item.path);
    
    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        size={mobile ? "default" : "sm"}
        onClick={() => {
          navigate(item.path);
          if (mobile) setIsMobileMenuOpen(false);
        }}
        className={`
          ${mobile ? 'w-full justify-start' : 'px-3'}
          ${isActive 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
          }
        `}
      >
        <Icon className={`w-4 h-4 ${mobile ? 'mr-3' : 'mr-1'}`} />
        {mobile ? item.label : item.description}
      </Button>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <PawPrint className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              Social Petwork
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="ml-4 border-red-500 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <NavLink key={item.path} item={item} mobile />
              ))}
              
              {/* Mobile Logout Button */}
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start mt-4 border-red-500 text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavBar;
