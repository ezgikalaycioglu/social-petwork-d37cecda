
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

const FinalCTA = () => {
  return (
    <section 
      className="py-20 px-4"
      style={{ background: 'linear-gradient(to right, #A8DAB5, #B2EBF2, #FFB3A7)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-8">🐕🎾🐱</div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Elevate Your Pet's Social Life?
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Join thousands of pet parents who have already discovered the joy of connected pet adventures. 
          Download Social Petwork today and start your journey!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Download className="mr-2 h-5 w-5" />
            Download on the App Store
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Smartphone className="mr-2 h-5 w-5" />
            Get it on Google Play
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
