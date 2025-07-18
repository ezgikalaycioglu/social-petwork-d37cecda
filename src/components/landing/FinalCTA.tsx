
import { ArrowRight, Users, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';

const FinalCTA = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { icon: <Users className="w-6 h-6" />, number: "0", label: "Happy Pet Parents" },
    { icon: <Heart className="w-6 h-6" />, number: "0", label: "Pet Friendships" }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get count of happy pet parents (users with profiles)
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Get count of pet friendships
        const { count: friendshipCount } = await supabase
          .from('pet_friendships')
          .select('*', { count: 'exact', head: true });

        setStats([
          { 
            icon: <Users className="w-6 h-6" />, 
            number: userCount ? `${userCount.toLocaleString()}+` : "0", 
            label: "Happy Pet Parents" 
          },
          { 
            icon: <Heart className="w-6 h-6" />, 
            number: friendshipCount ? `${friendshipCount.toLocaleString()}+` : "0", 
            label: "Pet Friendships" 
          }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
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
          <button 
            onClick={() => navigate('/auth')}
            className="bg-white text-green-600 font-bold text-xl px-12 py-4 rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Start Your Pet's Journey
            <ArrowRight className="inline-block ml-2 w-6 h-6" />
          </button>
          
          <p className="text-lg opacity-80">
            Free to use • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
