import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentMessage, AgentCapabilities, AgentResponse } from '../types';

export class CompetitiveIntelligenceAgent extends BaseAgent {
  constructor() {
    super({
      id: 'competitive-intelligence',
      name: 'Competitive Intelligence System',
      description: 'Provides market analysis, competitor insights, and strategic intelligence',
      specialties: [
        'Market analysis',
        'Competitor research',
        'Industry trends',
        'Strategic positioning',
        'SWOT analysis',
        'Market intelligence'
      ],
      tools: ['analysis', 'research', 'intelligence'],
      canHandle: (message: string) => {
        const triggers = [
          'competitor', 'competition', 'market analysis', 'industry trends',
          'competitive analysis', 'market research', 'swot', 'positioning',
          'market intelligence', 'industry insights', 'competitive landscape'
        ];
        
        const lowerMessage = message.toLowerCase();
        return triggers.some(trigger => lowerMessage.includes(trigger));
      },
      priority: 80
    });
  }

  override canHandle(message: string): boolean {
    const triggers = [
      'competitor', 'competition', 'market analysis', 'industry trends',
      'competitive analysis', 'market research', 'swot', 'positioning',
      'market intelligence', 'industry insights', 'competitive landscape'
    ];
    
    const lowerMessage = message.toLowerCase();
    return triggers.some(trigger => lowerMessage.includes(trigger));
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentMessage> {
    try {
      // Use LLM for sophisticated analysis
      if (this.enableLLM) {
        const response = await this.generateLLMResponse(
          message,
          `You are a competitive intelligence specialist. Analyze markets, competitors, and provide strategic insights. Focus on actionable intelligence and data-driven recommendations.`,
          context
        );
        
        return this.createResponse(
          response.content,
          this.getCapabilities().id,
          {
            confidence: response.confidence,
            attachments: [
              {
                type: 'link',
                title: '📊 Market Research Services',
                url: '/services'
              },
              {
                type: 'link', 
                title: '🎯 Strategic Consulting',
                url: '/contact'
              }
            ]
          }
        );
      }

      // Fallback structured responses
      const fallbackResponse = this.getFallbackResponse(message);
      return this.createResponse(
        fallbackResponse.content,
        this.getCapabilities().id,
        { confidence: fallbackResponse.confidence, attachments: fallbackResponse.attachments }
      );
      
    } catch (error) {
      console.error('CompetitiveIntelligenceAgent processing failed:', error);
      const fallbackResponse = this.getFallbackResponse(message);
      return this.createResponse(
        fallbackResponse.content,
        this.getCapabilities().id,
        { confidence: 0.5, error: (error as Error).message }
      );
    }
  }

  analyzeRequest(message: string): AgentResponse {
    const lowerMessage = message.toLowerCase();
    const keywords = ['competitor', 'market analysis', 'intelligence', 'research', 'swot', 'positioning'];
    const confidence = this.calculateConfidence(message, keywords);
    
    return this.formatResponse(
      `Analyzing competitive intelligence request: ${message.substring(0, 100)}...`,
      confidence
    );
  }

  getFallbackResponse(message: string): AgentResponse {
    return this.getStructuredResponse(message, {} as AgentContext);
  }

  private getStructuredResponse(message: string, _context: AgentContext): AgentResponse {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('competitor') || lowerMessage.includes('competitive analysis')) {
      return this.formatResponse(
        `I'll help you conduct comprehensive competitive analysis! Here's my systematic approach:

🎯 **Competitor Identification**
- Direct competitors (same product/service)
- Indirect competitors (alternative solutions)
- Emerging threats and disruptors

📊 **Analysis Framework**
- **Strengths & Weaknesses** - Product features, market position
- **Market Share** - Revenue, customer base, growth rates
- **Pricing Strategy** - Cost structure and positioning
- **Marketing Approach** - Channels, messaging, brand positioning

🔍 **Intelligence Gathering**
- Financial performance analysis
- Product roadmap investigation
- Customer feedback analysis
- Patent and IP landscape

📈 **Strategic Insights**
- Market gap identification
- Differentiation opportunities
- Competitive advantages to leverage
- Threat assessment and mitigation

Would you like me to focus on any specific aspect of competitive analysis?`,
        0.9,
        [
          {
            type: 'link',
            title: '📊 Request Analysis',
            url: '/contact'
          },
          {
            type: 'link',
            title: '🎯 Strategic Services',
            url: '/services'
          }
        ]
      );
    }

    if (lowerMessage.includes('market analysis') || lowerMessage.includes('market research')) {
      return this.formatResponse(
        `Excellent! Let me outline a comprehensive market analysis framework:

🌍 **Market Sizing & Segmentation**
- Total Addressable Market (TAM)
- Serviceable Addressable Market (SAM) 
- Serviceable Obtainable Market (SOM)
- Customer segmentation and personas

📈 **Growth & Trends Analysis**
- Historical market growth patterns
- Emerging technology impacts
- Regulatory changes and implications
- Economic factors and forecasting

🎯 **Customer Intelligence**
- Buying behavior patterns
- Decision-making processes
- Pain points and unmet needs
- Price sensitivity analysis

🚀 **Opportunity Assessment**
- Market entry strategies
- Blue ocean opportunities
- Partnership possibilities
- Innovation whitespace

Meta3Ventures leverages advanced analytics and AI tools to provide deep market insights for our portfolio companies.`,
        0.9,
        [
          {
            type: 'link',
            title: '🔬 Research Methodology',
            url: '/resources'
          }
        ]
      );
    }

    if (lowerMessage.includes('swot') || lowerMessage.includes('positioning')) {
      return this.formatResponse(
        `Let me help you develop strategic positioning through SWOT analysis:

💪 **Strengths Assessment**
- Core competencies and unique capabilities
- Technology advantages and IP portfolio
- Team expertise and market relationships
- Financial resources and runway

⚠️ **Weaknesses Identification**
- Resource constraints and capability gaps
- Market positioning challenges
- Operational limitations
- Competitive disadvantages

🌟 **Opportunities Mapping**
- Market trends and growth areas
- Technology convergence points
- Partnership and acquisition targets
- Regulatory changes creating advantage

🔺 **Threats Analysis**
- Competitive threats and new entrants
- Technology disruption risks
- Market saturation concerns
- Economic and regulatory risks

🎯 **Strategic Positioning**
- Differentiation strategy development
- Value proposition refinement
- Go-to-market optimization
- Competitive moat building

This forms the foundation for strategic decision-making and resource allocation.`,
        0.9,
        [
          {
            type: 'link',
            title: '🎯 Strategic Planning',
            url: '/services'
          }
        ]
      );
    }

    // Default competitive intelligence response
    return this.formatResponse(
      `As your Competitive Intelligence specialist, I provide:

🔍 **Market Intelligence**
- Comprehensive competitor analysis
- Market trends and opportunities
- Industry landscape mapping

📊 **Strategic Analysis**
- SWOT analysis and positioning
- Market entry strategies
- Competitive advantage identification

🎯 **Actionable Insights**
- Investment opportunities
- Partnership recommendations
- Risk assessment and mitigation

💡 **AI-Powered Research**
- Advanced analytics and data mining
- Real-time market monitoring
- Predictive trend analysis

What specific market intelligence do you need to drive your strategic decisions?`,
      0.8,
      [
        {
          type: 'link',
          title: '📊 Request Analysis',
          url: '/contact'
        },
        {
          type: 'link',
          title: '🎯 View Case Studies',
          url: '/portfolio'
        }
      ]
    );
  }
}