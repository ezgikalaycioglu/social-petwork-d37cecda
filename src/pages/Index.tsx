
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Hero from '../components/landing/Hero';
import AppShowcase from '../components/landing/AppShowcase';
import PWAInstallInstructions from '../components/landing/PWAInstallInstructions';
import Benefits from '../components/landing/Benefits';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import ProblemSolution from '../components/landing/ProblemSolution';
import Features from '../components/landing/Features';
import FloatingLanguageButton from '../components/FloatingLanguageButton';

import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const fromAuth = location.state?.fromAuth;

  // Redirect to dashboard if user is already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect mobile users to auth page if not logged in
  // But allow them to view landing page if they explicitly navigated back from auth
  if (!loading && !user && isMobile && !fromAuth) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state while checking auth or mobile detection
  if (loading || isMobile === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-2 border-green-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <PWAInstallInstructions />
      <AppShowcase />
      <Benefits />
      <FeatureShowcase />
      <ProblemSolution />
      <Features />
      
      <FinalCTA />
      <Footer />
      <FloatingLanguageButton />
    </div>
  );
};

export default Index;
