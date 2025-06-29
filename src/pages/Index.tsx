
import Hero from '../components/landing/Hero';
import AppPreview from '../components/landing/AppPreview';
import Features from '../components/landing/Features';
import ProblemSolution from '../components/landing/ProblemSolution';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <FinalCTA />
      <ProblemSolution />
      <Features />
      <AppPreview />
      <Footer />
    </div>
  );
};

export default Index;
