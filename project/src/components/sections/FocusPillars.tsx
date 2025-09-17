import React from 'react';
import { Brain, Notebook as Robot, Network } from 'lucide-react';
import { CTAButtons } from '../CTAButtons';

export const FocusPillars: React.FC = () => {
  const pillars = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Agentic AI & Multi-Agent Systems",
      description: "Advancing autonomous AI systems that can interact, learn, and evolve to solve complex challenges across industries."
    },
    {
      icon: <Robot className="w-8 h-8" />,
      title: "Intelligent Automation & Robotics",
      description: "Developing next-generation robotics and automation solutions powered by advanced AI and machine learning."
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Converging Frontiers",
      description: "Pioneering innovations at the intersection of Bio + AI, FinTech + AI, and Web3 Infrastructure to create transformative solutions."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Focus Pillars Overview
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our investment thesis centers on three transformative pillars that we believe will shape the future of technology and society.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <div 
              key={index}
              className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
              <div className="relative">
                <div className="mb-6 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit">
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Engineered to compound. Built to scale.
          </p>
          <div className="flex justify-center">
            <CTAButtons />
          </div>
        </div>
      </div>
    </section>
  );
};