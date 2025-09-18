/**
 * Advanced Security Utilities
 * Enhanced security features for admin protection
 */

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  passwordMinLength: number;
  requireSpecialChars: boolean;
  enableCSRF: boolean;
  enableRateLimit: boolean;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig = {
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 480, // 8 hours
    passwordMinLength: 12,
    requireSpecialChars: true,
    enableCSRF: true,
    enableRateLimit: true
  };

  private loginAttempts: Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }> = new Map();
  private rateLimit: Map<string, { count: number; resetTime: number }> = new Map();

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Enhanced password validation
  validatePassword(password: string): { isValid: boolean; errors: string[]; strength: number } {
    const errors: string[] = [];
    let strength = 0;

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors, strength: 0 };
    }

    // Length check
    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters long`);
    } else {
      strength += 1;
    }

    // Character variety checks
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      strength += 1;
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      strength += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      strength += 1;
    }

    if (this.config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (this.config.requireSpecialChars) {
      strength += 1;
    }

    // Common password check
    const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a more secure password');
    } else {
      strength += 1;
    }

    // Entropy check
    const entropy = this.calculateEntropy(password);
    if (entropy < 3) {
      errors.push('Password is not complex enough');
    } else {
      strength += 1;
    }

    return { 
      isValid: errors.length === 0, 
      errors, 
      strength: Math.min(strength, 10) 
    };
  }

  // Check login attempts and lockout
  checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntil?: Date } {
    const attempts = this.loginAttempts.get(identifier);
    
    if (!attempts) {
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }

    // Check if still locked
    if (attempts.lockedUntil && new Date() < attempts.lockedUntil) {
      return { 
        allowed: false, 
        remainingAttempts: 0, 
        lockedUntil: attempts.lockedUntil 
      };
    }

    // Reset if lockout period has passed
    if (attempts.lockedUntil && new Date() >= attempts.lockedUntil) {
      this.loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }

    const remaining = this.config.maxLoginAttempts - attempts.count;
    return { 
      allowed: remaining > 0, 
      remainingAttempts: Math.max(0, remaining) 
    };
  }

  // Record failed login attempt
  recordFailedLogin(identifier: string): void {
    const attempts = this.loginAttempts.get(identifier) || { count: 0, lastAttempt: new Date() };
    attempts.count += 1;
    attempts.lastAttempt = new Date();

    // Lock account if max attempts reached
    if (attempts.count >= this.config.maxLoginAttempts) {
      attempts.lockedUntil = new Date(Date.now() + this.config.lockoutDuration * 60 * 1000);
    }

    this.loginAttempts.set(identifier, attempts);
  }

  // Reset login attempts on successful login
  resetLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  // Rate limiting
  checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    if (!this.config.enableRateLimit) return true;

    const now = Date.now();
    const rateLimitData = this.rateLimit.get(identifier);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      this.rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (rateLimitData.count >= limit) {
      return false;
    }

    rateLimitData.count += 1;
    this.rateLimit.set(identifier, rateLimitData);
    return true;
  }

  // Generate CSRF token
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  validateCSRFToken(token: string, storedToken: string): boolean {
    if (!this.config.enableCSRF) return true;
    return token === storedToken && token.length === 64;
  }

  // Generate secure session ID
  generateSecureSessionId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Sanitize input
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate admin access
  validateAdminAccess(user: any): boolean {
    if (!user) return false;
    
    // Check user role
    const allowedRoles = ['admin', 'super_admin', 'root'];
    if (!allowedRoles.includes(user.role)) return false;

    // Check if user is active
    if (user.status && user.status !== 'active') return false;

    // Check if user has admin permissions
    if (user.permissions && !user.permissions.includes('admin_access')) return false;

    return true;
  }

  // Security headers
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Audit logging
  logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      ip: 'unknown' // Would be set by server
    };

    console.log(`[SECURITY-${severity.toUpperCase()}]`, logEntry);
    
    // Store in localStorage for debugging
    if (typeof window !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(logs));
    }
  }

  // Private helper methods
  private calculateEntropy(password: string): number {
    const charCounts: Record<string, number> = {};
    for (const char of password) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    let entropy = 0;
    const length = password.length;
    
    for (const count of Object.values(charCounts)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();
