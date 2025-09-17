/**
 * App Initialization Service
 * Initializes all services and configurations on app start
 */

import { errorMonitoring } from './error-monitoring.service';
import { backupService } from './backup.service';
import { appConfig } from '../config/app.config';
import { setupGlobalErrorHandling } from '../utils/errorBoundary.utils';

class AppInitService {
  private initialized = false;

  /**
   * Initialize all app services
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log(`🚀 Initializing Meta3Ventures v${appConfig.version} (${appConfig.environment})...`);

      // Initialize error monitoring
      if (appConfig.features.errorTracking) {
        await errorMonitoring.initialize();
        console.log('✅ Error monitoring initialized');
      }

      // Initialize backup service
      if (appConfig.features.backups) {
        backupService.initialize({
          interval: appConfig.performance.backupInterval,
          maxBackups: appConfig.performance.maxBackups,
          compressionEnabled: true,
          encryptionEnabled: false
        });
        console.log('✅ Backup service initialized');
      }

      // Set up performance monitoring
      if (appConfig.features.performanceMonitoring) {
        this.setupPerformanceMonitoring();
        console.log('✅ Performance monitoring initialized');
      }

      // Set up enhanced global error handling
      setupGlobalErrorHandling();
      console.log('✅ Enhanced error handling initialized');

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Initialize analytics
      if (appConfig.features.analytics) {
        this.initializeAnalytics();
        console.log('✅ Analytics initialized');
      }

      // Preload critical resources
      this.preloadCriticalResources();

      // Set app metadata in window object for debugging
      (window as unknown).__APP_VERSION__ = appConfig.version;
      (window as unknown).__BUILD_TIME__ = appConfig.buildTime;
      (window as unknown).__ENVIRONMENT__ = appConfig.environment;

      this.initialized = true;
      console.log('✅ App initialization complete');

    } catch (error) {
      console.error('❌ App initialization failed:', error);
      errorMonitoring.logError(error as Error, {
        action: 'app_initialization',
        severity: 'critical'
      });
    }
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > appConfig.performance.maxLongTaskDuration) {
              errorMonitoring.logPerformanceIssue(
                'long_task',
                entry.duration,
                appConfig.performance.maxLongTaskDuration
              );
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task monitoring not supported');
      }

      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.fetchStart;
            if (loadTime > appConfig.performance.maxPageLoadTime) {
              errorMonitoring.logPerformanceIssue(
                'page_load',
                loadTime,
                appConfig.performance.maxPageLoadTime
              );
            }
            console.log(`Page load time: ${loadTime}ms`);
          }
        }, 0);
      });
    }
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('✅ Network connection restored');
    });

    window.addEventListener('offline', () => {
      console.warn('❌ Network connection lost');
      errorMonitoring.logError('Network connection lost', {
        action: 'network_status',
        severity: 'medium'
      });
    });

    // Monitor failed requests
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // Log API errors
        if (!response.ok && response.status >= 500) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          errorMonitoring.logApiError(
            url,
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
        
        return response;
      } catch (error) {
        const url = typeof args[0] === 'string' ? args[0] : ((args[0] as Request)?.url || 'unknown');
        errorMonitoring.logApiError(url, error as Error);
        throw error;
      }
    };
  }

  /**
   * Preload critical resources for better performance
   */
  private preloadCriticalResources() {
    const criticalResources = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = 'style';
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });

    // Optimize images loading
    if ('loading' in HTMLImageElement.prototype) {
      document.documentElement.classList.add('native-lazy-loading');
    }
  }

  /**
   * Initialize analytics
   */
  private initializeAnalytics() {
    // Google Analytics
    const gaId = appConfig.services.analytics.gaId;
    if (gaId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      (window as unknown).dataLayer = (window as unknown).dataLayer || [];
      function gtag(...args: unknown[]) {
        (window as unknown).dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', gaId);
      
      console.log('✅ Google Analytics initialized');
    }
  }

  /**
   * Clean up on app unmount
   */
  cleanup() {
    backupService.stop();
    console.log('App cleanup complete');
  }
}

// Export singleton instance
export const appInit = new AppInitService();

// Auto-initialize on import if in browser
if (typeof window !== 'undefined') {
  appInit.initialize();
}