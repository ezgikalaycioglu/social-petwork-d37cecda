

import { ArrowRight } from 'lucide-react';
import AuthButton from '../AuthButton';
import WaitlistForm from '../WaitlistForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    console.log(`Attempting to scroll to section: ${sectionId}`);
    
    // Add a small delay to ensure the dropdown closes first
    setTimeout(() => {
      const section = document.querySelector(`[data-section="${sectionId}"]`);
      console.log(`Found section:`, section);
      
      if (section) {
        section.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      } else {
        console.error(`Section with data-section="${sectionId}" not found`);
        // Fallback: try to find by ID
        const fallbackSection = document.getElementById(sectionId);
        if (fallbackSection) {
          console.log(`Found fallback section by ID:`, fallbackSection);
          fallbackSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }
    }, 100);
  };

  const navigationItems = [
    { label: 'Get Started', id: 'final-cta' },
    { label: 'Problem & Solution', id: 'problem-solution' },
    { label: 'Features', id: 'features' },
    { label: 'App Preview', id: 'app-preview' },
    { label: 'Benefits', id: 'benefits' }
  ];

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: '#F3FCF6' }}>
      {/* Top Navigation Bar */}
      <nav className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
              alt="Social Petwork Logo"
              className="w-10 h-10 mr-3"
            />
            <span className="text-xl font-bold text-gray-800">Social Petwork</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 hover:underline underline-offset-4"
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex flex-wrap gap-4 justify-center">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="px-4 py-12 lg:py-20">

        <div className="max-w-6xl mx-auto text-center">
          {/* Main Logo - Larger for hero section */}
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/5666bf06-1feb-489f-9249-016d535e52bb.png" 
              alt="Social Petwork Logo"
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#FFB3A7' }}>
            Your pet's social life starts here.
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
            Find playmates, track adventures, and discover pet-friendly places, all in one app.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 min-w-[240px]"
              style={{ 
                background: 'linear-gradient(135deg, #FFB3A7 0%, #A8DAB5 100%)',
                boxShadow: '0 10px 30px rgba(255, 179, 167, 0.4)'
              }}
            >
              Get Started for Free
            </Button>
            
            <button 
              onClick={() => scrollToSection('features')}
              className="flex items-center font-medium hover:opacity-80 transition-opacity text-lg px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              Learn More <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">
                Get notified when we launch and receive exclusive updates!
              </p>
            </div>
            <WaitlistForm />
          </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

