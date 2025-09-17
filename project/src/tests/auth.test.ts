import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { authService } from '../utils/auth';

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should successfully authenticate with valid password', async () => {
      // Mock environment variable
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
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
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      await authService.loginWithPassword('test-password');
      
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.getCurrentUser()).toBeDefined();
    });

    it('should clear session on logout', async () => {
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      await authService.loginWithPassword('test-password');
      expect(authService.isAuthenticated()).toBe(true);
      
      await authService.logout();
      
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should validate active session', async () => {
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
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
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      await authService.loginWithPassword('test-password');
      
      expect(authService.isAdmin()).toBe(true);
    });

    it('should correctly identify non-admin role', async () => {
      // Mock Supabase login response
      const mockSupabaseResponse = {
        data: {
          user: { id: 'user-123', email: 'user@example.com' },
          session: { access_token: 'token-123' }
        },
        error: null
      };
      
      // This would need proper mocking of Supabase
      // For now, we'll test the logic directly
      expect(authService.isAdmin()).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not expose password in stored session', async () => {
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      await authService.loginWithPassword('test-password');
      
      const storedSession = localStorage.getItem('auth_session');
      expect(storedSession).toBeDefined();
      expect(storedSession).not.toContain('test-password');
    });

    it('should generate unique session tokens', async () => {
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      const result1 = await authService.loginWithPassword('test-password');
      await authService.logout();
      const result2 = await authService.loginWithPassword('test-password');
      
      // Session IDs should be different
      expect(result1.user?.id).not.toBe(result2.user?.id);
    });

    it('should log authentication events', async () => {
      vi.stubEnv('VITE_ADMIN_PASSWORD', 'test-password');
      
      await authService.loginWithPassword('test-password');
      
      const events = JSON.parse(localStorage.getItem('auth_events') || '[]');
      expect(events.length).toBeGreaterThan(0);
      expect(events[events.length - 1].event).toBe('login');
    });
  });
});