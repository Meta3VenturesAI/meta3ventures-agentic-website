import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CTAButtonsProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const CTAButtons: React.FC<CTAButtonsProps> = ({ variant = 'light', className = '' }) => {
  const isLight = variant === 'light';

  const handleNavigation = () => {
    // Scroll to top when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <Link 
        to="/apply"
        className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium transition-all transform hover:scale-105 ${
          isLight 
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
            : 'bg-white text-indigo-900 hover:bg-gray-100'
        }`}
        onClick={handleNavigation}
      >
        Apply Now
        <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
      <Link 
        to="/contact"
        className={`inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium transition-all transform hover:scale-105 ${
          isLight
            ? 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
            : 'border-2 border-white text-white hover:bg-white/10'
        }`}
        onClick={handleNavigation}
      >
        Contact Us
      </Link>
    </div>
  );
};