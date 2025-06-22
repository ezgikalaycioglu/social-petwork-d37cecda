
import { ArrowRight } from 'lucide-react';
import AuthButton from '../AuthButton';

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('[data-section="features"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#FFB3A7' }}>
          Social Petwork
        </h1>
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
            alt="Social Petwork Logo"
            className="w-64 h-64"
          />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#A8DAB5' }}>
          Unleash Their Social Life: Connect, Play, and Reward Your Pet!
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          The ultimate social app empowering pet parents to create profiles for their furry companions, 
          facilitate real-time, location-based playdates and group walks, track adventures, and unlock 
          exclusive discounts from pet businesses.
        </p>
        <div className="flex flex-col sm:flex-row gap-12 justify-center items-center">
          <div className="transform scale-125">
            <AuthButton />
          </div>
          <button 
            onClick={scrollToFeatures}
            className="flex items-center font-medium hover:opacity-80 transition-opacity text-lg px-8 py-3 rounded-lg border-2 border-transparent hover:border-current transform scale-125" 
            style={{ 
              color: '#FFB3A7',
              borderColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFB3A7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Learn More <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
