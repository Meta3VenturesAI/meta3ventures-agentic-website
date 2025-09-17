import React, { createContext, useContext, useState, useEffect } from 'react';
import { browserAuth, AuthUser } from '../utils/browser-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  user?: AuthUser;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | undefined>();

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = browserAuth.isAuthenticated();
    if (authenticated) {
      const currentUser = browserAuth.getCurrentUser();
      setIsAuthenticated(true);
      setUser(currentUser || undefined);
    }
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const result = await browserAuth.login(password);
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        return true;
      } else {
        return false;
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    browserAuth.logout();
    setIsAuthenticated(false);
    setUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};