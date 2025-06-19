
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import ProblemSolution from '../components/landing/ProblemSolution';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-blue-50 to-orange-50">
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
