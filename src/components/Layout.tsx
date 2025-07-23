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

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Mobile Top Navigation */}
      {showNavigation && <MobileTopNav />}
      
      {/* Desktop Sidebar */}
      {showNavigation && <DesktopSidebar />}
      
      {/* Main Content */}
      <main className={`${
        showNavigation 
          ? 'md:ml-64 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen' // Add top padding for mobile top nav, left margin for desktop sidebar, bottom padding for mobile nav
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