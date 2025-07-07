
import { Heart, Users, MapPin, Calendar } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: "Healthier, Happier Pets",
      description: "Regular socialization and exercise keep your pet physically and mentally stimulated."
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: "Build a Community",
      description: "Connect with fellow pet parents in your neighborhood and create lasting friendships."
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: "Discover New Places",
      description: "Find pet-friendly locations, parks, and businesses near you that welcome your furry friend."
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
      title: "Never Miss Adventures",
      description: "Get notified about local pet events, playdates, and activities happening around you."
    }
  ];

  return (
    <section data-section="benefits" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Why Choose Social Petwork?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your pet's life with meaningful connections and endless adventures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-gray-50 rounded-full">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
