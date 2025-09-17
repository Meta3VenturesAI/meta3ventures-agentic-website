import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CTAButtons } from '../CTAButtons';
import { imageConfig } from '../../utils/imageUtils';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                Our Vision & Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                We envision a future where intelligent systems enhance human capabilities and solve complex global challenges through innovative technology solutions.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mission</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      To engineer the future of intelligent systems by co-building with the founders who dare to define it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Purpose</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      To empower technical founders with the resources, expertise, and support needed to build transformative AI-driven companies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Approach</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Hands-on partnership combining deep technical expertise with strategic support to accelerate growth and innovation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <CTAButtons />
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg"></div>
            <img 
              src={imageConfig.optimizedUrls.teamCollaboration}
              alt="Team collaboration" 
              className="relative z-10 rounded-xl shadow-xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = imageConfig.fallbackImages.team;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};