
import { ArrowRight } from 'lucide-react';
import AuthButton from '../AuthButton';

const Hero = () => {
  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
            alt="Social Petwork Logo"
            className="w-40 h-40"
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: '#FFB3A7' }}>
          Unleash Their Social Life: Connect, Play, and Reward Your Pet!
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          The ultimate social app empowering pet parents to create profiles for their furry companions, 
          facilitate real-time, location-based playdates and group walks, track adventures, and unlock 
          exclusive discounts from pet businesses.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <AuthButton />
          <button className="flex items-center font-medium" style={{ color: '#FFB3A7' }}>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
