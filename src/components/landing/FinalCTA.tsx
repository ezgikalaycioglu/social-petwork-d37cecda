
import { ArrowRight, Star, Users, Heart } from 'lucide-react';

const FinalCTA = () => {
  const stats = [
    { icon: <Users className="w-6 h-6" />, number: "10,000+", label: "Happy Pet Parents" },
    { icon: <Heart className="w-6 h-6" />, number: "25,000+", label: "Pet Friendships" },
    { icon: <Star className="w-6 h-6" />, number: "4.9/5", label: "App Store Rating" }
  ];

  return (
    <section data-section="final-cta" className="py-20 px-4 bg-gradient-to-br from-green-600 to-blue-600 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-5xl font-bold mb-6">
            Your Pet's Best Life Starts Today
          </h2>
          <p className="text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            Join the community that's revolutionizing how pets connect, play, and explore the world together
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold mb-1">{stat.number}</div>
              <div className="text-lg opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main CTA */}
        <div className="space-y-8">
          <button className="bg-white text-green-600 font-bold text-xl px-12 py-4 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
            Start Your Pet's Journey
            <ArrowRight className="inline-block ml-2 w-6 h-6" />
          </button>
          
          <p className="text-lg opacity-80">
            Free to download • No credit card required • Available on iOS & Android
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-12 border-t border-white/20">
          <p className="text-sm opacity-70 mb-4">Trusted by pet parents worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold">App Store</div>
            <div className="text-2xl font-bold">Google Play</div>
            <div className="text-2xl font-bold">Product Hunt</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
