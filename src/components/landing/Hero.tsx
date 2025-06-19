
import { ArrowRight, Heart } from 'lucide-react';
import AuthButton from '../AuthButton';
import PawPinLogo from '../PawPinLogo';

const Hero = () => {
  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center items-center gap-3">
          <PawPinLogo className="w-16 h-16" size={64} />
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Social Petwork
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Connect with fellow pet parents, discover pet-friendly adventures, and build lasting friendships 
          in your local pet community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <AuthButton />
          <button className="flex items-center text-yellow-600 hover:text-yellow-700 font-medium">
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
