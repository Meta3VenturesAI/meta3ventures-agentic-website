import React from 'react';
import { SEO } from '../components/SEO';
import { Portfolio as PortfolioSection } from '../components/sections/Portfolio';
import { Brain, Code, Network } from 'lucide-react';
import { CTAButtons } from '../components/CTAButtons';

const PortfolioPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="Portfolio - Meta3Ventures"
        description="Explore our portfolio of innovative companies shaping the future of technology through AI, blockchain, and cutting-edge solutions."
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Our Portfolio
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mt-2">
                  Building Tomorrow's Tech Leaders
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                We partner with and support innovative companies that are pushing the boundaries 
                of technology in AI, blockchain, and emerging technologies.
              </p>
              <div className="flex justify-center">
                <CTAButtons variant="dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">30+</div>
                <div className="text-gray-600 dark:text-gray-300">Investments</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">7+</div>
                <div className="text-gray-600 dark:text-gray-300">Successful Exits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">🌀</div>
                <div className="text-gray-600 dark:text-gray-300">Value Creation Flywheel</div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Focus */}
        <div className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              Investment Verticals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                  <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI & Machine Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Autonomous systems, computer vision, and intelligent automation solutions.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                  <Code className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Media & Entertainment</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Digital content, streaming platforms, and interactive entertainment.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                  <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Fintech & Retail Technology</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Financial services, payment solutions, e-commerce platforms, and retail analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="container mx-auto px-4 md:px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <PortfolioSection />
          </div>
        </div>
      </div>
    </>
  );
};

export default PortfolioPage;