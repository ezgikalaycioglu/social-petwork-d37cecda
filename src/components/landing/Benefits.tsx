
import { Heart, Users, MapPin, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Benefits = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: t('landing.benefits.healthierPets'),
      description: t('landing.benefits.healthierPetsDesc')
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: t('landing.benefits.buildCommunity'),
      description: t('landing.benefits.buildCommunityDesc')
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: t('landing.benefits.discoverPlaces'),
      description: t('landing.benefits.discoverPlacesDesc')
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
      title: t('landing.benefits.neverMissAdventures'),
      description: t('landing.benefits.neverMissAdventuresDesc')
    }
  ];

  return (
    <section data-section="benefits" className="py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('landing.benefits.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('landing.benefits.subtitle')}
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
