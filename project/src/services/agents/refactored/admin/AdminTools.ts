/**
 * Admin Tools and Metrics Logging
 * 
 * Comprehensive admin tools for monitoring, analytics, and system management
 * of the agent system.
 */

import { RAGService } from '../rag/RAGService';
import { EnhancedSessionManager } from '../session/EnhancedSessionManager';
import { ExternalIntegrationService } from '../ExternalIntegrationService';

export interface SystemMetrics {
  timestamp: Date;
  agentSystem: {
    totalAgents: number;
    activeSessions: number;
    totalMessages: number;
    averageResponseTime: number;
  };
  ragSystem: {
    totalDocuments: number;
    totalSearches: number;
    averageSearchTime: number;
    categories: { [key: string]: number };
  };
  tools: {
    totalTools: number;
    toolUsage: { [toolId: string]: number };
    errorRate: number;
  };
  providers: {
    totalProviders: number;
    activeProviders: number;
    providerHealth: { [providerId: string]: boolean };
  };
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

export interface AgentPerformance {
  agentId: string;
  totalInteractions: number;
  averageResponseTime: number;
  successRate: number;
  toolUsage: { [toolId: string]: number };
  userSatisfaction?: number;
  lastActive: Date;
}

export interface ToolAnalytics {
  toolId: string;
  name: string;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  errorCount: number;
  lastUsed: Date;
  usageByAgent: { [agentId: string]: number };
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalMessages: number;
  averageSessionDuration: number;
  mostUsedTools: { toolId: string; count: number }[];
  commonTopics: string[];
  lastActive: Date;
  satisfaction?: number;
}

export class AdminTools {
  private static instance: AdminTools;
  private ragService: RAGService;
  private sessionManager: EnhancedSessionManager;
  private externalService: ExternalIntegrationService;
  private metrics: SystemMetrics[] = [];
  private agentPerformance: Map<string, AgentPerformance> = new Map();
  private toolAnalytics: Map<string, ToolAnalytics> = new Map();
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private startTime: Date;

  constructor() {
    this.ragService = RAGService.getInstance();
    this.sessionManager = EnhancedSessionManager.getInstance();
    this.externalService = ExternalIntegrationService.getInstance();
    this.startTime = new Date();
    
    // Start metrics collection
    this.startMetricsCollection();
  }

  static getInstance(): AdminTools {
    if (!AdminTools.instance) {
      AdminTools.instance = new AdminTools();
    }
    return AdminTools.instance;
  }

  private startMetricsCollection(): void {
    // Collect metrics every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 5 * 60 * 1000);

    // Initial metrics collection
    this.collectMetrics();
  }

  private async collectMetrics(): Promise<void> {
    try {
      const ragStats = await this.ragService.getStats();
      const allUsers = await this.sessionManager.getAllUserProfiles();
      const allSessions = await this.sessionManager.getAllSessionAnalytics();
      const externalTools = this.externalService.getAllExternalTools();
      const externalProviders = this.externalService.getAllExternalProviders();

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        agentSystem: {
          totalAgents: 10, // Based on our agent types
          activeSessions: allSessions.filter(s => s.endedAt > new Date(Date.now() - 30 * 60 * 1000)).length,
          totalMessages: allSessions.reduce((sum, s) => sum + s.messageCount, 0),
          averageResponseTime: this.calculateAverageResponseTime()
        },
        ragSystem: {
          totalDocuments: ragStats.totalDocuments,
          totalSearches: this.getTotalSearches(),
          averageSearchTime: this.getAverageSearchTime(),
          categories: ragStats.categories
        },
        tools: {
          totalTools: externalTools.length,
          toolUsage: this.getToolUsageStats(),
          errorRate: this.getErrorRate()
        },
        providers: {
          totalProviders: externalProviders.length,
          activeProviders: await this.getActiveProviderCount(),
          providerHealth: await this.getProviderHealth()
        },
        performance: {
          memoryUsage: this.getMemoryUsage(),
          cpuUsage: this.getCpuUsage(),
          uptime: Date.now() - this.startTime.getTime()
        }
      };

      this.metrics.push(metrics);
      
      // Keep only last 100 metrics entries
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      console.log('📊 System metrics collected:', {
        timestamp: metrics.timestamp,
        activeSessions: metrics.agentSystem.activeSessions,
        totalDocuments: metrics.ragSystem.totalDocuments,
        totalTools: metrics.tools.totalTools
      });
    } catch {
      console.error('Error collecting metrics:', error);
    }
  }

  private calculateAverageResponseTime(): number {
    // Mock calculation - in production, this would be based on actual response times
    return Math.random() * 1000 + 500; // 500-1500ms
  }

  private getTotalSearches(): number {
    // Mock calculation - in production, this would track actual searches
    return Math.floor(Math.random() * 1000) + 500;
  }

  private getAverageSearchTime(): number {
    // Mock calculation - in production, this would be based on actual search times
    return Math.random() * 100 + 50; // 50-150ms
  }

  private getToolUsageStats(): { [toolId: string]: number } {
    const stats: { [toolId: string]: number } = {};
    
    // Mock tool usage - in production, this would track actual usage
    const tools = [
      'market-analysis-external',
      'valuation-estimator-external',
      'business-plan-generator-external',
      'pitch-deck-generator-external',
      'kpi-dashboard-external',
      'enhanced-knowledge-search'
    ];

    tools.forEach(toolId => {
      stats[toolId] = Math.floor(Math.random() * 100) + 10;
    });

    return stats;
  }

  private getErrorRate(): number {
    // Mock error rate - in production, this would be based on actual errors
    return Math.random() * 0.05; // 0-5% error rate
  }

  private async getActiveProviderCount(): Promise<number> {
    const providers = this.externalService.getAllExternalProviders();
    let activeCount = 0;
    
    for (const provider of providers) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) activeCount++;
      } catch (error) {
        // Provider not available
      }
    }
    
    return activeCount;
  }

  private async getProviderHealth(): Promise<{ [providerId: string]: boolean }> {
    const providers = this.externalService.getAllExternalProviders();
    const health: { [providerId: string]: boolean } = {};
    
    for (const provider of providers) {
      try {
        health[provider.id] = await provider.isAvailable();
      } catch (error) {
        health[provider.id] = false;
      }
    }
    
    return health;
  }

  private getMemoryUsage(): number {
    // Mock memory usage - in production, use process.memoryUsage()
    return Math.random() * 100 + 50; // 50-150 MB
  }

  private getCpuUsage(): number {
    // Mock CPU usage - in production, use actual CPU monitoring
    return Math.random() * 50 + 10; // 10-60%
  }

  async getSystemMetrics(): Promise<SystemMetrics[]> {
    return [...this.metrics];
  }

  async getLatestMetrics(): Promise<SystemMetrics | null> {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  async getAgentPerformance(agentId: string): Promise<AgentPerformance | null> {
    return this.agentPerformance.get(agentId) || null;
  }

  async getAllAgentPerformance(): Promise<AgentPerformance[]> {
    return Array.from(this.agentPerformance.values());
  }

  async getToolAnalytics(toolId: string): Promise<ToolAnalytics | null> {
    return this.toolAnalytics.get(toolId) || null;
  }

  async getAllToolAnalytics(): Promise<ToolAnalytics[]> {
    return Array.from(this.toolAnalytics.values());
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    return this.userAnalytics.get(userId) || null;
  }

  async getAllUserAnalytics(): Promise<UserAnalytics[]> {
    return Array.from(this.userAnalytics.values());
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const latestMetrics = await this.getLatestMetrics();
    if (!latestMetrics) {
      return {
        status: 'critical',
        issues: ['No metrics available'],
        recommendations: ['Check system initialization']
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check agent system health
    if (latestMetrics.agentSystem.averageResponseTime > 2000) {
      issues.push('High response time detected');
      recommendations.push('Consider scaling or optimizing agent processing');
    }

    // Check RAG system health
    if (latestMetrics.ragSystem.totalDocuments === 0) {
      issues.push('No documents in knowledge base');
      recommendations.push('Initialize knowledge base with documents');
    }

    // Check tool health
    if (latestMetrics.tools.errorRate > 0.1) {
      issues.push('High tool error rate');
      recommendations.push('Investigate tool failures and improve error handling');
    }

    // Check provider health
    const activeProviders = latestMetrics.providers.activeProviders;
    const totalProviders = latestMetrics.providers.totalProviders;
    if (activeProviders < totalProviders) {
      issues.push(`${totalProviders - activeProviders} providers unavailable`);
      recommendations.push('Check provider connectivity and configuration');
    }

    // Check performance
    if (latestMetrics.performance.memoryUsage > 1000) {
      issues.push('High memory usage');
      recommendations.push('Consider memory optimization or scaling');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 2 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }

  async generateReport(): Promise<{
    summary: {
      totalUsers: number;
      totalSessions: number;
      totalMessages: number;
      systemUptime: number;
      averageResponseTime: number;
    };
    trends: {
      userGrowth: number;
      sessionGrowth: number;
      messageGrowth: number;
    };
    topTools: { toolId: string; usage: number }[];
    topAgents: { agentId: string; interactions: number }[];
    recommendations: string[];
  }> {
    const latestMetrics = await this.getLatestMetrics();
    const allUsers = await this.sessionManager.getAllUserProfiles();
    const allSessions = await this.sessionManager.getAllSessionAnalytics();
    const toolAnalytics = await this.getAllToolAnalytics();
    const agentPerformance = await this.getAllAgentPerformance();

    const summary = {
      totalUsers: allUsers.length,
      totalSessions: allSessions.length,
      totalMessages: allSessions.reduce((sum, s) => sum + s.messageCount, 0),
      systemUptime: latestMetrics?.performance.uptime || 0,
      averageResponseTime: latestMetrics?.agentSystem.averageResponseTime || 0
    };

    // Calculate trends (simplified)
    const trends = {
      userGrowth: Math.random() * 20 + 5, // 5-25% growth
      sessionGrowth: Math.random() * 30 + 10, // 10-40% growth
      messageGrowth: Math.random() * 40 + 15 // 15-55% growth
    };

    // Top tools
    const topTools = toolAnalytics
      .sort((a, b) => b.totalExecutions - a.totalExecutions)
      .slice(0, 5)
      .map(tool => ({ toolId: tool.toolId, usage: tool.totalExecutions }));

    // Top agents
    const topAgents = agentPerformance
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 5)
      .map(agent => ({ agentId: agent.agentId, interactions: agent.totalInteractions }));

    const recommendations = [
      'Monitor system performance regularly',
      'Consider adding more knowledge base documents',
      'Optimize tool response times',
      'Implement user feedback collection',
      'Scale infrastructure based on usage patterns'
    ];

    return {
      summary,
      trends,
      topTools,
      topAgents,
      recommendations
    };
  }

  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const data = {
      metrics: this.metrics,
      agentPerformance: Array.from(this.agentPerformance.values()),
      toolAnalytics: Array.from(this.toolAnalytics.values()),
      userAnalytics: Array.from(this.userAnalytics.values()),
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
