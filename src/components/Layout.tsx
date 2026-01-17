import React from 'react';
import { useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileTopNav from './MobileTopNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  // Pages that should not show navigation (landing page, auth, etc.)
  const noNavPages = ['/', '/auth', '/changelog'];
  const showNavigation = !noNavPages.includes(location.pathname);
  
  // Pet profile pages should only show sidebar, not top navigation
  const petProfilePage = location.pathname.startsWith('/pet-adventures/');
  const showTopNav = showNavigation && !petProfilePage;

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Mobile Top Navigation */}
      {showTopNav && <MobileTopNav />}
      
      {/* Desktop Sidebar */}
      {showNavigation && <DesktopSidebar />}
      
      {/* Main Content */}
      <main className={`${
        showNavigation 
          ? `xl:ml-64 ${showTopNav ? 'pt-20' : 'pt-0'} pb-20 xl:pt-0 xl:pb-0 min-h-screen` // Add top padding for mobile top nav (80px) only when showing, left margin for desktop sidebar, bottom padding for mobile nav
          : 'min-h-screen'
      }`}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showNavigation && <MobileBottomNav />}
    </div>
  );
};

export default Layout;