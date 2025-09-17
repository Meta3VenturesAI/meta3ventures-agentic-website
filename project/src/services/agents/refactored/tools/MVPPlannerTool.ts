import { AgentTool } from './types';

/**
 * MVP Planner Tool - Generates detailed MVP development plan
 * Helps entrepreneurs create a strategic approach to building their minimum viable product
 */

interface MVPFeature {
  name: string;
  priority: 'Critical' | 'Important' | 'Nice-to-have';
  effort: 'Low' | 'Medium' | 'High';
  description: string;
  userValue: string;
}

interface MVPPhase {
  name: string;
  duration: string;
  features: string[];
  milestones: string[];
  resources: string[];
}

function generateCoreFeatures(productType: string, targetMarket: string): MVPFeature[] {
  const featureDatabase: { [key: string]: MVPFeature[] } = {
    'saas': [
      {
        name: 'User Authentication',
        priority: 'Critical',
        effort: 'Medium',
        description: 'Secure user registration, login, and account management',
        userValue: 'Access to personalized experience and data security'
      },
      {
        name: 'Core Dashboard',
        priority: 'Critical',
        effort: 'High',
        description: 'Main interface showing key metrics and navigation',
        userValue: 'Central hub for all platform activities'
      },
      {
        name: 'Basic Analytics',
        priority: 'Important',
        effort: 'Medium',
        description: 'Essential metrics and reporting functionality',
        userValue: 'Data-driven insights for decision making'
      },
      {
        name: 'API Integration',
        priority: 'Important',
        effort: 'High',
        description: 'Connect with third-party services and data sources',
        userValue: 'Seamless workflow integration'
      },
      {
        name: 'Mobile Responsiveness',
        priority: 'Important',
        effort: 'Medium',
        description: 'Optimized experience across all devices',
        userValue: 'Access anywhere, anytime'
      }
    ],
    'marketplace': [
      {
        name: 'Product Listings',
        priority: 'Critical',
        effort: 'High',
        description: 'Create, edit, and display product/service listings',
        userValue: 'Showcase offerings to potential customers'
      },
      {
        name: 'Search & Filters',
        priority: 'Critical',
        effort: 'Medium',
        description: 'Find relevant products quickly and efficiently',
        userValue: 'Save time finding exactly what they need'
      },
      {
        name: 'Messaging System',
        priority: 'Critical',
        effort: 'Medium',
        description: 'Direct communication between buyers and sellers',
        userValue: 'Build trust and clarify requirements'
      },
      {
        name: 'Payment Processing',
        priority: 'Critical',
        effort: 'High',
        description: 'Secure transaction handling and escrow services',
        userValue: 'Safe and convenient payment experience'
      },
      {
        name: 'Rating & Reviews',
        priority: 'Important',
        effort: 'Medium',
        description: 'Trust system for buyers and sellers',
        userValue: 'Make informed decisions based on peer feedback'
      }
    ],
    'mobile-app': [
      {
        name: 'Onboarding Flow',
        priority: 'Critical',
        effort: 'Medium',
        description: 'Smooth introduction and setup process',
        userValue: 'Quick start and clear value proposition'
      },
      {
        name: 'Core Functionality',
        priority: 'Critical',
        effort: 'High',
        description: 'Primary feature that solves the main user problem',
        userValue: 'Direct solution to their specific need'
      },
      {
        name: 'Push Notifications',
        priority: 'Important',
        effort: 'Medium',
        description: 'Relevant updates and engagement triggers',
        userValue: 'Stay informed and engaged with the service'
      },
      {
        name: 'Offline Capability',
        priority: 'Important',
        effort: 'High',
        description: 'Basic functionality without internet connection',
        userValue: 'Reliable access regardless of connectivity'
      },
      {
        name: 'Social Integration',
        priority: 'Nice-to-have',
        effort: 'Medium',
        description: 'Share content and invite friends',
        userValue: 'Enhanced social experience and viral growth'
      }
    ]
  };

  return featureDatabase[productType.toLowerCase()] || featureDatabase['saas'];
}

function generateDevelopmentPhases(features: MVPFeature[], timeline: number): MVPPhase[] {
  const criticalFeatures = features.filter(f => f.priority === 'Critical');
  const importantFeatures = features.filter(f => f.priority === 'Important');

  const phases: MVPPhase[] = [
    {
      name: 'Phase 1: Core Foundation',
      duration: `${Math.ceil(timeline * 0.4)} weeks`,
      features: criticalFeatures.slice(0, 2).map(f => f.name),
      milestones: [
        'User authentication system implemented',
        'Basic core functionality working',
        'Development environment set up',
        'Initial testing framework established'
      ],
      resources: ['1 Senior Developer', '1 UI/UX Designer', 'Project Manager']
    },
    {
      name: 'Phase 2: Essential Features',
      duration: `${Math.ceil(timeline * 0.4)} weeks`,
      features: [...criticalFeatures.slice(2), ...importantFeatures.slice(0, 1)].map(f => f.name),
      milestones: [
        'All critical features implemented',
        'Integration testing completed',
        'Performance optimization done',
        'Security audit passed'
      ],
      resources: ['2 Developers', '1 QA Engineer', 'DevOps Support']
    },
    {
      name: 'Phase 3: Polish & Launch',
      duration: `${Math.ceil(timeline * 0.2)} weeks`,
      features: importantFeatures.slice(1).map(f => f.name),
      milestones: [
        'User acceptance testing completed',
        'Launch infrastructure ready',
        'Analytics and monitoring deployed',
        'MVP launched to beta users'
      ],
      resources: ['Full Development Team', 'Marketing Support', 'Customer Success']
    }
  ];

  return phases;
}

function generateTechnicalStack(productType: string, budget: number): {
  frontend: string[];
  backend: string[];
  database: string[];
  hosting: string[];
  tools: string[];
} {
  if (budget < 10000) {
    return {
      frontend: ['React', 'Tailwind CSS', 'Vite'],
      backend: ['Node.js', 'Express', 'Serverless Functions'],
      database: ['SQLite', 'Supabase (Free Tier)'],
      hosting: ['Vercel/Netlify', 'GitHub'],
      tools: ['VS Code', 'GitHub Actions', 'Figma (Free)']
    };
  } else if (budget < 50000) {
    return {
      frontend: ['React/Vue', 'TypeScript', 'Styled Components'],
      backend: ['Node.js/Python', 'PostgreSQL', 'Redis'],
      database: ['PostgreSQL', 'MongoDB Atlas'],
      hosting: ['AWS/GCP (Basic)', 'Docker', 'CI/CD Pipeline'],
      tools: ['Linear/Jira', 'Figma Pro', 'Monitoring Tools']
    };
  } else {
    return {
      frontend: ['React/Vue', 'TypeScript', 'Micro-frontends'],
      backend: ['Node.js/Python/Go', 'Microservices', 'API Gateway'],
      database: ['PostgreSQL', 'Redis', 'Elasticsearch'],
      hosting: ['AWS/GCP (Enterprise)', 'Kubernetes', 'Multi-region'],
      tools: ['Full DevOps Suite', 'Advanced Monitoring', 'Security Tools']
    };
  }
}

export const mvpPlannerTool: AgentTool = {
  id: 'mvp-planner',
  name: 'MVP Development Planner',
  description: 'Creates a comprehensive MVP development plan with features, timeline, and resource requirements',
  category: 'planning',
  parameters: {
    type: 'object',
    properties: {
      productName: {
        type: 'string',
        description: 'Name of the product/startup',
        required: true
      },
      productType: {
        type: 'string',
        description: 'Type of product (saas, marketplace, mobile-app, web-app)',
        default: 'saas'
      },
      targetMarket: {
        type: 'string',
        description: 'Primary target market or user segment',
        required: true
      },
      timeline: {
        type: 'number',
        description: 'Desired timeline in weeks',
        default: 12
      },
      budget: {
        type: 'number',
        description: 'Development budget in USD',
        default: 25000
      },
      teamSize: {
        type: 'number',
        description: 'Available team size',
        default: 3
      }
    },
    required: ['productName', 'targetMarket']
  },
  async execute({
    productName,
    productType = 'saas',
    targetMarket,
    timeline = 12,
    budget = 25000,
    teamSize = 3
  }: {
    productName: string;
    productType?: string;
    targetMarket: string;
    timeline?: number;
    budget?: number;
    teamSize?: number;
  }): Promise<any> {
    try {
      const coreFeatures = generateCoreFeatures(productType, targetMarket);
      const developmentPhases = generateDevelopmentPhases(coreFeatures, timeline);
      const techStack = generateTechnicalStack(productType, budget);

      const mvpPlan = {
        productName,
        productType,
        targetMarket,
        timeline: `${timeline} weeks`,
        budget: `$${budget.toLocaleString()}`,
        teamSize,

        executiveSummary: `MVP development plan for ${productName}, a ${productType} solution targeting ${targetMarket}. The plan outlines a ${timeline}-week development cycle with a budget of $${budget.toLocaleString()} and a team of ${teamSize} people.`,

        coreFeatures: coreFeatures.map(feature => ({
          ...feature,
          estimatedWeeks: feature.effort === 'High' ? 3 : feature.effort === 'Medium' ? 2 : 1
        })),

        developmentPhases,

        technicalStack: techStack,

        riskMitigation: [
          'Start with critical features only to validate core assumptions',
          'Implement user feedback loops early in development',
          'Plan for 20% timeline buffer for unexpected challenges',
          'Focus on one platform/channel initially',
          'Establish clear success metrics before launch'
        ],

        successMetrics: [
          'User acquisition: 100 active users in first month',
          'User engagement: 30% weekly active user retention',
          'Feature adoption: 70% of users use core functionality',
          'Performance: <2 second load time, 99% uptime',
          'Feedback: Net Promoter Score (NPS) > 50'
        ],

        nextSteps: [
          'Finalize technical architecture and infrastructure setup',
          'Create detailed user stories and acceptance criteria',
          'Set up development environment and CI/CD pipeline',
          'Begin Phase 1 development with core authentication system',
          'Establish user testing protocol for continuous validation'
        ]
      };

      return {
        success: true,
        data: mvpPlan
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};