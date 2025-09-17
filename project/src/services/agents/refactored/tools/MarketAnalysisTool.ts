import { AgentTool } from './types';

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
  'blockchain': { size: 19, growth: 0.58, currency: 'USD' },   // $19B in 2023, 58% CAGR
  'saas': { size: 195, growth: 0.18, currency: 'USD' },        // $195B in 2023, 18% CAGR
  'ecommerce': { size: 4.9, growth: 0.11, currency: 'USD' },   // $4.9T in 2023, 11% CAGR
  'cybersecurity': { size: 155, growth: 0.13, currency: 'USD' }, // $155B in 2023, 13% CAGR
  'edtech': { size: 89, growth: 0.15, currency: 'USD' },       // $89B in 2023, 15% CAGR
  'cleantech': { size: 1.4, growth: 0.25, currency: 'USD' }    // $1.4T in 2023, 25% CAGR
};

function generateInsights(industry: string, data: { size: number; growth: number; currency: string }): string[] {
  const insights: string[] = [];
  
  if (data.growth > 0.2) {
    insights.push('High growth sector with significant investment opportunities');
  }
  
  if (data.size > 100) {
    insights.push('Large market size indicates strong demand and competition');
  }
  
  if (industry === 'ai') {
    insights.push('AI market is experiencing rapid expansion due to enterprise adoption');
  } else if (industry === 'blockchain') {
    insights.push('Blockchain market shows highest growth rate but smaller current size');
  } else if (industry === 'fintech') {
    insights.push('Fintech sector benefits from digital transformation trends');
  }
  
  return insights;
}

export const marketAnalysisTool: AgentTool = {
  id: 'market-analysis',
  name: 'Market Analysis',
  description: 'Returns estimated market size and growth for a given industry.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      industry: { 
        type: 'string', 
        description: 'The industry name (e.g. ai, fintech, healthcare)',
        required: true
      },
      region: {
        type: 'string',
        description: 'Geographic region for analysis',
        default: 'global'
      }
    },
    required: ['industry']
  },
  async execute({ industry, region = 'global' }: { industry: string; region?: string }): Promise<any> {
    try {
      const key = industry.toLowerCase();
      const data = marketData[key];
      
      if (!data) {
        // Return a more helpful response for unknown industries
        const availableIndustries = Object.keys(marketData).join(', ');
        return {
          success: false,
          error: `No market data available for industry '${industry}'. Available industries: ${availableIndustries}`,
          availableIndustries: Object.keys(marketData)
        };
      }

      // Calculate projected market size for next 5 years
      const projectedSize = data.size * Math.pow(1 + data.growth, 5);
      
      return {
        success: true,
        data: {
          industry: key,
          region,
          currentSize: data.size,
          growthRate: data.growth,
          currency: data.currency,
          projectedSize2028: Math.round(projectedSize),
          marketTrend: data.growth > 0.2 ? 'High Growth' : data.growth > 0.1 ? 'Moderate Growth' : 'Stable',
          keyInsights: generateInsights(key, data)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};