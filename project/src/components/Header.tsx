import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleAdminMenu = () => setIsAdminMenuOpen(!isAdminMenuOpen);

  const _scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavigation = (_path: string) => {
    setIsMenuOpen(false);
    setIsAdminMenuOpen(false);
    // Scroll to top when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/partners', label: 'Partners' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
    { path: '#', label: 'Virtual Agents (Coming Soon)', disabled: true }
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text hover:scale-105 transition-transform"
            onClick={() => handleNavigation('/')}
          >
            Meta3Ventures
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            item.disabled ? (
              <span 
                key={item.path}
                className="text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium"
              >
                {item.label}
              </span>
            ) : (
              <Link 
                key={item.path}
                to={item.path}
                className={`text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium ${
                  isActivePath(item.path) ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Link>
            )
          ))}
          <Link 
            to="/apply"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
            onClick={() => handleNavigation('/apply')}
          >
            Apply Now
          </Link>
        </nav>

        <div className="flex items-center md:hidden space-x-4">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            onClick={toggleMenu}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={toggleAdminMenu}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Admin menu"
            >
              <Settings size={20} />
            </button>
            
            {isAdminMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/blog/manage"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleNavigation('/blog/manage')}
                >
                  Blog Management
                </Link>
              </div>
            )}
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg py-4 px-6 flex flex-col space-y-4 animate-fadeIn z-40">
          {menuItems.map((item) => (
            item.disabled ? (
              <span 
                key={item.path}
                className="text-gray-400 dark:text-gray-500 cursor-not-allowed py-2 font-medium"
              >
                {item.label}
              </span>
            ) : (
              <Link 
                key={item.path}
                to={item.path}
                className={`text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 font-medium ${
                  isActivePath(item.path) ? 'text-indigo-600 dark:text-indigo-400' : ''
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Link>
            )
          ))}
          <Link 
            to="/apply"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-center font-medium"
            onClick={() => handleNavigation('/apply')}
          >
            Apply Now
          </Link>
          <Link
            to="/blog/manage"
            className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2 font-medium"
            onClick={() => handleNavigation('/blog/manage')}
          >
            Blog Management
          </Link>
        </div>
      )}

      {/* Floating CTA for mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Link
          to="/apply"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          onClick={() => handleNavigation('/apply')}
        >
          Apply Now
        </Link>
      </div>
    </header>
  );
};