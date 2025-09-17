import { AgentTool } from '../types';

/**
 * marketAnalysisTool
 *
 * Provides basic market size and growth information for a given industry.  It
 * uses a small embedded dataset derived from public reports.  In a
 * production environment you should replace this with a call to a real
 * market intelligence API (e.g. CB Insights, Crunchbase, Statista) via
 * fetch().
 */
const marketData: Record<string, { size: number; growth: number; currency: string }> = {
  'ai': { size: 207, growth: 0.2, currency: 'USD' },           // $207B in 2023, 20% CAGR
  'fintech': { size: 162, growth: 0.16, currency: 'USD' },     // $162B in 2023, 16% CAGR
  'healthcare': { size: 125, growth: 0.12, currency: 'USD' },  // $125B in 2023, 12% CAGR
  'gaming': { size: 185, growth: 0.09, currency: 'USD' },      // $185B in 2023, 9% CAGR
  'blockchain': { size: 19, growth: 0.58, currency: 'USD' }    // $19B in 2023, 58% CAGR
};

export const marketAnalysisTool: AgentTool = {
  id: 'market-analysis',
  name: 'Market Analysis',
  description: 'Returns estimated market size and growth for a given industry.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      industry: { type: 'string', description: 'The industry name (e.g. ai, fintech, healthcare)' }
    },
    required: ['industry']
  },
  async execute({ industry }: { industry: string }): Promise<{ size: number; growth: number; currency: string }> {
    const key = industry.toLowerCase();
    const data = marketData[key];
    if (!data) {
      throw new Error(`No market data available for industry '${industry}'.`);
    }
    return data;
  }
};