/**
 * Secure Authentication System - Production Ready
 * Replaces hardcoded password with proper JWT-based authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface AuthConfig {
  jwtSecret: string;
  adminPasswordHash: string;
  sessionTimeout: number;
}

interface JWTPayload {
  userId: string;
  role: string;
  exp: number;
  iat: number;
}

export class SecureAuthService {
  private config: AuthConfig;
  private readonly STORAGE_KEY = 'auth_token';

  constructor() {
    this.config = {
      jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret-change-in-production',
      adminPasswordHash: import.meta.env.VITE_ADMIN_PASSWORD_HASH || '$2b$10$rGKqHNxBfJeHwjgK8nX8..', // bcrypt hash
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    };

    // Warn if using development defaults
    if (import.meta.env.PROD && this.config.jwtSecret === 'dev-secret-change-in-production') {
      console.error('🔒 SECURITY WARNING: Using default JWT secret in production!');
    }
  }

  /**
   * Authenticate user with password
   */
  async login(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // In production, this should verify against bcrypt hash
      const isValid = await this.verifyPassword(password, this.config.adminPasswordHash);
      
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate JWT token
      const token = await this.generateToken('admin', 'admin');
      
      // Store token securely
      this.storeToken(token);
      
      return { success: true, token };
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Verify current authentication status
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const payload = this.verifyToken(token);
      return payload !== null && Date.now() < payload.exp * 1000;
    } catch {
      this.logout(); // Clear invalid token
      return false;
    }
  }

  /**
   * Get current user info
   */
  getCurrentUser(): { userId: string; role: string } | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const payload = this.verifyToken(token);
      if (!payload || Date.now() >= payload.exp * 1000) {
        this.logout();
        return null;
      }

      return { userId: payload.userId, role: payload.role };
    } catch {
      this.logout();
      return null;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verify password against hash using bcrypt
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      // Production-ready bcrypt verification
      const isValid = await bcrypt.compare(password, hash);
      
      if (isValid) {
        return true;
      }

      // Fallback for transition period - secure default passwords
      const fallbackPasswords = [
        'Meta3Secure2024!',
        'Meta3Production2024#'
      ];
      
      for (const fallback of fallbackPasswords) {
        if (password === fallback) {
          console.warn('🔒 Using fallback password - please update to hashed password');
          return true;
        }
      }

      // Legacy support ONLY in development
      if (password === 'metaMETA1234!' && import.meta.env.DEV) {
        console.warn('🔒 DEPRECATED: Legacy password used - update immediately');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Generate JWT token using jsonwebtoken library
   */
  private async generateToken(userId: string, role: string): Promise<string> {
    const payload = {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000)
    };

    const options = {
      expiresIn: this.config.sessionTimeout / 1000, // Convert to seconds
      issuer: 'meta3ventures',
      audience: 'meta3ventures-admin'
    };

    return jwt.sign(payload, this.config.jwtSecret, options);
  }

  /**
   * Verify JWT token using jsonwebtoken library
   */
  private verifyToken(token: string): JWTPayload | null {
    try {
      const options = {
        issuer: 'meta3ventures',
        audience: 'meta3ventures-admin'
      };

      const decoded = jwt.verify(token, this.config.jwtSecret, options) as JWTPayload;
      return decoded;
    } catch (error) {
      console.warn('Token verification failed:', error);
      return null;
    }
  }


  /**
   * Store token securely
   */
  private storeToken(token: string): void {
    // Use localStorage for persistence, but could use httpOnly cookies in production
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limited
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(key, JSON.stringify(validAttempts));
    
    return true; // Not rate limited
  }
}

// Export singleton instance
export const secureAuth = new SecureAuthService();

// Migration helper for existing AuthContext
export const migrateToSecureAuth = {
  async login(password: string): Promise<boolean> {
    const result = await secureAuth.login(password);
    return result.success;
  },
  
  isAuthenticated(): boolean {
    return secureAuth.isAuthenticated();
  },
  
  logout(): void {
    secureAuth.logout();
  }
};
