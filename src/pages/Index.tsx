
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

  // Redirect to dashboard if user is already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking auth
  if (loading) {
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
