import { AgentTool } from './types';

/**
 * Funding Calculator Tool - Calculates funding requirements and scenarios
 * Helps entrepreneurs understand their financial needs and funding options
 */

interface FundingScenario {
  stage: string;
  description: string;
  typicalRange: string;
  timeToRaise: string;
  keyMetrics: string[];
  investors: string[];
  useOfFunds: string[];
}

interface MonthlyBurnCalculation {
  month: number;
  teamCost: number;
  operationalCost: number;
  marketingCost: number;
  totalBurn: number;
  cumulativeBurn: number;
  runway: number;
}

function calculateMonthlyBurn(
  teamSize: number,
  avgSalary: number,
  operationalCosts: number,
  marketingBudget: number,
  months: number
): MonthlyBurnCalculation[] {
  const monthlyTeamCost = (teamSize * avgSalary) / 12;
  const monthlyOperational = operationalCosts / 12;
  const monthlyMarketing = marketingBudget / 12;
  const monthlyBurn = monthlyTeamCost + monthlyOperational + monthlyMarketing;

  const calculations: MonthlyBurnCalculation[] = [];
  let cumulativeBurn = 0;

  for (let month = 1; month <= months; month++) {
    cumulativeBurn += monthlyBurn;
    const remainingFunds = Math.max(0, (months * monthlyBurn) - cumulativeBurn);
    const runway = Math.ceil(remainingFunds / monthlyBurn);

    calculations.push({
      month,
      teamCost: monthlyTeamCost,
      operationalCost: monthlyOperational,
      marketingCost: monthlyMarketing,
      totalBurn: monthlyBurn,
      cumulativeBurn,
      runway
    });
  }

  return calculations;
}

function getFundingScenarios(): FundingScenario[] {
  return [
    {
      stage: 'Pre-Seed',
      description: 'Initial funding to validate idea and build MVP',
      typicalRange: '$50K - $500K',
      timeToRaise: '2-4 months',
      keyMetrics: ['Problem validation', 'Early customer interest', 'Team assembly'],
      investors: ['Friends & Family', 'Angel Investors', 'Pre-seed VCs', 'Accelerators'],
      useOfFunds: ['MVP development', 'Market research', 'Team formation', 'Initial marketing']
    },
    {
      stage: 'Seed',
      description: 'Product-market fit and initial traction funding',
      typicalRange: '$500K - $3M',
      timeToRaise: '3-6 months',
      keyMetrics: ['Product-market fit', 'Revenue growth', 'User engagement', 'Team scaling'],
      investors: ['Angel Investors', 'Seed VCs', 'Strategic Investors', 'Crowdfunding'],
      useOfFunds: ['Product development', 'Customer acquisition', 'Team expansion', 'Operations']
    },
    {
      stage: 'Series A',
      description: 'Scale proven business model with significant growth',
      typicalRange: '$3M - $15M',
      timeToRaise: '4-8 months',
      keyMetrics: ['$1M+ ARR', 'Strong unit economics', 'Market expansion', 'Proven scalability'],
      investors: ['Tier 1 VCs', 'Growth Equity', 'Strategic Partners', 'Corporate VCs'],
      useOfFunds: ['Market expansion', 'Product innovation', 'Sales & marketing', 'International growth']
    },
    {
      stage: 'Series B',
      description: 'Aggressive expansion and market leadership',
      typicalRange: '$15M - $50M',
      timeToRaise: '6-12 months',
      keyMetrics: ['$10M+ ARR', 'Market leadership', 'Operational efficiency', 'Path to profitability'],
      investors: ['Growth VCs', 'Late-stage funds', 'Strategic investors', 'Private equity'],
      useOfFunds: ['Geographic expansion', 'New product lines', 'Strategic acquisitions', 'Team scaling']
    }
  ];
}

function calculateValuation(
  stage: string,
  revenue: number,
  growthRate: number,
  industryMultiple: number
): { preMoneyValuation: number; postMoneyValuation: number; equityDilution: number } {
  let baseMultiple = industryMultiple;

  // Adjust multiple based on stage and growth
  if (stage === 'pre-seed') baseMultiple *= 0.5;
  else if (stage === 'seed') baseMultiple *= 0.7;
  else if (stage === 'series-a') baseMultiple *= 1.0;
  else if (stage === 'series-b') baseMultiple *= 1.2;

  // Growth rate adjustment
  if (growthRate > 100) baseMultiple *= 1.5;
  else if (growthRate > 50) baseMultiple *= 1.2;
  else if (growthRate < 20) baseMultiple *= 0.8;

  const preMoneyValuation = Math.max(revenue * baseMultiple, 1000000); // Minimum $1M valuation
  const typicalDilution = {
    'pre-seed': 0.15,
    'seed': 0.20,
    'series-a': 0.25,
    'series-b': 0.20
  };

  const equityDilution = typicalDilution[stage.toLowerCase() as keyof typeof typicalDilution] || 0.20;
  const postMoneyValuation = preMoneyValuation / (1 - equityDilution);

  return {
    preMoneyValuation,
    postMoneyValuation,
    equityDilution: equityDilution * 100
  };
}

function generateFundingStrategy(
  stage: string,
  amount: number,
  timeline: number,
  industry: string
): {
  approach: string[];
  timeline: string[];
  keyMessages: string[];
  materials: string[];
} {
  const strategies = {
    'pre-seed': {
      approach: [
        'Start with warm introductions through your network',
        'Apply to relevant accelerators and incubators',
        'Pitch to angel investors in your industry',
        'Consider revenue-based financing for early cash flow'
      ],
      timeline: [
        'Month 1: Prepare pitch deck and financial model',
        'Month 2: Network outreach and initial meetings',
        'Month 3: Due diligence and term sheet negotiations',
        'Month 4: Legal documentation and funding close'
      ],
      keyMessages: [
        'Problem is significant and well-understood',
        'Solution has early validation and user interest',
        'Team has relevant expertise and execution ability',
        'Market opportunity is large and accessible'
      ],
      materials: [
        '10-slide pitch deck',
        'Financial model with 3-year projections',
        'Product demo or prototype',
        'Customer validation evidence'
      ]
    },
    'seed': {
      approach: [
        'Target seed-stage VCs aligned with your industry',
        'Leverage existing investors for warm introductions',
        'Build relationships 6 months before fundraising',
        'Consider strategic investors who add value beyond capital'
      ],
      timeline: [
        'Month 1-2: Market preparation and investor research',
        'Month 3-4: Initial outreach and first meetings',
        'Month 5: Due diligence and term sheet negotiations',
        'Month 6: Legal documentation and closing'
      ],
      keyMessages: [
        'Product-market fit demonstrated with traction metrics',
        'Clear path to scalable revenue growth',
        'Experienced team with domain expertise',
        'Defensible competitive advantages'
      ],
      materials: [
        'Comprehensive pitch deck (15-20 slides)',
        'Detailed financial model and projections',
        'Product roadmap and technical architecture',
        'Customer case studies and testimonials'
      ]
    }
  };

  const defaultStrategy = strategies['seed'];
  return strategies[stage.toLowerCase() as keyof typeof strategies] || defaultStrategy;
}

export const fundingCalculatorTool: AgentTool = {
  id: 'funding-calculator',
  name: 'Funding Requirements Calculator',
  description: 'Calculates funding requirements, runway, and provides strategic fundraising guidance',
  category: 'financial',
  parameters: {
    type: 'object',
    properties: {
      companyName: {
        type: 'string',
        description: 'Company name',
        required: true
      },
      stage: {
        type: 'string',
        description: 'Funding stage (pre-seed, seed, series-a, series-b)',
        default: 'seed'
      },
      teamSize: {
        type: 'number',
        description: 'Current or planned team size',
        default: 5
      },
      avgSalary: {
        type: 'number',
        description: 'Average annual salary per team member',
        default: 80000
      },
      operationalCosts: {
        type: 'number',
        description: 'Annual operational costs (office, software, etc.)',
        default: 60000
      },
      marketingBudget: {
        type: 'number',
        description: 'Annual marketing and customer acquisition budget',
        default: 120000
      },
      currentRevenue: {
        type: 'number',
        description: 'Current annual recurring revenue',
        default: 0
      },
      growthRate: {
        type: 'number',
        description: 'Monthly growth rate percentage',
        default: 15
      },
      industryMultiple: {
        type: 'number',
        description: 'Industry revenue multiple for valuation',
        default: 8
      },
      timelineMonths: {
        type: 'number',
        description: 'Funding runway needed in months',
        default: 18
      }
    },
    required: ['companyName']
  },
  async execute({
    companyName,
    stage = 'seed',
    teamSize = 5,
    avgSalary = 80000,
    operationalCosts = 60000,
    marketingBudget = 120000,
    currentRevenue = 0,
    growthRate = 15,
    industryMultiple = 8,
    timelineMonths = 18
  }: {
    companyName: string;
    stage?: string;
    teamSize?: number;
    avgSalary?: number;
    operationalCosts?: number;
    marketingBudget?: number;
    currentRevenue?: number;
    growthRate?: number;
    industryMultiple?: number;
    timelineMonths?: number;
  }): Promise<any> {
    try {
      const monthlyBurn = calculateMonthlyBurn(teamSize, avgSalary, operationalCosts, marketingBudget, timelineMonths);
      const totalFundingNeeded = monthlyBurn[0].totalBurn * timelineMonths;
      const fundingScenarios = getFundingScenarios();
      const currentStageInfo = fundingScenarios.find(s => s.stage.toLowerCase().includes(stage.toLowerCase()));
      const valuation = calculateValuation(stage, currentRevenue, growthRate, industryMultiple);
      const fundingStrategy = generateFundingStrategy(stage, totalFundingNeeded, 6, 'tech');

      const fundingCalculation = {
        companyName,
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),

        burnAnalysis: {
          monthlyBurn: monthlyBurn[0].totalBurn,
          annualBurn: monthlyBurn[0].totalBurn * 12,
          breakdown: {
            teamCosts: `${((monthlyBurn[0].teamCost / monthlyBurn[0].totalBurn) * 100).toFixed(1)}%`,
            operations: `${((monthlyBurn[0].operationalCost / monthlyBurn[0].totalBurn) * 100).toFixed(1)}%`,
            marketing: `${((monthlyBurn[0].marketingCost / monthlyBurn[0].totalBurn) * 100).toFixed(1)}%`
          }
        },

        fundingRequirements: {
          totalNeeded: totalFundingNeeded,
          runwayMonths: timelineMonths,
          safetyBuffer: totalFundingNeeded * 0.2, // 20% buffer
          recommendedRaise: totalFundingNeeded * 1.2
        },

        valuation: {
          preMoney: valuation.preMoneyValuation,
          postMoney: valuation.postMoneyValuation,
          equityDilution: `${valuation.equityDilution.toFixed(1)}%`,
          impliedRaise: valuation.postMoneyValuation - valuation.preMoneyValuation
        },

        stageGuidance: currentStageInfo,

        fundraisingStrategy: fundingStrategy,

        monthlyProjections: monthlyBurn.slice(0, Math.min(12, timelineMonths)),

        keyRecommendations: [
          `Target raise: $${(totalFundingNeeded * 1.2).toLocaleString()} for ${timelineMonths + 6}-month runway`,
          `Focus on ${stage} stage investors who understand your industry`,
          `Prepare for 6-month fundraising process with proper documentation`,
          `Consider revenue-based financing if you have predictable cash flow`,
          `Build relationships with investors 6 months before you need funding`
        ],

        nextSteps: [
          'Finalize your financial model with detailed assumptions',
          'Create compelling pitch deck focused on traction and growth',
          'Prepare due diligence materials and legal documentation',
          'Research and prioritize target investors aligned with your stage',
          'Practice your pitch and refine your fundraising story'
        ]
      };

      return {
        success: true,
        data: fundingCalculation
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};