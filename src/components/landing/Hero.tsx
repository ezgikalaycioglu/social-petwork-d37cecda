

import { ArrowRight, Menu, X } from 'lucide-react';
import AuthButton from '../AuthButton';
import WaitlistForm from '../WaitlistForm';
import PromotionalPopup from '../PromotionalPopup';
import LanguageSwitcher from '../LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(`[data-section="${sectionId}"]`);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  const navigationItems = [
    { label: t('landing.navigation.features'), id: 'features' },
    { label: t('landing.navigation.benefits'), id: 'benefits' },
    { label: t('landing.navigation.appPreview'), id: 'app-preview' },
    { label: t('landing.navigation.problemSolution'), id: 'problem-solution' },
    { label: t('landing.navigation.getStarted'), id: 'final-cta' }
  ];

  return (
    <>
      <PromotionalPopup />
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/bed53e0f-52d4-45b8-ae07-fcb1a7eeabb8.png" 
              alt="PawCult Logo"
              className="w-10 h-10 mr-3"
            />
            <span className="text-2xl font-bold text-gray-800">PawCult</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-600 hover:text-pink-600 transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
            <LanguageSwitcher variant="compact" className="ml-4" />
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="compact" />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-800 hover:text-pink-600 focus:outline-none transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <nav className="px-4 pt-2 pb-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-gray-600 hover:text-pink-600 transition-colors duration-200 py-2 font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 lg:py-20 relative overflow-hidden" style={{ backgroundColor: '#F3FCF6' }}>

      <div className="max-w-6xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/bed53e0f-52d4-45b8-ae07-fcb1a7eeabb8.png" 
            alt="PawCult Logo"
            className="w-32 h-32 md:w-40 md:h-40"
          />
        </div>

        {/* Main Headline */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#FFB3A7' }}>
            {t('landing.hero.title')}
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
            {t('landing.hero.subtitle')}
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
              {t('landing.hero.getStarted')}
            </Button>
            
            <button 
              onClick={() => scrollToSection('features')}
              className="flex items-center font-medium hover:opacity-80 transition-opacity text-lg px-6 py-3 text-gray-600 hover:text-gray-800"
            >
              {t('landing.hero.learnMore')} <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">
                {t('landing.hero.waitlistText')}
              </p>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default Hero;

