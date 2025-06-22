
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#F3FCF6' }}
    >
      <div className="max-w-md mx-auto text-center">
        <div className="text-6xl mb-8">🐕🚀🐱</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#FFB3A7' }}>
          Coming Soon!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          We're working hard to bring you the best pet social experience. 
          Stay tuned for updates!
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="text-white hover:opacity-90"
          style={{ backgroundColor: '#A8DAB5' }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default ComingSoon;
