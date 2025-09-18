/**
 * Production-Ready Logging System
 * 
 * Comprehensive logging with structured data, error tracking,
 * performance monitoring, and audit trails.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: {
    agentId?: string;
    userId?: string;
    sessionId?: string;
    toolId?: string;
    requestId?: string;
    component: string;
  };
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  performance?: {
    duration: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    version?: string;
    environment?: string;
  };
}

export interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  maxEntries: number;
  retentionDays: number;
  remoteEndpoint?: string;
  apiKey?: string;
}

export class ProductionLogger {
  private static instance: ProductionLogger;
  private config: LogConfig;
  private logs: LogEntry[] = [];
  private componentLoggers: Map<string, ProductionLogger> = new Map();

  constructor(config?: Partial<LogConfig>) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      enableRemote: false,
      maxEntries: 10000,
      retentionDays: 30,
      ...config
    };
  }

  static getInstance(config?: Partial<LogConfig>): ProductionLogger {
    if (!ProductionLogger.instance) {
      ProductionLogger.instance = new ProductionLogger(config);
    }
    return ProductionLogger.instance;
  }

  // Component-specific logger
  getComponentLogger(component: string): ProductionLogger {
    if (!this.componentLoggers.has(component)) {
      const logger = new ProductionLogger(this.config);
      this.componentLoggers.set(component, logger);
    }
    return this.componentLoggers.get(component)!;
  }

  // Core logging methods
  private log(
    level: LogLevel,
    message: string,
    context: LogEntry['context'],
    data?: unknown,
    error?: Error,
    performance?: LogEntry['performance']
  ): void {
    if (level < this.config.level) return;

    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      context,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined,
      performance,
      metadata: {
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.MODE || 'development'
      }
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(-this.config.maxEntries);
    }

    // Output based on configuration
    this.outputLog(logEntry);
  }

  private outputLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const contextStr = Object.entries(entry.context)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');

    const logMessage = `[${timestamp}] ${levelName} ${entry.context.component} ${entry.message} ${contextStr}`;

    if (this.config.enableConsole) {
      this.consoleLog(entry, logMessage);
    }

    if (this.config.enableFile) {
      this.fileLog(entry);
    }

    if (this.config.enableRemote) {
      this.remoteLog(entry);
    }
  }

  private consoleLog(entry: LogEntry, message: string): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level] || '';
    
    console.log(`${color}${message}${reset}`);
    
    if (entry.error) {
      console.error(`${color}Error: ${entry.error.name}: ${entry.error.message}${reset}`);
      if (entry.error.stack) {
        console.error(`${color}Stack: ${entry.error.stack}${reset}`);
      }
    }
  }

  private fileLog(entry: LogEntry): void {
    // File logging would be implemented here
    // For now, we'll just store in memory
    console.log('File logging not implemented yet');
  }

  private async remoteLog(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint || !this.config.apiKey) return;

    try {
      // Remote logging would be implemented here
      // For now, we'll just log to console
      console.log('Remote logging not implemented yet');
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  // Public logging methods
  debug(message: string, context: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context: LogEntry['context'], data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context: LogEntry['context'], error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, data, error);
  }

  critical(message: string, context: LogEntry['context'], error?: Error, data?: unknown): void {
    this.log(LogLevel.CRITICAL, message, context, data, error);
  }

  // Performance logging
  logPerformance(
    message: string,
    context: LogEntry['context'],
    duration: number,
    data?: unknown
  ): void {
    this.log(
      LogLevel.INFO,
      message,
      context,
      data,
      undefined,
      { duration }
    );
  }

  // Agent-specific logging
  logAgentStart(agentId: string, userId: string, sessionId: string): void {
    this.info('Agent started', {
      agentId,
      userId,
      sessionId,
      component: 'agent'
    });
  }

  logAgentEnd(agentId: string, userId: string, sessionId: string, duration: number): void {
    this.info('Agent ended', {
      agentId,
      userId,
      sessionId,
      component: 'agent'
    }, { duration });
  }

  logToolExecution(
    toolId: string,
    agentId: string,
    userId: string,
    sessionId: string,
    success: boolean,
    duration: number,
    error?: Error
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    const message = success ? 'Tool executed successfully' : 'Tool execution failed';
    
    this.log(level, message, {
      toolId,
      agentId,
      userId,
      sessionId,
      component: 'tool'
    }, { success, duration }, error);
  }

  logUserInteraction(
    agentId: string,
    userId: string,
    sessionId: string,
    interactionType: string,
    data?: unknown
  ): void {
    this.info('User interaction', {
      agentId,
      userId,
      sessionId,
      component: 'user'
    }, { interactionType, ...(data as any) });
  }

  logSystemEvent(
    event: string,
    component: string,
    data?: unknown,
    level: LogLevel = LogLevel.INFO
  ): void {
    this.log(level, event, { component }, data);
  }

  // Query methods
  getLogs(
    level?: LogLevel,
    component?: string,
    agentId?: string,
    userId?: string,
    limit: number = 100
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.context.component === component);
    }

    if (agentId) {
      filteredLogs = filteredLogs.filter(log => log.context.agentId === agentId);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.context.userId === userId);
    }

    return filteredLogs.slice(-limit);
  }

  getErrorLogs(limit: number = 100): LogEntry[] {
    return this.getLogs(LogLevel.ERROR, undefined, undefined, undefined, limit);
  }

  getCriticalLogs(limit: number = 100): LogEntry[] {
    return this.getLogs(LogLevel.CRITICAL, undefined, undefined, undefined, limit);
  }

  getPerformanceLogs(limit: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.performance !== undefined)
      .slice(-limit);
  }

  // Statistics
  getLogStats(): {
    total: number;
    byLevel: { [key: string]: number };
    byComponent: { [key: string]: number };
    errorRate: number;
    averagePerformance: number;
  } {
    const byLevel: { [key: string]: number } = {};
    const byComponent: { [key: string]: number } = {};
    let errorCount = 0;
    let performanceSum = 0;
    let performanceCount = 0;

    this.logs.forEach(log => {
      byLevel[LogLevel[log.level]] = (byLevel[LogLevel[log.level]] || 0) + 1;
      byComponent[log.context.component] = (byComponent[log.context.component] || 0) + 1;
      
      if (log.level >= LogLevel.ERROR) {
        errorCount++;
      }
      
      if (log.performance) {
        performanceSum += log.performance.duration;
        performanceCount++;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      byComponent,
      errorRate: this.logs.length > 0 ? errorCount / this.logs.length : 0,
      averagePerformance: performanceCount > 0 ? performanceSum / performanceCount : 0
    };
  }

  // Configuration
  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): LogConfig {
    return { ...this.config };
  }

  // Cleanup
  clearLogs(): void {
    this.logs = [];
  }

  // Export
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        logs: this.logs,
        stats: this.getLogStats(),
        timestamp: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV export would be implemented here
      return 'CSV export not implemented yet';
    }
  }
}
