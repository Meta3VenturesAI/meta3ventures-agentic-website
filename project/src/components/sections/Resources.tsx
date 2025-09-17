import React from 'react';
import { BookOpen, FileText, Video, Download, ArrowRight } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  link: string;
}

export const Resources: React.FC = () => {
  const resources: Resource[] = [
    {
      title: "AI Investment Thesis 2025",
      description: "Our comprehensive analysis of the AI landscape and investment opportunities in autonomous systems.",
      icon: <BookOpen className="w-6 h-6" />,
      category: "Research",
      link: "#"
    },
    {
      title: "Founder's Guide to AI Integration",
      description: "Technical whitepaper on implementing AI systems in early-stage startups.",
      icon: <FileText className="w-6 h-6" />,
      category: "Whitepaper",
      link: "#"
    },
    {
      title: "Building Agentic AI Systems",
      description: "Video series on developing autonomous AI agents with real-world applications.",
      icon: <Video className="w-6 h-6" />,
      category: "Video Series",
      link: "#"
    },
    {
      title: "AI Startup Toolkit",
      description: "Essential resources and templates for AI-first startup founders.",
      icon: <Download className="w-6 h-6" />,
      category: "Tools",
      link: "#"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Resources Hub
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Access our curated collection of insights, guides, and tools to help you build 
            and scale your AI-driven venture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((resource, index) => (
            <div 
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit">
                {resource.icon}
              </div>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {resource.category}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900 dark:text-white">
                {resource.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {resource.description}
              </p>
              <a 
                href={resource.link}
                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Learn More
                <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a 
            href="#"
            className="inline-flex items-center justify-center px-6 py-3 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            View All Resources
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};