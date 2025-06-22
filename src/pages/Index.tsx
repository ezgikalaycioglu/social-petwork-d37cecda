
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ProblemSolution from '../components/landing/ProblemSolution';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #C8E6C9, #A8DAB5, #FFDAB9)' }}>
      <Hero />
      <ProblemSolution />
      <Features />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
