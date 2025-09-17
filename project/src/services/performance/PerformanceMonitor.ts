/**
 * Comprehensive Performance Monitoring System
 * Tracks system performance, user interactions, and application health
 */

interface PerformanceMetric {
  id: string;
  timestamp: Date;
  category: 'page_load' | 'api_request' | 'user_interaction' | 'system_resource';
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  tags: Record<string, string>;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  network: 'online' | 'offline' | 'slow';
  timestamp: Date;
}

interface UserMetrics {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  bounceRate: number;
  errorCount: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private startTime: number = performance.now();
  private isMonitoring: boolean = false;

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Web Vitals
    this.observeWebVitals();

    // Monitor Resource Loading
    this.observeResourceLoading();

    // Monitor User Interactions
    this.observeUserInteractions();

    // Monitor System Resources
    this.observeSystemResources();

    this.isMonitoring = true;
  }

  private observeWebVitals(): void {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            id: `lcp-${Date.now()}`,
            timestamp: new Date(),
            category: 'page_load',
            name: 'largest_contentful_paint',
            value: entry.startTime,
            unit: 'ms',
            tags: { type: 'web_vital' }
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn('LCP observer not supported');
    }

    try {
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            id: `fid-${Date.now()}`,
            timestamp: new Date(),
            category: 'user_interaction',
            name: 'first_input_delay',
            value: (entry as any).processingStart - entry.startTime,
            unit: 'ms',
            tags: { type: 'web_vital' }
          });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    } catch (error) {
      console.warn('FID observer not supported');
    }
  }

  private observeResourceLoading(): void {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            this.recordMetric({
              id: `resource-${Date.now()}`,
              timestamp: new Date(),
              category: 'page_load',
              name: 'resource_load_time',
              value: resource.responseEnd - resource.startTime,
              unit: 'ms',
              tags: {
                resource_type: resource.initiatorType,
                resource_name: resource.name.split('/').pop() || 'unknown'
              }
            });
          }
        }
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('Resource observer not supported');
    }
  }

  private observeUserInteractions(): void {
    if (typeof window === 'undefined') return;

    const interactionEvents = ['click', 'keydown', 'scroll', 'resize'];

    interactionEvents.forEach(eventType => {
      window.addEventListener(eventType, (event) => {
        this.recordMetric({
          id: `interaction-${Date.now()}`,
          timestamp: new Date(),
          category: 'user_interaction',
          name: eventType,
          value: 1,
          unit: 'count',
          tags: {
            element: (event.target as Element)?.tagName?.toLowerCase() || 'unknown',
            page: window.location.pathname
          }
        });
      }, { passive: true });
    });
  }

  private observeSystemResources(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMetric({
          id: `memory-${Date.now()}`,
          timestamp: new Date(),
          category: 'system_resource',
          name: 'heap_memory_used',
          value: memory.usedJSHeapSize,
          unit: 'bytes',
          tags: { type: 'memory' }
        });

        this.recordMetric({
          id: `memory-limit-${Date.now()}`,
          timestamp: new Date(),
          category: 'system_resource',
          name: 'heap_memory_limit',
          value: memory.jsHeapSizeLimit,
          unit: 'bytes',
          tags: { type: 'memory' }
        });
      }

      // Check network status
      const connection = (navigator as any).connection;
      if (connection) {
        this.recordMetric({
          id: `network-${Date.now()}`,
          timestamp: new Date(),
          category: 'system_resource',
          name: 'network_speed',
          value: connection.downlink,
          unit: 'ms',
          tags: {
            type: 'network',
            effective_type: connection.effectiveType
          }
        });
      }
    }, 30000); // Every 30 seconds
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Emit metric event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance_metric', { detail: metric }));
    }
  }

  // API Response Time Monitoring
  async measureApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> {
    const startTime = performance.now();
    const startTimestamp = new Date();

    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;

      this.recordMetric({
        id: `api-success-${Date.now()}`,
        timestamp: startTimestamp,
        category: 'api_request',
        name: 'api_response_time',
        value: duration,
        unit: 'ms',
        tags: {
          endpoint,
          method,
          status: 'success'
        }
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        id: `api-error-${Date.now()}`,
        timestamp: startTimestamp,
        category: 'api_request',
        name: 'api_response_time',
        value: duration,
        unit: 'ms',
        tags: {
          endpoint,
          method,
          status: 'error',
          error_type: error instanceof Error ? error.name : 'unknown'
        }
      });

      throw error;
    }
  }

  // Component Render Time Monitoring
  measureComponentRender(componentName: string): () => void {
    const startTime = performance.now();
    const startTimestamp = new Date();

    return () => {
      const duration = performance.now() - startTime;

      this.recordMetric({
        id: `component-${Date.now()}`,
        timestamp: startTimestamp,
        category: 'user_interaction',
        name: 'component_render_time',
        value: duration,
        unit: 'ms',
        tags: {
          component: componentName,
          page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
        }
      });
    };
  }

  // Get Performance Summary
  getPerformanceSummary(timeRange: number = 300000): {
    metrics: PerformanceMetric[];
    summary: {
      pageLoadTime: number;
      apiResponseTime: number;
      userInteractions: number;
      errorRate: number;
      memoryUsage: number;
    };
  } {
    const cutoffTime = new Date(Date.now() - timeRange);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);

    const pageLoadMetrics = recentMetrics.filter(m => m.category === 'page_load');
    const apiMetrics = recentMetrics.filter(m => m.category === 'api_request');
    const interactionMetrics = recentMetrics.filter(m => m.category === 'user_interaction');
    const resourceMetrics = recentMetrics.filter(m => m.category === 'system_resource');

    const summary = {
      pageLoadTime: this.calculateAverage(pageLoadMetrics.map(m => m.value)),
      apiResponseTime: this.calculateAverage(apiMetrics.map(m => m.value)),
      userInteractions: interactionMetrics.length,
      errorRate: this.calculateErrorRate(apiMetrics),
      memoryUsage: this.getLatestMemoryUsage(resourceMetrics)
    };

    return {
      metrics: recentMetrics,
      summary
    };
  }

  // System Health Check
  getSystemHealth(): SystemHealth {
    const memoryMetrics = this.metrics
      .filter(m => m.name === 'heap_memory_used')
      .slice(-1)[0];

    const memoryUsage = memoryMetrics ? (memoryMetrics.value / (1024 * 1024 * 1024)) : 0; // GB

    return {
      cpu: 0, // Not available in browser
      memory: Math.min(100, (memoryUsage / 4) * 100), // Assume 4GB limit
      network: navigator.onLine ? 'online' : 'offline',
      timestamp: new Date()
    };
  }

  // User Session Metrics
  getUserMetrics(): UserMetrics {
    const sessionStart = this.startTime;
    const now = performance.now();
    const sessionDuration = now - sessionStart;

    const interactionMetrics = this.metrics.filter(m => m.category === 'user_interaction');
    const apiMetrics = this.metrics.filter(m => m.category === 'api_request');
    const errorMetrics = apiMetrics.filter(m => m.tags.status === 'error');

    return {
      sessionDuration: sessionDuration / 1000, // Convert to seconds
      pageViews: this.getPageViewCount(),
      interactions: interactionMetrics.length,
      bounceRate: this.calculateBounceRate(),
      errorCount: errorMetrics.length
    };
  }

  // Performance Alert System
  checkPerformanceAlerts(): Array<{
    type: 'warning' | 'error';
    message: string;
    metric: string;
    value: number;
  }> {
    const alerts: Array<{
      type: 'warning' | 'error';
      message: string;
      metric: string;
      value: number;
    }> = [];

    const summary = this.getPerformanceSummary().summary;

    // Page Load Time Alert
    if (summary.pageLoadTime > 3000) {
      alerts.push({
        type: summary.pageLoadTime > 5000 ? 'error' : 'warning',
        message: 'Page load time is high',
        metric: 'page_load_time',
        value: summary.pageLoadTime
      });
    }

    // API Response Time Alert
    if (summary.apiResponseTime > 1000) {
      alerts.push({
        type: summary.apiResponseTime > 3000 ? 'error' : 'warning',
        message: 'API response time is high',
        metric: 'api_response_time',
        value: summary.apiResponseTime
      });
    }

    // Error Rate Alert
    if (summary.errorRate > 5) {
      alerts.push({
        type: summary.errorRate > 10 ? 'error' : 'warning',
        message: 'High error rate detected',
        metric: 'error_rate',
        value: summary.errorRate
      });
    }

    // Memory Usage Alert
    if (summary.memoryUsage > 80) {
      alerts.push({
        type: summary.memoryUsage > 95 ? 'error' : 'warning',
        message: 'High memory usage detected',
        metric: 'memory_usage',
        value: summary.memoryUsage
      });
    }

    return alerts;
  }

  // Export Metrics for Analysis
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'category', 'name', 'value', 'unit', 'tags'];
      const csvRows = [headers.join(',')];

      this.metrics.forEach(metric => {
        const row = [
          metric.id,
          metric.timestamp.toISOString(),
          metric.category,
          metric.name,
          metric.value.toString(),
          metric.unit,
          JSON.stringify(metric.tags)
        ];
        csvRows.push(row.join(','));
      });

      return csvRows.join('\n');
    }

    return JSON.stringify(this.metrics, null, 2);
  }

  // Utility Methods
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateErrorRate(apiMetrics: PerformanceMetric[]): number {
    if (apiMetrics.length === 0) return 0;
    const errorCount = apiMetrics.filter(m => m.tags.status === 'error').length;
    return (errorCount / apiMetrics.length) * 100;
  }

  private getLatestMemoryUsage(resourceMetrics: PerformanceMetric[]): number {
    const memoryMetrics = resourceMetrics.filter(m => m.name === 'heap_memory_used');
    if (memoryMetrics.length === 0) return 0;

    const latest = memoryMetrics[memoryMetrics.length - 1];
    return (latest.value / (1024 * 1024 * 1024)) * 100; // Convert to percentage
  }

  private getPageViewCount(): number {
    // Simple implementation - could be enhanced with actual page tracking
    return 1;
  }

  private calculateBounceRate(): number {
    // Simple implementation - could be enhanced with actual bounce tracking
    const interactions = this.metrics.filter(m => m.category === 'user_interaction').length;
    return interactions > 5 ? 0 : 100;
  }

  // Cleanup
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.isMonitoring = false;
  }
}