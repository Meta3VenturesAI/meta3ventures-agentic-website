import { AgentTool } from '../types';

/**
 * kpiDashboardTool
 *
 * Generates a simple KPI dashboard summary from input metrics.  Returns
 * analysis and suggested next steps.  This stub does not create visual
 * charts but provides the data necessary to do so.  In a full
 * implementation, you could generate charts with a charting library.
 */
export const kpiDashboardTool: AgentTool = {
  id: 'kpi-dashboard',
  name: 'KPI Dashboard',
  description: 'Analyzes key metrics and provides commentary and benchmarks.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      arr: { type: 'number', description: 'Annual recurring revenue (ARR) in millions USD' },
      growth: { type: 'number', description: 'Growth rate (0.2 = 20%)' },
      churn: { type: 'number', description: 'Customer churn rate (0.1 = 10%)' },
      cac: { type: 'number', description: 'Customer acquisition cost in USD' },
      runway: { type: 'number', description: 'Runway remaining in months' }
    },
    required: ['arr', 'growth', 'churn', 'cac', 'runway']
  },
  async execute({ arr, growth, churn, cac, runway }: { arr: number; growth: number; churn: number; cac: number; runway: number }): Promise<any> {
    const commentary: string[] = [];
    if (growth < 0.1) commentary.push('Growth is below typical startup benchmarks; consider optimizing marketing.');
    else if (growth > 0.3) commentary.push('Growth is strong; ensure infrastructure scales.');
    if (churn > 0.2) commentary.push('Churn is high; invest in customer success.');
    if (cac > 5000) commentary.push('CAC is high; revisit acquisition channels.');
    if (runway < 6) commentary.push('Runway is short; prioritize fundraising or cost reduction.');

    return {
      arr,
      growth,
      churn,
      cac,
      runway,
      commentary
    };
  }
};