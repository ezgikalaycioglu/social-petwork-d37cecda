
import { MapPin, Users, Calendar, Heart, Camera, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <MapPin className="w-12 h-12 text-green-600" />,
      title: t('landing.features.petMap'),
      description: t('landing.features.petMapDesc'),
      color: "green"
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600" />,
      title: t('landing.features.socialNetwork'),
      description: t('landing.features.socialNetworkDesc'),
      color: "blue"
    },
    {
      icon: <Calendar className="w-12 h-12 text-purple-600" />,
      title: t('landing.features.eventPlanning'),
      description: t('landing.features.eventPlanningDesc'),
      color: "purple"
    },
    {
      icon: <Heart className="w-12 h-12 text-pink-600" />,
      title: t('landing.features.petProfiles'),
      description: t('landing.features.petProfilesDesc'),
      color: "pink"
    },
    {
      icon: <Camera className="w-12 h-12 text-orange-600" />,
      title: t('landing.features.adventureLogging'),
      description: t('landing.features.adventureLoggingDesc'),
      color: "orange"
    },
    {
      icon: <Bell className="w-12 h-12 text-red-600" />,
      title: t('landing.features.smartNotifications'),
      description: t('landing.features.smartNotificationsDesc'),
      color: "red"
    }
  ];

  return (
    <section data-section="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {t('landing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('landing.features.subtitle')}
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
