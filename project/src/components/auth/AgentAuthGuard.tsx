/**
 * Agent Authentication Guard - Professional access control for virtual agents
 * Ensures only authenticated users can access the virtual agents system
 */

import React, { useState } from 'react';
import { Shield, Bot, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AgentAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'user' | 'admin';
  agentName?: string;
}

interface LoginModalProps {
  onClose?: () => void;
  agentName?: string;
}

const AgentLoginModal: React.FC<LoginModalProps> = ({ onClose, agentName }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(password);
      
      if (success) {
        toast.success(`Welcome to Meta3 Virtual Agents!`);
        if (onClose) onClose();
      } else {
        toast.error('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Virtual Agents Access
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {agentName ? `Accessing ${agentName}` : 'Secure authentication required'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta3 Virtual Agents System
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Access our professional AI agents for venture building, fundraising, and market intelligence.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white pr-12"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center">
              <input
                id="remember-session"
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="remember-session" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember this session
              </label>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Your session is secured with enterprise-grade encryption. All conversations are private and confidential.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Access Virtual Agents</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Meta3 Ventures • Secure AI Agent Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export const AgentAuthGuard: React.FC<AgentAuthGuardProps> = ({ 
  children, 
  requiredRole = 'user',
  agentName 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);

  // Check authentication
  if (!isAuthenticated) {
    return (
      <AgentLoginModal 
        onClose={() => setShowLoginModal(false)}
        agentName={agentName}
      />
    );
  }

  // Check role-based access (if needed in future)
  // if (requiredRole === 'admin' && user?.role !== 'admin') {
  //   return <AccessDeniedComponent requiredRole={requiredRole} />;
  // }

  return <>{children}</>;
};

export default AgentAuthGuard;
