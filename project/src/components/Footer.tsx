import React from 'react';
import { Twitter, Linkedin, Mail, SunMedium as Medium } from 'lucide-react';
import { useForm } from '@formspree/react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const [state, handleSubmit] = useForm("xdkgwaaa");
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.succeeded) {
      toast.success('Welcome! You\'re now subscribed to our newsletter.');
      // Reset form and reload page to clear Formspree state
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.reset();
        }
        // Reload to clear form state completely
        window.location.reload();
      }, 2000);
    }
  }, [state.succeeded]);

  if (state.errors && Object.keys(state.errors).length > 0) {
    toast.error('Failed to subscribe. Please try again.');
  }

  const handleNavigation = () => {
    // Scroll to top when navigating to a new page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">Meta3Ventures</h3>
            <p className="text-gray-400 mb-4">
              Pioneering the future of tech innovation and digital transformation through strategic consulting and cutting-edge solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/meta3ventures" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com/company/meta3ventures" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                <Linkedin size={20} />
              </a>
              <a href="https://medium.com/@meta3ventures" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                <Medium size={20} />
              </a>
              <a href="mailto:liron@meta3ventures.com" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Home</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Services</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>About Us</Link></li>
              <li><Link to="/portfolio" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Portfolio</Link></li>
              <li><Link to="/partners" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Partners</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Venture Studio Support</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>AI Integration</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Strategic Network Access</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Intelligence Layer</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors" onClick={handleNavigation}>Growth Acceleration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Stay updated with our latest insights and news.</p>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                name="email"
                required
                disabled={state.submitting}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {state.submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </div>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Meta3Ventures. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/contact" className="text-gray-500 hover:text-white text-sm transition-colors" onClick={handleNavigation}>Privacy Policy</Link>
              <Link to="/contact" className="text-gray-500 hover:text-white text-sm transition-colors" onClick={handleNavigation}>Terms of Service</Link>
              <Link to="/contact" className="text-gray-500 hover:text-white text-sm transition-colors" onClick={handleNavigation}>Cookie Policy</Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Derech Menachem Begin 121, Tel Aviv-Yafo, Israel | 
              <a href="tel:+972528444500" className="hover:text-white transition-colors ml-1">+972 52-844-4500</a> | 
              <a href="mailto:liron@meta3ventures.com" className="hover:text-white transition-colors ml-1">liron@meta3ventures.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};