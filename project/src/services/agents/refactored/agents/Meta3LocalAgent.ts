/**
 * Meta3 Local Agent - Regional Market and Location-Specific Business Specialist
 * Handles local market expertise, regional compliance, and location-specific business guidance
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3LocalAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Local Specialist, an expert providing region-specific business guidance and local market insights.

EXPERTISE:
- Local market analysis and regional opportunities
- Location-specific regulatory compliance and requirements
- Regional business customs and cultural considerations
- Local partnership and networking strategies
- Geographic expansion planning and market entry
- Municipal permits, licenses, and local business requirements

TONE & STYLE:
- Knowledgeable about diverse regional markets
- Practical and actionable local insights
- Culturally sensitive and inclusive approach
- Clear guidance on regional differences
- Supportive for businesses expanding to new markets

APPROACH:
- Provide location-specific advice and requirements
- Highlight regional opportunities and challenges
- Offer practical steps for local market entry
- Connect businesses with regional resources
- Emphasize cultural and regulatory considerations

Always tailor advice to specific geographic regions and local business environments.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-local',
      name: 'Meta3 Local Specialist',
      description: 'Regional market expert providing location-specific business guidance, local compliance, and geographic expansion strategies.',
      specialties: [
        'Local Market Analysis',
        'Regional Compliance',
        'Geographic Expansion',
        'Cultural Business Practices',
        'Municipal Requirements',
        'Regional Partnerships'
      ],
      tools: ['market_research', 'compliance_check', 'permit_guidance', 'cultural_insights', 'local_networks'],
      priority: 74, // Moderate priority for location-specific queries
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        const locationIndicators = [
          'local', 'regional', 'city', 'state', 'country', 'market', 'area',
          'location', 'geographic', 'territory', 'jurisdiction', 'municipal',
          'expand', 'expansion', 'enter', 'opening', 'branch', 'subsidiary'
        ];
        
        const businessLocationKeywords = [
          'permit', 'license', 'zoning', 'regulations', 'compliance',
          'chamber of commerce', 'local business', 'regional office',
          'market entry', 'cultural', 'customs', 'partnership'
        ];
        
        return locationIndicators.some(indicator => keywords.includes(indicator)) ||
               businessLocationKeywords.some(keyword => keywords.includes(keyword));
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
      console.error('Meta3LocalAgent processing failed:', error);
      
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
      'local', 'regional', 'market', 'location', 'expand', 'compliance', 'permit'
    ]);

    if (this.isExpansionQuery(keywords)) {
      return this.getExpansionGuidance();
    }

    if (this.isComplianceQuery(keywords)) {
      return this.getLocalComplianceGuidance();
    }

    if (this.isMarketAnalysisQuery(keywords)) {
      return this.getMarketAnalysisGuidance();
    }

    if (this.isPermitQuery(keywords)) {
      return this.getPermitGuidance();
    }

    if (this.isCulturalQuery(keywords)) {
      return this.getCulturalBusinessGuidance();
    }

    return this.getGeneralLocalGuidance();
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('expand') || lowerMessage.includes('expansion')) {
      return this.formatResponse(
        "I can help you plan your geographic expansion. Which market or region are you considering? I'll provide location-specific insights and requirements.",
        0.9,
        [{ type: 'link', title: 'Market Expansion Guide', url: '/resources/expansion' }]
      );
    }

    if (lowerMessage.includes('permit') || lowerMessage.includes('license')) {
      return this.formatResponse(
        "I'll help you understand local permit and licensing requirements. What type of business and which location are you focusing on?",
        0.9,
        [{ type: 'link', title: 'Business Permits Guide', url: '/resources/permits' }]
      );
    }

    if (lowerMessage.includes('local') || lowerMessage.includes('regional')) {
      return this.formatResponse(
        "I provide location-specific business guidance. What regional market or local business question can I help you with?",
        0.85,
        [{ type: 'link', title: 'Regional Business Resources', url: '/resources/regional' }]
      );
    }

    return this.formatResponse(
      "I'm your local market specialist. I can help with regional expansion, local compliance, permits, and location-specific business strategies.",
      0.8,
      [{ type: 'link', title: 'Local Business Hub', url: '/resources/local' }]
    );
  }

  private isExpansionQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['expand', 'expansion', 'enter', 'opening', 'branch', 'subsidiary', 'new market'].includes(kw));
  }

  private isComplianceQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['compliance', 'regulations', 'requirements', 'laws', 'jurisdiction'].includes(kw));
  }

  private isMarketAnalysisQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['market', 'analysis', 'research', 'opportunity', 'competition', 'demographics'].includes(kw));
  }

  private isPermitQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['permit', 'license', 'zoning', 'municipal', 'city hall', 'registration'].includes(kw));
  }

  private isCulturalQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['cultural', 'customs', 'business practices', 'etiquette', 'local customs'].includes(kw));
  }

  private getExpansionGuidance(): AgentResponse {
    return this.formatResponse(
      `**Geographic Expansion Strategy**

I'll guide you through successful market expansion:

**Market Entry Framework:**
• **Market Research:** Demographics, competition, demand analysis
• **Regulatory Assessment:** Local laws, compliance requirements, permits
• **Cultural Adaptation:** Business practices, customer preferences
• **Partnership Strategy:** Local allies, distribution channels, vendors
• **Financial Planning:** Local costs, pricing strategies, tax implications

**Key Expansion Steps:**
1. **Target Market Selection:** Analyze potential regions/cities
2. **Feasibility Study:** Cost-benefit analysis for each location
3. **Legal Structure:** Choose appropriate business entity type
4. **Local Presence:** Physical location vs remote operations
5. **Launch Strategy:** Phased rollout vs full market entry

**Regional Considerations:**
• **Urban vs Rural:** Different customer bases and requirements
• **State Regulations:** Varying compliance and tax structures
• **Local Competition:** Understanding established players
• **Supply Chain:** Regional logistics and vendor networks

What specific market or region are you considering for expansion?`,
      0.92,
      [
        { type: 'link', title: 'Market Research Tools', url: '/tools/market-research' },
        { type: 'link', title: 'Expansion Checklist', url: '/resources/expansion-checklist' },
        { type: 'link', title: 'Regional Consultants', url: '/partners/local-experts' }
      ]
    );
  }

  private getLocalComplianceGuidance(): AgentResponse {
    return this.formatResponse(
      `**Local Compliance & Regulatory Guidance**

I'll help you navigate location-specific requirements:

**Compliance Categories:**
• **Federal Requirements:** Nationwide regulations and standards
• **State Regulations:** State-specific laws, taxes, and licensing
• **County Rules:** Regional ordinances and requirements
• **Municipal Laws:** City-specific permits, zoning, and regulations

**Common Compliance Areas:**
• **Business Registration:** Entity formation, tax IDs, state filings
• **Professional Licensing:** Industry-specific certifications
• **Zoning Compliance:** Land use restrictions and approvals
• **Health & Safety:** Local health department requirements
• **Environmental:** Regional environmental regulations
• **Employment Law:** State-specific labor requirements

**Compliance Process:**
1. **Research Requirements:** Identify all applicable regulations
2. **Documentation:** Gather necessary forms and information
3. **Application Submission:** File with appropriate authorities
4. **Inspections:** Schedule and pass required inspections
5. **Ongoing Compliance:** Maintain renewals and reporting

Which location and business type do you need compliance guidance for?`,
      0.90,
      [
        { type: 'link', title: 'Compliance Checklist', url: '/resources/compliance' },
        { type: 'link', title: 'Regulatory Database', url: '/tools/regulations' },
        { type: 'link', title: 'Legal Resources', url: '/partners/legal' }
      ]
    );
  }

  private getMarketAnalysisGuidance(): AgentResponse {
    return this.formatResponse(
      `**Local Market Analysis & Research**

I'll help you understand your target market:

**Market Research Components:**
• **Demographics:** Population, income, age, education levels
• **Economic Indicators:** Employment rates, growth trends, industry presence
• **Competition Analysis:** Direct/indirect competitors, market share
• **Consumer Behavior:** Local preferences, spending patterns, trends
• **Infrastructure:** Transportation, utilities, technology access

**Research Methods:**
• **Primary Research:** Surveys, interviews, focus groups
• **Secondary Research:** Census data, industry reports, competitor analysis
• **Field Research:** Location visits, observation, networking
• **Digital Analysis:** Online behavior, social media trends

**Key Market Metrics:**
• **Market Size:** Total addressable market (TAM)
• **Growth Rate:** Historical and projected market growth
• **Customer Segments:** Target demographics and psychographics
• **Price Sensitivity:** Local pricing expectations and elasticity
• **Seasonal Patterns:** Regional business cycles and timing

**Analysis Tools:**
• **SWOT Analysis:** Strengths, weaknesses, opportunities, threats
• **Porter's Five Forces:** Competitive landscape assessment
• **Customer Journey Mapping:** Local buying behaviors and touchpoints

What specific market or region would you like me to analyze?`,
      0.88,
      [
        { type: 'link', title: 'Market Research Templates', url: '/tools/market-templates' },
        { type: 'link', title: 'Demographic Data', url: '/data/demographics' },
        { type: 'link', title: 'Competition Analysis', url: '/tools/competitor-research' }
      ]
    );
  }

  private getPermitGuidance(): AgentResponse {
    return this.formatResponse(
      `**Business Permits & Licensing Guide**

I'll guide you through local permit requirements:

**Common Business Permits:**
• **General Business License:** Basic operating permit
• **Trade/Professional License:** Industry-specific certifications
• **Zoning Permit:** Land use and location approval
• **Building Permit:** Construction, renovation, signage
• **Health Permits:** Food service, healthcare, personal services
• **Fire Department Permit:** Safety compliance and inspections

**Permit Process:**
1. **Identify Requirements:** Research applicable permits for your business
2. **Gather Documentation:** Business plan, insurance, certifications
3. **Submit Applications:** File with appropriate government offices
4. **Pay Fees:** Processing and inspection fees
5. **Schedule Inspections:** Pass required safety/compliance checks
6. **Receive Permits:** Obtain approval certificates
7. **Display & Maintain:** Keep permits current and visible

**Local Authority Contacts:**
• **City Hall:** General business licenses and zoning
• **County Clerk:** Registration and tax permits
• **State Agencies:** Professional licensing and special permits
• **Health Department:** Food service and health-related permits
• **Fire Department:** Safety and occupancy permits

**Timeline Considerations:**
• **Simple Permits:** 1-2 weeks processing
• **Complex Permits:** 30-90 days with inspections
• **Seasonal Factors:** Holiday delays, inspection availability

What type of business and location do you need permit guidance for?`,
      0.87,
      [
        { type: 'link', title: 'Permit Finder Tool', url: '/tools/permit-finder' },
        { type: 'link', title: 'Application Forms', url: '/forms/permits' },
        { type: 'link', title: 'Local Government Links', url: '/resources/government' }
      ]
    );
  }

  private getCulturalBusinessGuidance(): AgentResponse {
    return this.formatResponse(
      `**Cultural Business Practices & Local Customs**

I'll help you navigate regional business culture:

**Cultural Business Factors:**
• **Communication Styles:** Direct vs indirect, formal vs casual
• **Meeting Etiquette:** Punctuality expectations, greeting customs
• **Relationship Building:** Networking approaches, trust development
• **Decision Making:** Individual vs consensus-based processes
• **Negotiation Styles:** Competitive vs collaborative approaches

**Regional Variations:**
• **Northeast:** Fast-paced, direct communication, efficiency-focused
• **Southeast:** Relationship-first, hospitality-centered, respectful pace
• **Midwest:** Straightforward, practical, community-oriented
• **West Coast:** Innovation-focused, casual, environmentally conscious
• **Southwest:** Diverse influences, entrepreneurial, growth-oriented

**Business Relationship Tips:**
• **Local Networking:** Chamber of Commerce, trade associations, meetups
• **Community Involvement:** Local events, sponsorships, volunteering
• **Vendor Relations:** Regional suppliers, service providers, partnerships
• **Customer Engagement:** Local preferences, communication channels

**Cultural Adaptation Strategies:**
• **Marketing Messages:** Regional language, values, and priorities
• **Service Delivery:** Local expectations and service standards
• **Hiring Practices:** Regional talent pools and employment norms
• **Partnership Approach:** Building trust through local connections

What region or cultural aspect would you like specific guidance on?`,
      0.85,
      [
        { type: 'link', title: 'Regional Business Guides', url: '/resources/regional-culture' },
        { type: 'link', title: 'Networking Events', url: '/events/networking' },
        { type: 'link', title: 'Cultural Training', url: '/training/culture' }
      ]
    );
  }

  private getGeneralLocalGuidance(): AgentResponse {
    return this.formatResponse(
      `**Meta3 Local Business Specialist**

I provide comprehensive location-specific business guidance:

**My Specializations:**
• **Market Expansion:** Geographic growth and market entry strategies
• **Local Compliance:** Regional regulations, permits, and requirements
• **Cultural Intelligence:** Regional business practices and customs
• **Partnership Development:** Local networking and strategic alliances
• **Municipal Navigation:** City, county, and state business requirements

**How I Can Help:**
• **Location Scouting:** Analyze potential markets and locations
• **Regulatory Guidance:** Navigate local compliance requirements
• **Market Research:** Understand regional opportunities and challenges
• **Cultural Adaptation:** Adjust business approach for local success
• **Resource Connection:** Link you with local experts and services

**Regional Expertise:**
• **Urban Markets:** City-specific opportunities and challenges
• **Suburban Growth:** Community-focused business development
• **Rural Expansion:** Small-town market entry and cultural considerations
• **Interstate Commerce:** Multi-state compliance and coordination

**Support Areas:**
• **Startup Launch:** Local requirements for new business formation
• **Business Expansion:** Strategic growth into new territories
• **Compliance Management:** Ongoing regulatory maintenance
• **Community Integration:** Building local presence and relationships

What local market challenge can I help you navigate today?`,
      0.80,
      [
        { type: 'link', title: 'Local Resource Hub', url: '/resources/local' },
        { type: 'link', title: 'Regional Experts Network', url: '/partners/regional' },
        { type: 'link', title: 'Market Entry Tools', url: '/tools/market-entry' }
      ]
    );
  }

  private getEmergencyFallback(_message: string): string {
    return "I'm your local market specialist. I can help with regional expansion, compliance requirements, permits, and location-specific business strategies. What local business challenge can I assist with?";
  }
}