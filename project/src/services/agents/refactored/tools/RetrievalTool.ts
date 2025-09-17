import { AgentTool } from './types';

/**
 * retrievalTool
 *
 * A simple semantic search tool for agents.  It accepts a query string and
 * returns an array of "snippets" representing the most relevant
 * documents in your knowledge base.  The actual retrieval logic should
 * be implemented using a vector store (e.g. Supabase vector, Chroma).
 * For now, this is a placeholder implementation.
 */

function generateMockSnippets(query: string, topK: number, category: string): Array<{
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  source: string;
  category: string;
}> {
  const lowerQuery = query.toLowerCase();
  
  // Mock knowledge base entries
  const knowledgeBase = [
    {
      id: 'meta3-investment-criteria',
      title: 'Meta3Ventures Investment Criteria',
      content: 'Meta3Ventures focuses on early-stage investments in AI, blockchain, and emerging technologies. Investment Range: $100K - $2M. Stage: Pre-seed to Series A. Sectors: AI/ML, Blockchain, FinTech, SaaS, HealthTech.',
      category: 'investment',
      keywords: ['investment', 'criteria', 'ai', 'blockchain', 'funding', 'startup']
    },
    {
      id: 'ai-market-trends-2024',
      title: 'AI Market Trends 2024',
      content: 'Key AI market trends for 2024: 1. Generative AI Enterprise Adoption - 60% of enterprises implementing GenAI solutions. 2. AI Infrastructure Investment - $50B+ in AI infrastructure spending. 3. Regulatory Development - EU AI Act implementation.',
      category: 'market-research',
      keywords: ['ai', 'trends', '2024', 'market', 'generative', 'enterprise']
    },
    {
      id: 'startup-funding-stages',
      title: 'Startup Funding Stages Guide',
      content: 'Comprehensive guide to startup funding stages: PRE-SEED ($50K - $500K) - Validate product-market fit. SEED ($500K - $3M) - Proven traction and initial revenue. SERIES A ($3M - $15M) - Strong revenue growth and market validation.',
      category: 'funding',
      keywords: ['funding', 'stages', 'startup', 'seed', 'series-a', 'investment']
    },
    {
      id: 'business-plan-structure',
      title: 'Business Plan Structure',
      content: 'A strong business plan should include: Executive Summary, Market Analysis, Business Model, Product/Service Description, Team, Financial Projections, and Go-to-Market Strategy.',
      category: 'business-planning',
      keywords: ['business', 'plan', 'structure', 'executive', 'summary', 'market']
    },
    {
      id: 'pitch-deck-essentials',
      title: 'Pitch Deck Essentials',
      content: 'Essential pitch deck slides: Problem & Solution, Market Opportunity, Traction, Business Model, Team, Financials & Ask, and Roadmap. Keep it concise and compelling.',
      category: 'pitch-deck',
      keywords: ['pitch', 'deck', 'slides', 'presentation', 'investor', 'funding']
    },
    {
      id: 'valuation-methods',
      title: 'Startup Valuation Methods',
      content: 'Common startup valuation methods: Revenue Multiples (3-15x depending on industry), DCF Analysis, Comparable Company Analysis, and Risk-Adjusted NPV. Consider growth rate, market size, and competitive position.',
      category: 'valuation',
      keywords: ['valuation', 'methods', 'revenue', 'multiples', 'dcf', 'startup']
    },
    {
      id: 'kpi-metrics-startup',
      title: 'Key Startup Metrics',
      content: 'Important startup metrics: ARR (Annual Recurring Revenue), MRR (Monthly Recurring Revenue), CAC (Customer Acquisition Cost), LTV (Lifetime Value), Churn Rate, and Runway. Monitor these regularly for business health.',
      category: 'metrics',
      keywords: ['kpi', 'metrics', 'arr', 'mrr', 'cac', 'ltv', 'churn']
    },
    {
      id: 'market-validation-strategies',
      title: 'Market Validation Strategies',
      content: 'Effective market validation strategies: Customer interviews (30-50 minimum), Landing page validation, Pre-order campaigns, Pilot programs, A/B testing, and MVP testing. Focus on real customer feedback.',
      category: 'validation',
      keywords: ['market', 'validation', 'customer', 'interviews', 'mvp', 'testing']
    }
  ];

  // Filter by category if specified
  const filteredBase = category === 'all' 
    ? knowledgeBase 
    : knowledgeBase.filter(item => item.category === category);

  // Calculate relevance scores based on keyword matching
  const scoredItems = filteredBase.map(item => {
    let relevanceScore = 0;
    const queryWords = lowerQuery.split(/\s+/);
    
    // Check for keyword matches
    queryWords.forEach(word => {
      if (item.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
        relevanceScore += 1;
      }
      if (item.title.toLowerCase().includes(word)) {
        relevanceScore += 2;
      }
      if (item.content.toLowerCase().includes(word)) {
        relevanceScore += 1;
      }
    });

    return {
      ...item,
      relevanceScore
    };
  });

  // Sort by relevance score and return top K results
  const sortedItems = scoredItems
    .filter(item => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);

  // If no matches found, return some general results
  if (sortedItems.length === 0) {
    return knowledgeBase.slice(0, Math.min(topK, 3)).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      relevanceScore: 0.1,
      source: 'knowledge-base',
      category: item.category
    }));
  }

  return sortedItems.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    relevanceScore: item.relevanceScore,
    source: 'knowledge-base',
    category: item.category
  }));
}

export const retrievalTool: AgentTool = {
  id: 'knowledge-base-search',
  name: 'Knowledge Base Search',
  description: 'Searches the internal knowledge base and returns relevant passages for grounding answers.',
  category: 'information',
  parameters: {
    type: 'object',
    properties: {
      query: { 
        type: 'string', 
        description: 'The search query string',
        required: true
      },
      topK: { 
        type: 'integer', 
        description: 'Number of results to return',
        default: 3
      },
      category: {
        type: 'string',
        description: 'Knowledge category to search in',
        default: 'all'
      }
    },
    required: ['query']
  },
  async execute({ query, topK = 3, category = 'all' }: { 
    query: string; 
    topK?: number; 
    category?: string;
  }): Promise<any> {
    try {
      console.log(`🔍 retrievalTool called with query="${query}", topK=${topK}, category="${category}"`);
      
      // TODO: integrate your vector store here; for now return dummy data
      // This is a placeholder implementation that should be replaced with actual vector search
      
      // Simulate search results based on query keywords
      const snippets = generateMockSnippets(query, topK, category);
      
      return {
        success: true,
        data: {
          query,
          category,
          snippets,
          totalResults: snippets.length,
          searchTime: Math.random() * 100 + 50, // Mock search time in ms
          metadata: {
            source: 'knowledge-base',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
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