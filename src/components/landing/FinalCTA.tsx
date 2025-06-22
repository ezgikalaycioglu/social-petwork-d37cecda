
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinalCTA = () => {
  const navigate = useNavigate();

  const handleAppStoreClick = () => {
    navigate('/coming-soon');
  };

  return (
    <section 
      className="py-20 px-4 bg-white"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-8">🐕🎾🐱</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#FFB3A7' }}>
          Ready to Elevate Your Pet's Social Life?
        </h2>
        <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
          Join pet parents in your neighbourhood who you can discover the joy of pet adventures together. 
          Download Social Petwork today and start your journey!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleAppStoreClick}
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-gray-300"
          >
            <Download className="mr-2 h-5 w-5" />
            Download on the App Store
          </Button>
          <Button 
            onClick={handleAppStoreClick}
            size="lg" 
            className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-gray-300"
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
