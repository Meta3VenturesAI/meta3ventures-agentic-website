/**
 * Audit Logging Service
 * Comprehensive logging for security, compliance, and monitoring
 */

interface AuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  action: string;
  category: 'auth' | 'admin' | 'form' | 'llm' | 'system' | 'security';
  severity: 'info' | 'warning' | 'error' | 'critical';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  url?: string;
  outcome: 'success' | 'failure' | 'blocked';
}

interface AuditConfig {
  maxLocalEvents: number;
  flushInterval: number;
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
}

export class AuditLogger {
  private events: AuditEvent[] = [];
  private config: AuditConfig;
  private sessionId: string;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      maxLocalEvents: 1000,
      flushInterval: 60000, // 1 minute
      enableConsoleLogging: import.meta.env.DEV,
      enableRemoteLogging: import.meta.env.PROD,
      remoteEndpoint: import.meta.env.VITE_AUDIT_ENDPOINT,
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
    this.logSystemStart();
  }

  /**
   * Log authentication events
   */
  logAuth(action: string, details: Record<string, any>, outcome: 'success' | 'failure' | 'blocked', userId?: string): void {
    this.log({
      action,
      category: 'auth',
      severity: outcome === 'success' ? 'info' : 'warning',
      details,
      outcome,
      userId
    });
  }

  /**
   * Log admin panel actions
   */
  logAdmin(action: string, details: Record<string, any>, userId?: string): void {
    this.log({
      action,
      category: 'admin',
      severity: 'info',
      details,
      outcome: 'success',
      userId
    });
  }

  /**
   * Log form submissions
   */
  logFormSubmission(formType: string, details: Record<string, any>, outcome: 'success' | 'failure' = 'success'): void {
    this.log({
      action: 'form_submission',
      category: 'form',
      severity: outcome === 'success' ? 'info' : 'warning',
      details: { formType, ...details },
      outcome
    });
  }

  /**
   * Log LLM interactions
   */
  logLLMInteraction(provider: string, model: string, details: Record<string, any>, outcome: 'success' | 'failure' = 'success'): void {
    this.log({
      action: 'llm_request',
      category: 'llm',
      severity: outcome === 'success' ? 'info' : 'warning',
      details: { provider, model, ...details },
      outcome
    });
  }

  /**
   * Log security events
   */
  logSecurity(action: string, details: Record<string, any>, severity: 'warning' | 'error' | 'critical' = 'warning'): void {
    this.log({
      action,
      category: 'security',
      severity,
      details,
      outcome: 'blocked'
    });
  }

  /**
   * Log system events
   */
  logSystem(action: string, details: Record<string, any>, severity: 'info' | 'warning' | 'error' = 'info'): void {
    this.log({
      action,
      category: 'system',
      severity,
      details,
      outcome: 'success'
    });
  }

  /**
   * Core logging method
   */
  private log(eventData: Partial<AuditEvent>): void {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ipAddress: this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...eventData
    } as AuditEvent;

    // Store event
    this.events.push(event);

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(event);
    }

    // Manage memory
    if (this.events.length > this.config.maxLocalEvents) {
      this.events = this.events.slice(-this.config.maxLocalEvents);
    }

    // Store critical events immediately
    if (event.severity === 'critical' || event.category === 'security') {
      this.flushEvents();
    }
  }

  /**
   * Get recent events for admin dashboard
   */
  getRecentEvents(limit: number = 100, category?: string): AuditEvent[] {
    let events = [...this.events];
    
    if (category) {
      events = events.filter(e => e.category === category);
    }

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get events by user
   */
  getUserEvents(userId: string, limit: number = 50): AuditEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get security events
   */
  getSecurityEvents(limit: number = 100): AuditEvent[] {
    return this.events
      .filter(e => e.category === 'security' || e.severity === 'critical')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Export events for compliance
   */
  exportEvents(startDate?: Date, endDate?: Date): AuditEvent[] {
    let events = [...this.events];

    if (startDate) {
      events = events.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (endDate) {
      events = events.filter(e => new Date(e.timestamp) <= endDate);
    }

    return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Flush events to remote endpoint
   */
  private async flushEvents(): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint || this.events.length === 0) {
      return;
    }

    try {
      const eventsToFlush = [...this.events];
      
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          events: eventsToFlush,
          timestamp: new Date().toISOString(),
          source: 'meta3ventures-frontend'
        })
      });

      if (response.ok) {
        // Clear flushed events
        this.events = [];
      } else {
        console.warn('Failed to flush audit events:', response.status);
      }
    } catch (error) {
      console.warn('Audit log flush error:', error);
    }
  }

  private logToConsole(event: AuditEvent): void {
    const emoji = {
      auth: '🔐',
      admin: '⚙️',
      form: '📝',
      llm: '🤖',
      system: '💻',
      security: '🚨'
    }[event.category] || '📋';

    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[event.severity];

    const message = `${emoji} ${severityEmoji} [${event.category.toUpperCase()}] ${event.action}`;
    
    if (event.severity === 'critical' || event.severity === 'error') {
      console.error(message, event.details);
    } else if (event.severity === 'warning') {
      console.warn(message, event.details);
    } else {
      console.log(message, event.details);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string | undefined {
    // In production, this would be set by the server
    // For now, we'll use a placeholder
    return 'client-ip-unknown';
  }

  private startPeriodicFlush(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.flushEvents();
      }, this.config.flushInterval);
    }
  }

  private logSystemStart(): void {
    this.logSystem('application_start', {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Audit event helpers
export const AuditEvents = {
  // Authentication
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  SESSION_EXPIRED: 'session_expired',
  
  // Admin actions
  ADMIN_ACCESS: 'admin_dashboard_access',
  ADMIN_CONFIG_CHANGE: 'admin_configuration_change',
  ADMIN_USER_ACTION: 'admin_user_action',
  
  // Security
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_TOKEN: 'invalid_token_used',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity_detected',
  
  // Forms
  FORM_SUBMIT: 'form_submission',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  
  // LLM
  LLM_REQUEST: 'llm_request_made',
  LLM_ERROR: 'llm_request_error',
  
  // System
  ERROR_OCCURRED: 'application_error',
  PERFORMANCE_ISSUE: 'performance_issue_detected'
};
