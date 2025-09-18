/**
 * Real-Time Agent Monitoring System
 * 
 * Provides real-time monitoring, logging, and alerting for agent interactions,
 * performance metrics, and system health.
 */

// Browser-compatible EventEmitter implementation
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    if (!this.events[event]) {
      return false;
    }
    this.events[event].forEach(listener => listener(...args));
    return true;
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) {
      return this;
    }
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }
}

export interface AgentEvent {
  id: string;
  timestamp: Date;
  type: 'agent_start' | 'agent_end' | 'tool_execution' | 'error' | 'user_interaction' | 'system_alert';
  agentId: string;
  userId?: string;
  sessionId?: string;
  data: unknown;
  metadata?: {
    processingTime?: number;
    success?: boolean;
    errorMessage?: string;
    toolId?: string;
    confidence?: number;
  };
}

export interface PerformanceMetrics {
  agentId: string;
  totalInteractions: number;
  averageResponseTime: number;
  successRate: number;
  errorRate: number;
  lastActivity: Date;
  peakConcurrency: number;
  currentConcurrency: number;
}

export interface SystemAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'error' | 'resource' | 'security';
  title: string;
  description: string;
  agentId?: string;
  resolved: boolean;
  resolvedAt?: Date;
}

export class RealTimeMonitor extends EventEmitter {
  private static instance: RealTimeMonitor;
  private eventHistory: AgentEvent[] = [];
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private activeSessions: Map<string, { agentId: string; userId: string; startTime: Date }> = new Map();
  private alerts: SystemAlert[] = [];
  private maxEvents: number = 1000;
  private maxAlerts: number = 100;
  private maxListeners: number = 50;

  constructor() {
    super();
  }

  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners(): number {
    return this.maxListeners;
  }

  static getInstance(): RealTimeMonitor {
    if (!RealTimeMonitor.instance) {
      RealTimeMonitor.instance = new RealTimeMonitor();
    }
    return RealTimeMonitor.instance;
  }

  // Event Logging
  logEvent(event: Omit<AgentEvent, 'id' | 'timestamp'>): void {
    const fullEvent: AgentEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };

    this.eventHistory.push(fullEvent);

    // Keep only the most recent events
    if (this.eventHistory.length > this.maxEvents) {
      this.eventHistory = this.eventHistory.slice(-this.maxEvents);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(fullEvent);

    // Check for alerts
    this.checkForAlerts(fullEvent);

    // Emit event for real-time listeners
    this.emit('agentEvent', fullEvent);
  }

  // Agent Session Management
  startAgentSession(sessionId: string, agentId: string, userId: string): void {
    this.activeSessions.set(sessionId, {
      agentId,
      userId,
      startTime: new Date()
    });

    this.logEvent({
      type: 'agent_start',
      agentId,
      userId,
      sessionId,
      data: { sessionId, agentId, userId }
    });
  }

  endAgentSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const duration = Date.now() - session.startTime.getTime();
      
      this.logEvent({
        type: 'agent_end',
        agentId: session.agentId,
        userId: session.userId,
        sessionId,
        data: { 
          sessionId, 
          agentId: session.agentId, 
          userId: session.userId,
          duration 
        }
      });

      this.activeSessions.delete(sessionId);
    }
  }

  // Tool Execution Monitoring
  logToolExecution(
    agentId: string, 
    toolId: string, 
    userId: string, 
    sessionId: string, 
    success: boolean, 
    processingTime: number,
    errorMessage?: string
  ): void {
    this.logEvent({
      type: 'tool_execution',
      agentId,
      userId,
      sessionId,
      data: { toolId, success, processingTime, errorMessage },
      metadata: {
        toolId,
        success,
        processingTime,
        errorMessage
      }
    });
  }

  // User Interaction Monitoring
  logUserInteraction(
    agentId: string, 
    userId: string, 
    sessionId: string, 
    interactionType: string, 
    data: unknown
  ): void {
    this.logEvent({
      type: 'user_interaction',
      agentId,
      userId,
      sessionId,
      data: { interactionType, ...(data as any) }
    });
  }

  // Error Monitoring
  logError(
    agentId: string, 
    error: Error, 
    userId?: string, 
    sessionId?: string, 
    context?: unknown
  ): void {
    this.logEvent({
      type: 'error',
      agentId,
      userId,
      sessionId,
      data: { 
        errorMessage: error.message, 
        errorStack: error.stack,
        context 
      },
      metadata: {
        success: false,
        errorMessage: error.message
      }
    });
  }

  // Performance Metrics
  private updatePerformanceMetrics(event: AgentEvent): void {
    const agentId = event.agentId;
    let metrics = this.performanceMetrics.get(agentId);
    
    if (!metrics) {
      metrics = {
        agentId,
        totalInteractions: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorRate: 0,
        lastActivity: new Date(),
        peakConcurrency: 0,
        currentConcurrency: 0
      };
      this.performanceMetrics.set(agentId, metrics);
    }

    // Update metrics based on event type
    switch (event.type) {
      case 'agent_start':
        metrics.currentConcurrency++;
        metrics.peakConcurrency = Math.max(metrics.peakConcurrency, metrics.currentConcurrency);
        break;
      
      case 'agent_end':
        metrics.currentConcurrency = Math.max(0, metrics.currentConcurrency - 1);
        break;
      
      case 'tool_execution':
        metrics.totalInteractions++;
        if (event.metadata?.processingTime) {
          metrics.averageResponseTime = 
            (metrics.averageResponseTime * (metrics.totalInteractions - 1) + event.metadata.processingTime) / 
            metrics.totalInteractions;
        }
        break;
      
      case 'error':
        metrics.errorRate = (metrics.errorRate * (metrics.totalInteractions - 1) + 1) / metrics.totalInteractions;
        break;
    }

    metrics.lastActivity = event.timestamp;
    metrics.successRate = 1 - metrics.errorRate;
  }

  // Alert System
  private checkForAlerts(event: AgentEvent): void {
    const alerts: SystemAlert[] = [];

    // High error rate alert
    const metrics = this.performanceMetrics.get(event.agentId);
    if (metrics && metrics.errorRate > 0.1) {
      alerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity: 'high',
        type: 'error',
        title: 'High Error Rate Detected',
        description: `Agent ${event.agentId} has an error rate of ${(metrics.errorRate * 100).toFixed(2)}%`,
        agentId: event.agentId,
        resolved: false
      });
    }

    // High response time alert
    if (metrics && metrics.averageResponseTime > 5000) {
      alerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity: 'medium',
        type: 'performance',
        title: 'High Response Time',
        description: `Agent ${event.agentId} has an average response time of ${metrics.averageResponseTime.toFixed(0)}ms`,
        agentId: event.agentId,
        resolved: false
      });
    }

    // High concurrency alert
    if (metrics && metrics.currentConcurrency > 50) {
      alerts.push({
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        severity: 'high',
        type: 'resource',
        title: 'High Concurrency',
        description: `Agent ${event.agentId} has ${metrics.currentConcurrency} concurrent sessions`,
        agentId: event.agentId,
        resolved: false
      });
    }

    // Add alerts
    alerts.forEach(alert => {
      this.alerts.push(alert);
      this.emit('alert', alert);
    });

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }
  }

  // Getters
  getRecentEvents(limit: number = 50): AgentEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getEventsByAgent(agentId: string, limit: number = 50): AgentEvent[] {
    return this.eventHistory
      .filter(event => event.agentId === agentId)
      .slice(-limit);
  }

  getEventsByType(type: AgentEvent['type'], limit: number = 50): AgentEvent[] {
    return this.eventHistory
      .filter(event => event.type === type)
      .slice(-limit);
  }

  getPerformanceMetrics(agentId?: string): PerformanceMetrics[] {
    if (agentId) {
      const metrics = this.performanceMetrics.get(agentId);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.performanceMetrics.values());
  }

  getActiveSessions(): Array<{ sessionId: string; agentId: string; userId: string; startTime: Date }> {
    return Array.from(this.activeSessions.entries()).map(([sessionId, session]) => ({
      sessionId,
      ...session
    }));
  }

  getActiveSessionsByAgent(agentId: string): Array<{ sessionId: string; userId: string; startTime: Date }> {
    return Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.agentId === agentId)
      .map(([sessionId, session]) => ({
        sessionId,
        userId: session.userId,
        startTime: session.startTime
      }));
  }

  getAlerts(resolved?: boolean): SystemAlert[] {
    if (resolved !== undefined) {
      return this.alerts.filter(alert => alert.resolved === resolved);
    }
    return this.alerts;
  }

  getAlertsBySeverity(severity: SystemAlert['severity']): SystemAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Alert Management
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alertResolved', alert);
      return true;
    }
    return false;
  }

  // Real-time Subscriptions
  subscribeToAgentEvents(agentId: string, callback: (_event: AgentEvent) => void): () => void {
    const handler = (event: any) => {
      if (event.agentId === agentId) {
        callback(event);
      }
    };
    
    this.on('agentEvent', handler);
    
    return () => this.off('agentEvent', handler);
  }

  subscribeToAlerts(callback: (alert: SystemAlert) => void): () => void {
    this.on('alert', callback);
    return () => this.off('alert', callback);
  }

  // System Health
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    activeSessions: number;
    totalAlerts: number;
    unresolvedAlerts: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const activeSessions = this.activeSessions.size;
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved).length;
    const allMetrics = Array.from(this.performanceMetrics.values());
    
    const averageResponseTime = allMetrics.length > 0 
      ? allMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / allMetrics.length
      : 0;
    
    const errorRate = allMetrics.length > 0
      ? allMetrics.reduce((sum, m) => sum + m.errorRate, 0) / allMetrics.length
      : 0;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (unresolvedAlerts > 5 || errorRate > 0.1) {
      status = 'critical';
    } else if (unresolvedAlerts > 2 || errorRate > 0.05) {
      status = 'warning';
    }

    return {
      status,
      activeSessions,
      totalAlerts: this.alerts.length,
      unresolvedAlerts,
      averageResponseTime,
      errorRate
    };
  }

  // Data Export
  exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      events: this.eventHistory,
      performanceMetrics: Array.from(this.performanceMetrics.values()),
      activeSessions: this.getActiveSessions(),
      alerts: this.alerts,
      systemHealth: this.getSystemHealth(),
      timestamp: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV export would be implemented here
      return 'CSV export not implemented yet';
    }
  }
}
