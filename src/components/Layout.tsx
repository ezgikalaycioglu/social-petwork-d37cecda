
import React from 'react';
import GlobalNavBar from './GlobalNavBar';
import Footer from './landing/Footer';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex flex-col">
      <GlobalNavBar />
      <main className="flex-1 min-h-[calc(100vh-4rem)] pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavBar />
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
