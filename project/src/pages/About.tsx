import React from 'react';
import { SEO } from '../components/SEO';
import { CheckCircle, Users, Target, Lightbulb, Rocket, Brain, Network, ArrowRight, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { imageConfig } from '../utils/imageUtils';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Mission-Driven",
      description: "We're committed to empowering founders who are building the future of intelligent systems."
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation First",
      description: "We push boundaries at the intersection of AI, automation, and emerging technologies."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Founder-Centric",
      description: "Our approach is built around the unique needs and vision of each founding team."
    }
  ];

  const pillars = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Technical Excellence",
      description: "Deep expertise in AI, blockchain, and emerging technologies guides our partnership and support strategies."
    },
    {
      icon: <Network className="w-6 h-6" />,
      title: "Network Effect",
      description: "Our ecosystem of partners, advisors, and portfolio companies creates compound value."
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Execution Focus",
      description: "We provide hands-on support and strategic resources to accelerate growth and innovation."
    }
  ];

  return (
    <>
      <SEO 
        title="About - Meta3Ventures"
        description="Meta3Ventures is a thesis-driven venture platform empowering the next generation of intelligent companies through AI innovation and strategic support."
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-24">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Story
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mt-2">
                  Building Tomorrow's Tech Leaders
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Meta3Ventures is a thesis-driven venture platform—part startup studio, part strategic partner—built 
                to empower the next generation of intelligent companies. We partner with and support bold, technical founders building 
                at the frontier of Agentic AI, automation, and convergence technologies.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">30+</div>
                <div className="text-gray-600 dark:text-gray-300">Portfolio Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">🌀</div>
                <div className="text-gray-600 dark:text-gray-300">Value Creation Flywheel</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">7+</div>
                <div className="text-gray-600 dark:text-gray-300">Successful Exits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  Our Vision
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  We envision a future where intelligent systems enhance human capabilities and solve complex 
                  global challenges through innovative technology solutions. A world where AI and automation 
                  work seamlessly to create more opportunities and better outcomes for everyone.
                </p>
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  To engineer the future of intelligent systems by co-building with the founders who dare to 
                  define it. We provide the strategic support, technical expertise, and network access needed 
                  to turn visionary ideas into market-leading companies.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg"></div>
                <img 
                  src={imageConfig.optimizedUrls.teamCollaboration}
                  alt="Team collaboration" 
                  className="relative z-10 rounded-xl shadow-xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = imageConfig.fallbackImages.team;
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                Leadership
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our leadership team brings together decades of experience in technology, venture building, 
                and company scaling to help founders succeed.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative h-full">
                    <img 
                      src={imageConfig.optimizedUrls.lironLanger}
                      alt="Liron Langer - Managing Director"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800";
                      }}
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Liron Langer</h3>
                    <p className="text-xl text-indigo-600 dark:text-indigo-400 mb-6">Managing Director</p>
                    
                    <div className="prose dark:prose-invert">
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Liron Langer serves as the Managing Director of Meta3Ventures, where he leverages his extensive experience 
                        in venture building, entrepreneurship, and company management to drive innovation and transformative growth 
                        in the AI and Web3 industries.
                      </p>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        With over 25 years of experience in founding, scaling, and managing companies from inception to successful 
                        exits, Liron's expertise spans across AI, Cybersecurity, Blockchain, Retail, Media, and Fintech.
                      </p>

                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        As the former Chief Investment Officer at Nielsen Innovate Fund, Liron has a strong track record of 
                        early-stage partnership success, guiding numerous startups and delivering exceptional returns to LPs.
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <a 
                        href="mailto:liron@meta3ventures.com"
                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label="Email Liron Langer"
                      >
                        <Mail className="w-6 h-6" />
                      </a>
                      <a 
                        href="https://linkedin.com/in/lironlanger"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label="Liron Langer LinkedIn Profile"
                      >
                        <Linkedin className="w-6 h-6" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Pillars */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
              Strategic Pillars
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pillars.map((pillar, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit mb-4">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-12 text-white text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Build the Future?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join us in shaping the next generation of intelligent systems.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    to="/apply"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link 
                    to="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 border border-white text-white hover:bg-white/10 font-medium rounded-lg transition-colors"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;