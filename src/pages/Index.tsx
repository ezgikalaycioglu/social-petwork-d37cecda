
import Hero from '../components/landing/Hero';
import AppShowcase from '../components/landing/AppShowcase';
import PWAInstallInstructions from '../components/landing/PWAInstallInstructions';
import Benefits from '../components/landing/Benefits';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import ProblemSolution from '../components/landing/ProblemSolution';
import Features from '../components/landing/Features';
import AppPreview from '../components/landing/AppPreview';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AppShowcase />
      <PWAInstallInstructions />
      <Benefits />
      <FeatureShowcase />
      <ProblemSolution />
      <Features />
      <AppPreview />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
