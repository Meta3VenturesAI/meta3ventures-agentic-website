/**
 * Enhanced Error Boundary Utilities
 * Provides comprehensive error handling and logging
 */

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  userAgent?: string;
  timestamp: Date;
  buildVersion?: string;
  environment: string;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  context: ErrorContext;
  errorInfo?: ErrorInfo;
}

/**
 * Enhanced error serialization for logging
 */
export const serializeError = (
  error: Error,
  errorInfo?: ErrorInfo,
  additionalContext?: Partial<ErrorContext>
): SerializedError => {
  const context: ErrorContext = {
    userId: additionalContext?.userId,
    sessionId: additionalContext?.sessionId,
    route: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    buildVersion: (window as unknown).__APP_VERSION__,
    environment: (window as unknown).__ENVIRONMENT__ || 'unknown',
    ...additionalContext
  };

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause: (error as unknown).cause,
    context,
    errorInfo
  };
};

/**
 * Error classification for better handling
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  EXTERNAL_SERVICE = 'external_service'
}

/**
 * Classify error based on type and message
 */
export const classifyError = (error: Error): { severity: ErrorSeverity; category: ErrorCategory } => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (message.includes('fetch') || message.includes('network') || name.includes('network')) {
    return { severity: ErrorSeverity.MEDIUM, category: ErrorCategory.NETWORK };
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('authentication') || message.includes('token')) {
    return { severity: ErrorSeverity.HIGH, category: ErrorCategory.AUTHENTICATION };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
    return { severity: ErrorSeverity.LOW, category: ErrorCategory.VALIDATION };
  }

  // Permission errors
  if (message.includes('permission') || message.includes('forbidden') || message.includes('access denied')) {
    return { severity: ErrorSeverity.HIGH, category: ErrorCategory.PERMISSION };
  }

  // System errors
  if (name.includes('syntax') || name.includes('reference') || name.includes('type')) {
    return { severity: ErrorSeverity.CRITICAL, category: ErrorCategory.SYSTEM };
  }

  // Default classification
  return { severity: ErrorSeverity.MEDIUM, category: ErrorCategory.BUSINESS_LOGIC };
};

/**
 * Enhanced error logging with context
 */
export const logError = async (
  error: Error,
  errorInfo?: ErrorInfo,
  additionalContext?: Partial<ErrorContext>
) => {
  const serializedError = serializeError(error, errorInfo, additionalContext);
  const classification = classifyError(error);

  const logEntry = {
    ...serializedError,
    ...classification,
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  // Console logging for development
  if (import.meta.env.DEV) {
    console.group(`🚨 Error [${classification.severity.toUpperCase()}] - ${classification.category}`);
    console.error('Error:', error);
    console.log('Context:', logEntry.context);
    if (errorInfo) {
      console.log('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();
  }

  // Production error tracking
  if (import.meta.env.PROD) {
    try {
      // Send to error tracking service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
    } catch (loggingError) {
      console.warn('Failed to log error to tracking service:', loggingError);
    }
  }

  // Store in local storage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('error_log') || '[]');
    existingErrors.push(logEntry);
    
    // Keep only last 50 errors
    const recentErrors = existingErrors.slice(-50);
    localStorage.setItem('error_log', JSON.stringify(recentErrors));
  } catch (storageError) {
    console.warn('Failed to store error in local storage:', storageError);
  }

  return logEntry;
};

/**
 * Error recovery strategies
 */
export const getErrorRecoveryAction = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('network') || message.includes('fetch')) {
    return 'Please check your internet connection and try again.';
  }

  if (message.includes('unauthorized') || message.includes('token')) {
    return 'Please log in again to continue.';
  }

  if (message.includes('validation')) {
    return 'Please check your input and try again.';
  }

  if (message.includes('not found')) {
    return 'The requested resource could not be found.';
  }

  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};

/**
 * Create user-friendly error message
 */
export const createUserFriendlyMessage = (error: Error): string => {
  const classification = classifyError(error);
  const recoveryAction = getErrorRecoveryAction(error);

  switch (classification.category) {
    case ErrorCategory.NETWORK:
      return `Connection issue: ${recoveryAction}`;
    case ErrorCategory.AUTHENTICATION:
      return `Authentication required: ${recoveryAction}`;
    case ErrorCategory.VALIDATION:
      return `Input validation: ${recoveryAction}`;
    case ErrorCategory.PERMISSION:
      return `Access denied: ${recoveryAction}`;
    default:
      return recoveryAction;
  }
};

/**
 * Global error handler setup
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    logError(error, undefined, { route: 'unhandled_promise_rejection' });
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logError(event.error, undefined, { route: 'global_error_handler' });
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window && event.target instanceof HTMLElement) {
      const element = event.target as HTMLElement;
      const error = new Error(`Resource loading failed: ${element.tagName} - ${(element as unknown).src || (element as unknown).href}`);
      logError(error, undefined, { route: 'resource_loading_error' });
    }
  }, true);
};

export default {
  serializeError,
  classifyError,
  logError,
  getErrorRecoveryAction,
  createUserFriendlyMessage,
  setupGlobalErrorHandling
};
