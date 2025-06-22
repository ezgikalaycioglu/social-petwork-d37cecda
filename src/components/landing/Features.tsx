
import { Card, CardContent } from '@/components/ui/card';

const Features = () => {
  const features = [
    {
      image: "/lovable-uploads/8b5a6e00-39f2-4fb4-b968-a331dd55db04.png",
      title: "Your Pet's Digital Identity",
      description: "Give your furry friend their own charming profile! Share adorable photos, unique personality traits, and preferences to help them find their perfect playmates.",
      bgColor: "#B2EBF2"
    },
    {
      image: "/lovable-uploads/3e6a2d26-3c26-45b5-9033-a36c0cf88527.png",
      title: "Connect & Play Locally",
      description: "Easily discover nearby pet pals and organize spontaneous meetups or planned group walks. Our optional live location sharing ensures safe, fun, and effortless interactions.",
      bgColor: "#C8E6C9"
    },
    {
      image: "/lovable-uploads/d98b0943-4ce6-4334-9339-47232c046eef.png",
      title: "Track Their Pawsome Journeys",
      description: "Log your daily walks, track distances, and visualize the exciting places you and your pet have explored. Share your adventures with a supportive community and cherish every moment.",
      bgColor: "#FFDAB9"
    },
    {
      image: "/lovable-uploads/843c803e-8ea4-4a7c-865a-77f0687a1413.png",
      title: "Stay Connected, Stay Safe",
      description: "Keep your local pet community informed with quick alerts like 'Heading out for a walk!' or 'Lost pet alert.' Foster a caring and engaged neighborhood network.",
      bgColor: "#E8D5FF"
    },
    {
      image: "/lovable-uploads/1a993b61-c324-4545-8f89-c363f4445f3e.png",
      title: "Rewarding Every Adventure",
      description: "Get rewarded for being an active pet parent! Unlock special discounts and coupons from local pet stores, groomers, and other pet businesses, making healthy habits even more rewarding.",
      bgColor: "#FFB7A3"
    }
  ];

  return (
    <section className="py-20 px-4" style={{ backgroundColor: '#F3FCF6' }} data-section="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Everything Your Pet Needs to 
            <span style={{ color: '#FFB3A7' }}> Socialize & Thrive</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the features that make Social Petwork the perfect companion for you and your furry friend's social adventures.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="h-8 w-8 object-contain"
                  />
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
