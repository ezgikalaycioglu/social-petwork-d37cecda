
import { ArrowRight, Heart } from 'lucide-react';
import AuthButton from '../AuthButton';
import LogoWithBackgroundRemoval from '../LogoWithBackgroundRemoval';

const Hero = () => {
  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <LogoWithBackgroundRemoval
            originalImageSrc="/lovable-uploads/7d4aa119-8d6e-474d-8101-8636c0f0dedb.png"
            alt="Social Petwork Logo"
            width="96"
            height="96"
            className="w-24 h-24"
          />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-orange-500 bg-clip-text text-transparent">
          Social Petwork
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect with fellow pet parents, discover pet-friendly adventures, and build lasting friendships 
          in your local pet community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <AuthButton />
          <button className="flex items-center text-green-600 hover:text-green-700 font-medium">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        
        <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg border">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐕</span>
              <span>Dog Playdates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐱</span>
              <span>Cat Cafés</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Pet Care Tips</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏞️</span>
              <span>Adventures</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
