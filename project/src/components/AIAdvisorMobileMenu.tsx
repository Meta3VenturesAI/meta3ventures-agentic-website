import React, { useState } from 'react';
import { 
  Brain, Rocket, DollarSign, X, ChevronRight,
  MessageCircle
} from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';

interface AIAdvisorMobileMenuProps {
  onOpenVentureLaunch: () => void;
  onOpenFundraising: () => void;
  onOpenCompetitive: () => void;
  onOpenVirtualAssistant: () => void;
}

export const AIAdvisorMobileMenu: React.FC<AIAdvisorMobileMenuProps> = ({
  onOpenVentureLaunch,
  onOpenFundraising,
  onOpenCompetitive,
  onOpenVirtualAssistant
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const advisors = [
    {
      id: 'virtual-assistant',
      name: 'Virtual Assistant',
      description: 'General AI assistant for navigation and questions',
      icon: MessageCircle,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => {
        onOpenVirtualAssistant();
        setIsOpen(false);
      }
    },
    {
      id: 'venture-launch',
      name: 'Venture Launch Builder',
      description: 'Strategic advisor for early-stage startups',
      icon: Rocket,
      color: 'from-purple-600 to-indigo-600',
      onClick: () => {
        onOpenVentureLaunch();
        setIsOpen(false);
      }
    },
    {
      id: 'fundraising',
      name: 'Fundraising Advisor',
      description: 'Complete fundraising preparation guide',
      icon: DollarSign,
      color: 'from-green-600 to-teal-600',
      onClick: () => {
        onOpenFundraising();
        setIsOpen(false);
      }
    },
    {
      id: 'competitive',
      name: 'Competitive Intelligence',
      description: 'Multi-agent research for USP development',
      icon: Brain,
      color: 'from-indigo-600 to-blue-600',
      onClick: () => {
        onOpenCompetitive();
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg z-50"
        aria-label="Open AI Advisors Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Brain className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              AI
            </span>
          </>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-45 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="AI Advisors Menu"
      >
        <div className="p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Advisors
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            {advisors.map((advisor) => {
              const Icon = advisor.icon;
              return (
                <button
                  key={advisor.id}
                  onClick={advisor.onClick}
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all group"
                  aria-label={`Open ${advisor.name}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-gradient-to-r ${advisor.color} rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {advisor.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {advisor.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Pro Tip:</strong> Each AI advisor specializes in different aspects of your business journey. Use them together for comprehensive support.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};