import { AgentTool } from '../types';

/**
 * metricsLogger
 *
 * Captures metrics for each agent interaction and provides summary
 * statistics.  This is a simple in-memory logger; you should replace it
 * with persistent logging (e.g. Supabase, BigQuery) in production.
 */

interface InteractionRecord {
  timestamp: Date;
  agentId: string;
  userId: string;
  message: string;
  responseTimeMs: number;
  success: boolean;
  tokensUsed?: number;
}

class MetricsLogger {
  private records: InteractionRecord[] = [];

  log(record: InteractionRecord): void {
    this.records.push(record);
  }

  getSummary(): unknown {
    const total = this.records.length;
    const byAgent: Record<string, { count: number; avgResponse: number }> = {};
    for (const rec of this.records) {
      const stats = byAgent[rec.agentId] || { count: 0, avgResponse: 0 };
      stats.count += 1;
      stats.avgResponse += rec.responseTimeMs;
      byAgent[rec.agentId] = stats;
    }
    // Compute average response time
    for (const id of Object.keys(byAgent)) {
      byAgent[id].avgResponse = byAgent[id].avgResponse / byAgent[id].count;
    }
    return {
      totalInteractions: total,
      byAgent
    };
  }
}

export const metricsLogger = new MetricsLogger();