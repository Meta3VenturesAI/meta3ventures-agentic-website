import { AgentTool } from './types';

/**
 * pitchDeckTool
 *
 * Creates a simple pitch deck structure for a startup.  Each slide is
 * represented as an object with a title and bullet points.  Real
 * implementations should generate actual presentation files (e.g. via
 * PptxGenJS).  Here we return a JSON structure for demonstration.
 */

function generateProblemStatement(industry: string): string {
  const problems: Record<string, string> = {
    'ai': 'AI solutions are fragmented, expensive, and difficult to implement',
    'fintech': 'Traditional financial services are slow, expensive, and exclude many users',
    'healthcare': 'Healthcare systems are inefficient and lack patient-centric approaches',
    'saas': 'Business software is complex, expensive, and doesn\'t integrate well',
    'ecommerce': 'Small businesses lack affordable, easy-to-use ecommerce solutions',
    'default': 'Current solutions are inadequate, expensive, or difficult to use'
  };
  
  return problems[industry.toLowerCase()] || problems.default;
}

function getMarketSize(industry: string): string {
  const sizes: Record<string, string> = {
    'ai': '$207B globally, 20% CAGR',
    'fintech': '$162B globally, 16% CAGR',
    'healthcare': '$125B globally, 12% CAGR',
    'saas': '$195B globally, 18% CAGR',
    'ecommerce': '$4.9T globally, 11% CAGR',
    'default': 'Large and growing market with significant opportunity'
  };
  
  return sizes[industry.toLowerCase()] || sizes.default;
}

function getTargetSegments(industry: string): string {
  const segments: Record<string, string> = {
    'ai': 'Enterprise, SMBs, Developers',
    'fintech': 'Consumers, Small Businesses, Financial Institutions',
    'healthcare': 'Providers, Patients, Payers',
    'saas': 'SMBs, Enterprises, Teams',
    'ecommerce': 'Small Businesses, Online Retailers, Marketplaces',
    'default': 'Primary and secondary customer segments'
  };
  
  return segments[industry.toLowerCase()] || segments.default;
}

function getGrowthRate(industry: string): string {
  const rates: Record<string, string> = {
    'ai': '20% annually',
    'fintech': '16% annually',
    'healthcare': '12% annually',
    'saas': '18% annually',
    'ecommerce': '11% annually',
    'default': 'Strong growth trajectory'
  };
  
  return rates[industry.toLowerCase()] || rates.default;
}

function generateKeyMetrics(stage: string): string {
  const metrics: Record<string, string> = {
    'seed': 'User signups, pilot customers, product development milestones',
    'series-a': 'MRR growth, customer acquisition cost, churn rate',
    'series-b': 'ARR, customer lifetime value, market share',
    'growth': 'Revenue growth, profitability, market leadership'
  };
  
  return metrics[stage] || metrics['seed'];
}

function getRevenueStreams(industry: string): string {
  const streams: Record<string, string> = {
    'ai': 'Subscription, usage-based pricing, API access',
    'fintech': 'Transaction fees, subscription, premium features',
    'healthcare': 'Per-patient pricing, subscription, outcomes-based',
    'saas': 'Monthly/annual subscriptions, tiered features',
    'ecommerce': 'Commission, listing fees, premium services',
    'default': 'Multiple revenue streams based on value delivery'
  };
  
  return streams[industry.toLowerCase()] || streams.default;
}

function getPricingStrategy(industry: string): string {
  const strategies: Record<string, string> = {
    'ai': 'Value-based pricing with usage tiers',
    'fintech': 'Competitive pricing with volume discounts',
    'healthcare': 'Outcomes-based pricing model',
    'saas': 'Freemium with premium tiers',
    'ecommerce': 'Commission-based with flat fees',
    'default': 'Competitive pricing strategy'
  };
  
  return strategies[industry.toLowerCase()] || strategies.default;
}

function getUnitEconomics(stage: string): string {
  const economics: Record<string, string> = {
    'seed': 'Early stage - focusing on product-market fit',
    'series-a': 'Positive unit economics with growth focus',
    'series-b': 'Strong unit economics and scalability',
    'growth': 'Optimized unit economics and profitability'
  };
  
  return economics[stage] || economics['seed'];
}

function getUniqueValueProp(industry: string, product: string): string {
  return `Revolutionary ${product} that addresses key pain points in ${industry} with superior technology and user experience`;
}

function getCompetitiveMoats(industry: string): string {
  const moats: Record<string, string> = {
    'ai': 'Proprietary algorithms, data network effects, technical expertise',
    'fintech': 'Regulatory compliance, network effects, user trust',
    'healthcare': 'Clinical validation, regulatory approval, provider relationships',
    'saas': 'Integration ecosystem, switching costs, data insights',
    'ecommerce': 'Brand recognition, supplier relationships, logistics',
    'default': 'Technology, network effects, brand, and operational advantages'
  };
  
  return moats[industry.toLowerCase()] || moats.default;
}

function getTechDifferentiation(industry: string): string {
  const tech: Record<string, string> = {
    'ai': 'Advanced ML algorithms, real-time processing, edge computing',
    'fintech': 'Blockchain integration, real-time processing, security',
    'healthcare': 'AI diagnostics, telemedicine, data analytics',
    'saas': 'Cloud-native architecture, API-first design, automation',
    'ecommerce': 'AI recommendations, mobile-first, omnichannel',
    'default': 'Cutting-edge technology and innovative approaches'
  };
  
  return tech[industry.toLowerCase()] || tech.default;
}

function getHiringPlan(stage: string): string {
  const plans: Record<string, string> = {
    'seed': 'Core team of 5-10 people',
    'series-a': 'Scale to 20-30 people',
    'series-b': 'Expand to 50-100 people',
    'growth': 'Scale to 100+ people'
  };
  
  return plans[stage] || plans['seed'];
}

function getCurrentFinancials(stage: string): string {
  const financials: Record<string, string> = {
    'seed': 'Pre-revenue, focusing on product development',
    'series-a': 'Early revenue, $10K-100K MRR',
    'series-b': 'Growing revenue, $100K-1M MRR',
    'growth': 'Strong revenue, $1M+ MRR'
  };
  
  return financials[stage] || financials['seed'];
}

function getUseOfFunds(fundingAsk: number, stage: string): string {
  const percentages: Record<string, { product: number; team: number; marketing: number; operations: number }> = {
    'seed': { product: 40, team: 30, marketing: 20, operations: 10 },
    'series-a': { product: 30, team: 40, marketing: 25, operations: 5 },
    'series-b': { product: 20, team: 35, marketing: 35, operations: 10 },
    'growth': { product: 15, team: 30, marketing: 40, operations: 15 }
  };
  
  const allocation = percentages[stage] || percentages['seed'];
  const productAmount = Math.round(fundingAsk * allocation.product / 100);
  const teamAmount = Math.round(fundingAsk * allocation.team / 100);
  const marketingAmount = Math.round(fundingAsk * allocation.marketing / 100);
  const operationsAmount = Math.round(fundingAsk * allocation.operations / 100);
  
  return `Product development (${productAmount}K), Team expansion (${teamAmount}K), Marketing (${marketingAmount}K), Operations (${operationsAmount}K)`;
}

function getNext6Months(stage: string): string {
  const milestones: Record<string, string> = {
    'seed': 'Launch MVP, acquire first customers, validate product-market fit',
    'series-a': 'Scale user acquisition, improve product features, expand team',
    'series-b': 'Enter new markets, launch new products, scale operations',
    'growth': 'International expansion, strategic partnerships, prepare for next round'
  };
  
  return milestones[stage] || milestones['seed'];
}

function getNext12Months(stage: string): string {
  const milestones: Record<string, string> = {
    'seed': 'Achieve product-market fit, raise Series A, scale team',
    'series-a': 'Reach $1M ARR, expand to new markets, build partnerships',
    'series-b': 'Scale to $10M ARR, international expansion, prepare for Series C',
    'growth': 'Market leadership, IPO preparation, strategic acquisitions'
  };
  
  return milestones[stage] || milestones['seed'];
}

function getLongTermVision(industry: string): string {
  return `Become the leading ${industry} platform, transforming how businesses and consumers interact with ${industry} solutions globally`;
}

function generateKeyMessages(company: string, industry: string, product: string): string[] {
  return [
    `${company} is revolutionizing ${industry} with ${product}`,
    `Large and growing market opportunity in ${industry}`,
    `Strong traction and validation in early stages`,
    `Experienced team with deep ${industry} expertise`,
    `Clear path to profitability and market leadership`
  ];
}

export const pitchDeckTool: AgentTool = {
  id: 'pitch-deck-generator',
  name: 'Pitch Deck Generator',
  description: 'Creates a basic pitch deck outline for a startup.',
  category: 'document',
  parameters: {
    type: 'object',
    properties: {
      company: { 
        type: 'string', 
        description: 'Company name',
        required: true
      },
      industry: { 
        type: 'string', 
        description: 'Industry or sector',
        required: true
      },
      product: { 
        type: 'string', 
        description: 'Product or service description',
        required: true
      },
      traction: { 
        type: 'string', 
        description: 'Key traction metrics or milestones',
        required: true
      },
      fundingAsk: {
        type: 'number',
        description: 'Funding amount requested in thousands USD',
        default: 1000
      },
      stage: {
        type: 'string',
        description: 'Company stage (seed, series-a, etc.)',
        default: 'seed'
      }
    },
    required: ['company', 'industry', 'product', 'traction']
  },
  async execute({ company, industry, product, traction, fundingAsk = 1000, stage = 'seed' }: { 
    company: string; 
    industry: string; 
    product: string; 
    traction: string;
    fundingAsk?: number;
    stage?: string;
  }): Promise<any> {
    try {
      const pitchDeck = [
        { 
          title: `${company}: Introduction`, 
          bullets: [
            `Industry: ${industry}`,
            `Mission: Revolutionizing ${industry} through innovative ${product}`,
            `Vision: To become the leading ${industry} solution provider`
          ]
        },
        { 
          title: 'Problem & Solution', 
          bullets: [
            `Problem: ${generateProblemStatement(industry)}`,
            `Solution: ${product}`,
            `Why Now: Market timing and technology readiness`
          ]
        },
        { 
          title: 'Market Opportunity', 
          bullets: [
            `Market Size: ${getMarketSize(industry)}`,
            `Target Customer Segments: ${getTargetSegments(industry)}`,
            `Growth Rate: ${getGrowthRate(industry)}`
          ]
        },
        { 
          title: 'Traction & Validation', 
          bullets: [
            traction,
            `Stage: ${stage}`,
            `Key Metrics: ${generateKeyMetrics(stage)}`
          ]
        },
        { 
          title: 'Business Model', 
          bullets: [
            `Revenue Streams: ${getRevenueStreams(industry)}`,
            `Pricing Strategy: ${getPricingStrategy(industry)}`,
            `Unit Economics: ${getUnitEconomics(stage)}`
          ]
        },
        { 
          title: 'Competitive Advantage', 
          bullets: [
            `Unique Value Proposition: ${getUniqueValueProp(industry, product)}`,
            `Competitive Moats: ${getCompetitiveMoats(industry)}`,
            `Technology Differentiation: ${getTechDifferentiation(industry)}`
          ]
        },
        { 
          title: 'Team', 
          bullets: [
            `Founders: Experienced ${industry} professionals`,
            `Advisors: Industry experts and successful entrepreneurs`,
            `Hiring Plan: ${getHiringPlan(stage)}`
          ]
        },
        { 
          title: 'Financials & Ask', 
          bullets: [
            `Current Financials: ${getCurrentFinancials(stage)}`,
            `Funding Requirements: $${fundingAsk}K`,
            `Use of Funds: ${getUseOfFunds(fundingAsk, stage)}`
          ]
        },
        { 
          title: 'Roadmap & Milestones', 
          bullets: [
            `Next 6 Months: ${getNext6Months(stage)}`,
            `Next 12 Months: ${getNext12Months(stage)}`,
            `Long-term Vision: ${getLongTermVision(industry)}`
          ]
        }
      ];

      return {
        success: true,
        data: {
          company,
          industry: industry.toLowerCase(),
          stage,
          fundingAsk,
          slides: pitchDeck,
          totalSlides: pitchDeck.length,
          estimatedDuration: '10-15 minutes',
          keyMessages: generateKeyMessages(company, industry, product)
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