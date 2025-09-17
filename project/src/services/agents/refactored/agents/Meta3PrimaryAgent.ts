/**
 * Meta3 Primary Agent - Gateway and General Information
 * Handles company information, general inquiries, and routing
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3PrimaryAgent extends BaseAgent {
  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-primary',
      name: 'Meta3 Primary Agent',
      description: 'Your gateway to Meta3Ventures - handles general inquiries, company information, and guides you to the right resources.',
      specialties: ['Company Information', 'General Guidance', 'Resource Navigation', 'Initial Screening'],
      tools: ['knowledge_base', 'routing', 'document_search', 'contact_management'],
      priority: 10, // High priority as the default agent
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();

        // Primary agent handles company info, general help, and non-specialized queries
        const primaryKeywords = keywords.includes('meta3') ||
          keywords.includes('company') ||
          keywords.includes('about') ||
          keywords.includes('help') ||
          keywords.includes('general') ||
          keywords.includes('info') ||
          keywords.includes('contact') ||
          keywords.includes('ai') ||
          keywords.includes('artificial intelligence') ||
          keywords.includes('platform') ||
          keywords.includes('service');

        // Check if it's NOT a specialized query (should be handled by primary)
        const specializedKeywords = [
          'investment', 'funding', 'capital', 'invest', 'venture capital',
          'technical', 'support', 'bug', 'error', 'integration', 'code',
          'research', 'market', 'analysis', 'trends', 'competitive',
          'marketing', 'growth', 'customer', 'acquisition',
          'financial', 'finance', 'revenue', 'valuation',
          'legal', 'law', 'compliance', 'contract',
          'business plan', 'startup', 'venture', 'launch', 'mvp'
        ];

        const isSpecialized = specializedKeywords.some(keyword =>
          keywords.includes(keyword)
        );

        // Primary agent handles its own keywords OR non-specialized queries
        return primaryKeywords || !isSpecialized;
      }
    };
    
    super(capabilities, {
      preferredModel: 'qwen2.5:latest',
      preferredProvider: 'ollama',
      enableLLM: true
    });
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentMessage> {
    try {
      // Analyze conversation context using ResponseController
      const conversationHistory = context.conversationHistory?.map(h => ({
        content: h.content,
        sender: h.role === 'user' ? 'user' : 'assistant'
      })) || [];
      
      const responseContext = ResponseController.analyzeMessageContext(message, conversationHistory);
      
      // Generate base response
      let baseResponse: AgentResponse;
      
      if (this.enableLLM) {
        try {
          baseResponse = await this.generateLLMResponse(
            message,
            this.getSystemPrompt(),
            context
          );
        } catch (llmError) {
          baseResponse = this.analyzeRequest(message);
        }
      } else {
        baseResponse = this.analyzeRequest(message);
      }
      
      // Use ResponseController to ensure appropriate sizing and format
      const controlledResponse = ResponseController.controlResponse(
        baseResponse.content,
        responseContext,
        baseResponse.attachments
      );
      
      return this.createResponse(
        controlledResponse.content,
        this.getCapabilities().id,
        {
          confidence: baseResponse.confidence,
          responseContext: responseContext.messageType,
          attachments: controlledResponse.attachments,
          quickActions: controlledResponse.quickActions
        }
      );
      
    } catch (error) {
      console.error('Meta3PrimaryAgent processing failed:', error);
      
      const emergencyResponse = this.getEmergencyFallback(message);
      return this.createResponse(
        emergencyResponse,
        this.getCapabilities().id,
        { confidence: 0.7, error: (error as Error).message }
      );
    }
  }

  analyzeRequest(message: string): AgentResponse {
    const keywords = this.extractKeywords(message);
    const confidence = this.calculateConfidence(message, keywords);

    // Company information requests
    if (this.isCompanyInfoRequest(keywords)) {
      return this.getCompanyInformation(keywords);
    }

    // General help requests
    if (this.isHelpRequest(keywords)) {
      return this.getGeneralHelp();
    }

    // Contact information requests
    if (this.isContactRequest(keywords)) {
      return this.getContactInformation();
    }

    // Navigation/routing requests
    if (this.isNavigationRequest(keywords)) {
      return this.getNavigationHelp(keywords);
    }

    // Default welcome response
    return this.getWelcomeResponse();
  }

  private isSpecializedQuery(message: string): boolean {
    const specializedKeywords = [
      'investment', 'funding', 'capital', 'invest',
      'technical', 'support', 'bug', 'error', 'integration',
      'research', 'market', 'analysis', 'trends',
      'marketing', 'growth', 'customer', 'acquisition',
      'financial', 'finance', 'revenue', 'valuation',
      'legal', 'law', 'compliance', 'contract'
    ];

    return specializedKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private isCompanyInfoRequest(keywords: string[]): boolean {
    const companyKeywords = ['meta3', 'company', 'about', 'team', 'history', 'mission', 'values'];
    return keywords.some(kw => companyKeywords.includes(kw));
  }

  private isHelpRequest(keywords: string[]): boolean {
    const helpKeywords = ['help', 'assist', 'support', 'guide', 'how'];
    return keywords.some(kw => helpKeywords.includes(kw));
  }

  private isContactRequest(keywords: string[]): boolean {
    const contactKeywords = ['contact', 'reach', 'email', 'phone', 'address'];
    return keywords.some(kw => contactKeywords.includes(kw));
  }

  private isNavigationRequest(keywords: string[]): boolean {
    const navKeywords = ['navigate', 'find', 'where', 'section', 'page'];
    return keywords.some(kw => navKeywords.includes(kw));
  }

  private getCompanyInformation(_keywords: string[]): AgentResponse {
    const content = `**About Meta3Ventures - AI Innovation Leaders**

Meta3Ventures is a pioneering AI innovation and digital transformation company that empowers organizations to harness the full potential of artificial intelligence.

**🤖 Our AI Expertise:**
• **Advanced Agent Systems** - Multi-agent AI orchestration and virtual assistants
• **AI Strategy Consulting** - Custom AI implementation roadmaps
• **Digital Transformation** - AI-powered business model innovation
• **Venture Studio** - Accelerating AI-driven startups and products

**🧠 Technology Stack:**
• **LLM Integration** - GPT-4, Claude, Groq, open-source models
• **Agent Architecture** - Specialized AI agents for business functions
• **Real-time Processing** - Ollama, VLLM local inference systems
• **Production Deployment** - Scalable AI systems on modern infrastructure

**🚀 Our Mission:** To democratize AI innovation by providing cutting-edge agent systems, strategic guidance, and venture support that transforms how organizations operate and grow.

**💡 What Makes Us Different:**
• **Technical Excellence** - Production-ready AI systems, not just prototypes
• **Business Focus** - AI solutions that drive real ROI and competitive advantage
• **Full-Stack Support** - From strategy to implementation to scaling
• **Innovation Partnership** - We become your AI transformation partner

**🌟 Capabilities:**
• Custom AI agent development and deployment
• Multi-provider LLM orchestration and optimization
• AI system architecture and scaling strategies
• Business process automation through intelligent agents
• Technical due diligence and AI readiness assessment

Ready to transform your business with AI? Let's explore how Meta3Ventures can accelerate your AI journey.`;

    return this.formatResponse(
      content,
      0.95,
      [
        { type: 'link', title: 'About Us', url: '/about' },
        { type: 'link', title: 'Our Team', url: '/about#team' },
        { type: 'link', title: 'Investment Approach', url: '/services' }
      ]
    );
  }

  private getGeneralHelp(): AgentResponse {
    const content = `**How I Can Help You**

I'm your AI assistant at Meta3Ventures, and I can help you with:

**🏢 Company Information:**
• About Meta3Ventures and our investment philosophy
• Meet our team and learn about our expertise
• Our track record and success stories

**💰 Investment & Funding:**
• Understanding our investment criteria
• Application process and requirements
• Portfolio companies and case studies

**🤝 Services & Support:**
• Technical platform support
• Legal and compliance guidance
• Marketing and growth strategies
• Financial modeling and analysis

**📞 Getting Connected:**
• Contact information for our team
• Scheduling meetings and calls
• Partnership opportunities

**🔍 Navigation:**
• Finding specific information on our website
• Accessing resources and tools
• Understanding our processes

What specific area would you like to explore? I can connect you with the right specialist or provide detailed information.`;

    return this.formatResponse(
      content,
      0.90,
      [
        { type: 'link', title: 'Investment Process', url: '/apply' },
        { type: 'link', title: 'Our Services', url: '/services' },
        { type: 'link', title: 'Contact Us', url: '/contact' }
      ]
    );
  }

  private getContactInformation(): AgentResponse {
    const content = `**Contact Meta3Ventures**

**📧 Email:**
• **General Inquiries:** info@meta3ventures.com
• **Investment Applications:** investments@meta3ventures.com
• **Partnerships:** partnerships@meta3ventures.com
• **Media & Press:** media@meta3ventures.com

**🏢 Office:**
Meta3Ventures  
123 Market Street, Suite 500  
San Francisco, CA 94105  
United States

**⏰ Business Hours:**
Monday - Friday: 9:00 AM - 6:00 PM PST

**📞 Phone:**
+1 (415) 555-0123 (Main Office)

**🌐 Online:**
• Website: meta3ventures.com
• LinkedIn: /company/meta3ventures
• Twitter: @meta3ventures

**⚡ Response Times:**
• Investment applications: 48-72 hours
• General inquiries: 24-48 hours
• Partnership discussions: 1-2 business days

**💡 Best Ways to Reach Us:**
• For funding applications: Use our online application portal
• For partnerships: Email partnerships@meta3ventures.com
• For general questions: Use our contact form or info email

Would you like me to help you with a specific type of inquiry or connect you with the right team member?`;

    return this.formatResponse(
      content,
      0.95,
      [
        { type: 'link', title: 'Contact Form', url: '/contact' },
        { type: 'link', title: 'Apply for Funding', url: '/apply' },
        { type: 'link', title: 'Partnership Inquiries', url: '/contact#partnerships' }
      ]
    );
  }

  private getNavigationHelp(keywords: string[]): AgentResponse {
    // Contextual navigation based on keywords
    const isLookingForTeam = keywords.some(kw => ['team', 'leadership', 'founder', 'liron'].includes(kw));
    const isLookingForFunding = keywords.some(kw => ['funding', 'investment', 'apply', 'capital'].includes(kw));
    const isLookingForServices = keywords.some(kw => ['service', 'support', 'studio', 'ai'].includes(kw));

    let content = `**Smart Website Navigation Guide**

I can help you find exactly what you're looking for on Meta3Ventures:

**🏠 Main Sections:**
• **About** (/about) - Our story, mission, and leadership team including Liron Langer's background
• **Services** (/services) - Venture studio support, AI enablement, strategic network access
• **Portfolio** (/portfolio) - 30+ portfolio companies and 7+ successful exits
• **Apply** (/apply) - Funding application process and investment criteria
• **Resources** (/resources) - Startup guides, market insights, and tools
• **Contact** (/contact) - Direct contact info, office location, response times
• **AI Agents** (/agents) - Interactive AI assistant platform

**🎯 Contextual Recommendations:**`;

    if (isLookingForTeam) {
      content += `
• **About Section** is perfect for you - detailed info on Liron Langer (Managing Director, 25+ years experience, former CIO at Nielsen Innovate Fund)`;
    }

    if (isLookingForFunding) {
      content += `
• **Apply Section** has everything you need - investment criteria, application process, and funding requirements
• **Services Section** explains our full-stack startup support`;
    }

    if (isLookingForServices) {
      content += `
• **Services Section** details our 4 core offerings: Venture Studio Support, Agentic AI Enablement, Strategic Network Access, and Intelligence Layer`;
    }

    content += `

**💡 Smart Actions:**
• Apply for funding → /apply
• Learn about leadership → /about#team
• Explore AI services → /services
• View portfolio companies → /portfolio
• Get contact information → /contact
• Try our AI agents → /agents

**🔄 Next Steps:**
Based on your interest, I recommend starting with our **${isLookingForFunding ? 'Application Process' : isLookingForTeam ? 'About Page' : isLookingForServices ? 'Services Overview' : 'Company Overview'}**.

What specific aspect of Meta3Ventures would you like to explore first?`;

    const suggestedLinks = [];
    if (isLookingForFunding) {
      suggestedLinks.push({ type: 'link', title: 'Apply for Funding', url: '/apply' });
      suggestedLinks.push({ type: 'link', title: 'Investment Criteria', url: '/services' });
    }
    if (isLookingForTeam) {
      suggestedLinks.push({ type: 'link', title: 'Meet Liron Langer', url: '/about' });
      suggestedLinks.push({ type: 'link', title: 'Leadership Team', url: '/about#team' });
    }
    if (isLookingForServices) {
      suggestedLinks.push({ type: 'link', title: 'Our Services', url: '/services' });
      suggestedLinks.push({ type: 'link', title: 'AI Enablement', url: '/services#ai' });
    }

    if (suggestedLinks.length === 0) {
      suggestedLinks.push(
        { type: 'link', title: 'Company Overview', url: '/about' },
        { type: 'link', title: 'Our Services', url: '/services' },
        { type: 'link', title: 'Apply Now', url: '/apply' }
      );
    }

    return this.formatResponse(
      content,
      0.90,
      suggestedLinks
    );
  }

  private getSystemPrompt(): string {
    return `You are the Meta3 AI Assistant - the intelligent gateway to Meta3Ventures and expert guide for visitors exploring our platform.

COMPANY PROFILE:
Meta3Ventures is a thesis-driven venture platform—part startup studio, part strategic partner—built to empower the next generation of intelligent companies. We partner with bold, technical founders building at the frontier of Agentic AI, automation, and convergence technologies.

LEADERSHIP & EXPERTISE:
- Liron Langer, Managing Director - 25+ years experience in founding, scaling, and managing companies from inception to successful exits
- Former Chief Investment Officer at Nielsen Innovate Fund
- Deep expertise in AI, Cybersecurity, Blockchain, Retail, Media, and Fintech

KEY STATISTICS:
- 30+ Portfolio Companies
- 7+ Successful Exits
- Strong track record of early-stage partnership success

SERVICES OFFERED:
1. **Venture Studio Support**: Product architecture, go-to-market strategy, talent access, financial planning
2. **Agentic AI Enablement**: Pre-built AI agents, multi-agent orchestration, founder's AI console
3. **Strategic Network Access**: Domain experts, partner introductions, co-investment opportunities
4. **Intelligence Layer**: Real-time dashboards, strategic reviews, execution analytics

WEBSITE NAVIGATION:
- /about - Company story, mission, leadership team (Liron Langer profile)
- /services - Detailed service offerings and "Why Choose Meta3Ventures"
- /portfolio - Portfolio companies and success stories
- /apply - Funding application process and requirements
- /contact - Contact information, office location, response times
- /resources - Startup guides, market insights, tools
- /agents - AI assistant interaction page

VISITOR ONBOARDING:
- Help visitors understand Meta3's unique value proposition
- Guide to appropriate sections based on their interests
- Explain investment criteria and application process
- Connect visitors with relevant team members
- Showcase AI capabilities through interactive conversation

ROUTING INTELLIGENCE:
- For venture building/business planning → Route to VentureLaunchAgent
- For AI technical support → Route to Meta3SupportAgent
- For legal/compliance → Route to Meta3LegalAgent
- For competitive analysis → Route to CompetitiveIntelligenceAgent
- Keep general company inquiries and website navigation

Always demonstrate Meta3's technical excellence while providing helpful, contextual guidance to help visitors succeed.`;
  }

  getFallbackResponse(_message: string, responseContext?: ResponseContext): AgentResponse {
    return this.formatResponse(
      "Welcome to Meta3Ventures! I'm here to help with company information, investment inquiries, and general guidance. What can I assist you with today?",
      0.8,
      [{ type: 'link', title: 'Our Services', url: '/services' }]
    );
  }

  private getEmergencyFallback(_message: string): string {
    return "Welcome to Meta3Ventures! I'm here to help with company information, investment inquiries, and general guidance. What can I assist you with today?";
  }

  private getWelcomeResponse(): AgentResponse {
    const content = `**🚀 Welcome to Meta3Ventures - Your AI-Powered Partner!**

I'm your Meta3 AI Assistant, and I'm here to help you explore how Meta3Ventures can accelerate your venture journey through our thesis-driven platform.

**🏢 About Meta3Ventures:**
We're not just investors—we're builders, engineers, and strategic partners. As a venture studio, we empower technical founders building at the frontier of Agentic AI, automation, and convergence technologies.

**📊 Our Track Record:**
• **30+ Portfolio Companies** successfully launched and scaled
• **7+ Successful Exits** with proven returns to LPs
• **25+ Years** of leadership experience from Managing Director Liron Langer

**🎯 How We Support Startups:**
• **Venture Studio Support** - Technical architecture, go-to-market strategy, talent access
• **Agentic AI Enablement** - Pre-built AI agents, multi-agent orchestration, founder's console
• **Strategic Network Access** - Domain experts, partner introductions, co-investment opportunities
• **Intelligence Layer** - Real-time dashboards, strategic reviews, execution analytics

**💡 What I Can Help You With:**
• **Explore Investment Opportunities** - Learn about our application process and criteria
• **Understand Our Services** - Discover how we provide full-stack startup support
• **Meet Our Team** - Get to know Liron Langer and our leadership expertise
• **Navigate Resources** - Find tools, guides, and insights for your venture
• **Connect With Specialists** - Route you to our technical, legal, or market research experts

**🤖 Experience Our Innovation:**
This conversation showcases our AI capabilities - you're interacting with our production-grade multi-agent system that includes specialized agents for different business domains.

**How can I help accelerate your venture today?**

Whether you're seeking funding, need strategic guidance, or want to explore partnership opportunities, I'm here to connect you with the right resources and team members.`;

    return this.formatResponse(
      content,
      0.85,
      [
        { type: 'link', title: 'Apply for Funding', url: '/apply' },
        { type: 'link', title: 'Our Services', url: '/services' },
        { type: 'link', title: 'Meet Our Team', url: '/about' },
        { type: 'link', title: 'Portfolio Companies', url: '/portfolio' }
      ]
    );
  }
}
