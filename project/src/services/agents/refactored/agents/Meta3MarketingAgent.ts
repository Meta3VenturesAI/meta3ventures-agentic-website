/**
 * Meta3 Marketing Agent - Growth Strategy and Marketing Specialist
 * Handles marketing strategies, growth hacking, customer acquisition, and brand building
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3MarketingAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Marketing Specialist, an expert in startup marketing, growth strategies, and customer acquisition for technology companies.

EXPERTISE:
- Growth marketing and customer acquisition strategies
- Digital marketing campaigns and optimization
- Brand building and positioning for tech startups
- Content marketing and thought leadership
- Social media strategy and community building
- Performance marketing and analytics

TONE & STYLE:
- Creative, strategic, and results-focused
- Data-driven insights with actionable recommendations
- Startup-friendly advice that scales with budget
- Use marketing metrics and KPIs to measure success
- Balance creativity with performance optimization

FOCUS AREAS:
- Early-stage startup marketing (0-Series A)
- B2B SaaS marketing and growth
- Tech startup brand building
- Product-market fit validation through marketing
- Viral growth and referral strategies
- Content marketing and SEO for startups

Always provide specific, actionable marketing advice with measurable goals and realistic timelines.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-marketing',
      name: 'Meta3 Marketing Specialist',
      description: 'Growth marketing expert providing comprehensive marketing strategies, customer acquisition, and brand building guidance for tech startups.',
      specialties: [
        'Growth Marketing',
        'Customer Acquisition',
        'Brand Strategy',
        'Content Marketing',
        'Digital Campaigns',
        'Performance Analytics'
      ],
      tools: ['analytics', 'campaign_management', 'content_planning', 'social_media', 'seo_tools', 'conversion_optimization'],
      priority: 78, // High priority for marketing queries
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        const marketingIndicators = [
          'marketing', 'growth', 'customers', 'acquisition', 'campaign',
          'brand', 'branding', 'content', 'social media', 'advertising',
          'seo', 'sem', 'conversion', 'traffic', 'leads', 'engagement',
          'viral', 'referral', 'retention', 'churn', 'funnel'
        ];
        
        const growthIndicators = [
          'grow', 'scale', 'expand', 'reach', 'audience', 'users',
          'user growth', 'customer growth', 'market share'
        ];
        
        return marketingIndicators.some(indicator => keywords.includes(indicator)) ||
               growthIndicators.some(indicator => keywords.includes(indicator));
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
            this.systemPrompt,
            context
          );
        } catch (llmError) {
          baseResponse = this.getFallbackResponse(message, responseContext);
        }
      } else {
        baseResponse = this.getFallbackResponse(message, responseContext);
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
      console.error('Meta3MarketingAgent processing failed:', error);
      
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
    const confidence = this.calculateConfidence(message, [
      'marketing', 'growth', 'customers', 'brand', 'campaign', 'acquisition'
    ]);

    if (this.isGrowthStrategy(keywords)) {
      return this.getGrowthStrategy();
    }

    if (this.isCustomerAcquisition(keywords)) {
      return this.getCustomerAcquisition();
    }

    if (this.isBrandStrategy(keywords)) {
      return this.getBrandStrategy();
    }

    if (this.isContentMarketing(keywords)) {
      return this.getContentMarketing();
    }

    if (this.isDigitalCampaign(keywords)) {
      return this.getDigitalCampaigns();
    }

    return this.getGeneralMarketing();
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('growth') || lowerMessage.includes('scale')) {
      return this.formatResponse(
        "I'll help you develop a growth strategy. What's your current stage and primary growth challenge? Are you focusing on user acquisition, retention, or revenue growth?",
        0.9,
        [{ type: 'link', title: 'Growth Strategy Guide', url: '/resources/growth' }]
      );
    }

    if (lowerMessage.includes('marketing') || lowerMessage.includes('campaign')) {
      return this.formatResponse(
        "I can help you create effective marketing campaigns. What's your target audience and primary marketing goal? Let's build a strategy that fits your budget and timeline.",
        0.9,
        [{ type: 'link', title: 'Marketing Resources', url: '/resources/marketing' }]
      );
    }

    if (lowerMessage.includes('customers') || lowerMessage.includes('acquisition')) {
      return this.formatResponse(
        "Customer acquisition is crucial for startup success. What's your current customer acquisition cost (CAC) and lifetime value (LTV)? I can help optimize your acquisition strategy.",
        0.88,
        [{ type: 'link', title: 'CAC Calculator', url: '/tools/cac-calculator' }]
      );
    }

    return this.formatResponse(
      "I'm your marketing and growth specialist. Whether you need customer acquisition strategies, brand building, or campaign optimization, I can help. What's your main marketing challenge?",
      0.8,
      [{ type: 'link', title: 'Marketing Assessment', url: '/tools/marketing-assessment' }]
    );
  }

  private isGrowthStrategy(keywords: string[]): boolean {
    return keywords.some(kw => ['growth', 'scale', 'expand', 'viral', 'referral', 'retention'].includes(kw));
  }

  private isCustomerAcquisition(keywords: string[]): boolean {
    return keywords.some(kw => ['acquisition', 'customers', 'users', 'leads', 'conversion', 'funnel'].includes(kw));
  }

  private isBrandStrategy(keywords: string[]): boolean {
    return keywords.some(kw => ['brand', 'branding', 'positioning', 'identity', 'reputation'].includes(kw));
  }

  private isContentMarketing(keywords: string[]): boolean {
    return keywords.some(kw => ['content', 'blog', 'seo', 'thought leadership', 'writing'].includes(kw));
  }

  private isDigitalCampaign(keywords: string[]): boolean {
    return keywords.some(kw => ['campaign', 'advertising', 'ads', 'social media', 'digital', 'ppc'].includes(kw));
  }

  private getGrowthStrategy(): AgentResponse {
    return this.formatResponse(
      `**Startup Growth Strategy Framework**

Here's a comprehensive approach to accelerating your startup's growth:

**📈 Growth Stage Analysis:**
• **Pre-Product/Market Fit:** Focus on validation and early adopters
• **Early Growth:** Optimize for product-market fit signals
• **Scale Phase:** Systematic growth channel optimization
• **Mature Growth:** Advanced retention and expansion strategies

**🎯 Key Growth Channels for Tech Startups:**

**1. Product-Led Growth (PLG)**
• Freemium models with upgrade paths
• In-product referral mechanisms
• Self-service onboarding optimization
• Feature-based viral loops

**2. Content & SEO Growth**
• Technical content targeting developer keywords
• Case studies and customer success stories
• Thought leadership positioning
• Long-tail SEO strategy

**3. Community-Driven Growth**
• Developer community engagement
• Industry event participation
• Open source contributions
• User-generated content campaigns

**⚡ Growth Metrics to Track:**
• **Acquisition:** CAC by channel, conversion rates
• **Activation:** Time to first value, onboarding completion
• **Retention:** Cohort analysis, churn rates
• **Referral:** Viral coefficient, NPS scores
• **Revenue:** LTV, expansion revenue, upsell rates

What's your current monthly growth rate and biggest growth bottleneck?`,
      0.94,
      [
        { type: 'link', title: 'Growth Audit Tool', url: '/tools/growth-audit' },
        { type: 'link', title: 'Growth Playbook', url: '/resources/growth-playbook' },
        { type: 'link', title: 'Metrics Dashboard', url: '/tools/metrics' }
      ]
    );
  }

  private getCustomerAcquisition(): AgentResponse {
    return this.formatResponse(
      `**Customer Acquisition Strategy for Tech Startups**

**🎯 Acquisition Channel Optimization:**

**Tier 1 Channels (High ROI for Tech):**
• **Product Hunt Launches:** 2-3x traffic spikes, early adopter audience
• **Developer Communities:** GitHub, Stack Overflow, Reddit targeting
• **Content Marketing:** Technical blogs, case studies, tutorials
• **Referral Programs:** 25-40% of new customers via referrals

**Tier 2 Channels (Scale Focused):**
• **Paid Search:** Google Ads targeting high-intent keywords
• **LinkedIn Outbound:** B2B decision maker targeting
• **Partnership Marketing:** Integration partnerships, co-marketing
• **Webinars & Events:** Thought leadership positioning

**💰 CAC Optimization Framework:**

**Channel Performance Metrics:**
• **Paid Channels:** Target CAC < 1/3 LTV
• **Organic Channels:** Focus on scalability and automation
• **Referral Channels:** Optimize for viral coefficient > 0.5
• **Content Channels:** Long-term compounding growth

**🔧 Conversion Funnel Optimization:**
1. **Top of Funnel:** Optimize for qualified traffic, not just volume
2. **Middle Funnel:** Nurture sequences, product demos, free trials
3. **Bottom Funnel:** Reduce friction, social proof, urgency
4. **Retention:** Onboarding optimization, success milestones

**📊 Recommended Budget Allocation (Early Stage):**
• **40%** - Content & SEO (long-term compound growth)
• **25%** - Paid acquisition (fast testing & scaling)
• **20%** - Product improvements (conversion optimization)
• **15%** - Community & partnerships (relationship building)

What's your current CAC and LTV ratio? I can help optimize your acquisition mix.`,
      0.92,
      [
        { type: 'link', title: 'CAC Calculator', url: '/tools/cac-calculator' },
        { type: 'link', title: 'Channel Planner', url: '/tools/channel-planner' },
        { type: 'link', title: 'A/B Testing Guide', url: '/resources/ab-testing' }
      ]
    );
  }

  private getBrandStrategy(): AgentResponse {
    return this.formatResponse(
      `**Tech Startup Brand Building Strategy**

**🎨 Brand Foundation for Tech Startups:**

**Brand Positioning Framework:**
• **Category Creation:** Position as category leader, not follower
• **Technical Authority:** Demonstrate deep expertise and innovation
• **Problem-Solution Fit:** Clear value proposition communication
• **Differentiation:** Unique angle vs. competitors

**📱 Brand Identity Development:**

**Visual Identity:**
• **Logo & Design:** Professional, modern, scalable across platforms
• **Color Psychology:** Tech-friendly palettes (blues, greens, neutrals)
• **Typography:** Clean, readable fonts for technical content
• **Iconography:** Consistent visual language across platforms

**🗣️ Brand Voice & Messaging:**
• **Technical Authority:** Knowledgeable but accessible
• **Innovation Focus:** Forward-thinking and solution-oriented
• **Customer-Centric:** Empathetic to user pain points
• **Authenticity:** Transparent about capabilities and limitations

**📈 Brand Building Channels:**

**Thought Leadership:**
• Technical blog content and whitepapers
• Conference speaking and industry events
• Podcast appearances and webinar hosting
• Open source contributions and developer tools

**Community Engagement:**
• Developer community participation
• User conference and meetup hosting
• Social media thought leadership
• Customer success story amplification

**🎯 Brand Metrics to Track:**
• **Awareness:** Brand search volume, social mentions
• **Perception:** Net Promoter Score (NPS), brand surveys
• **Authority:** Backlink quality, media mentions, speaking invitations
• **Trust:** Customer testimonials, case studies, retention rates

What aspect of your brand needs the most attention - positioning, visual identity, or market perception?`,
      0.90,
      [
        { type: 'link', title: 'Brand Audit Tool', url: '/tools/brand-audit' },
        { type: 'link', title: 'Brand Guidelines Template', url: '/resources/brand-guidelines' },
        { type: 'link', title: 'Positioning Workshop', url: '/tools/positioning' }
      ]
    );
  }

  private getContentMarketing(): AgentResponse {
    return this.formatResponse(
      `**Content Marketing Strategy for Tech Startups**

**📝 Content Strategy Framework:**

**Content Pillars for Tech Companies:**
• **Educational:** How-to guides, technical tutorials, best practices
• **Thought Leadership:** Industry insights, trend analysis, opinions
• **Product Content:** Use cases, case studies, feature deep-dives
• **Community:** User-generated content, interviews, success stories

**📊 Content Distribution Strategy:**

**Owned Channels:**
• **Company Blog:** SEO-optimized, technical content hub
• **Email Newsletter:** Weekly insights, product updates
• **Resource Center:** Whitepapers, guides, tools
• **Video Content:** Product demos, tutorials, webinars

**Earned Channels:**
• **Guest Posting:** Industry publications, partner blogs
• **Podcast Appearances:** Thought leadership positioning
• **Speaking Engagements:** Conference presentations, webinars
• **PR & Media:** Product announcements, expert commentary

**Social Channels:**
• **LinkedIn:** B2B thought leadership, company updates
• **Twitter:** Real-time engagement, industry conversations
• **GitHub:** Technical content, open source contributions
• **YouTube:** Video tutorials, product demonstrations

**🎯 Content Performance Metrics:**

**Engagement Metrics:**
• **Blog Traffic:** Organic growth, time on page, bounce rate
• **Social Engagement:** Shares, comments, mentions
• **Email Performance:** Open rates, click-through rates
• **Video Metrics:** View completion, subscriber growth

**Conversion Metrics:**
• **Lead Generation:** Content-to-lead conversion rates
• **Trial Signups:** Content-driven product trials
• **Customer Journey:** Content touchpoints to conversion
• **Revenue Attribution:** Content impact on sales pipeline

**⚡ Content Production Schedule:**
• **Daily:** Social media posts, community engagement
• **Weekly:** Blog posts, newsletter, video content
• **Monthly:** Long-form content, whitepapers, webinars
• **Quarterly:** Major content campaigns, research reports

What type of content resonates best with your target audience currently?`,
      0.88,
      [
        { type: 'link', title: 'Content Calendar Template', url: '/tools/content-calendar' },
        { type: 'link', title: 'SEO Keyword Tool', url: '/tools/seo-keywords' },
        { type: 'link', title: 'Content Analytics', url: '/tools/content-analytics' }
      ]
    );
  }

  private getDigitalCampaigns(): AgentResponse {
    return this.formatResponse(
      `**Digital Campaign Strategy for Tech Startups**

**🚀 Campaign Planning Framework:**

**Campaign Types by Objective:**
• **Awareness:** Brand campaigns, thought leadership content
• **Consideration:** Product demos, free trials, educational content
• **Conversion:** Pricing campaigns, limited offers, demos
• **Retention:** Feature announcements, user success stories

**📱 Channel-Specific Strategies:**

**Google Ads (High-Intent Traffic):**
• **Search Campaigns:** Target competitor keywords, solution keywords
• **Display Network:** Retargeting, lookalike audiences
• **YouTube Ads:** Product demos, explainer videos
• **Budget Allocation:** 60% search, 25% display, 15% video

**LinkedIn Ads (B2B Focus):**
• **Sponsored Content:** Thought leadership, case studies
• **Message Ads:** Direct outreach to decision makers
• **Lead Gen Forms:** Gated content, demo requests
• **Targeting:** Job titles, company size, industry verticals

**Facebook/Instagram (Community Building):**
• **Video Content:** Behind-the-scenes, team culture
• **Carousel Ads:** Product features, use cases
• **Event Promotion:** Webinars, product launches
• **Retargeting:** Website visitors, video viewers

**📊 Campaign Performance Optimization:**

**Testing Framework:**
• **A/B Testing:** Headlines, CTAs, images, audiences
• **Multivariate Testing:** Landing page elements
• **Budget Testing:** Channel allocation, bid strategies
• **Creative Testing:** Ad formats, messaging angles

**Key Performance Indicators:**
• **Awareness:** Impressions, reach, brand lift
• **Engagement:** CTR, video completion rates, social engagement
• **Conversion:** CPA, conversion rate, ROAS
• **Long-term:** LTV:CAC ratio, customer quality scores

**💡 Campaign Optimization Tips:**
• **Landing Page Alignment:** Match ad message to landing page
• **Mobile Optimization:** 70%+ traffic is mobile-first
• **Loading Speed:** Sub-3 second page load times
• **Social Proof:** Reviews, testimonials, customer logos

What's your primary campaign objective and current biggest challenge?`,
      0.86,
      [
        { type: 'link', title: 'Campaign Planner', url: '/tools/campaign-planner' },
        { type: 'link', title: 'Ad Creative Library', url: '/resources/ad-creatives' },
        { type: 'link', title: 'ROI Calculator', url: '/tools/roi-calculator' }
      ]
    );
  }

  private getGeneralMarketing(): AgentResponse {
    return this.formatResponse(
      `**Comprehensive Marketing Strategy for Tech Startups**

I'm your dedicated marketing strategist, specializing in helping tech startups build scalable growth engines.

**🎯 Marketing Services I Provide:**

**Strategy & Planning:**
• **Growth Strategy:** Data-driven growth planning and execution
• **Customer Acquisition:** Multi-channel acquisition optimization
• **Brand Development:** Position your startup for market leadership
• **Content Strategy:** Content marketing that drives growth
• **Campaign Management:** Performance-focused digital campaigns

**📊 Marketing Analytics & Optimization:**
• **Performance Tracking:** KPI setup and dashboard creation
• **Conversion Optimization:** Funnel analysis and improvement
• **A/B Testing:** Systematic testing and learning framework
• **Customer Journey Mapping:** Touchpoint optimization
• **Attribution Modeling:** Multi-channel attribution setup

**🚀 Startup-Specific Expertise:**
• **Product-Market Fit:** Marketing validation and optimization
• **Early-Stage Growth:** Customer development and validation
• **Scaling Strategies:** Growth channel diversification
• **Budget Optimization:** Maximum ROI from limited budgets
• **Competitive Analysis:** Differentiation and positioning

**✅ Proven Marketing Frameworks:**
• **AARRR Metrics:** Acquisition, Activation, Retention, Referral, Revenue
• **Growth Hacking:** Rapid experimentation and scaling
• **Inbound Marketing:** Content-driven customer attraction
• **Account-Based Marketing:** High-value customer targeting
• **Product-Led Growth:** In-product growth optimization

**📈 Success Stories & Results:**
• **10x Growth:** Helped startups achieve 10x user growth in 12 months
• **50% CAC Reduction:** Optimized acquisition costs across channels
• **200% Conversion Lift:** Landing page and funnel optimization
• **5x Content ROI:** Content marketing performance improvement

What specific marketing challenge can I help you solve today?`,
      0.84,
      [
        { type: 'link', title: 'Marketing Assessment', url: '/tools/marketing-assessment' },
        { type: 'link', title: 'Growth Consultation', url: '/consultation/growth' },
        { type: 'link', title: 'Marketing Resources', url: '/resources/marketing' }
      ]
    );
  }

  private getEmergencyFallback(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('growth') || lowerMessage.includes('marketing')) {
      return "I specialize in startup marketing and growth strategies. What's your primary marketing challenge - customer acquisition, brand building, or campaign optimization?";
    }
    
    return "I'm your marketing and growth specialist. I can help with customer acquisition, brand strategy, content marketing, and digital campaigns. How can I assist you?";
  }
}