import React from 'react';
import { CTAButtons } from '../CTAButtons';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const { elementRef, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section 
      ref={elementRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800"
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-5xl mx-auto text-center">
          {/* New Application Process Banner */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-full border border-yellow-400/30 mb-6 transition-all duration-1000 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-medium text-sm">New streamlined application process now live!</span>
            <Link to="/apply" className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors">
              <span className="text-sm font-semibold">Apply Now</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <h1 className={`text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight transition-all duration-1000 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <span className="block mb-4">Engineering the Future with AI.</span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text text-2xl md:text-4xl lg:text-5xl">
              Partnering with Founders Who Build the Next Generation of Intelligent Systems.
            </span>
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 transition-all duration-1000 delay-300 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            From Agentic AI to Convergence Tech, we invest in what matters next—by building, not betting.
          </p>
          
          <div className={`transition-all duration-1000 delay-500 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CTAButtons variant="dark" className="justify-center" />
          </div>

          <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 delay-700 ${
            isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-8 h-12 rounded-full border-2 border-white/30 flex justify-center items-start p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-scroll-indicator"></div>
            </div>
            <span className="text-white/70 text-sm mt-2">Scroll to explore</span>
          </div>
        </div>
      </div>
    </section>
  );
};