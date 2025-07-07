
import { ArrowRight, Menu } from 'lucide-react';
import AuthButton from '../AuthButton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('[data-section="features"]');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigationItems = [
    { label: 'Get Started', id: 'final-cta' },
    { label: 'Problem & Solution', id: 'problem-solution' },
    { label: 'Features', id: 'features' },
    { label: 'App Preview', id: 'app-preview' }
  ];

  return (
    <section className="px-4 py-12 lg:py-20 relative overflow-hidden" style={{ backgroundColor: '#F3FCF6' }}>
      {/* Navigation Dropdown */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white backdrop-blur-sm border-green-200 hover:bg-white/90 p-2 shadow-lg"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-white backdrop-blur-sm border-green-200 shadow-lg z-50"
          >
            {navigationItems.map((item) => (
              <DropdownMenuItem 
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="cursor-pointer hover:bg-green-50 py-2 px-3"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Desktop two-column layout, mobile stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[600px]">
          
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1 space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <img 
                src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
                alt="Social Petwork Logo"
                className="w-20 h-20 lg:w-24 lg:h-24"
              />
            </div>

            {/* Main Headline */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4" style={{ color: '#FFB3A7' }}>
                Your pet's social life starts here.
              </h1>
              
              {/* Subheading */}
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
                Find playmates, track adventures, and discover pet-friendly places, all in one app.
              </p>
              
              {/* CTA Button - Most prominent element */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 min-w-[240px]"
                  style={{ 
                    background: 'linear-gradient(135deg, #FFB3A7 0%, #A8DAB5 100%)',
                    boxShadow: '0 10px 30px rgba(255, 179, 167, 0.4)'
                  }}
                >
                  Get Started for Free
                </Button>
                
                <button 
                  onClick={scrollToFeatures}
                  className="flex items-center font-medium hover:opacity-80 transition-opacity text-lg px-6 py-3 text-gray-600 hover:text-gray-800"
                >
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - App Screenshot */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main app screenshot with enhanced styling */}
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/lovable-uploads/d9e8b07e-7d6b-4ddb-ae7c-bcf5166c1ce0.png" 
                  alt="Social Petwork App - Pet Map Feature"
                  className="w-72 md:w-80 lg:w-96 h-auto rounded-3xl shadow-2xl border-4 border-white"
                  style={{ 
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)'
                  }}
                />
                
                {/* Floating UI elements for added authenticity */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-pulse">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg transform rotate-12">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-sm">
                      🐕
                    </div>
                    <div className="text-xs font-medium text-gray-700">New friend nearby!</div>
                  </div>
                </div>
              </div>
              
              {/* Background decorative elements */}
              <div className="absolute -z-10 top-8 right-8 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
              <div className="absolute -z-10 bottom-8 left-8 w-24 h-24 bg-orange-200 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
