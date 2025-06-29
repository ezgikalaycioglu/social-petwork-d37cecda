import { Heart, Users } from 'lucide-react';

const ProblemSolution = () => {
  return (
    <section className="py-16 px-4" style={{ backgroundColor: '#F3FCF6' }} data-section="problem-solution">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12">
          Tired of Solo Walks? Discover Your Pet's 
          <span style={{ color: '#A8DAB5' }}> New Best Friends!</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Problem */}
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/6e457dfb-1058-40e5-a8bd-30f4d7bcc591.png" 
                alt="Challenge illustration"
                className="w-20 h-20"
              />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: '#FFB3A7' }}>The Challenge</h3>
            <p className="text-gray-600 leading-relaxed">
              It's tough to connect with other pet owners in your neighborhood, find new playmates for your dog, or even know who to avoid on your walks. And let's be honest, wouldn't it be great to make those daily walks even more rewarding?
            </p>
          </div>
          
          {/* Solution */}
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/b0aaeefd-b613-4195-a9f1-fb54239a1595.png" 
                alt="Solution illustration"
                className="w-20 h-20"
              />
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
