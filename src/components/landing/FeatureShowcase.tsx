
const FeatureShowcase = () => {
  return (
    <section className="py-20" style={{ backgroundColor: '#F3FCF6' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Meet Other Pet Parents 
            <span style={{ color: '#FFB3A7' }}> Near You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our interactive map helps you discover nearby pets and organize playdates with just a few taps
          </p>
        </div>
        
        {/* Feature 1: Image Left, Text Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
            <img 
              src="/lovable-uploads/d9e8b07e-7d6b-4ddb-ae7c-bcf5166c1ce0.png" 
              alt="Interactive pet map showing nearby pets and their locations"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-xl"
            />
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              Discover Pets Around You
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              See which pets are nearby and available for playdates. Our map shows you real-time locations of active pet parents in your neighborhood, making it easy to coordinate spontaneous meetups or planned activities.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Real-time location sharing with privacy controls</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Filter by pet type, size, and personality</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Send playdate requests instantly</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Feature 2: Text Left, Image Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              Connect & Plan Together
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Once you've found compatible pets nearby, easily coordinate meetups through our built-in messaging system. Plan group walks, puppy playdates, or visit pet-friendly venues together.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Direct messaging with other pet parents</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Group event coordination tools</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>Share photos and updates from your adventures</span>
              </li>
            </ul>
          </div>
          
          <div>
            <img 
              src="/lovable-uploads/4c206775-4a71-4b32-a928-56724509f935.png" 
              alt="Pet messaging and coordination interface"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
