
import { AlertTriangle, CheckCircle, Heart, Users } from 'lucide-react';

const ProblemSolution = () => {
  const problems = [
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: "Isolated Pets",
      description: "Many pets lack social interaction, leading to behavioral issues and boredom."
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: "Busy Pet Parents",
      description: "Finding time to socialize pets and discover new activities is challenging."
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      title: "Limited Resources",
      description: "Pet parents struggle to find reliable information about pet-friendly places and events."
    }
  ];

  const solutions = [
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Connected Community",
      description: "Build a network of pet friends and arrange regular social activities."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Efficient Planning",
      description: "Easily organize and join pet activities with just a few taps."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      title: "Comprehensive Directory",
      description: "Access a complete database of pet-friendly locations and upcoming events."
    }
  ];

  return (
    <section data-section="problem-solution" className="py-20 px-4 bg-gradient-to-br from-red-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            The Pet Parent Struggle is Real
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We understand the challenges you face in keeping your pet happy and social
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problems Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h3 className="text-3xl font-bold text-red-600 mb-8 flex items-center justify-center lg:justify-start">
                <AlertTriangle className="w-8 h-8 mr-3" />
                Common Problems
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
                Our Solutions
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
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Pet's Life?</h3>
            <p className="text-xl mb-6 opacity-90">Join thousands of happy pet parents who've already made the switch</p>
            <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition-colors duration-300">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
