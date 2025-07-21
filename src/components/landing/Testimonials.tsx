import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah & Max",
      location: "San Francisco, CA",
      text: "PawCult helped Max find his best friend Luna! Now they have weekly playdates and we've become great friends with Luna's family too.",
      petEmoji: "🐕",
      rating: 5
    },
    {
      name: "Mike & Whiskers",
      location: "Austin, TX",
      text: "The adventure tracking feature is amazing! We've discovered so many new trails and parks. Plus, the discounts have saved us hundreds on pet supplies.",
      petEmoji: "🐱",
      rating: 5
    },
    {
      name: "Emma & Buddy",
      location: "Seattle, WA",
      text: "As a new pet parent, PawCult connected me with experienced dog owners who gave invaluable advice. The community is so supportive!",
      petEmoji: "🐕",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span style={{ color: '#FFB3A7' }}>Paw-sitive</span> Stories from Our Community
          </h2>
          <p className="text-xl text-gray-600">
            Hear how PawCult has transformed the lives of pets and their families
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{testimonial.petEmoji}</div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
