// Types for the Multi-Agent Competitive Intelligence System

export interface ResearchAgent {
  id: string;
  name: string;
  role: 'orchestrator' | 'market' | 'competitor' | 'customer' | 'usp' | 'differentiation';
  status: 'idle' | 'working' | 'completed' | 'error';
  currentTask?: string;
  progress?: number;
  findings?: AgentFinding[];
}

export interface AgentFinding {
  id: string;
  agentId: string;
  type: 'insight' | 'data' | 'recommendation' | 'warning' | 'opportunity';
  category: string;
  content: string;
  confidence: number; // 0-100
  sources?: string[];
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CompetitorProfile {
  id: string;
  name: string;
  website?: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  marketShare?: number;
  funding?: {
    total: number;
    lastRound: string;
    investors: string[];
  };
  products: {
    name: string;
    description: string;
    pricing?: string;
    features: string[];
  }[];
  positioning: string;
  targetMarket: string[];
  keyDifferentiators: string[];
}

export interface MarketAnalysis {
  marketSize: {
    tam: number; // Total Addressable Market
    sam: number; // Serviceable Addressable Market
    som: number; // Serviceable Obtainable Market
  };
  growthRate: number;
  trends: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
    timeframe: string;
  }[];
  segments: {
    name: string;
    size: number;
    growth: number;
    attractiveness: number; // 1-10
  }[];
  barriers: {
    type: 'entry' | 'exit' | 'switching';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export interface USPCanvas {
  targetCustomer: {
    demographics: string[];
    psychographics: string[];
    painPoints: string[];
    jobs: string[];
  };
  valueProposition: {
    headline: string;
    subheadline: string;
    uniqueBenefits: string[];
    emotionalBenefits: string[];
    functionalBenefits: string[];
  };
  differentiators: {
    feature: string;
    competitorComparison: {
      competitor: string;
      theirOffering: string;
      ourAdvantage: string;
    }[];
    proofPoints: string[];
  }[];
  positioning: {
    statement: string;
    category: string;
    forWho: string;
    uniqueBecause: string;
    unlike: string;
  };
}

export interface SWOTAnalysis {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

export interface SWOTItem {
  id: string;
  description: string;
  impact: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  likelihood?: 1 | 2 | 3 | 4 | 5; // For opportunities and threats
  actionItems?: string[];
  category?: string;
}

export interface CompetitiveLandscape {
  dimensions: {
    x: { label: string; min: number; max: number };
    y: { label: string; min: number; max: number };
  };
  players: {
    name: string;
    x: number;
    y: number;
    size: number; // Bubble size representing market share or revenue
    color: string;
    isUs?: boolean;
  }[];
  quadrants?: {
    name: string;
    description: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface ResearchSession {
  id: string;
  companyName: string;
  industry: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'initializing' | 'researching' | 'analyzing' | 'synthesizing' | 'completed';
  agents: ResearchAgent[];
  findings: AgentFinding[];
  competitors: CompetitorProfile[];
  marketAnalysis?: MarketAnalysis;
  uspCanvas?: USPCanvas;
  swot?: SWOTAnalysis;
  landscape?: CompetitiveLandscape;
  recommendations: {
    category: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    rationale: string;
    expectedImpact: string;
    timeframe: string;
    resources: string[];
  }[];
}

export interface ResearchRequest {
  companyName: string;
  industry: string;
  currentDescription?: string;
  targetMarket?: string;
  mainCompetitors?: string[];
  currentUSP?: string;
  researchDepth: 'quick' | 'standard' | 'comprehensive';
  focusAreas?: ('market' | 'competitors' | 'customers' | 'positioning' | 'differentiation')[];
}