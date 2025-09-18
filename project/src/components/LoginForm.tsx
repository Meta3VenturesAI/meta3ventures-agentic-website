import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(password);
      if (!success) {
        setError('Invalid password. Please contact administrator.');
        setPassword('');
      }
    } catch {
      setError('Login failed. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blog Management Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Please enter your password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;