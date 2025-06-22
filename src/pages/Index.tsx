
import Hero from '../components/landing/Hero';
import AppPreview from '../components/landing/AppPreview';
import Features from '../components/landing/Features';
import ProblemSolution from '../components/landing/ProblemSolution';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3FCF6' }}>
      <Hero />
      <FinalCTA />
      <ProblemSolution />
      <Features />
      <AppPreview />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
