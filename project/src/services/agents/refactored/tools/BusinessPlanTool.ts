import { AgentTool } from './types';

/**
 * businessPlanTool
 *
 * Generates a basic business plan outline given a company name, industry and
 * product description.  In a real implementation, you could use a
 * language model to flesh out the sections or assemble a templated
 * document with rich formatting (e.g. PDF or DOCX).  Here we return a
 * plain object for demonstration purposes.
 */

function generateExecutiveSummary(company: string, industry: string, product: string, stage: string): string {
  return `${company} is an innovative ${industry} startup focused on delivering ${product} to its target market. We are in the ${stage} stage and seeking strategic partnerships and funding to accelerate our growth and market penetration.`;
}

function generateProblemStatement(industry: string, _product: string): string {
  const problems: Record<string, string> = {
    'ai': 'Current AI solutions are fragmented, expensive, and difficult to implement for small businesses.',
    'fintech': 'Traditional financial services are slow, expensive, and exclude underserved populations.',
    'healthcare': 'Healthcare systems are inefficient, costly, and lack patient-centric approaches.',
    'saas': 'Businesses struggle with complex, expensive software that doesn\'t integrate well.',
    'ecommerce': 'Small businesses lack affordable, easy-to-use ecommerce solutions.',
    'default': 'Current solutions in the market are inadequate, expensive, or difficult to use.'
  };
  
  return problems[industry.toLowerCase()] || problems.default;
}

function generateSolutionDescription(product: string, industry: string): string {
  return `Our solution ${product} addresses these challenges by providing a more efficient, cost-effective, and user-friendly alternative that specifically targets the ${industry} market.`;
}

function generateMarketAnalysis(industry: string): string {
  const marketSizes: Record<string, string> = {
    'ai': 'The AI market is valued at $207B globally with 20% annual growth.',
    'fintech': 'The fintech market is worth $162B with 16% annual growth.',
    'healthcare': 'The healthcare market is $125B with 12% annual growth.',
    'saas': 'The SaaS market is $195B with 18% annual growth.',
    'ecommerce': 'The ecommerce market is $4.9T with 11% annual growth.',
    'default': 'The target market shows significant growth potential with increasing demand.'
  };
  
  return marketSizes[industry.toLowerCase()] || marketSizes.default;
}

function generateBusinessModel(industry: string, _product: string): string {
  const models: Record<string, string> = {
    'ai': 'Subscription-based SaaS model with usage-based pricing tiers.',
    'fintech': 'Transaction-based revenue model with premium features.',
    'healthcare': 'B2B subscription model with per-patient pricing.',
    'saas': 'Monthly/annual subscription with tiered feature access.',
    'ecommerce': 'Commission-based model with premium listing options.',
    'default': 'Revenue model based on value delivered to customers.'
  };
  
  return models[industry.toLowerCase()] || models.default;
}

function generateGoToMarketStrategy(industry: string, stage: string): string {
  if (stage === 'idea') {
    return 'Focus on market validation through customer interviews, MVP development, and pilot programs.';
  } else if (stage === 'mvp') {
    return 'Launch beta program, gather user feedback, and refine product-market fit.';
  } else if (stage === 'early-revenue') {
    return 'Scale marketing efforts, expand sales team, and optimize conversion funnels.';
  } else {
    return 'Aggressive market expansion, strategic partnerships, and international growth.';
  }
}

function generateTeamSection(stage: string): string {
  if (stage === 'idea') {
    return 'Founding team with complementary skills in technology, business, and market expertise.';
  } else if (stage === 'mvp') {
    return 'Core team of 3-5 people with technical and business development capabilities.';
  } else {
    return 'Expanded team with dedicated roles in engineering, sales, marketing, and operations.';
  }
}

function generateFinancialProjections(fundingGoal: number, stage: string): string {
  const years = stage === 'idea' ? 3 : stage === 'mvp' ? 2 : 1;
  return `Revenue projections for ${years} years, showing path to profitability. Funding requirement: $${fundingGoal}K for ${stage} stage development and market entry.`;
}

function generateRiskAnalysis(industry: string, stage: string): string {
  return `Key risks include market competition, regulatory changes in ${industry}, technology adoption challenges, and execution risks at the ${stage} stage.`;
}

function generateMilestones(stage: string): string[] {
  const milestones: Record<string, string[]> = {
    'idea': [
      'Complete market research and validation',
      'Develop MVP prototype',
      'Secure initial funding',
      'Build founding team'
    ],
    'mvp': [
      'Launch beta version',
      'Acquire first 100 users',
      'Achieve product-market fit',
      'Raise Series A funding'
    ],
    'early-revenue': [
      'Reach $100K ARR',
      'Scale to 1,000 customers',
      'Expand to new markets',
      'Build strategic partnerships'
    ],
    'growth': [
      'Reach $1M ARR',
      'International expansion',
      'Series B funding',
      'Market leadership position'
    ]
  };
  
  return milestones[stage] || milestones['idea'];
}

function generateNextSteps(stage: string): string[] {
  const nextSteps: Record<string, string[]> = {
    'idea': [
      'Conduct detailed market research',
      'Develop business model canvas',
      'Create financial projections',
      'Identify potential investors'
    ],
    'mvp': [
      'Build and test MVP',
      'Gather user feedback',
      'Refine product features',
      'Prepare pitch deck'
    ],
    'early-revenue': [
      'Scale marketing efforts',
      'Hire key team members',
      'Optimize operations',
      'Plan next funding round'
    ],
    'growth': [
      'Expand to new markets',
      'Develop strategic partnerships',
      'Consider acquisition opportunities',
      'Plan for IPO or exit'
    ]
  };
  
  return nextSteps[stage] || nextSteps['idea'];
}

export const businessPlanTool: AgentTool = {
  id: 'business-plan-generator',
  name: 'Business Plan Generator',
  description: 'Generates a structured business plan outline for a given venture.',
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
        description: 'Brief description of the product or service',
        required: true
      },
      stage: {
        type: 'string',
        description: 'Company stage (idea, mvp, early-revenue, growth)',
        default: 'idea'
      },
      fundingGoal: {
        type: 'number',
        description: 'Funding goal in thousands USD',
        default: 1000
      }
    },
    required: ['company', 'industry', 'product']
  },
  async execute({ company, industry, product, stage = 'idea', fundingGoal = 1000 }: { 
    company: string; 
    industry: string; 
    product: string; 
    stage?: string;
    fundingGoal?: number;
  }): Promise<any> {
    try {
      const businessPlan = {
        company,
        industry: industry.toLowerCase(),
        stage,
        fundingGoal,
        executiveSummary: generateExecutiveSummary(company, industry, product, stage),
        problem: generateProblemStatement(industry, product),
        solution: generateSolutionDescription(product, industry),
        marketAnalysis: generateMarketAnalysis(industry),
        businessModel: generateBusinessModel(industry, product),
        goToMarket: generateGoToMarketStrategy(industry, stage),
        team: generateTeamSection(stage),
        financials: generateFinancialProjections(fundingGoal, stage),
        riskAnalysis: generateRiskAnalysis(industry, stage),
        milestones: generateMilestones(stage),
        nextSteps: generateNextSteps(stage)
      };

      return {
        success: true,
        data: businessPlan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};