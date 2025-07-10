import React from 'react';
import { useLocation } from 'react-router-dom';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';

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
      {/* Desktop Sidebar */}
      {showNavigation && <DesktopSidebar />}
      
      {/* Main Content */}
      <main className={`${
        showNavigation 
          ? 'md:ml-64 pb-16 md:pb-0' // Add left margin for desktop sidebar, bottom padding for mobile nav
          : ''
      }`}>
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showNavigation && <MobileBottomNav />}
    </div>
  );
};

export default Layout;