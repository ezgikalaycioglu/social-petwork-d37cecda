
import { Button } from '@/components/ui/button';
import { Smartphone, Download } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-green-100 via-blue-100 to-orange-100">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
              Social Petwork: 
              <span className="text-green-600"> Connect</span> Your 
              <span className="text-orange-500"> Furry Friends</span>, 
              <span className="text-blue-600"> Explore & Save!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              The ultimate social app empowering pet parents to create profiles for their furry companions, 
              facilitate real-time, location-based playdates and group walks, track adventures, 
              and unlock exclusive discounts from pet businesses.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Download className="mr-2 h-5 w-5" />
              Download on the App Store
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-lg rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Smartphone className="mr-2 h-5 w-5" />
              Get it on Google Play
            </Button>
          </div>
        </div>
        
        {/* Visual Placeholder */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="w-80 h-96 bg-white rounded-3xl shadow-2xl border-8 border-gray-200 overflow-hidden">
              <div className="h-full bg-gradient-to-b from-green-200 via-blue-200 to-orange-200 flex flex-col items-center justify-center p-6">
                <div className="text-6xl mb-4">🐕🐱</div>
                <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Social Petwork</h3>
                <p className="text-sm text-gray-600 text-center">Connect • Play • Explore • Save</p>
                <div className="mt-6 space-y-3 w-full">
                  <div className="h-3 bg-white/50 rounded-full"></div>
                  <div className="h-3 bg-white/30 rounded-full w-3/4"></div>
                  <div className="h-3 bg-white/40 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl animate-bounce">
              🎾
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center text-2xl animate-pulse">
              🦴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
