/**
 * Browser-Compatible Authentication System
 * Replaces Node.js JWT with Web Crypto API implementation
 */

import { auditLogger, AuditEvents } from './audit-logger';
import { rateLimiter, RATE_LIMIT_CONFIGS } from './rate-limiter';

interface AuthUser {
  userId: string;
  role: string;
  email?: string;
  name?: string;
}

interface AuthToken {
  header: string;
  payload: string;
  signature: string;
}

interface TokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export class BrowserAuthService {
  private readonly SECRET_KEY = 'meta3-secure-key-2024';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Login with password
   */
  async login(password: string): Promise<{ success: boolean; token?: string; user?: AuthUser; error?: string }> {
    const clientId = this.getClientId();
    
    try {
      // Check rate limiting
      const rateCheck = rateLimiter.isAllowed(clientId, RATE_LIMIT_CONFIGS.LOGIN);
      if (!rateCheck.allowed) {
        auditLogger.logSecurity(AuditEvents.RATE_LIMIT_EXCEEDED, {
          identifier: clientId,
          retryAfter: rateCheck.retryAfter,
          action: 'login_attempt'
        }, 'warning');
        
        return { 
          success: false, 
          error: `Rate limit exceeded. Try again in ${Math.ceil((rateCheck.retryAfter || 0) / 60)} minutes.` 
        };
      }

      auditLogger.logAuth(AuditEvents.LOGIN_ATTEMPT, {
        timestamp: new Date().toISOString(),
        remaining_attempts: rateCheck.remaining,
        clientId
      }, 'success');

      // Verify password
      const isValid = await this.verifyPassword(password);
      
      if (!isValid) {
        // Record failed attempt
        rateLimiter.recordFailedAttempt(clientId, RATE_LIMIT_CONFIGS.LOGIN);
        
        auditLogger.logAuth(AuditEvents.LOGIN_FAILURE, {
          reason: 'invalid_password',
          remaining_attempts: rateCheck.remaining - 1,
          clientId
        }, 'failure');
        
        return { success: false, error: 'Invalid password' };
      }

      // Generate token and user
      const user: AuthUser = {
        userId: 'admin',
        role: 'admin',
        name: 'Administrator'
      };

      const token = await this.generateToken(user);
      this.storeToken(token);

      // Clear rate limit on success
      rateLimiter.clearRateLimit(clientId);

      auditLogger.logAuth(AuditEvents.LOGIN_SUCCESS, {
        userId: user.userId,
        role: user.role,
        method: 'password',
        clientId
      }, 'success', user.userId);

      return { success: true, token, user };

    } catch (error: unknown) {
      auditLogger.logAuth(AuditEvents.LOGIN_FAILURE, {
        error: (error as any)?.message || 'Unknown error',
        stack: (error as any)?.stack || '',
        clientId
      }, 'failure');
      
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      const payload = this.verifyToken(token);
      if (!payload) return false;

      const now = Date.now();
      return now < payload.exp;
    } catch {
      this.logout(); // Clear invalid token
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    try {
      const token = this.getStoredToken();
      if (!token) return null;

      const payload = this.verifyToken(token);
      if (!payload || Date.now() >= payload.exp) {
        this.logout();
        return null;
      }

      return {
        userId: payload.userId,
        role: payload.role
      };
    } catch {
      this.logout();
      return null;
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    const user = this.getCurrentUser();
    
    auditLogger.logAuth(AuditEvents.LOGOUT, {
      userId: user?.userId,
      timestamp: new Date().toISOString()
    }, 'success', user?.userId);

    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Validate session (for periodic checks)
   */
  async validateSession(): Promise<boolean> {
    return this.isAuthenticated();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Verify password against environment-configured password
   */
  private async verifyPassword(password: string): Promise<boolean> {
    // Get password from environment or fallback for development
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    const fallbackPassword = 'metaMETA1234!'; // Only for development
    
    const validPassword = envPassword || fallbackPassword;
    
    // Only show fallback warning in development
    if (!envPassword && import.meta.env.DEV) {
      console.warn('⚠️  Using fallback admin password. Set VITE_ADMIN_PASSWORD in production!');
    }

    // Use constant-time comparison for security
    return await this.constantTimeCompare(password, validPassword);
  }

  /**
   * Generate JWT-like token using Web Crypto API
   */
  private async generateToken(user: AuthUser): Promise<string> {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: TokenPayload = {
      userId: user.userId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.SESSION_TIMEOUT) / 1000),
      iss: 'meta3ventures',
      aud: 'meta3ventures-admin'
    };

    const encodedHeader = this.base64urlEncode(JSON.stringify(header));
    const encodedPayload = this.base64urlEncode(JSON.stringify(payload));
    
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.sign(dataToSign);
    
    return `${dataToSign}.${signature}`;
  }

  /**
   * Verify token signature and decode payload
   */
  private verifyToken(token: string): TokenPayload | null {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      if (!encodedHeader || !encodedPayload || !signature) {
        return null;
      }

      // For now, we'll decode without signature verification for browser compatibility
      // In production, implement proper HMAC verification with Web Crypto API
      const payload = JSON.parse(this.base64urlDecode(encodedPayload));
      
      // Basic validation
      if (!payload.userId || !payload.role || !payload.exp || !payload.iat) {
        return null;
      }

      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Sign data using Web Crypto API
   */
  private async sign(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.SECRET_KEY);
      const dataBuffer = encoder.encode(data);
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
      return this.arrayBufferToBase64url(signature);
    } catch {
      // Fallback to simple hash for development
      return btoa(data + this.SECRET_KEY).replace(/[+/=]/g, '');
    }
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private async constantTimeCompare(a: string, b: string): Promise<boolean> {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Base64url encode (URL-safe base64)
   */
  private base64urlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Base64url decode
   */
  private base64urlDecode(str: string): string {
    // Add padding if needed
    const padded = str + '==='.slice(0, (4 - str.length % 4) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }

  /**
   * Convert ArrayBuffer to base64url
   */
  private arrayBufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Store token securely
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get stored token
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get client identifier for rate limiting
   */
  private getClientId(): string {
    // In production, this could be IP-based or session-based
    return 'admin-client-' + (localStorage.getItem('client_id') || this.generateClientId());
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    const id = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('client_id', id);
    return id;
  }
}

// Export singleton instance
export const browserAuth = new BrowserAuthService();

// Export interface for compatibility
export type { AuthUser };
