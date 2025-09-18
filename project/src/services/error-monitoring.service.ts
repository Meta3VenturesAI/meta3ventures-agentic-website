/**
 * Error Monitoring and Logging Service
 * Handles error tracking, logging, and reporting for production
 */

interface ErrorContext {
  userId?: string;
  formId?: string;
  action?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  userAgent: string;
  url: string;
  environment: string;
}

class ErrorMonitoringService {
  private sentryDSN: string | null;
  private environment: string;
  private errorQueue: ErrorReport[] = [];
  private isInitialized = false;
  
  constructor() {
    this.sentryDSN = import.meta.env.VITE_SENTRY_DSN || null;
    this.environment = import.meta.env.VITE_APP_ENV || 'development';
  }

  /**
   * Initialize error monitoring (Sentry)
   */
  async initialize() {
    if (this.isInitialized || !this.sentryDSN) return;
    
    try {
      // Dynamic import for Sentry to reduce bundle size
      const Sentry = await import('@sentry/react');
      
      Sentry.init({
        dsn: this.sentryDSN,
        environment: this.environment,
        integrations: [],
        tracesSampleRate: this.environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend: (event, hint) => {
          // Filter out certain errors
          if (this.shouldIgnoreError(hint.originalException)) {
            return null;
          }
          return event;
        }
      });
      
      this.isInitialized = true;
      
      // Process queued errors
      this.processErrorQueue();
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Log error to monitoring service
   */
  logError(error: Error | string, context: ErrorContext = {}) {
    const errorReport: ErrorReport = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      environment: this.environment
    };

    // Log to console in development
    if (this.environment === 'development') {
      console.error('Error Report:', errorReport);
    }

    // Send to monitoring service
    if (this.isInitialized) {
      this.sendToSentry(errorReport);
    } else {
      // Queue error if not initialized
      this.errorQueue.push(errorReport);
    }

    // Also log to local storage for debugging
    this.logToLocalStorage(errorReport);
    
    // Send to backend if critical
    if (context.severity === 'critical') {
      this.sendToBackend(errorReport);
    }
  }

  /**
   * Track form submission errors
   */
  logFormError(formId: string, error: Error | string, formData?: Record<string, any>) {
    this.logError(error, {
      formId,
      action: 'form_submission',
      metadata: {
        formData: this.sanitizeFormData(formData)
      },
      severity: 'high'
    });
  }

  /**
   * Track API errors
   */
  logApiError(endpoint: string, error: Error | string, statusCode?: number) {
    this.logError(error, {
      action: 'api_call',
      metadata: {
        endpoint,
        statusCode
      },
      severity: statusCode && statusCode >= 500 ? 'critical' : 'medium'
    });
  }

  /**
   * Track performance issues
   */
  logPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      this.logError(`Performance threshold exceeded: ${metric}`, {
        action: 'performance',
        metadata: {
          metric,
          value,
          threshold
        },
        severity: 'low'
      });
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, email?: string, additionalContext?: Record<string, any>) {
    if (this.isInitialized) {
      import('@sentry/react').then(Sentry => {
        Sentry.setUser({
          id: userId,
          email,
          ...additionalContext
        });
      });
    }
  }

  /**
   * Clear user context (on logout)
   */
  clearUserContext() {
    if (this.isInitialized) {
      import('@sentry/react').then(Sentry => {
        Sentry.setUser(null);
      });
    }
  }

  /**
   * Private methods
   */
  
  private async sendToSentry(errorReport: ErrorReport) {
    try {
      const Sentry = await import('@sentry/react');
      
      Sentry.withScope(scope => {
        // Set context with proper type
        scope.setContext('error_details', errorReport.context as any);
        scope.setLevel(this.mapSeverityToSentryLevel(errorReport.context.severity as any) as any);
        
        // Set tags
        scope.setTag('form_id', errorReport.context.formId || 'unknown');
        scope.setTag('action', errorReport.context.action || 'unknown');
        
        // Capture exception or message
        if (errorReport.stack) {
          Sentry.captureException(new Error(errorReport.message));
        } else {
          Sentry.captureMessage(errorReport.message);
        }
      });
    } catch (error) {
      console.error('Failed to send error to Sentry:', error);
    }
  }

  private mapSeverityToSentryLevel(severity?: string) {
    switch (severity) {
      case 'critical': return 'fatal';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'error';
    }
  }

  private shouldIgnoreError(error: unknown): boolean {
    if (!error) return true;
    
    const ignoredMessages = [
      'Network request failed',
      'Failed to fetch',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured'
    ];
    
    const errorMessage = (error as any).message || error.toString();
    return ignoredMessages.some(msg => errorMessage.includes(msg));
  }

  private processErrorQueue() {
    while (this.errorQueue.length > 0) {
      const errorReport = this.errorQueue.shift();
      if (errorReport) {
        this.sendToSentry(errorReport);
      }
    }
  }

  private sanitizeFormData(data?: Record<string, any>): Record<string, any> {
    if (!data) return {};
    
    const sensitiveFields = ['password', 'email', 'phone', 'ssn', 'creditCard'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private logToLocalStorage(errorReport: ErrorReport) {
    try {
      const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errors.push(errorReport);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(errors));
    } catch (error) {
      console.error('Failed to log error to localStorage:', error);
    }
  }

  private async sendToBackend(errorReport: ErrorReport) {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      });
      
      if (!response.ok) {
        console.error('Failed to send error to backend:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to send error to backend:', error);
    }
  }

  /**
   * Get error logs from localStorage
   */
  getLocalErrorLogs(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear local error logs
   */
  clearLocalErrorLogs() {
    localStorage.removeItem('error_logs');
  }
}

// Export singleton instance
export const errorMonitoring = new ErrorMonitoringService();

// Initialize on app start
if (typeof window !== 'undefined') {
  errorMonitoring.initialize();
  
  // Global error handler
  window.addEventListener('error', (event) => {
    errorMonitoring.logError(event.error || event.message, {
      action: 'uncaught_error',
      severity: 'high'
    });
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    errorMonitoring.logError(`Unhandled promise rejection: ${event.reason}`, {
      action: 'unhandled_rejection',
      severity: 'high'
    });
  });
}