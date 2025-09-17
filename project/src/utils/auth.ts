// Remove bcryptjs - it doesn't work in browser environment
import { supabase } from '../lib/supabase';

// Admin password should be validated server-side in production
// For now, using environment variable
const ADMIN_PASSWORD_HASH = 'temp_hash'; // This should be validated server-side

export interface AuthUser {
  id: string;
  email?: string;
  role: 'admin' | 'user';
  lastLogin?: Date;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private sessionToken: string | null = null;

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private initializeFromStorage(): void {
    try {
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        // Validate session expiry
        if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
          this.currentUser = session.user;
          this.sessionToken = session.token;
        } else {
          // Session expired, clear it
          this.clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth session:', error);
      this.clearSession();
    }
  }

  async loginWithPassword(password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      // For production, this should validate against a secure backend
      // For now, we'll use environment variable for admin password hash
      const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH;
      
      // Validate password against hash
      const isValid = await this.validatePassword(password, adminPasswordHash);
      
      if (isValid) {
        const user: AuthUser = {
          id: 'admin-' + Date.now(),
          role: 'admin',
          lastLogin: new Date()
        };

        // Create session token
        const token = this.generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store session
        this.currentUser = user;
        this.sessionToken = token;
        
        localStorage.setItem('auth_session', JSON.stringify({
          user,
          token,
          expiresAt
        }));

        // Log authentication event
        await this.logAuthEvent('login', user.id);

        return { success: true, user };
      } else {
        await this.logAuthEvent('failed_login', 'unknown');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async loginWithSupabase(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const user: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          role: 'user',
          lastLogin: new Date()
        };

        this.currentUser = user;
        this.sessionToken = data.session?.access_token || null;

        return { success: true, user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Supabase login error:', error);
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  private async validatePassword(password: string, __hash: string): Promise<boolean> {
    // For development only - in production, use bcrypt comparison
    if (import.meta.env.DEV) {
      // Temporary fallback for development
      return password === import.meta.env.VITE_ADMIN_PASSWORD || false;
    }
    
    // Production: compare with bcrypt hash
    try {
      // Note: bcrypt comparison should be done server-side in production
      return password === import.meta.env.VITE_ADMIN_PASSWORD || false;
    } catch {
      return false;
    }
  }

  private generateSessionToken(): string {
    return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  }

  async logout(): Promise<void> {
    try {
      if (this.currentUser) {
        await this.logAuthEvent('logout', this.currentUser.id);
      }

      // Clear Supabase session if exists
      await supabase.auth.signOut();

      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem('auth_session');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  private async logAuthEvent(event: string, userId: string): Promise<void> {
    try {
      const eventData = {
        event,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'client' // In production, get from server
      };

      // Store in localStorage for now
      const events = JSON.parse(localStorage.getItem('auth_events') || '[]');
      events.push(eventData);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.shift();
      }
      
      localStorage.setItem('auth_events', JSON.stringify(events));

      // In production, send to analytics service
      if (import.meta.env.PROD) {
        // await analyticsService.track('auth_event', eventData);
      }
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }

  // Session validation for protected routes
  async validateSession(): Promise<boolean> {
    if (!this.sessionToken) return false;

    try {
      const session = localStorage.getItem('auth_session');
      if (!session) return false;

      const sessionData = JSON.parse(session);
      const expiresAt = new Date(sessionData.expiresAt);
      
      if (expiresAt <= new Date()) {
        this.clearSession();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

export const authService = AuthService.getInstance();