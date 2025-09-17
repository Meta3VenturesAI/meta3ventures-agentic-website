/**
 * Performance Monitor Service
 * Comprehensive performance tracking for virtual agents system
 */

interface PerformanceMetric {
  id: string;
  timestamp: Date;
  category: 'response_time' | 'memory_usage' | 'user_interaction' | 'error_rate' | 'agent_usage';
  value: number;
  metadata?: Record<string, any>;
}

interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  errorCount: number;
  lastUsed: Date;
  popularQueries: string[];
}

interface SystemHealth {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  score: number;
  metrics: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
    userSatisfaction: number;
  };
  recommendations: string[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private agentPerformance: Map<string, AgentPerformance> = new Map();
  private observers: PerformanceObserver[] = [];
  private startTime: number = Date.now();

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              id: `long-task-${Date.now()}`,
              timestamp: new Date(),
              category: 'response_time',
              value: entry.duration,
              metadata: {
                type: 'long_task',
                name: entry.name,
                startTime: entry.startTime
              }
            });
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }

      // Monitor navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              id: `navigation-${Date.now()}`,
              timestamp: new Date(),
              category: 'response_time',
              value: navEntry.loadEventEnd - navEntry.loadEventStart,
              metadata: {
                type: 'navigation',
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
                firstPaint: navEntry.loadEventEnd - navEntry.fetchStart
              }
            });
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation timing monitoring not supported:', error);
      }
    }

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Monitor user interactions
    this.startUserInteractionMonitoring();
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Store in localStorage for persistence
    try {
      const stored = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      stored.push({
        ...metric,
        timestamp: metric.timestamp.toISOString()
      });
      
      // Keep only last 500 in storage
      if (stored.length > 500) {
        stored.splice(0, stored.length - 500);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(stored));
    } catch (error) {
      console.warn('Failed to store performance metric:', error);
    }
  }

  /**
   * Track agent performance
   */
  trackAgentInteraction(agentId: string, agentName: string, responseTime: number, success: boolean, query?: string): void {
    let performance = this.agentPerformance.get(agentId);
    
    if (!performance) {
      performance = {
        agentId,
        agentName,
        totalRequests: 0,
        averageResponseTime: 0,
        successRate: 100,
        errorCount: 0,
        lastUsed: new Date(),
        popularQueries: []
      };
    }

    // Update metrics
    const totalRequests = performance.totalRequests + 1;
    const averageResponseTime = (performance.averageResponseTime * performance.totalRequests + responseTime) / totalRequests;
    const errorCount = success ? performance.errorCount : performance.errorCount + 1;
    const successRate = ((totalRequests - errorCount) / totalRequests) * 100;

    // Update popular queries
    if (query && success) {
      const queries = [...performance.popularQueries];
      queries.push(query);
      
      // Keep only last 10 queries
      if (queries.length > 10) {
        queries.shift();
      }
      
      performance.popularQueries = queries;
    }

    const updatedPerformance: AgentPerformance = {
      ...performance,
      totalRequests,
      averageResponseTime,
      successRate,
      errorCount,
      lastUsed: new Date()
    };

    this.agentPerformance.set(agentId, updatedPerformance);

    // Record metric
    this.recordMetric({
      id: `agent-${agentId}-${Date.now()}`,
      timestamp: new Date(),
      category: 'agent_usage',
      value: responseTime,
      metadata: {
        agentId,
        agentName,
        success,
        query: query?.substring(0, 100) // Limit query length for storage
      }
    });
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(type: 'click' | 'input' | 'scroll' | 'resize', element?: string): void {
    this.recordMetric({
      id: `interaction-${Date.now()}`,
      timestamp: new Date(),
      category: 'user_interaction',
      value: 1,
      metadata: {
        type,
        element,
        timestamp: Date.now()
      }
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.recordMetric({
      id: `error-${Date.now()}`,
      timestamp: new Date(),
      category: 'error_rate',
      value: 1,
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
        userAgent: navigator.userAgent
      }
    });
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => 
      now - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    // Calculate response time
    const responseTimes = recentMetrics
      .filter(m => m.category === 'response_time' || m.category === 'agent_usage')
      .map(m => m.value);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    // Calculate error rate
    const totalInteractions = recentMetrics.filter(m => 
      m.category === 'agent_usage' || m.category === 'user_interaction'
    ).length;
    const errors = recentMetrics.filter(m => m.category === 'error_rate').length;
    const errorRate = totalInteractions > 0 ? (errors / totalInteractions) * 100 : 0;

    // Get memory usage
    const memoryUsage = this.getCurrentMemoryUsage();

    // Calculate overall score
    const responseScore = Math.max(0, 100 - (avgResponseTime / 100)); // 100ms = 1 point deduction
    const errorScore = Math.max(0, 100 - (errorRate * 10)); // 1% error = 10 points deduction
    const memoryScore = Math.max(0, 100 - (memoryUsage / 1024 / 1024)); // 1MB = 1 point deduction
    
    const overallScore = Math.round((responseScore + errorScore + memoryScore) / 3);

    // Determine status
    let status: SystemHealth['status'];
    if (overallScore >= 90) status = 'excellent';
    else if (overallScore >= 75) status = 'good';
    else if (overallScore >= 60) status = 'warning';
    else status = 'critical';

    // Generate recommendations
    const recommendations: string[] = [];
    if (avgResponseTime > 3000) recommendations.push('Response time is slow - consider optimizing agent processing');
    if (errorRate > 5) recommendations.push('High error rate detected - check agent configurations');
    if (memoryUsage > 100 * 1024 * 1024) recommendations.push('High memory usage - consider optimizing memory management');

    return {
      status,
      score: overallScore,
      metrics: {
        responseTime: avgResponseTime,
        memoryUsage,
        errorRate,
        userSatisfaction: Math.max(0, 100 - errorRate * 5) // Simple satisfaction estimate
      },
      recommendations
    };
  }

  /**
   * Get agent performance data
   */
  getAgentPerformance(): AgentPerformance[] {
    return Array.from(this.agentPerformance.values())
      .sort((a, b) => b.totalRequests - a.totalRequests);
  }

  /**
   * Get performance metrics for a time range
   */
  getMetrics(
    category?: PerformanceMetric['category'],
    timeRange?: { start: Date; end: Date }
  ): PerformanceMetric[] {
    let filtered = this.metrics;

    if (category) {
      filtered = filtered.filter(m => m.category === category);
    }

    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const data = {
      systemInfo: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        sessionDuration: Date.now() - this.startTime
      },
      systemHealth: this.getSystemHealth(),
      agentPerformance: this.getAgentPerformance(),
      metrics: this.metrics.slice(-100), // Last 100 metrics
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    const checkMemory = () => {
      const memoryUsage = this.getCurrentMemoryUsage();
      
      this.recordMetric({
        id: `memory-${Date.now()}`,
        timestamp: new Date(),
        category: 'memory_usage',
        value: memoryUsage,
        metadata: {
          type: 'heap_usage',
          timestamp: Date.now()
        }
      });
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  /**
   * Start user interaction monitoring
   */
  private startUserInteractionMonitoring(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      const elementInfo = target.tagName.toLowerCase() + 
        (target.className ? `.${target.className.split(' ')[0]}` : '') +
        (target.id ? `#${target.id}` : '');
      
      this.trackUserInteraction('click', elementInfo);
    });

    // Track scrolling
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackUserInteraction('scroll', `y:${window.scrollY}`);
      }, 100);
    });

    // Track window resize
    window.addEventListener('resize', () => {
      this.trackUserInteraction('resize', `${window.innerWidth}x${window.innerHeight}`);
    });
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as unknown).memory;
      return memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  /**
   * Clean up observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Track global errors
window.addEventListener('error', (event) => {
  performanceMonitor.trackError(new Error(event.message), 'global_error');
});

window.addEventListener('unhandledrejection', (event) => {
  performanceMonitor.trackError(new Error(event.reason), 'unhandled_promise');
});

export default performanceMonitor;
