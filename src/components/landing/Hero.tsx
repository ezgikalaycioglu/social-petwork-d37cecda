
import { ArrowRight, Heart } from 'lucide-react';
import AuthButton from '../AuthButton';

const Hero = () => {
  return (
    <section className="px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <svg 
            width="96" 
            height="96" 
            viewBox="0 0 100 100" 
            className="text-green-600"
          >
            {/* Circular background */}
            <circle cx="50" cy="50" r="48" fill="currentColor" stroke="#e5e7eb" strokeWidth="2"/>
            
            {/* First dog (top half, facing right) */}
            <g fill="white">
              {/* Body */}
              <ellipse cx="50" cy="35" rx="20" ry="12" transform="rotate(15 50 35)"/>
              {/* Head */}
              <ellipse cx="68" cy="32" rx="8" ry="6"/>
              {/* Nose */}
              <circle cx="75" cy="32" r="2" fill="#374151"/>
              {/* Eye */}
              <circle cx="70" cy="30" r="1.5" fill="#374151"/>
              {/* Ear */}
              <ellipse cx="62" cy="28" rx="3" ry="5" transform="rotate(-20 62 28)"/>
              {/* Tail */}
              <ellipse cx="35" cy="40" rx="8" ry="3" transform="rotate(45 35 40)"/>
              {/* Legs */}
              <ellipse cx="45" cy="45" rx="2" ry="6"/>
              <ellipse cx="55" cy="45" rx="2" ry="6"/>
            </g>
            
            {/* Second dog (bottom half, facing left) */}
            <g fill="#065f46">
              {/* Body */}
              <ellipse cx="50" cy="65" rx="20" ry="12" transform="rotate(-165 50 65)"/>
              {/* Head */}
              <ellipse cx="32" cy="68" rx="8" ry="6"/>
              {/* Nose */}
              <circle cx="25" cy="68" r="2" fill="white"/>
              {/* Eye */}
              <circle cx="30" cy="70" r="1.5" fill="white"/>
              {/* Ear */}
              <ellipse cx="38" cy="72" rx="3" ry="5" transform="rotate(20 38 72)"/>
              {/* Tail */}
              <ellipse cx="65" cy="60" rx="8" ry="3" transform="rotate(-135 65 60)"/>
              {/* Legs */}
              <ellipse cx="45" cy="55" rx="2" ry="6"/>
              <ellipse cx="55" cy="55" rx="2" ry="6"/>
            </g>
            
            {/* Small dividing curve in the middle */}
            <path 
              d="M 20 50 Q 50 30 80 50 Q 50 70 20 50" 
              fill="none" 
              stroke="white" 
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>
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
