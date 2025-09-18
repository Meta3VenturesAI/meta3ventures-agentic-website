/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking and optimization helpers
 */

import React from 'react';
import { appConfig } from '../config/app.config';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  lastRender: Date;
}

// Performance metrics collector
class PerformanceCollector {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentPerformance>();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  private setupObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Long Task Observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long_task',
            value: entry.duration,
            unit: 'ms',
            timestamp: new Date(),
            context: {
              name: entry.name,
              startTime: entry.startTime
            }
          });

          if (entry.duration > appConfig.performance.maxLongTaskDuration) {
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (_e) {
      console.warn('Long task observer not supported');
    }

    // Layout Shift Observer
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'layout_shift',
            value: (entry as any).value,
            unit: 'score',
            timestamp: new Date(),
            context: {
              hadRecentInput: (entry as any).hadRecentInput
            }
          });
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (_e) {
      console.warn('Layout shift observer not supported');
    }

    // Paint Observer
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name.replace('-', '_'),
            value: entry.startTime,
            unit: 'ms',
            timestamp: new Date()
          });
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (_e) {
      console.warn('Paint observer not supported');
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log performance issues in development
    if (import.meta.env.DEV) {
      this.logPerformanceIssues(metric);
    }
  }

  private logPerformanceIssues(metric: PerformanceMetric) {
    const thresholds: Record<string, number> = {
      long_task: appConfig.performance.maxLongTaskDuration,
      layout_shift: 0.1,
      first_paint: 1000,
      first_contentful_paint: 1500
    };

    const threshold = thresholds[metric.name];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance issue detected: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold}${metric.unit})`);
    }
  }

  recordComponentRender(componentName: string, renderTime: number) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      const newRenderCount = existing.renderCount + 1;
      const newAverageRenderTime = (existing.averageRenderTime * existing.renderCount + renderTime) / newRenderCount;
      
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: newRenderCount,
        averageRenderTime: newAverageRenderTime,
        lastRender: new Date()
      });
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRender: new Date()
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  getWebVitals() {
    const metrics = this.getMetrics();
    
    return {
      fcp: metrics.find(m => m.name === 'first_contentful_paint')?.value,
      lcp: this.getLCP(),
      fid: this.getFID(),
      cls: this.getCLS(),
      ttfb: this.getTTFB()
    };
  }

  private getLCP(): number | undefined {
    if (typeof window === 'undefined') return undefined;
    
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : undefined;
  }

  private getFID(): number | undefined {
    const fidMetrics = this.metrics.filter(m => m.name === 'first_input_delay');
    return fidMetrics.length > 0 ? fidMetrics[0].value : undefined;
  }

  private getCLS(): number {
    const clsMetrics = this.metrics.filter(m => m.name === 'layout_shift');
    return clsMetrics.reduce((sum, metric) => sum + metric.value, 0);
  }

  private getTTFB(): number | undefined {
    if (typeof window === 'undefined') return undefined;
    
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming;
      return nav.responseStart - nav.requestStart;
    }
    return undefined;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceCollector = new PerformanceCollector();

// React component performance wrapper
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  return function PerformanceTrackedComponent(props: P) {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      performanceCollector.recordComponentRender(displayName, renderTime);
      
      if (import.meta.env.DEV && renderTime > 16) {
        console.warn(`Slow render detected: ${displayName} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(WrappedComponent, props);
  };
}

// Performance measurement utilities
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    performanceCollector.recordMetric({
      name: `async_${name}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date()
    });
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - start;
    
    performanceCollector.recordMetric({
      name: `async_${name}_error`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { error: (error as Error).message }
    });
    
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  fn: () => T
): { result: T; duration: number } => {
  const start = performance.now();
  
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    performanceCollector.recordMetric({
      name: `sync_${name}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date()
    });
    
    return { result, duration };
  } catch (error) {
    const duration = performance.now() - start;
    
    performanceCollector.recordMetric({
      name: `sync_${name}_error`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { error: (error as Error).message }
    });
    
    throw error;
  }
};

// Bundle size analysis
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return null;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  return {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
    totalResources: scripts.length + stylesheets.length,
    scriptUrls: scripts.map(s => (s as HTMLScriptElement).src),
    stylesheetUrls: stylesheets.map(s => (s as HTMLLinkElement).href)
  };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
};

// Performance report generator
export const generatePerformanceReport = () => {
  const metrics = performanceCollector.getMetrics();
  const componentMetrics = performanceCollector.getComponentMetrics();
  const webVitals = performanceCollector.getWebVitals();
  const bundleAnalysis = analyzeBundleSize();
  const memoryUsage = getMemoryUsage();

  return {
    timestamp: new Date(),
    webVitals,
    metrics: {
      total: metrics.length,
      byType: metrics.reduce((acc, metric) => {
        acc[metric.name] = (acc[metric.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    components: {
      total: componentMetrics.length,
      slowest: componentMetrics
        .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
        .slice(0, 10),
      mostRendered: componentMetrics
        .sort((a, b) => b.renderCount - a.renderCount)
        .slice(0, 10)
    },
    bundle: bundleAnalysis,
    memory: memoryUsage
  };
};

export default {
  performanceCollector,
  withPerformanceTracking,
  measureAsync,
  measureSync,
  analyzeBundleSize,
  getMemoryUsage,
  generatePerformanceReport
};
