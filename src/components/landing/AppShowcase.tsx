const AppShowcase = () => {
  const appScreenshots = [
    {
      src: "/lovable-uploads/2d10cedf-1d4a-4e52-bba5-57f929afcff0.png",
      alt: "Pet Map Feature",
      title: "Interactive Map"
    },
    {
      src: "/lovable-uploads/fe720991-9c3b-4ed1-aedb-8f99f69fe11c.png", 
      alt: "Social Feed",
      title: "Social Feed"
    },
    {
      src: "/lovable-uploads/bae374ba-a277-4e16-92dd-d6738ad85b12.png",
      alt: "Event Planning",
      title: "Events"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            See the app in action
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get a glimpse of how PawCult makes connecting with other pet parents effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {appScreenshots.map((screenshot, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative group">
                {/* Phone mockup container */}
                <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-xl transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-black rounded-[2rem] p-1">
                    <img 
                      src={screenshot.src} 
                      alt={screenshot.alt}
                      className="w-48 h-auto rounded-[1.8rem] shadow-lg"
                    />
                  </div>
                  
                  {/* Phone details */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              <h3 className="mt-4 text-sm font-medium text-gray-700 text-center">
                {screenshot.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;