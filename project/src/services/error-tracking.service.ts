import * as Sentry from '@sentry/react';

interface ErrorContext {
  user?: { id: string; email?: string };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private initialized = false;
  private errorQueue: Array<{ error: Error; context?: ErrorContext }> = [];

  private constructor() {}

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  initialize(): void {
    if (this.initialized) return;

    const dsn = import.meta.env.VITE_SENTRY_DSN || '';
    const environment = import.meta.env.VITE_APP_ENV || 'development';
    const isProduction = environment === 'production';

    // Only initialize Sentry if DSN is provided
    if (dsn && dsn.length > 0 && isProduction) {
      try {
        Sentry.init({
          dsn,
          environment,
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ],
          tracesSampleRate: isProduction ? 0.1 : 1.0,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          beforeSend(event, hint) {
            // Filter out certain errors
            if (event.exception) {
              const error = hint.originalException;
              
              // Don't send network errors in development
              if (!isProduction && error instanceof TypeError && error.message.includes('fetch')) {
                return null;
              }
              
              // Filter out browser extension errors
              if (error instanceof Error && error.message?.includes('extension://')) {
                return null;
              }
            }
            
            // Remove sensitive data
            if (event.request?.cookies) {
              delete event.request.cookies;
            }
            
            return event;
          },
        });

        this.initialized = true;
        console.log('Error tracking initialized');

        // Process any queued errors
        this.processErrorQueue();
      } catch (error) {
        console.error('Failed to initialize error tracking:', error);
      }
    } else if (!isProduction) {
      // In development, just log errors
      this.initialized = true;
      console.log('Error tracking in development mode');
    }
  }

  private processErrorQueue(): void {
    while (this.errorQueue.length > 0) {
      const { error, context } = this.errorQueue.shift()!;
      this.captureException(error, context);
    }
  }

  captureException(error: Error | unknown, context?: ErrorContext): void {
    // Convert unknown errors to Error objects
    const errorObj = error instanceof Error ? error : new Error(String(error));

    if (!this.initialized) {
      // Queue the error if not initialized yet
      this.errorQueue.push({ error: errorObj, context });
      return;
    }

    if (import.meta.env.VITE_APP_ENV === 'production') {
      // Set user context if provided
      if (context?.user) {
        Sentry.setUser(context.user);
      }

      // Set tags if provided
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          Sentry.setTag(key, value);
        });
      }

      // Set extra context if provided
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          Sentry.setExtra(key, value);
        });
      }

      // Capture the exception
      Sentry.captureException(errorObj, {
        level: context?.level || 'error',
      });
    } else {
      // In development, log to console with formatting
      console.group(`🚨 Error Captured (${context?.level || 'error'})`);
      console.error(errorObj);
      if (context) {
        console.log('Context:', context);
      }
      console.groupEnd();
    }

    // Also log to local storage for debugging
    this.logErrorLocally(errorObj, context);
  }

  captureMessage(message: string, context?: ErrorContext): void {
    if (import.meta.env.VITE_APP_ENV === 'production') {
      Sentry.captureMessage(message, context?.level || 'info');
    } else {
      console.log(`📝 Message: ${message}`, context);
    }
  }

  private logErrorLocally(error: Error, context?: ErrorContext): void {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const storedErrors = localStorage.getItem('app_errors');
      const errors = storedErrors ? JSON.parse(storedErrors) : [];
      errors.push(errorLog);

      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }

      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (e) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to log error locally:', e);
    }
  }

  setUserContext(user: { id: string; email?: string; username?: string }): void {
    if (this.initialized && import.meta.env.VITE_APP_ENV === 'production') {
      Sentry.setUser(user);
    }
  }

  clearUserContext(): void {
    if (this.initialized && import.meta.env.VITE_APP_ENV === 'production') {
      Sentry.setUser(null);
    }
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }): void {
    if (this.initialized && import.meta.env.VITE_APP_ENV === 'production') {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category || 'custom',
        level: breadcrumb.level || 'info',
        data: breadcrumb.data,
        timestamp: Date.now() / 1000,
      });
    }
  }

  startTransaction(name: string, op: string = 'navigation'): unknown {
    if (this.initialized && import.meta.env.VITE_APP_ENV === 'production') {
      // Transaction API changed in newer Sentry versions
      return Sentry.startSpan({ name, op }, () => {});
    }
    return null;
  }

  // Helper method for async error handling
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.captureException(error, context);
      return undefined;
    }
  }

  // Get local error logs for debugging
  getLocalErrorLogs(): unknown[] {
    try {
      const storedErrors = localStorage.getItem('app_errors');
      return storedErrors ? JSON.parse(storedErrors) : [];
    } catch {
      return [];
    }
  }

  // Clear local error logs
  clearLocalErrorLogs(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch {
      // Silently fail
    }
  }
}

export const errorTracking = ErrorTrackingService.getInstance();

// Export Sentry for direct use where needed
export { Sentry };