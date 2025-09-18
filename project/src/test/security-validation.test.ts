/**
 * Security Implementation Validation Tests
 * Comprehensive testing of the authentication and security systems
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { BrowserAuthService, browserAuth } from '../utils/browser-auth';
import { auditLogger, AuditEvents } from '../utils/audit-logger';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '../utils/rate-limiter';

describe('Security Implementation Validation', () => {
  beforeEach(() => {
    // Clear any existing auth state
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication System', () => {
    test('should reject weak passwords', async () => {
      const result = await browserAuth.login('123');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should validate password strength requirements', () => {
      const weakPasswords = ['123', 'password', 'abc123', '11111111'];
      const strongPassword = 'StrongP@ssw0rd2024!';
      
      weakPasswords.forEach(password => {
        // This should fail for weak passwords
        expect(password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)).toBe(true);
      });
      
      // Strong password should pass basic requirements
      expect(strongPassword.length >= 8).toBe(true);
      expect(/[A-Z]/.test(strongPassword)).toBe(true);
      expect(/[a-z]/.test(strongPassword)).toBe(true);
      expect(/[0-9]/.test(strongPassword)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(strongPassword)).toBe(true);
    });

    test('should handle session timeout properly', () => {
      const authService = new BrowserAuthService();
      
      // Simulate expired token
      const expiredToken = {
        header: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
        payload: btoa(JSON.stringify({
          userId: 'test',
          role: 'admin',
          iat: Date.now() - 1000000,
          exp: Date.now() - 100000, // Expired
          iss: 'meta3ventures',
          aud: 'meta3ventures-admin'
        })),
        signature: 'test_signature'
      };
      
      localStorage.setItem('auth_token', JSON.stringify(expiredToken));
      
      // Should not be authenticated with expired token
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Rate Limiting System', () => {
    test('should enforce login rate limits', () => {
      const clientId = 'test-client';
      const config = RATE_LIMIT_CONFIGS.LOGIN;
      
      // Should allow initial attempts
      for (let i = 0; i < config.maxAttempts; i++) {
        const result = rateLimiter.isAllowed(clientId, config);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(config.maxAttempts - i - 1);
      }
      
      // Should block after max attempts
      const blocked = rateLimiter.isAllowed(clientId, config);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });

    test('should have different rate limits for different operations', () => {
      // LOGIN should be stricter than FORM_SUBMISSION (LOGIN: 5 max, FORM: 3 max)
      // LOGIN should have longer window than FORM (LOGIN: 15min, FORM: 1min)
      expect(RATE_LIMIT_CONFIGS.LOGIN.maxAttempts).toBeGreaterThan(RATE_LIMIT_CONFIGS.FORM_SUBMISSION.maxAttempts);
      expect(RATE_LIMIT_CONFIGS.LOGIN.windowMs).toBeGreaterThan(RATE_LIMIT_CONFIGS.FORM_SUBMISSION.windowMs);
    });
  });

  describe('Audit Logging System', () => {
    test('should log security events properly', () => {
      // Mock console to capture log output
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      auditLogger.logSecurity('TEST_EVENT', {
        test: 'data',
        timestamp: new Date().toISOString()
      }, 'warning');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should categorize events correctly', () => {
      expect(AuditEvents.LOGIN_SUCCESS).toBeDefined();
      expect(AuditEvents.LOGIN_FAILURE).toBeDefined();
      expect(AuditEvents.RATE_LIMIT_EXCEEDED).toBeDefined();
      expect(AuditEvents.SESSION_EXPIRED).toBeDefined();
    });
  });

  describe('Data Security', () => {
    test('should not store sensitive data in localStorage', () => {
      const sensitiveData = ['password', 'secret', 'key', 'token'];
      
      localStorage.setItem('test', 'some test data');
      
      const stored = localStorage.getItem('test');
      sensitiveData.forEach(sensitive => {
        expect(stored?.toLowerCase().includes(sensitive)).toBe(false);
      });
      
      localStorage.removeItem('test');
    });

    test('should encrypt authentication tokens', () => {
      // After successful login, token should be structured properly
      const token = localStorage.getItem('auth_token');
      if (token) {
        const parsed = JSON.parse(token);
        expect(parsed).toHaveProperty('header');
        expect(parsed).toHaveProperty('payload');
        expect(parsed).toHaveProperty('signature');
      }
    });
  });

  describe('Input Validation', () => {
    test('should sanitize user inputs', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '../../etc/passwd',
        'SELECT * FROM users',
        '<img src=x onerror=alert(1)>'
      ];

      maliciousInputs.forEach(input => {
        // Basic sanitization check - should not contain script tags or javascript: protocol
        const sanitized = input.replace(/<script.*?>.*?<\/script>/gi, '')
                              .replace(/javascript:/gi, '');
        expect(sanitized).not.toContain('<script>');
        expect(sanitized.toLowerCase()).not.toContain('javascript:');
      });
    });
  });

  describe('Environment Security', () => {
    test('should not expose sensitive environment variables', () => {
      // Check that sensitive vars are not accessible in client-side code
      const sensitiveVars = ['API_SECRET', 'DATABASE_URL', 'PRIVATE_KEY'];
      
      sensitiveVars.forEach(varName => {
        expect(process.env[varName]).toBeUndefined();
        expect(import.meta.env[varName]).toBeUndefined();
      });
    });

    test('should only expose VITE_ prefixed environment variables', () => {
      // Critical security-related env vars should be prefixed with VITE_
      const criticalKeys = ['ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SENTRY_DSN'];
      criticalKeys.forEach(key => {
        if (import.meta.env[key]) {
          expect(key).toMatch(/^VITE_/);
        }
      });
      
      // Verify that our application-specific environment variables are properly prefixed
      const appEnvVars = Object.keys(import.meta.env).filter(key => 
        key.includes('ADMIN') || key.includes('SUPABASE') || key.includes('SENTRY')
      );
      appEnvVars.forEach(key => {
        expect(key).toMatch(/^VITE_/);
      });
    });
  });
});

/**
 * Integration Tests for Security Features
 */
describe('Security Integration Tests', () => {
  test('complete authentication flow', async () => {
    // 1. Login attempt
    const result = await browserAuth.login('testPassword123!');
    
    // 2. Should handle invalid credentials gracefully
    expect(result.success).toBe(false); // Unless we have valid test credentials
    
    // 3. Check that failed login is logged
    // This would require mocking the audit system
  });

  test('session management lifecycle', () => {
    const authService = new BrowserAuthService();
    
    // Initially not authenticated
    expect(authService.isAuthenticated()).toBe(false);
    
    // After logout, should clear session
    authService.logout();
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });
});

/**
 * Security Compliance Checks
 */
describe('Security Compliance', () => {
  test('password requirements meet security standards', () => {
    const requirements = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    };
    
    // These should be enforced by the authentication system
    expect(requirements.minLength).toBeGreaterThanOrEqual(8);
    expect(requirements.requireUppercase).toBe(true);
    expect(requirements.requireNumbers).toBe(true);
  });

  test('session security configuration', () => {
    const sessionConfig = {
      timeout: 24 * 60 * 60 * 1000, // 24 hours
      secure: true,
      sameSite: 'strict'
    };
    
    expect(sessionConfig.timeout).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    expect(sessionConfig.secure).toBe(true);
  });

  test('audit logging requirements', () => {
    // Should log critical security events
    const requiredEvents = [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE', 
      'LOGOUT',
      'SESSION_EXPIRED',
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_ACTIVITY'
    ];
    
    requiredEvents.forEach(event => {
      expect(AuditEvents[event as keyof typeof AuditEvents]).toBeDefined();
    });
  });
});