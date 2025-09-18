import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../utils/auth';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
    
    // Set up environment variables
    process.env.VITE_ADMIN_PASSWORD = 'test-password';
    process.env.VITE_ADMIN_PASSWORD_HASH = '';
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should successfully authenticate with valid password', async () => {
      const result = await authService.loginWithPassword('test-password');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.role).toBe('admin');
    });

    it('should fail authentication with invalid password', async () => {
      const result = await authService.loginWithPassword('wrong-password');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.user).toBeUndefined();
    });

    it('should maintain session after successful login', async () => {
      await authService.loginWithPassword('test-password');
      
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toBeDefined();
    });

    it('should clear session on logout', async () => {
      await authService.loginWithPassword('test-password');
      expect(authService.isAuthenticated()).toBe(true);
      
      await authService.logout();
      
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should validate active session', async () => {
      await authService.loginWithPassword('test-password');
      
      const isValid = await authService.validateSession();
      expect(isValid).toBe(true);
    });

    it('should invalidate expired session', async () => {
      // Create expired session
      const expiredSession = {
        user: { id: 'test', role: 'admin' },
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };
      
      localStorage.setItem('auth_session', JSON.stringify(expiredSession));
      
      const isValid = await authService.validateSession();
      expect(isValid).toBe(false);
    });
  });

  describe('Role Management', () => {
    it('should correctly identify admin role', async () => {
      await authService.loginWithPassword('test-password');
      
      expect(authService.isAdmin()).toBe(true);
    });

    it('should correctly identify non-admin role', async () => {
      // Clear any existing session
      await authService.logout();
      
      // Test with no user logged in
      expect(authService.isAdmin()).toBe(false);
      
      // Test with a non-admin user (simulate by setting currentUser directly)
      const nonAdminUser = {
        id: 'user-123',
        role: 'user' as const,
        lastLogin: new Date()
      };
      
      // Manually set a non-admin user for testing
      (authService as any).currentUser = nonAdminUser;
      expect(authService.isAdmin()).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not expose password in stored session', async () => {
      const result = await authService.loginWithPassword('test-password');
      expect(result.success).toBe(true);
      
      const storedSession = localStorage.getItem('auth_session');
      expect(storedSession).toBeDefined();
      expect(storedSession).not.toContain('test-password');
    });

    it('should generate unique session tokens', async () => {
      const result1 = await authService.loginWithPassword('test-password');
      await authService.logout();
      const result2 = await authService.loginWithPassword('test-password');
      
      // Session IDs should be different
      expect(result1.user?.id).not.toBe(result2.user?.id);
    });

    it('should log authentication events', async () => {
      await authService.loginWithPassword('test-password');
      
      const events = JSON.parse(localStorage.getItem('auth_events') || '[]');
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].event).toBe('login');
    });
  });
});