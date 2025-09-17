import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser } from '../utils/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
  login: (_password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (_email: string, _password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount and periodically
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const isValid = await authService.validateSession();
        if (isValid) {
          const currentUser = authService.getCurrentUser();
          setIsAuthenticated(true);
          setUser(currentUser);
          setIsAdmin(authService.isAdmin());
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();

    // Re-validate session every 5 minutes
    const interval = setInterval(validateAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.loginWithPassword(password);
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        setIsAdmin(result.user.role === 'admin');
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.loginWithSupabase(email, password);
      
      if (result.success && result.user) {
        setIsAuthenticated(true);
        setUser(result.user);
        setIsAdmin(result.user.role === 'admin');
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      user, 
      login, 
      loginWithEmail, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};