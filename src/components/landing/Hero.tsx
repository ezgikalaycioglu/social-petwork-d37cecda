
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
    <section className="px-4 py-20 text-center relative" style={{ backgroundColor: '#F3FCF6' }}>
      {/* Navigation Dropdown */}
      <div className="absolute top-4 right-4">
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

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#FFB3A7' }}>
          Social Petwork
        </h1>
        <div className="mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
            alt="Social Petwork Logo"
            className="w-64 h-64"
          />
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: '#A8DAB5' }}>
          Your pet's social life starts here.
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          The ultimate social app empowering pet parents to create profiles for their furry companions, 
          facilitate real-time, location-based playdates and group walks, track adventures, and unlock 
          exclusive discounts from pet businesses.
        </p>
        <div className="flex flex-row gap-4 sm:gap-12 justify-center items-center">
          <div className="transform scale-100 sm:scale-125">
            <AuthButton />
          </div>
          <button 
            onClick={scrollToFeatures}
            className="flex items-center font-medium hover:opacity-80 transition-opacity text-base sm:text-lg px-4 py-2 sm:px-8 sm:py-3 border-transparent hover:border-current transform scale-100 sm:scale-125" 
            style={{ 
              color: '#FFB3A7',
              borderColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FFB3A7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            Learn More <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
