import { AgentTool } from './types';

/**
 * valuationTool
 *
 * Estimates a startup's valuation using simple revenue multiples.
 * Inputs: industry, annual revenue (USD), and year‑over‑year growth rate.
 * Returns: an estimated valuation range (low/high).  Industry multiples are
 * drawn from public market comparables as of 2024.  Replace this with
 * calls to a financial data provider for production use.
 */

const valuationMultiples: Record<string, number> = {
  'ai': 10,
  'fintech': 12,
  'healthcare': 8,
  'gaming': 7,
  'blockchain': 15,
  'saas': 11,
  'ecommerce': 6,
  'cybersecurity': 9,
  'edtech': 8,
  'cleantech': 13,
  'default': 8
};

function getStageMultiplier(stage: string): number {
  const multipliers: Record<string, number> = {
    'seed': 0.6,
    'series-a': 1.0,
    'series-b': 1.2,
    'series-c': 1.4,
    'growth': 1.1,
    'late-stage': 1.3
  };
  return multipliers[stage.toLowerCase()] || 1.0;
}

function generateValuationInsights(industry: string, revenue: number, growth: number, stage: string, multiplier: number): string[] {
  const insights: string[] = [];
  
  if (multiplier > 15) {
    insights.push('Very high valuation multiple - consider market conditions and competitive landscape');
  } else if (multiplier > 10) {
    insights.push('High valuation multiple - strong growth prospects expected');
  } else if (multiplier < 5) {
    insights.push('Conservative valuation multiple - may indicate market challenges or early stage');
  }
  
  if (growth > 0.5) {
    insights.push('Exceptional growth rate - premium valuation justified');
  } else if (growth < 0.1) {
    insights.push('Low growth rate - valuation may be challenged');
  }
  
  if (revenue > 100) {
    insights.push('Significant revenue base - established market position');
  } else if (revenue < 1) {
    insights.push('Early revenue stage - focus on growth metrics and market validation');
  }
  
  return insights;
}

export const valuationTool: AgentTool = {
  id: 'valuation-estimator',
  name: 'Valuation Estimator',
  description: 'Estimates company valuation based on revenue, growth and industry multiples.',
  category: 'finance',
  parameters: {
    type: 'object',
    properties: {
      industry: { 
        type: 'string', 
        description: 'Industry (e.g. ai, fintech)',
        required: true
      },
      revenue: { 
        type: 'number', 
        description: 'Annual revenue in millions USD',
        required: true
      },
      growth: { 
        type: 'number', 
        description: 'Year‑over‑year growth rate (0.2 = 20%)',
        required: true
      },
      stage: {
        type: 'string',
        description: 'Company stage (seed, series-a, series-b, etc.)',
        default: 'series-a'
      }
    },
    required: ['industry', 'revenue', 'growth']
  },
  async execute({ industry, revenue, growth, stage = 'series-a' }: { 
    industry: string; 
    revenue: number; 
    growth: number; 
    stage?: string;
  }): Promise<any> {
    try {
      const mult = valuationMultiples[industry.toLowerCase()] || valuationMultiples.default;
      
      // Adjust multiple slightly based on growth rate (higher growth → higher multiple)
      const adjustedMult = mult * (1 + growth);
      
      // Apply stage-based adjustments
      const stageMultiplier = getStageMultiplier(stage);
      const finalMultiplier = adjustedMult * stageMultiplier;
      
      const baseValuation = revenue * finalMultiplier;
      
      // Provide a range +/- 20%
      const low = parseFloat((baseValuation * 0.8).toFixed(2));
      const high = parseFloat((baseValuation * 1.2).toFixed(2));
      
      return {
        success: true,
        data: {
          industry: industry.toLowerCase(),
          revenue,
          growth: growth * 100, // Convert to percentage
          stage,
          baseValuation: Math.round(baseValuation),
          valuationRange: { low, high },
          methodology: {
            industryMultiple: mult,
            growthAdjustment: growth,
            stageAdjustment: stageMultiplier,
            finalMultiple: finalMultiplier
          },
          insights: generateValuationInsights(industry, revenue, growth, stage, finalMultiplier)
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