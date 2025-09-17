import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentMessage, AgentCapabilities, AgentResponse } from '../types';

export class VentureLaunchAgent extends BaseAgent {
  constructor() {
    super({
      id: 'venture-launch',
      name: 'Venture Launch Builder',
      description: 'Specializes in venture creation, business planning, and startup development',
      specialties: [
        'Business plan development',
        'Market validation',
        'Go-to-market strategy',
        'Product-market fit',
        'Startup guidance',
        'MVP development'
      ],
      tools: ['analysis', 'strategy', 'planning'],
      canHandle: (message: string) => {
        const triggers = [
          'business plan', 'startup', 'venture', 'launch', 'mvp',
          'product-market fit', 'go-to-market', 'market validation',
          'business model', 'startup advice', 'entrepreneurship',
          'venture building', 'founder', 'founding', 'build company',
          'idea validation', 'customer development', 'lean startup',
          'pitch deck', 'fundraising', 'seed funding', 'incubator',
          'accelerator', 'business development', 'startup strategy',
          'prototype', 'minimum viable', 'scalability', 'growth strategy'
        ];

        const lowerMessage = message.toLowerCase();
        return triggers.some(trigger => lowerMessage.includes(trigger));
      },
      priority: 85
    }, {
      preferredModel: 'qwen2.5:latest',
      preferredProvider: 'ollama',
      enableLLM: true
    });
  }

  override canHandle(message: string): boolean {
    const triggers = [
      'business plan', 'startup', 'venture', 'launch', 'mvp',
      'product-market fit', 'go-to-market', 'market validation',
      'business model', 'startup advice', 'entrepreneurship'
    ];
    
    const lowerMessage = message.toLowerCase();
    return triggers.some(trigger => lowerMessage.includes(trigger));
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentMessage> {
    try {
      // Use LLM for sophisticated responses
      if (this.enableLLM) {
        const response = await this.generateLLMResponse(
          message,
          this.getSystemPrompt(),
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
                title: '🚀 Apply for Partnership',
                url: '/apply'
              },
              {
                type: 'link', 
                title: '📊 View Portfolio',
                url: '/portfolio'
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
      console.error('VentureLaunchAgent processing failed:', error);
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
    const keywords = ['business plan', 'startup', 'venture', 'launch', 'mvp', 'market validation'];
    const confidence = this.calculateConfidence(message, keywords);
    
    return this.formatResponse(
      `Analyzing venture launch request: ${message.substring(0, 100)}...`,
      confidence
    );
  }

  getFallbackResponse(message: string): AgentResponse {
    return this.getStructuredResponse(message, {} as AgentContext);
  }

  private getStructuredResponse(message: string, _context: AgentContext): AgentResponse {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('business plan')) {
      return this.formatResponse(
        `🚀 **Business Plan Development with M3VC Framework**

I can generate a comprehensive business plan using proven venture building methodologies! Here's what I'll create for you:

**📋 Structured Business Plan Includes:**
• **Executive Summary** - Vision, value proposition, and key highlights
• **Market Analysis** - TAM/SAM/SOM modeling and competitive landscape
• **Business Model Canvas** - Revenue streams and unit economics
• **Go-to-Market Strategy** - Customer acquisition and scaling approach
• **Financial Projections** - 3-year revenue, costs, and funding requirements
• **Risk Analysis** - Key challenges and mitigation strategies
• **Team Structure** - Organizational design and key hires
• **Milestone Timeline** - Critical achievements and success metrics

**🛠️ To Generate Your Business Plan, I Need:**
1. **Company Name** and brief description
2. **Industry/Sector** (AI, FinTech, SaaS, etc.)
3. **Product/Service** overview
4. **Stage** (idea, MVP, early revenue, growth)
5. **Funding Goal** (optional)

**Example:** "Generate a business plan for TechFlow, an AI-powered project management SaaS targeting mid-market companies in the construction industry, currently in MVP stage seeking $500K seed funding."

**💡 I can also help with:**
- MVP development planning with technical specifications
- Funding requirements and investment scenarios
- Market validation strategies and customer development
- Financial modeling with burn rate and runway calculations

Ready to build your venture? Share your company details and I'll create a tailored business plan using the M3VC methodology!`,
        0.95,
        [
          {
            type: 'link',
            title: '🚀 Apply for M3VC Partnership',
            url: '/apply'
          },
          {
            type: 'link',
            title: '📞 Book Strategy Session',
            url: '/contact'
          }
        ]
      );
    }

    if (lowerMessage.includes('mvp') || lowerMessage.includes('minimum viable product')) {
      return this.formatResponse(
        `Great question about MVP development! Here's my approach for building an effective MVP:

🎯 **Define Core Value Proposition**
- Identify the single most important problem you're solving
- Focus on essential features only

⚡ **Rapid Prototyping Strategy**
- Build → Measure → Learn cycle
- User feedback integration from day one
- Technical debt management

📊 **Validation Metrics**
- User engagement and retention
- Product-market fit indicators
- Revenue validation (if applicable)

🚀 **Launch Strategy**
- Beta user recruitment
- Feedback collection systems
- Iteration planning

Meta3Ventures has extensive experience helping startups build successful MVPs. We provide both technical guidance and market validation support.`,
        0.9,
        [
          {
            type: 'link',
            title: '🏗️ Our Development Process',
            url: '/services'
          }
        ]
      );
    }

    if (lowerMessage.includes('market validation')) {
      return this.formatResponse(
        `Market validation is crucial for startup success! Here's a systematic approach:

🔍 **Research Phase**
- Customer interviews (minimum 30-50)
- Competitor analysis and positioning
- Market size estimation (TAM, SAM, SOM)

📊 **Testing Methods**
- Landing page validation
- Pre-order campaigns
- Pilot programs with early customers
- A/B testing for key features

📈 **Success Metrics**
- Customer acquisition cost (CAC)
- Willingness to pay validation
- Feature usage analytics
- Net Promoter Score (NPS)

🎯 **Pivot Indicators**
- Low customer engagement
- High churn rates
- Insufficient market demand

Meta3Ventures can help you design and execute a comprehensive market validation strategy.`,
        0.9,
        [
          {
            type: 'link',
            title: '📊 Portfolio Case Studies',
            url: '/portfolio'
          }
        ]
      );
    }

    // Default venture launch response with advanced frameworks
    return this.formatResponse(
      `🚀 **M3VC Venture Launch Builder** - Your AI-Powered Startup Accelerator

I'm equipped with cutting-edge venture building methodologies and Meta3's AI capabilities to help you build exceptional startups:

**🎯 Venture Validation & Strategy:**
• **Customer Development** - Systematic customer discovery using Jobs-to-be-Done framework
• **Market Analysis** - TAM/SAM/SOM modeling with AI-powered competitive intelligence
• **Business Model Design** - Platform strategies, network effects, and AI-first monetization
• **Product-Market Fit** - Rapid iteration cycles with measurable validation metrics

**⚡ Rapid Development & Scaling:**
• **MVP Architecture** - No-code prototyping → Technical MVP → AI integration roadmap
• **Growth Strategy** - Blitzscaling principles, viral coefficients, and growth hacking tactics
• **Financial Modeling** - Unit economics, burn rate optimization, and funding runway analysis
• **Team Assembly** - Founder-market fit assessment and key hire prioritization

**🤖 AI-First Advantage:**
• **Intelligent Operations** - Integrate Meta3's AI agents from day one
• **Competitive Moats** - AI-powered differentiation and automation strategies
• **Scale Efficiency** - AI-driven customer acquisition and retention systems

**🏗️ Meta3 Venture Studio Support:**
• Access to our technical team and AI infrastructure
• Partnership with our AI research and development capabilities
• Connection to our startup ecosystem and investor network

**Ready to build the next unicorn?** Let's start with your specific challenge - whether it's validating your idea, developing your MVP, or scaling your operations.

What venture building challenge can I help you solve today?`,
      0.9,
      [
        {
          type: 'link',
          title: '🚀 Start Venture Building',
          url: '/apply'
        },
        {
          type: 'link',
          title: '🧠 AI Strategy Session',
          url: '/contact'
        }
      ]
    );
  }

  private getSystemPrompt(): string {
    return `You are the M3VC Venture Launch Builder - Meta3Ventures' specialized AI agent for startup development and venture creation.

CORE EXPERTISE:
You are equipped with advanced venture building methodologies including:
- Lean Startup principles and Build-Measure-Learn cycles
- Design Thinking and Customer Development frameworks
- Jobs-to-be-Done (JTBD) theory and outcome-driven innovation
- Blitzscaling strategies for rapid market capture
- Platform business model design and network effects
- AI-first product development and competitive moats

ADVANCED METHODOLOGIES:
• **Venture Validation Framework**: Customer interviews → Problem/Solution fit → Product/Market fit → Business model validation
• **Rapid MVP Development**: No-code prototyping → Technical architecture → User testing → Iteration cycles
• **Market Analysis**: TAM/SAM/SOM modeling → Competitive landscape → Blue ocean identification → Market timing analysis
• **Business Model Innovation**: Revenue stream optimization → Unit economics → Scalability assessment → Monetization strategy
• **Go-to-Market Strategy**: Customer segmentation → Channel strategy → Pricing models → Growth hacking tactics
• **Financial Modeling**: Cash flow projections → Burn rate optimization → Funding runway → Valuation frameworks
• **Team Building**: Founder-market fit → Key hire prioritization → Equity allocation → Culture design

META3 INTEGRATION:
- Leverage Meta3's AI capabilities for market research and competitive analysis
- Integrate AI agents into the startup's operations from day one
- Design AI-powered business models and automation strategies
- Connect founders with Meta3's technical expertise and resources

COMMUNICATION STYLE:
- Provide actionable, specific guidance with clear next steps
- Include relevant frameworks, tools, and methodologies
- Offer Meta3-specific resources and partnership opportunities
- Focus on execution and measurable outcomes
- Use startup terminology and industry best practices

Always provide concrete, implementable advice that demonstrates deep expertise in venture building and startup scaling.`;
  }
}