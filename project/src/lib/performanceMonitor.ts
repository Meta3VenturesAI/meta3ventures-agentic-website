// Enhanced performance monitoring
interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  resourceLoadTimes: ResourceTiming[];
  memoryUsage?: MemoryInfo;
  connectionType?: string;
  deviceType: string;
  timestamp: string;
  url: string;
  sessionId: string;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size?: number;
  type: string;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

class PerformanceMonitor {
  private sessionId: string;
  private metrics: Partial<PerformanceMetrics> = {};
  private observer?: PerformanceObserver;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupPerformanceObservers();
    this.measurePageLoad();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) return;

    // Observe Web Vitals
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            this.metrics.largestContentfulPaint = entry.startTime;
            break;
          case 'first-input':
            this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              this.metrics.cumulativeLayoutShift = 
                (this.metrics.cumulativeLayoutShift || 0) + (entry as any).value;
            }
            break;
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime;
            }
            break;
        }
      }
    });

    try {
      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift', 'paint'] });
    } catch (e) {
      console.warn('Performance observer not supported:', e);
    }
  }

  private measurePageLoad(): void {
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.collectMetrics(), 0);
      });
    }
  }

  private collectMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    }

    // Collect resource timings
    this.metrics.resourceLoadTimes = this.getResourceTimings();

    // Memory usage (if available)
    if ('memory' in performance) {
      this.metrics.memoryUsage = (performance as any).memory;
    }

    // Connection info
    if ('connection' in navigator) {
      this.metrics.connectionType = (navigator as any).connection?.effectiveType;
    }

    // Device type
    this.metrics.deviceType = this.getDeviceType();

    // Complete metrics
    this.metrics.timestamp = new Date().toISOString();
    this.metrics.url = window.location.href;
    this.metrics.sessionId = this.sessionId;

    this.reportMetrics();
  }

  private getResourceTimings(): ResourceTiming[] {
    return performance.getEntriesByType('resource').map((entry: any) => ({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: this.getResourceType(entry.name)
    }));
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'script';
    if (url.match(/\.css$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private reportMetrics(): void {
    // In development, log to console
    if (import.meta.env.MODE === 'development') {
      console.log('Performance Metrics:', this.metrics);
    }

    // Store metrics for analysis
    this.storeMetrics();

    // In production, send to analytics service
    this.sendToAnalytics();
  }

  private storeMetrics(): void {
    try {
      const storedMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
      storedMetrics.push(this.metrics);
      
      // Keep only last 10 sessions
      if (storedMetrics.length > 10) {
        storedMetrics.splice(0, storedMetrics.length - 10);
      }
      
      localStorage.setItem('performanceMetrics', JSON.stringify(storedMetrics));
    } catch (e) {
      console.warn('Failed to store performance metrics:', e);
    }
  }

  private async sendToAnalytics(): Promise<void> {
    // In a real implementation, send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    try {
      // Placeholder for analytics integration
      if (window.gtag) {
        window.gtag('event', 'page_performance', {
          page_load_time: this.metrics.pageLoadTime,
          first_contentful_paint: this.metrics.firstContentfulPaint,
          largest_contentful_paint: this.metrics.largestContentfulPaint,
          cumulative_layout_shift: this.metrics.cumulativeLayoutShift,
          device_type: this.metrics.deviceType
        });
      }
    } catch (e) {
      console.warn('Failed to send performance metrics:', e);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getStoredMetrics(): PerformanceMetrics[] {
    try {
      return JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    } catch {
      return [];
    }
  }

  public clearStoredMetrics(): void {
    localStorage.removeItem('performanceMetrics');
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;

// Web Vitals helper functions
export const measureWebVitals = () => {
  // These would typically be imported from 'web-vitals' package
  // For now, we'll use our performance monitor
  return performanceMonitor.getMetrics();
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}