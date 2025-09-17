// Production error tracking and monitoring
interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
  environment: string;
}

class ErrorTracker {
  private sessionId: string;
  private userId?: string;
  private buildVersion: string;
  private environment: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.buildVersion = this.getBuildVersion();
    this.environment = import.meta.env.MODE;
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBuildVersion(): string {
    return (window as unknown).__APP_VERSION__ || 'unknown';
  }

  private setupGlobalErrorHandlers(): void {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion,
        environment: this.environment
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        buildVersion: this.buildVersion,
        environment: this.environment
      });
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public reportError(error: Partial<ErrorReport>): void {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: error.userAgent || navigator.userAgent,
      timestamp: error.timestamp || new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      buildVersion: this.buildVersion,
      environment: this.environment
    };

    // Only log errors in development
    if (this.environment === 'development') {
      console.error('Error tracked:', errorReport);
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    this.sendToErrorService(errorReport);
  }

  private async sendToErrorService(error: ErrorReport): Promise<void> {
    try {
      // In a real implementation, you would send to your error tracking service
      // For now, we'll store in localStorage for debugging
      const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errors.push(error);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error log:', e);
    }
  }

  public getStoredErrors(): ErrorReport[] {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredErrors(): void {
    localStorage.removeItem('errorLogs');
  }
}

export const errorTracker = new ErrorTracker();
export default errorTracker;