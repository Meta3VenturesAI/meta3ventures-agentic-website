import React, { createContext, useContext, useState, useEffect } from 'react';
import { browserAuth, AuthUser } from '../utils/browser-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  user?: AuthUser;
  validatePassword: (password: string) => { isValid: boolean; errors: string[] };
  checkAdminAccess: () => boolean;
  getSessionInfo: () => { sessionId: string; loginTime: string; lastActivity: string };
  isSessionValid: () => boolean;
  refreshSession: () => void;
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

    // Set up session monitoring
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated && !isSessionValid()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  const login = async (password: string): Promise<boolean> => {
    try {
      // Validate password first
      const validation = validatePassword(password);
      if (!validation.isValid) {
        if (import.meta.env.DEV) {
          console.error('Password validation failed:', validation.errors);
        }
        return false;
      }

      const result = await browserAuth.login(password);
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        
        // Store session info
        const sessionInfo = {
          sessionId: generateSessionId(),
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        sessionStorage.setItem('admin_session', JSON.stringify(sessionInfo));
        
        return true;
      } else {
        if (import.meta.env.DEV) {
          console.error('Login failed: Invalid credentials');
        }
        return false;
      }
    } catch (error: unknown) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
        // Log detailed error for debugging
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      }
      return false;
    }
  };

  const logout = () => {
    browserAuth.logout();
    setIsAuthenticated(false);
    setUser(undefined);
    sessionStorage.removeItem('admin_session');
  };

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const checkAdminAccess = (): boolean => {
    if (!isAuthenticated) return false;
    
    // Check if user has admin role
    const userRole = user?.role || 'user';
    return userRole === 'admin' || userRole === 'super_admin';
  };

  const getSessionInfo = (): { sessionId: string; loginTime: string; lastActivity: string } => {
    const sessionData = sessionStorage.getItem('admin_session');
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    return {
      sessionId: 'no-session',
      loginTime: 'never',
      lastActivity: 'never'
    };
  };

  const isSessionValid = (): boolean => {
    const sessionData = sessionStorage.getItem('admin_session');
    if (!sessionData) return false;
    
    try {
      const session = JSON.parse(sessionData);
      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      const sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
      
      return (now.getTime() - lastActivity.getTime()) < sessionTimeout;
    } catch {
      return false;
    }
  };

  const refreshSession = (): void => {
    const sessionData = sessionStorage.getItem('admin_session');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        session.lastActivity = new Date().toISOString();
        sessionStorage.setItem('admin_session', JSON.stringify(session));
      } catch {
        // Ignore errors
      }
    }
  };

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (isAuthenticated) {
        refreshSession();
      }
    };

    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('scroll', updateActivity);

    return () => {
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      document.removeEventListener('scroll', updateActivity);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      user,
      validatePassword,
      checkAdminAccess,
      getSessionInfo,
      isSessionValid,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function
const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};