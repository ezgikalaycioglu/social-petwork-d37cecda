
import { MapPin, Users, Calendar, Heart, Camera, Bell } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <MapPin className="w-12 h-12 text-green-600" />,
      title: "Pet Map",
      description: "Discover pet-friendly locations, see where other pets are playing, and find the perfect spots for adventures.",
      color: "green"
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: "Social Network",
      description: "Connect with other pet parents, arrange playdates, and build a community around your furry friends.",
      color: "blue"
    },
    {
      icon: <Calendar className="w-12 h-12 text-purple-600" />,
      title: "Event Planning",
      description: "Organize group walks, pet parties, and training sessions. Never miss out on local pet events.",
      color: "purple"
    },
    {
      icon: <Heart className="w-12 h-12 text-pink-600" />,
      title: "Pet Profiles",
      description: "Create detailed profiles for your pets, track their adventures, and share their personalities.",
      color: "pink"
    },
    {
      icon: <Camera className="w-12 h-12 text-orange-600" />,
      title: "Adventure Logging",
      description: "Document your pet's adventures with photos and stories. Create lasting memories of your journeys together.",
      color: "orange"
    },
    {
      icon: <Bell className="w-12 h-12 text-red-600" />,
      title: "Smart Notifications",
      description: "Stay updated with playdate requests, nearby events, and activities tailored to your pet's interests.",
      color: "red"
    }
  ];

  return (
    <section data-section="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Everything Your Pet Needs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From finding playmates to discovering new adventures, PawCult has all the tools to enrich your pet's social life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200">
              <div className="flex flex-col items-center text-center">
                <div className={`mb-6 p-4 bg-${feature.color}-100 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
