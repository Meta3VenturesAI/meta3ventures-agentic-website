import React from 'react';
import { Code, Users, Brain, Network, BarChart, Repeat, CheckCircle, Zap } from 'lucide-react';
import { SEO } from '../components/SEO';
import { CTAButtons } from '../components/CTAButtons';
import { Contact } from '../components/sections/Contact';

const ServicesPage: React.FC = () => {
  const services = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Venture Studio Support",
      description: "Hands-on operational support to accelerate execution",
      features: [
        "Product & Technical Architecture",
        "Go-To-Market Strategy",
        "Talent Access & Org Design",
        "Financial Planning & Strategy"
      ]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Agentic AI Enablement",
      description: "Empowering startups with automation-first capabilities",
      features: [
        "Pre-built AI Agents & Workflows",
        "Multi-Agent System Orchestration",
        "Founder's AI Console",
        "Performance Analytics"
      ]
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Strategic Network Access",
      description: "Plug into a powerful ecosystem of collaborators",
      features: [
        "Domain Experts & Advisors",
        "Partner Introductions",
        "Co-investment Opportunities",
        "Industry Connections"
      ]
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Intelligence Layer",
      description: "Data-driven insights for optimal performance",
      features: [
        "Real-Time Dashboards",
        "Strategic Reviews",
        "Execution Analytics",
        "Growth Metrics"
      ]
    }
  ];

  return (
    <>
      <SEO 
        title="Services - Meta3Ventures"
        description="Explore our comprehensive suite of venture studio services, from technical support to strategic networking, designed to help startups scale and succeed."
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 md:px-6 py-24">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Beyond Capital.
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                  We Engineer Your Edge
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-12">
                At Meta3Ventures, we're more than investors—we're builders, engineers, and strategic partners. 
                Our service model is designed to equip early-stage founders with the infrastructure, insight, 
                and relationships needed to go from zero to traction—and from traction to scale.
              </p>
              <div className="flex justify-center">
                <CTAButtons variant="dark" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-20">
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-all transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
                    {service.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {service.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Why Choose Us */}
          <section className="mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                Why Choose Meta3Ventures?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Proven Track Record",
                    description: "Successfully launched and scaled 50+ startups"
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Expert Team",
                    description: "Access to industry veterans and technical experts"
                  },
                  {
                    icon: <Repeat className="w-6 h-6" />,
                    title: "Full-Stack Support",
                    description: "End-to-end assistance from ideation to scale"
                  }
                ].map((item, index) => (
                  <div key={index} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto text-center mb-20">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">🌀 Designed to Compound</h2>
              <p className="text-xl text-gray-300 mb-12">
                Each layer of support feeds into the next—creating a flywheel effect that compounds strategic advantage, 
                accelerates product-market fit, and positions our startups for sustainable, high-velocity growth.
              </p>
              <div className="flex justify-center">
                <CTAButtons variant="dark" />
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <Contact />
        </div>
      </div>
    </>
  );
};

export default ServicesPage;