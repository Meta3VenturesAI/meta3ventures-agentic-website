import React from 'react';
import { Code, Users, PenTool as Tool, Network, BarChart, Repeat } from 'lucide-react';
import { CTAButtons } from '../CTAButtons';

export const ValueFlywheel: React.FC = () => {
  const steps = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Founder-Centric Support",
      description: "Direct access to our team, frameworks, and operator-experienced advisors"
    },
    {
      icon: <Tool className="w-6 h-6" />,
      title: "AI-Powered Acceleration",
      description: "Agentic AI & automation tools accelerate development and streamline operations"
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Strategic Partnerships",
      description: "Access to distribution, co-investment, and deep domain expertise"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Data-Driven Insights",
      description: "Real-time visibility and AI-powered feedback loops guide execution"
    },
    {
      icon: <Repeat className="w-6 h-6" />,
      title: "Ecosystem Reinvestment",
      description: "Successful founders become advisors, investors, and ecosystem builders"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Continuous Innovation",
      description: "Every cycle sharpens focus and compounds ecosystem value"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Our Value Creation Flywheel
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            We Engineer Your Edge, Designed To Compound
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            At Meta3Ventures, our hands-on approach goes beyond capital. We embed each startup into a 
            high-leverage value creation loop built around founder needs, strategic partners, and 
            intelligent systems.
          </p>
          <div className="flex justify-center">
            <CTAButtons />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The result: faster, smarter, more resilient companies built for long-term success in the AI-driven future.
          </p>
        </div>
      </div>
    </section>
  );
};