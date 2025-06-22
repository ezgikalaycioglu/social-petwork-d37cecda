
import { Heart, Users } from 'lucide-react';

const ProblemSolution = () => {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: '#F3FCF6' }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12" style={{ color: '#FFB3A7' }}>
          Tired of Solo Walks? Discover Your Pet's New Best Friends!
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Problem */}
          <div className="space-y-4">
            <div className="text-gray-400 text-5xl mb-4">😔</div>
            <h3 className="text-2xl font-bold" style={{ color: '#FFB3A7' }}>The Challenge</h3>
            <p className="text-gray-600 leading-relaxed">
              It's tough to connect with other pet owners in your neighborhood, find new playmates for your dog, or even know who to avoid on your walks. And let's be honest, wouldn't it be great to make those daily walks even more rewarding?
            </p>
          </div>
          
          {/* Solution */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-2 text-4xl mb-4">
              <span>🐕</span>
              <Heart className="h-8 w-8 text-red-500 mt-2" />
              <span>🐱</span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#FFB3A7' }}>The Solution</h3>
            <p className="text-gray-600 leading-relaxed">
              Social Petwork changes everything. It's the social app designed exclusively for pets and their parents! Imagine your pet having their own profile, connecting with others, and unlocking a world of shared adventures right in your area.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
