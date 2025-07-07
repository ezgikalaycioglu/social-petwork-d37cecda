
const AppPreview = () => {
  const features = [
    {
      title: "Interactive Pet Map",
      description: "See where pets are playing in real-time and discover new locations",
      image: "/lovable-uploads/d9e8b07e-7d6b-4ddb-ae7c-bcf5166c1ce0.png"
    },
    {
      title: "Social Feed",
      description: "Share adventures and connect with your pet community",
      image: "/lovable-uploads/5f6310c4-2136-48d2-84a3-11a3c11677d2.png"
    },
    {
      title: "Event Planning",
      description: "Organize and join pet meetups, training sessions, and fun activities",
      image: "/lovable-uploads/843c803e-8ea4-4a7c-865a-77f0687a1413.png"
    }
  ];

  return (
    <section data-section="app-preview" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            See Social Petwork in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a peek at how our app makes pet socializing simple and fun
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              <div className="flex-1 flex justify-center">
                <div className="relative">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-80 h-auto rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -z-10 top-4 left-4 w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl opacity-50"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
