
import { Heart, Users } from 'lucide-react';

const ProblemSolution = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Problem */}
          <div className="space-y-4">
            <div className="text-gray-400 text-5xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-800">The Challenge</h3>
            <p className="text-gray-600 leading-relaxed">
              Finding like-minded pet parents for playdates, discovering pet-friendly places, 
              and connecting with local pet communities can be difficult and time-consuming.
            </p>
          </div>
          
          {/* Solution */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-2 text-4xl mb-4">
              <span>🐕</span>
              <Heart className="h-8 w-8 text-red-500 mt-2" />
              <span>🐱</span>
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#A8DAB5' }}>The Solution</h3>
            <p className="text-gray-600 leading-relaxed">
              Social Petwork brings pet families together with smart matching, 
              real-time coordination, and a supportive community that makes every adventure rewarding.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
