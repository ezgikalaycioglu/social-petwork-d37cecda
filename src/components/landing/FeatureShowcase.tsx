
import { useTranslation } from 'react-i18next';

const FeatureShowcase = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20" style={{ backgroundColor: '#F3FCF6' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('landing.featureShowcase.title')}{' '}
            <span style={{ color: '#FFB3A7' }}>{t('landing.featureShowcase.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('landing.featureShowcase.subtitle')}
          </p>
        </div>
        
        {/* Feature 1: Image Left, Text Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="order-2 lg:order-1">
            <img 
              src="/lovable-uploads/2d10cedf-1d4a-4e52-bba5-57f929afcff0.png" 
              alt="Interactive pet map showing nearby pets and their locations"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-xl"
            />
          </div>
          
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t('landing.featureShowcase.discoverTitle')}
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('landing.featureShowcase.discoverDesc')}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.discoverFeature1')}</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.discoverFeature2')}</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.discoverFeature3')}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Feature 2: Text Left, Image Right */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800">
              {t('landing.featureShowcase.connectTitle')}
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              {t('landing.featureShowcase.connectDesc')}
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.connectFeature1')}</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.connectFeature2')}</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 mr-3 flex-shrink-0"></div>
                <span>{t('landing.featureShowcase.connectFeature3')}</span>
              </li>
            </ul>
          </div>
          
          <div>
            <img 
              src="/lovable-uploads/7fee39e3-23ef-4fac-8893-d6482330416a.png" 
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
