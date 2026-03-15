
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProblemSolution = () => {
  const { t } = useTranslation();

  const problems = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: t('landing.problemSolution.problem1Title'),
      description: t('landing.problemSolution.problem1Desc')
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: t('landing.problemSolution.problem2Title'),
      description: t('landing.problemSolution.problem2Desc')
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: t('landing.problemSolution.problem3Title'),
      description: t('landing.problemSolution.problem3Desc')
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: t('landing.problemSolution.solution1Title'),
      description: t('landing.problemSolution.solution1Desc')
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: t('landing.problemSolution.solution2Title'),
      description: t('landing.problemSolution.solution2Desc')
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: t('landing.problemSolution.solution3Title'),
      description: t('landing.problemSolution.solution3Desc')
    }
  ];

  return (
    <section data-section="problem-solution" className="py-20 px-4 bg-gradient-to-br from-red-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            {t('landing.problemSolution.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('landing.problemSolution.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problems Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-bold text-red-600 mb-8 flex items-center justify-center lg:justify-start">
                <AlertTriangle className="w-8 h-8 mr-3" />
                {t('landing.problemSolution.commonProblems')}
              </h3>
            </div>
            
            <div className="space-y-6">
              {problems.map((problem, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-red-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                      {problem.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {problem.title}
                      </h4>
                      <p className="text-gray-600">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-bold text-green-600 mb-8 flex items-center justify-center lg:justify-start">
                <CheckCircle className="w-8 h-8 mr-3" />
                {t('landing.problemSolution.ourSolutions')}
              </h3>
            </div>
            
            <div className="space-y-6">
              {solutions.map((solution, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-green-100">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
                      {solution.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {solution.title}
                      </h4>
                      <p className="text-gray-600">
                        {solution.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">{t('landing.problemSolution.ctaTitle')}</h3>
            <p className="text-xl mb-6 opacity-90">{t('landing.problemSolution.ctaSubtitle')}</p>
            <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors duration-300">
              {t('landing.problemSolution.ctaButton')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
