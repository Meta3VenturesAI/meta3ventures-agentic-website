import { AgentTool } from './types';

/**
 * kpiDashboardTool
 *
 * Generates a simple KPI dashboard summary from input metrics.  Returns
 * analysis and suggested next steps.  This stub does not create visual
 * charts but provides the data necessary to do so.  In a full
 * implementation, you could generate charts with a charting library.
 */

function calculateLTV(arr: number, churn: number): number {
  // LTV = ARR / (Churn Rate * Number of Customers)
  // Assuming average customer count based on ARR
  const estimatedCustomers = Math.max(1, arr * 1000000 / 10000); // Assume $10K ARPU
  return (arr * 1000000) / (churn * estimatedCustomers);
}

function generateAnalysis(arr: number, growth: number, churn: number, cac: number, runway: number, ltv: number, ltvCacRatio: number, paybackPeriod: number, _industry: string): string[] {
  const analysis: string[] = [];
  
  // Growth analysis
  if (growth < 0.1) {
    analysis.push('Growth is below typical startup benchmarks; consider optimizing marketing and product-market fit.');
  } else if (growth > 0.3) {
    analysis.push('Growth is strong; ensure infrastructure and team can scale accordingly.');
  } else {
    analysis.push('Growth is healthy and sustainable for current stage.');
  }
  
  // Churn analysis
  if (churn > 0.2) {
    analysis.push('Churn is high; invest in customer success and product improvements.');
  } else if (churn < 0.05) {
    analysis.push('Churn is excellent; focus on scaling and growth.');
  } else {
    analysis.push('Churn is within acceptable range; monitor trends closely.');
  }
  
  // CAC analysis
  if (cac > 5000) {
    analysis.push('CAC is high; revisit acquisition channels and optimize conversion funnels.');
  } else if (cac < 1000) {
    analysis.push('CAC is low; consider scaling acquisition efforts.');
  } else {
    analysis.push('CAC is reasonable; focus on scaling efficient channels.');
  }
  
  // Runway analysis
  if (runway < 6) {
    analysis.push('Runway is short; prioritize fundraising or cost reduction immediately.');
  } else if (runway < 12) {
    analysis.push('Runway is adequate but plan for next funding round.');
  } else {
    analysis.push('Runway is healthy; focus on growth and efficiency.');
  }
  
  // LTV:CAC analysis
  if (ltvCacRatio < 3) {
    analysis.push('LTV:CAC ratio is low; improve customer value or reduce acquisition costs.');
  } else if (ltvCacRatio > 5) {
    analysis.push('LTV:CAC ratio is excellent; scale acquisition efforts.');
  } else {
    analysis.push('LTV:CAC ratio is healthy; optimize for efficiency and growth.');
  }
  
  // Payback period analysis
  if (paybackPeriod > 12) {
    analysis.push('Payback period is long; focus on improving unit economics.');
  } else if (paybackPeriod < 6) {
    analysis.push('Payback period is excellent; scale acquisition efforts.');
  } else {
    analysis.push('Payback period is reasonable; monitor and optimize.');
  }
  
  return analysis;
}

function generateRecommendations(arr: number, growth: number, churn: number, cac: number, runway: number, ltvCacRatio: number, _paybackPeriod: number, _industry: string): string[] {
  const recommendations: string[] = [];
  
  // Growth recommendations
  if (growth < 0.1) {
    recommendations.push('Focus on product-market fit and customer feedback');
    recommendations.push('Experiment with different marketing channels');
    recommendations.push('Consider pivoting or refining value proposition');
  } else if (growth > 0.3) {
    recommendations.push('Scale infrastructure and team to support growth');
    recommendations.push('Implement systems and processes for scale');
    recommendations.push('Consider raising additional funding for growth');
  }
  
  // Churn recommendations
  if (churn > 0.2) {
    recommendations.push('Implement customer success program');
    recommendations.push('Improve onboarding and user experience');
    recommendations.push('Add customer feedback loops and support');
  }
  
  // CAC recommendations
  if (cac > 5000) {
    recommendations.push('Optimize conversion funnels and landing pages');
    recommendations.push('Test different acquisition channels');
    recommendations.push('Improve targeting and messaging');
  }
  
  // Runway recommendations
  if (runway < 6) {
    recommendations.push('Start fundraising process immediately');
    recommendations.push('Implement cost reduction measures');
    recommendations.push('Focus on revenue-generating activities');
  } else if (runway < 12) {
    recommendations.push('Prepare for next funding round');
    recommendations.push('Optimize burn rate and efficiency');
    recommendations.push('Build relationships with potential investors');
  }
  
  // LTV:CAC recommendations
  if (ltvCacRatio < 3) {
    recommendations.push('Increase customer lifetime value through upselling');
    recommendations.push('Reduce customer acquisition costs');
    recommendations.push('Improve product stickiness and engagement');
  }
  
  return recommendations;
}

function getIndustryBenchmarks(industry: string): Record<string, any> {
  const benchmarks: Record<string, Record<string, any>> = {
    'saas': {
      growth: { good: 0.2, excellent: 0.3 },
      churn: { good: 0.05, excellent: 0.02 },
      ltvCac: { good: 3, excellent: 5 },
      paybackPeriod: { good: 12, excellent: 6 }
    },
    'fintech': {
      growth: { good: 0.15, excellent: 0.25 },
      churn: { good: 0.08, excellent: 0.04 },
      ltvCac: { good: 2.5, excellent: 4 },
      paybackPeriod: { good: 15, excellent: 8 }
    },
    'ecommerce': {
      growth: { good: 0.1, excellent: 0.2 },
      churn: { good: 0.1, excellent: 0.05 },
      ltvCac: { good: 2, excellent: 3 },
      paybackPeriod: { good: 18, excellent: 10 }
    },
    'healthcare': {
      growth: { good: 0.12, excellent: 0.2 },
      churn: { good: 0.06, excellent: 0.03 },
      ltvCac: { good: 3.5, excellent: 5 },
      paybackPeriod: { good: 14, excellent: 8 }
    },
    'default': {
      growth: { good: 0.15, excellent: 0.25 },
      churn: { good: 0.07, excellent: 0.04 },
      ltvCac: { good: 3, excellent: 5 },
      paybackPeriod: { good: 12, excellent: 6 }
    }
  };
  
  return benchmarks[industry.toLowerCase()] || benchmarks['default'];
}

function calculateHealthScore(arr: number, growth: number, churn: number, cac: number, runway: number, ltvCacRatio: number): number {
  let score = 0;
  
  // Growth score (0-25 points)
  if (growth >= 0.3) score += 25;
  else if (growth >= 0.2) score += 20;
  else if (growth >= 0.1) score += 15;
  else if (growth >= 0.05) score += 10;
  else score += 5;
  
  // Churn score (0-25 points)
  if (churn <= 0.02) score += 25;
  else if (churn <= 0.05) score += 20;
  else if (churn <= 0.1) score += 15;
  else if (churn <= 0.15) score += 10;
  else score += 5;
  
  // LTV:CAC score (0-25 points)
  if (ltvCacRatio >= 5) score += 25;
  else if (ltvCacRatio >= 3) score += 20;
  else if (ltvCacRatio >= 2) score += 15;
  else if (ltvCacRatio >= 1) score += 10;
  else score += 5;
  
  // Runway score (0-25 points)
  if (runway >= 24) score += 25;
  else if (runway >= 18) score += 20;
  else if (runway >= 12) score += 15;
  else if (runway >= 6) score += 10;
  else score += 5;
  
  return Math.min(100, Math.max(0, score));
}

function generateAlerts(arr: number, growth: number, churn: number, cac: number, runway: number, ltvCacRatio: number, paybackPeriod: number): string[] {
  const alerts: string[] = [];
  
  if (runway < 3) {
    alerts.push('🚨 CRITICAL: Runway less than 3 months - immediate action required');
  } else if (runway < 6) {
    alerts.push('⚠️ WARNING: Runway less than 6 months - start fundraising');
  }
  
  if (churn > 0.2) {
    alerts.push('⚠️ WARNING: High churn rate - focus on retention');
  }
  
  if (ltvCacRatio < 1) {
    alerts.push('🚨 CRITICAL: LTV:CAC ratio below 1 - unsustainable unit economics');
  } else if (ltvCacRatio < 2) {
    alerts.push('⚠️ WARNING: Low LTV:CAC ratio - improve unit economics');
  }
  
  if (paybackPeriod > 24) {
    alerts.push('⚠️ WARNING: Long payback period - optimize acquisition efficiency');
  }
  
  if (growth < 0.05) {
    alerts.push('⚠️ WARNING: Low growth rate - review strategy and execution');
  }
  
  return alerts;
}

export const kpiDashboardTool: AgentTool = {
  id: 'kpi-dashboard',
  name: 'KPI Dashboard',
  description: 'Analyzes key metrics and provides commentary and benchmarks.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      arr: { 
        type: 'number', 
        description: 'Annual recurring revenue (ARR) in millions USD',
        required: true
      },
      growth: { 
        type: 'number', 
        description: 'Growth rate (0.2 = 20%)',
        required: true
      },
      churn: { 
        type: 'number', 
        description: 'Customer churn rate (0.1 = 10%)',
        required: true
      },
      cac: { 
        type: 'number', 
        description: 'Customer acquisition cost in USD',
        required: true
      },
      runway: { 
        type: 'number', 
        description: 'Runway remaining in months',
        required: true
      },
      ltv: {
        type: 'number',
        description: 'Customer lifetime value in USD',
        default: 0
      },
      industry: {
        type: 'string',
        description: 'Industry for benchmarking',
        default: 'saas'
      }
    },
    required: ['arr', 'growth', 'churn', 'cac', 'runway']
  },
  async execute({ arr, growth, churn, cac, runway, ltv = 0, industry = 'saas' }: { 
    arr: number; 
    growth: number; 
    churn: number; 
    cac: number; 
    runway: number;
    ltv?: number;
    industry?: string;
  }): Promise<any> {
    try {
      // Calculate LTV if not provided
      const calculatedLtv = ltv || calculateLTV(arr, churn);
      
      // Calculate LTV:CAC ratio
      const ltvCacRatio = calculatedLtv / cac;
      
      // Calculate payback period
      const paybackPeriod = cac / (arr * 1000000 / 12); // Convert ARR to monthly revenue
      
      // Generate analysis
      const analysis = generateAnalysis(arr, growth, churn, cac, runway, calculatedLtv, ltvCacRatio, paybackPeriod, industry);
      
      // Generate recommendations
      const recommendations = generateRecommendations(arr, growth, churn, cac, runway, ltvCacRatio, paybackPeriod, industry);
      
      // Generate benchmarks
      const benchmarks = getIndustryBenchmarks(industry);
      
      return {
        success: true,
        data: {
          metrics: {
            arr,
            growth: growth * 100, // Convert to percentage
            churn: churn * 100, // Convert to percentage
            cac,
            runway,
            ltv: calculatedLtv,
            ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
            paybackPeriod: Math.round(paybackPeriod * 100) / 100
          },
          analysis,
          recommendations,
          benchmarks,
          healthScore: calculateHealthScore(arr, growth, churn, cac, runway, ltvCacRatio),
          alerts: generateAlerts(arr, growth, churn, cac, runway, ltvCacRatio, paybackPeriod)
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