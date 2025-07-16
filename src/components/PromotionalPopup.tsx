import { useState, useEffect } from 'react';
import { X, Crown, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PromotionalPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('promoPopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after 2 seconds delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('promoPopupSeen', 'true');
  };

  const handleSignUp = () => {
    handleClose();
    navigate('/auth');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-6 pb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-300" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            🎉 Limited Time Offer!
          </h2>
          <p className="text-center text-pink-100">
            Be among the first 1000 users
          </p>
        </div>

        {/* Content */}
        <div className="p-6 pt-0 -mt-4 bg-white rounded-t-2xl relative">
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg p-4 border border-pink-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Premium Features for FREE
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Get 1 full year of premium features when you sign up today!
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center text-sm text-gray-700">
                  <Users className="w-4 h-4 mr-2 text-pink-500" />
                  Advanced pet matching
                </div>
                <div className="flex items-center justify-center text-sm text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                  Premium event planning
                </div>
                <div className="flex items-center justify-center text-sm text-gray-700">
                  <Crown className="w-4 h-4 mr-2 text-pink-500" />
                  Priority support
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm font-medium">
                ⏰ Only for the first 1000 users!
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSignUp}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Claim Your FREE Premium Year
              </Button>
              
              <button
                onClick={handleClose}
                className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalPopup;