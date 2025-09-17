import React from 'react';
import { Rocket, Layers, Brain, Network, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Services: React.FC = () => {
  const services = [
    {
      icon: <Layers className="w-12 h-12 text-indigo-400" />,
      title: "Venture Studio Support",
      description: "Product, GTM, and growth execution by experienced operators."
    },
    {
      icon: <Brain className="w-12 h-12 text-indigo-400" />,
      title: "Agentic AI Enablement",
      description: "Pre-built agents, dashboards, and automation layers to accelerate growth."
    },
    {
      icon: <Network className="w-12 h-12 text-indigo-400" />,
      title: "Strategic Network Access",
      description: "Connect with advisors, GTM partners, and co-investors to unlock opportunities."
    },
    {
      icon: <BarChart className="w-12 h-12 text-indigo-400" />,
      title: "Execution Intelligence",
      description: "Data-driven insights, AI-powered dashboards, and strategic reviews for optimal performance."
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="text-indigo-400 w-8 h-8 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-400">
              Our Services
            </h2>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Where Capital Meets Execution
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Meta3Ventures empowers founders with hands-on support, 
            agentic AI tools, and strategic connections to move faster, smarter, and more focused.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition-all duration-300"
            >
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xl text-gray-300 mb-8">
            Engineered to compound. Built to scale.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/services"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Explore Our Model
            </Link>
            <Link
              to="/apply"
              className="inline-flex items-center px-8 py-3 border border-indigo-400 text-indigo-400 hover:bg-indigo-400/10 rounded-lg font-medium transition-colors"
            >
              Submit Your Pitch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;