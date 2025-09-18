import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PortfolioCompany {
  name: string;
  website: string;
  description: string;
  status?: string;
  acquirer?: string;
  category: string;
}

export const Portfolio: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const companies: PortfolioCompany[] = [
    {
      name: "AdVerif.ai",
      website: "adverifai.com",
      description: "Utilized AI to identify and combat misinformation online, enhancing brand safety.",
      status: "Exit",
      acquirer: "Zefr",
      category: "AI & Machine Learning"
    },
    {
      name: "BrainVu",
      website: "brainvu.com",
      description: "Real-time emotion analysis in VR/AR market research.",
      status: "Exit",
      acquirer: "Mantis Vision",
      category: "AI & Machine Learning"
    },
    {
      name: "vBrand",
      website: "vbrandsports.com",
      description: "AI data platform for sports marketing.",
      status: "Exit",
      acquirer: "Nielsen",
      category: "AI & Machine Learning"
    },
    {
      name: "First Digital Asset",
      website: "firstdigitalasset.com",
      description: "Digital asset management and trading solutions.",
      status: "Exit",
      acquirer: "Fireblocks",
      category: "FinTech"
    },
    {
      name: "Parsempo",
      website: "parsempo.com",
      description: "AI-powered digital out-of-home advertising platform.",
      category: "AdTech"
    },
    {
      name: "ARpalus",
      website: "arpalus.com",
      description: "Product availability excellence, from shelf to inventory using Computer Vision.",
      category: "Retail Technology"
    },
    {
      name: "Package.ai",
      website: "package.ai",
      description: "Last mile logistics optimization.",
      category: "Logistics"
    },
    {
      name: "Webeyez",
      website: "webeyez.com",
      description: "Digital experience monitoring made SMART.",
      category: "Analytics"
    },
    {
      name: "Placense",
      website: "placense.com",
      description: "The future of privacy in location intelligence.",
      category: "Privacy Tech"
    },
    {
      name: "G-Mana",
      website: "g-mana.com",
      description: "Provides addressable TV and OTT SSAI monetization solutions for linear, live, or VOD content, enhancing content monetization with seamless, targeted ads.",
      category: "AdTech"
    },
    {
      name: "SHOW!",
      website: "show.marketing",
      description: "An automatic and engaging ad solution tailored for live-video influencers, enhancing monetization strategies during live streams.",
      category: "Marketing Tech"
    },
    {
      name: "Momentum",
      website: "nif.vc/portfolio/momentum/",
      description: "Blockchain-centric global standard for loyalty marketing and AI-driven cash flow.",
      status: "Exit",
      category: "Blockchain"
    },
    {
      name: "Voiceable",
      website: "voiceable.co",
      description: "Provides online shoppers with an in-store experience through voice and video.",
      category: "E-commerce"
    },
    {
      name: "Enerjoy",
      website: "enerjoy.co",
      description: "Motivational tool for sales and service teams.",
      category: "HR Tech"
    },
    {
      name: "Personalics",
      website: "personalics.com",
      description: "Automated 1:1 marketing.",
      category: "Marketing Tech"
    },
    {
      name: "GenovateAI",
      website: "genovateai.com",
      description: "An AI consultancy and development firm specializing in generative AI tools and solutions for enterprise applications.",
      category: "AI & Machine Learning"
    },
    {
      name: "QuickCast",
      website: "quickcast.tv",
      description: "Empowers content creators to build, manage, distribute, and monetize FAST channels and custom-branded TV apps across connected TV and OTT platforms.",
      category: "Media & Entertainment"
    },
    {
      name: "Wizer",
      website: "getwizer.com",
      description: "AI-powered adaptable research platform.",
      category: "Research Tech"
    },
    {
      name: "ciValue",
      website: "civalue.com",
      description: "Customer-centric AI and monetization solutions for FMCG retail.",
      status: "Exit",
      acquirer: "NielsenIQ",
      category: "Retail Technology"
    },
    {
      name: "Crossense",
      website: "fortune.com",
      description: "Understanding consumer behavior through digital tracking.",
      status: "Exit",
      acquirer: "Toluna",
      category: "Analytics"
    },
    {
      name: "Revuze",
      website: "revuze.it",
      description: "AI-powered platform for real-time consumer insights.",
      category: "Analytics"
    },
    {
      name: "OurCart",
      website: "ourcart.com",
      description: "Connecting brands to consumers.",
      category: "E-commerce"
    },
    {
      name: "Web3M",
      website: "web3m.com",
      description: "Web3 marketing and development solutions.",
      category: "Blockchain"
    },
    {
      name: "Papaya Gaming",
      website: "papayagaming.com",
      description: "Innovative gaming solutions and experiences.",
      category: "Gaming"
    },
    {
      name: "Payset",
      website: "payset.io",
      description: "Digital payment and financial solutions.",
      category: "FinTech"
    },
    {
      name: "Palwallet",
      website: "palwallet.com",
      description: "Digital wallet and cryptocurrency solutions.",
      category: "FinTech"
    },
    {
      name: "MonkeyLegauge",
      website: "monkeylegauge.com",
      description: "Blockchain gaming and NFT solutions.",
      category: "Gaming"
    }
  ];

  const nextTestimonial = useCallback(() => {
    setActiveIndex((current) => (current + 1) % companies.length);
  }, [companies.length]);

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + companies.length) % companies.length);
  };

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        nextTestimonial();
      }, 4000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isPaused, nextTestimonial]);

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'AI & Machine Learning': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      'Media & Entertainment': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      'FinTech': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      'Retail Technology': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      'Analytics': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
      'AdTech': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      'Blockchain': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      'E-commerce': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
      'Gaming': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200',
      'Privacy Tech': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200',
      'Logistics': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
      'Marketing Tech': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
      'HR Tech': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
      'Research Tech': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
  };

  return (
    <section id="portfolio" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
            Our Portfolio & Past Investments
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We partner with innovative companies that are shaping the future of technology
            through AI, blockchain, and cutting-edge solutions.
          </p>
        </div>

        <div 
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl">
            {companies.map((company, index) => (
              <div
                key={index}
                className={`transition-all duration-500 ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0 hidden'
                }`}
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                    <div className="w-48 h-48 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl flex items-center justify-center p-6">
                      <h3 className="text-2xl font-bold text-white text-center break-words">
                        {company.name}
                      </h3>
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {company.name}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(company.category)}`}>
                          {company.category}
                        </span>
                        {company.status && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                            {company.status} {company.acquirer && `to ${company.acquirer}`}
                          </span>
                        )}
                      </div>
                      <a
                        href={`https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mb-4"
                      >
                        {company.website}
                        <ExternalLink size={14} />
                      </a>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {company.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous company"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next company"
          >
            <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>

          <div className="flex justify-center mt-8 space-x-2">
            {companies.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'bg-indigo-600 dark:bg-indigo-400 w-6' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to company ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <Link 
            to="/apply"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-medium inline-flex items-center transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Apply Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link 
            to="/contact"
            className="border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 inline-flex items-center transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};