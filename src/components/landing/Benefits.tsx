
import { MapPin, Camera, Gift } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: MapPin,
      title: "Find Playmates",
      description: "Connect with nearby pets and their families for fun playdates and adventures."
    },
    {
      icon: Camera,
      title: "Track Adventures",
      description: "Log and share your pet's daily walks, activities, and special moments."
    },
    {
      icon: Gift,
      title: "Get Deals",
      description: "Unlock exclusive discounts from local pet stores, groomers, and services."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Everything Your Pet Needs in 
            <span style={{ color: '#A8DAB5' }}> One App</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the simple way to enhance your pet's social life and daily adventures
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: '#F3FCF6' }}
              >
                <benefit.icon className="h-10 w-10" style={{ color: '#A8DAB5' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
