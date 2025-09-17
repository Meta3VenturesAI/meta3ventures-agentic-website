/**
 * Agent Tools System - Extensible tools and knowledge base for agents
 * Enhanced with new business tools from external implementation
 */

import { AgentTool } from './tools/types';
import { ExternalIntegrationService } from './ExternalIntegrationService';

// Re-export AgentTool for compatibility
export type { AgentTool } from './tools/types';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
  relevanceScore?: number;
}

export class AgentToolsSystem {
  private static instance: AgentToolsSystem;
  private tools: Map<string, AgentTool> = new Map();
  private knowledgeBase: Map<string, KnowledgeItem> = new Map();

  static getInstance(): AgentToolsSystem {
    if (!AgentToolsSystem.instance) {
      AgentToolsSystem.instance = new AgentToolsSystem();
      AgentToolsSystem.instance.initializeDefaultTools().catch(error =>
        console.warn('Tool initialization failed:', error)
      );
      AgentToolsSystem.instance.initializeKnowledgeBase();
    }
    return AgentToolsSystem.instance;
  }

  private async initializeDefaultTools(): Promise<void> {
    // Initialize external integration service
    const externalService = ExternalIntegrationService.getInstance();

    // Register external tools (these are the real implementations)
    const externalTools = externalService.getAllExternalTools();
    externalTools.forEach(tool => {
      this.registerTool(tool);
    });

    // Register specialized venture building tools
    try {
      const { businessPlanTool } = await import('./tools/BusinessPlanTool');
      const { mvpPlannerTool } = await import('./tools/MVPPlannerTool');
      const { fundingCalculatorTool } = await import('./tools/FundingCalculatorTool');

      this.registerTool(businessPlanTool);
      this.registerTool(mvpPlannerTool);
      this.registerTool(fundingCalculatorTool);

      console.log(`✅ Registered ${externalTools.length + 3} tools (${externalTools.length} external + 3 venture tools)`);
    } catch (error) {
      console.warn('Failed to load some venture building tools:', error);
      console.log(`✅ Registered ${externalTools.length} external tools`);
    }
  }

  private initializeKnowledgeBase(): void {
    const knowledge: KnowledgeItem[] = [
      {
        id: 'meta3-investment-criteria',
        title: 'Meta3Ventures Investment Criteria',
        content: `Meta3Ventures focuses on early-stage investments in AI, blockchain, and emerging technologies. 
        
        Investment Range: $100K - $2M
        Stage: Pre-seed to Series A
        Sectors: AI/ML, Blockchain, FinTech, SaaS, HealthTech
        
        Key Criteria:
        - Strong technical team with domain expertise
        - Scalable technology solution
        - Clear market opportunity ($1B+ TAM)
        - Defensible competitive moat
        - Proven early traction or validation
        
        Geographic Focus: North America, Europe, select APAC markets
        
        Investment Process:
        1. Initial screening (2 weeks)
        2. Due diligence (4-6 weeks)
        3. Investment committee review (1 week)
        4. Term sheet and closing (2-3 weeks)`,
        category: 'investment',
        tags: ['criteria', 'process', 'requirements'],
        lastUpdated: new Date()
      },
      {
        id: 'ai-market-trends-2024',
        title: 'AI Market Trends 2024',
        content: `Key AI market trends for 2024:
        
        1. Generative AI Enterprise Adoption
        - 60% of enterprises implementing GenAI solutions
        - Focus on productivity and automation
        - Average ROI: 15-25% in first year
        
        2. AI Infrastructure Investment
        - $50B+ in AI infrastructure spending
        - GPU shortage driving innovation
        - Edge AI deployment growing 40% YoY
        
        3. Regulatory Development
        - EU AI Act implementation
        - US federal AI guidelines
        - Industry self-regulation initiatives
        
        4. Vertical AI Solutions
        - Healthcare AI: $45B market
        - Financial AI: $35B market  
        - Manufacturing AI: $28B market
        
        5. AI Talent Market
        - 300% increase in AI job postings
        - Average salary: $180K-$300K
        - Skills gap driving education initiatives`,
        category: 'market-research',
        tags: ['ai', 'trends', '2024', 'market'],
        lastUpdated: new Date()
      },
      {
        id: 'startup-funding-stages',
        title: 'Startup Funding Stages Guide',
        content: `Comprehensive guide to startup funding stages:
        
        PRE-SEED ($50K - $500K)
        - Validate product-market fit
        - Build MVP and initial team
        - Typical investors: Angels, micro-VCs
        - Equity: 10-20%
        
        SEED ($500K - $3M)
        - Proven traction and initial revenue
        - Scale team and operations
        - Typical investors: Seed funds, strategic angels
        - Equity: 15-25%
        
        SERIES A ($3M - $15M)
        - Strong revenue growth and market validation
        - Scale go-to-market and expand team
        - Typical investors: VCs, growth funds
        - Equity: 20-30%
        
        SERIES B ($15M - $50M)
        - Proven business model and market leadership
        - Geographic expansion and new products
        - Typical investors: Growth VCs, strategics
        - Equity: 15-25%
        
        Key Metrics by Stage:
        - Seed: $10K+ MRR, 20% monthly growth
        - Series A: $100K+ MRR, product-market fit
        - Series B: $1M+ MRR, clear path to profitability`,
        category: 'funding',
        tags: ['funding', 'stages', 'investment', 'startup'],
        lastUpdated: new Date()
      }
    ];

    knowledge.forEach(item => this.knowledgeBase.set(item.id, item));
  }

  // Register a new tool
  registerTool(tool: AgentTool): void {
    this.tools.set(tool.id, tool);
  }

  // Get available tools for an agent
  getToolsForAgent(agentId: string): AgentTool[] {
    // Get external tools first
    const externalService = ExternalIntegrationService.getInstance();
    const externalTools = externalService.getToolsForAgent(agentId);

    // Add specialized M3VC tools for venture-launch agent
    const agentSpecificTools: { [key: string]: string[] } = {
      'venture-launch': [
        'business-plan-generator',
        'mvp-planner',
        'funding-calculator'
      ]
    };

    const toolIds = agentSpecificTools[agentId] || [];
    const specializedTools: AgentTool[] = [];

    for (const toolId of toolIds) {
      const tool = this.tools.get(toolId);
      if (tool) {
        specializedTools.push(tool);
      }
    }

    return [...externalTools, ...specializedTools];
  }

  // Execute a tool
  async executeTool(toolId: string, parameters: unknown, context?: unknown): Promise<any> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    try {
      return await tool.execute(parameters);
    } catch (error) {
      console.error(`Tool execution failed for ${toolId}:`, error);
      throw error;
    }
  }

  // Add knowledge item
  addKnowledge(item: KnowledgeItem): void {
    this.knowledgeBase.set(item.id, item);
  }

  // Search knowledge base
  searchKnowledge(query: string, category?: string): KnowledgeItem[] {
    const results: KnowledgeItem[] = [];
    const queryLower = query.toLowerCase();

    for (const item of this.knowledgeBase.values()) {
      if (category && item.category !== category) continue;

      let relevanceScore = 0;
      
      // Title match
      if (item.title.toLowerCase().includes(queryLower)) {
        relevanceScore += 10;
      }

      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        relevanceScore += 5;
      }

      // Tag match
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(queryLower)) {
          relevanceScore += 3;
        }
      }

      if (relevanceScore > 0) {
        results.push({ ...item, relevanceScore });
      }
    }

    return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  // Get all knowledge categories
  getKnowledgeCategories(): string[] {
    const categories = new Set<string>();
    for (const item of this.knowledgeBase.values()) {
      categories.add(item.category);
    }
    return Array.from(categories);
  }

}

export const agentToolsSystem = AgentToolsSystem.getInstance();
