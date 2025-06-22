import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, MapPin, Camera, Gift } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: UserCircle,
      title: "Personalized Pet Profiles",
      description: "Give your pet their own digital identity! Create charming profiles with photos, personality traits, and preferences to help them make new friends.",
      bgColor: "#B2EBF2",
      iconColor: "#A8DAB5"
    },
    {
      icon: MapPin,
      title: "Real-time Playdates & Walks",
      description: "Discover nearby pet pals and organize spontaneous or planned playdates and group walks with optional live location sharing for safe, fun interactions.",
      bgColor: "#C8E6C9",
      iconColor: "#A8DAB5"
    },
    {
      icon: Camera,
      title: "Adventure Tracking & Memories",
      description: "Log your walks, track distances, and visualize the exciting places you and your pet have explored. Share your paw-some adventures with the community.",
      bgColor: "#FFDAB9",
      iconColor: "#FFB3A7"
    },
    {
      icon: Gift,
      title: "Exclusive Pet Perks & Rewards",
      description: "Earn rewards for your activity and unlock special discounts and coupons from local pet stores, groomers, and other pet businesses.",
      bgColor: "#FFB7A3",
      iconColor: "#FFB3A7"
    }
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: '#F3FCF6' }} data-section="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Everything Your Pet Needs to 
            <span style={{ color: '#A8DAB5' }}> Socialize & Thrive</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make Social Petwork the perfect companion for you and your furry friend's social adventures.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon className="h-8 w-8" style={{ color: feature.iconColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
