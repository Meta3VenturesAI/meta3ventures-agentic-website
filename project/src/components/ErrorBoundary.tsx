import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Create visible error display for deployment debugging
    if (typeof window !== 'undefined') {
      const errorMsg = `Error: ${error.message}\nStack: ${error.stack}`;
      console.error('DEPLOYMENT ERROR:', errorMsg);
      
      // Also display in DOM for visibility
      const errorDiv = document.createElement('div');
      errorDiv.id = 'deployment-error';
      errorDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #ffeeee;
        border: 2px solid #ff0000;
        padding: 10px;
        max-width: 400px;
        z-index: 99999;
        font-family: monospace;
        font-size: 11px;
        color: #000;
      `;
      errorDiv.innerHTML = `
        <strong style="color: red;">ERROR CAUGHT:</strong><br>
        ${error.message}<br>
        <small>${error.stack?.substring(0, 200)}...</small>
      `;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        const el = document.getElementById('deployment-error');
        if (el) el.style.display = 'none';
      }, 30000); // Hide after 30 seconds
    }
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // You can integrate with services like Sentry here
      console.error('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
    
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        return <this.props.FallbackComponent error={this.state.error} resetErrorBoundary={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We apologize for the inconvenience. Please try refreshing the page or return to the homepage.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Error Details:</h3>
                <pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </button>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-medium rounded-lg transition-colors"
              >
                <Home className="mr-2 h-5 w-5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;