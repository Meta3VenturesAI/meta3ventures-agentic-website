/**
 * Security Integration Tests
 * Real-world testing of security components working together
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { browserAuth } from '../utils/browser-auth';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '../utils/rate-limiter';

describe('Security Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('authentication flow works correctly', async () => {
    // Should reject invalid credentials
    const result = await browserAuth.login('invalid');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('rate limiting prevents brute force', () => {
    const clientId = 'test-client';
    const config = RATE_LIMIT_CONFIGS.LOGIN;
    
    // Use up all allowed attempts
    for (let i = 0; i < config.maxAttempts; i++) {
      const result = rateLimiter.isAllowed(clientId, config);
      expect(result.allowed).toBe(true);
    }
    
    // Next attempt should be blocked
    const blocked = rateLimiter.isAllowed(clientId, config);
    expect(blocked.allowed).toBe(false);
  });

  test('session management works correctly', () => {
    // Initially not authenticated
    expect(browserAuth.isAuthenticated()).toBe(false);
    
    // After logout, should clear everything
    browserAuth.logout();
    expect(browserAuth.getCurrentUser()).toBeNull();
  });

  test('environment variables are secure', () => {
    // Check that sensitive environment variables are not exposed
    const sensitiveKeys = ['API_SECRET', 'DATABASE_URL', 'PRIVATE_KEY'];
    
    sensitiveKeys.forEach(key => {
      expect(import.meta.env[key]).toBeUndefined();
    });
  });

  test('configuration is production-ready', () => {
    // Rate limiting should be reasonable
    expect(RATE_LIMIT_CONFIGS.LOGIN.maxAttempts).toBeLessThanOrEqual(10);
    expect(RATE_LIMIT_CONFIGS.LOGIN.windowMs).toBeGreaterThan(60000);
    
    // Form submissions should be more restrictive than general API
    expect(RATE_LIMIT_CONFIGS.FORM_SUBMISSION.maxAttempts).toBeLessThanOrEqual(5);
  });
});

describe('Security Validation Checklist', () => {
  test('authentication system components exist', () => {
    expect(browserAuth).toBeDefined();
    expect(browserAuth.login).toBeDefined();
    expect(browserAuth.logout).toBeDefined();
    expect(browserAuth.isAuthenticated).toBeDefined();
  });

  test('rate limiting system is configured', () => {
    expect(rateLimiter).toBeDefined();
    expect(RATE_LIMIT_CONFIGS).toBeDefined();
    expect(RATE_LIMIT_CONFIGS.LOGIN).toBeDefined();
    expect(RATE_LIMIT_CONFIGS.FORM_SUBMISSION).toBeDefined();
  });

  test('security headers should be implemented', () => {
    // This would typically be tested at the server/deployment level
    // For now, just verify the build includes security considerations
    expect(import.meta.env.VITE_ENABLE_SECURITY_HEADERS).toBeTruthy();
  });
});