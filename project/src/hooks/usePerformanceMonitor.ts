/**
 * Performance Monitor React Hook
 * Easy integration of performance monitoring in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PerformanceMonitor } from '../services/performance/PerformanceMonitor';

interface PerformanceSummary {
  pageLoadTime: number;
  apiResponseTime: number;
  userInteractions: number;
  errorRate: number;
  memoryUsage: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
}

interface UsePerformanceMonitorResult {
  summary: PerformanceSummary | null;
  alerts: PerformanceAlert[];
  isMonitoring: boolean;
  measureApiCall: <T>(apiCall: () => Promise<T>, endpoint: string, method?: string) => Promise<T>;
  measureRender: (componentName: string) => () => void;
  recordMetric: (name: string, value: number, category: string, tags?: Record<string, string>) => void;
  exportMetrics: (format?: 'json' | 'csv') => string;
  refreshSummary: () => void;
}

export function usePerformanceMonitor(
  refreshInterval: number = 30000,
  autoStart: boolean = true
): UsePerformanceMonitorResult {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize performance monitor
  useEffect(() => {
    if (autoStart && typeof window !== 'undefined') {
      monitorRef.current = PerformanceMonitor.getInstance();
      setIsMonitoring(true);

      // Initial summary
      updateSummary();

      // Set up periodic updates
      if (refreshInterval > 0) {
        intervalRef.current = setInterval(updateSummary, refreshInterval);
      }

      // Listen for real-time metric events
      const handleMetricEvent = (event: CustomEvent) => {
        // Throttle updates to avoid excessive re-renders
        throttledUpdateSummary();
      };

      window.addEventListener('performance_metric', handleMetricEvent as EventListener);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        window.removeEventListener('performance_metric', handleMetricEvent as EventListener);
      };
    }
  }, [autoStart, refreshInterval]);

  const updateSummary = useCallback(() => {
    if (monitorRef.current) {
      const performanceData = monitorRef.current.getPerformanceSummary();
      setSummary(performanceData.summary);

      const performanceAlerts = monitorRef.current.checkPerformanceAlerts();
      setAlerts(performanceAlerts);
    }
  }, []);

  // Throttled update to prevent excessive re-renders
  const throttledUpdateSummary = useCallback(
    throttle(updateSummary, 1000),
    [updateSummary]
  );

  // Measure API call performance
  const measureApiCall = useCallback(
    async <T>(apiCall: () => Promise<T>, endpoint: string, method: string = 'GET'): Promise<T> => {
      if (!monitorRef.current) {
        return apiCall();
      }
      return monitorRef.current.measureApiCall(apiCall, endpoint, method);
    },
    []
  );

  // Measure component render performance
  const measureRender = useCallback((componentName: string) => {
    if (!monitorRef.current) {
      return () => {}; // No-op if monitor not available
    }
    return monitorRef.current.measureComponentRender(componentName);
  }, []);

  // Record custom metric
  const recordMetric = useCallback((
    name: string,
    value: number,
    category: string,
    tags: Record<string, string> = {}
  ) => {
    if (monitorRef.current) {
      monitorRef.current.recordMetric({
        id: `custom-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        category: category as any,
        name,
        value,
        unit: 'count',
        tags
      });
    }
  }, []);

  // Export metrics
  const exportMetrics = useCallback((format: 'json' | 'csv' = 'json'): string => {
    if (!monitorRef.current) {
      return format === 'json' ? '[]' : '';
    }
    return monitorRef.current.exportMetrics(format);
  }, []);

  // Refresh summary manually
  const refreshSummary = useCallback(() => {
    updateSummary();
  }, [updateSummary]);

  return {
    summary,
    alerts,
    isMonitoring,
    measureApiCall,
    measureRender,
    recordMetric,
    exportMetrics,
    refreshSummary
  };
}

// Component-specific performance monitoring hook
export function useComponentPerformance(componentName: string) {
  const { measureRender, recordMetric } = usePerformanceMonitor(0, false);
  const renderEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Start measuring render time
    renderEndRef.current = measureRender(componentName);

    // Record component mount
    recordMetric('component_mount', 1, 'user_interaction', {
      component: componentName
    });

    return () => {
      // End render measurement
      if (renderEndRef.current) {
        renderEndRef.current();
      }

      // Record component unmount
      recordMetric('component_unmount', 1, 'user_interaction', {
        component: componentName
      });
    };
  }, [componentName, measureRender, recordMetric]);

  return {
    recordInteraction: (interactionType: string) => {
      recordMetric('component_interaction', 1, 'user_interaction', {
        component: componentName,
        interaction_type: interactionType
      });
    },
    recordError: (errorType: string) => {
      recordMetric('component_error', 1, 'user_interaction', {
        component: componentName,
        error_type: errorType
      });
    }
  };
}

// API performance monitoring hook
export function useApiPerformance() {
  const { measureApiCall } = usePerformanceMonitor(0, false);

  return {
    measureCall: measureApiCall,
    measureFetch: useCallback(async (url: string, options?: RequestInit) => {
      return measureApiCall(
        () => fetch(url, options),
        url,
        options?.method || 'GET'
      );
    }, [measureApiCall])
  };
}

// Simple throttle utility
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}