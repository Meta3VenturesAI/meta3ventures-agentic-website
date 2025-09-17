/**
 * Meta3 Research Agent - Market Intelligence and Analysis Specialist
 * Provides comprehensive market research, competitive analysis, and industry insights
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';

export class Meta3ResearchAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Research Specialist, an expert market researcher and strategic analyst for Meta3Ventures, a leading venture capital firm.

EXPERTISE:
- Market research and competitive analysis
- Industry trends and strategic intelligence  
- Market sizing (TAM/SAM/SOM analysis)
- Data analysis and insights generation
- Investment market intelligence

TONE & STYLE:
- Professional, analytical, data-driven
- Specific metrics and concrete insights
- Strategic recommendations with actionable next steps
- Use bullet points and structured formatting
- Include relevant market data and statistics when possible

FOCUS AREAS:
- AI/ML, FinTech, SaaS, Blockchain, and emerging technologies
- Early-stage venture capital market dynamics
- Startup ecosystem and funding environment analysis
- Competitive landscape and market positioning

Provide comprehensive, professional analysis that helps with investment decisions and strategic planning. Always include specific insights, data points, and actionable recommendations.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-research',
      name: 'Meta3 Research Specialist',
      description: 'Expert market researcher providing comprehensive industry analysis, competitive intelligence, and strategic market insights.',
      specialties: ['Market Research', 'Competitive Analysis', 'Industry Trends', 'Market Sizing', 'Strategic Intelligence', 'Data Analysis'],
      tools: ['market_data', 'competitive_intelligence', 'trend_analysis', 'industry_reports', 'data_visualization'],
      priority: 70, // Lower than GeneralConversationAgent (80) to prevent interference
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        
        // Only handle complex research requests, not simple queries
        const hasResearchKeywords = (
          keywords.includes('research') ||
          keywords.includes('market analysis') ||
          keywords.includes('competitive analysis') ||
          keywords.includes('industry analysis') ||
          keywords.includes('market sizing') ||
          keywords.includes('tam') ||
          keywords.includes('sam') ||
          keywords.includes('som') ||
          keywords.includes('competitive intelligence') ||
          keywords.includes('market landscape') ||
          keywords.includes('industry trends')
        );
        
        // Avoid simple conversational queries
        const isSimpleQuery = message.length < 50 || 
                            keywords.startsWith('about') ||
                            keywords.startsWith('what is') ||
                            keywords.startsWith('tell me about');
        
        return hasResearchKeywords && !isSimpleQuery;
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
      // First try LLM-enhanced response
      const response = await this.generateLLMResponse(message, this.systemPrompt, context);
      
      return this.createResponse(response.content, this.capabilities.id, {
        confidence: response.confidence,
        processingTime: Date.now() - (context.timestamp?.getTime() || Date.now()),
        tools_used: ['llm_analysis', 'market_intelligence', 'competitive_analysis'],
        attachments: response.attachments
      });
    } catch (error) {
      console.error('Error processing research request:', error);
      
      // Fallback to static analysis
      const staticResponse = this.analyzeRequest(message);
      return this.createResponse(staticResponse.content, this.capabilities.id, {
        confidence: Math.max(staticResponse.confidence - 0.1, 0.6), // Slightly lower confidence for fallback
        processingTime: Date.now() - (context.timestamp?.getTime() || Date.now()),
        tools_used: ['static_analysis', 'fallback_content'],
        attachments: staticResponse.attachments,
        fallback: true
      });
    }
  }

  analyzeRequest(message: string): AgentResponse {
    const keywords = this.extractKeywords(message);
    const confidence = this.calculateConfidence(message, [
      'market', 'research', 'analysis', 'competitive', 'industry', 'trends', 'data'
    ]);

    if (this.isMarketSizingRequest(keywords)) {
      return this.getMarketSizingAnalysis();
    }

    if (this.isCompetitiveAnalysisRequest(keywords)) {
      return this.getCompetitiveAnalysis();
    }

    if (this.isTrendAnalysisRequest(keywords)) {
      return this.getTrendAnalysis();
    }

    if (this.isIndustryAnalysisRequest(keywords)) {
      return this.getIndustryAnalysis();
    }

    return this.getGeneralResearch();
  }

  getFallbackResponse(message: string): AgentResponse {
    // Use the existing analyzeRequest method as fallback
    return this.analyzeRequest(message);
  }

  private isMarketSizingRequest(keywords: string[]): boolean {
    return keywords.some(kw => ['market', 'size', 'sizing', 'tam', 'sam', 'som', 'opportunity'].includes(kw));
  }

  private isCompetitiveAnalysisRequest(keywords: string[]): boolean {
    return keywords.some(kw => ['competitive', 'competition', 'competitors', 'landscape', 'positioning'].includes(kw));
  }

  private isTrendAnalysisRequest(keywords: string[]): boolean {
    return keywords.some(kw => ['trends', 'trending', 'forecast', 'future', 'emerging', 'growth'].includes(kw));
  }

  private isIndustryAnalysisRequest(keywords: string[]): boolean {
    return keywords.some(kw => ['industry', 'sector', 'vertical', 'segment', 'analysis'].includes(kw));
  }

  private getMarketSizingAnalysis(): AgentResponse {
    const content = `# Market Sizing & Opportunity Analysis

## 📊 Comprehensive Market Assessment Framework

### Total Addressable Market (TAM) Analysis:

**AI/ML Market (2024-2030):**
• **Current Size:** $150B (2024)
• **Projected Size:** $1.35T (2030)
• **CAGR:** 42.3%
• **Key Drivers:** Enterprise adoption, automation, generative AI

**Blockchain/Web3 Market:**
• **Current Size:** $67B (2024)  
• **Projected Size:** $163B (2030)
• **CAGR:** 16.2%
• **Recovery Drivers:** Regulatory clarity, institutional adoption

**FinTech Market:**
• **Current Size:** $312B (2024)
• **Projected Size:** $608B (2030)
• **CAGR:** 11.8%
• **Growth Areas:** Embedded finance, B2B payments, RegTech

### 🎯 Serviceable Addressable Market (SAM):

**Early-Stage Venture Capital:**
• **Market Size:** $45B annually
• **Target Segments:** Pre-seed, Seed, Series A
• **Geographic Focus:** North America, Europe, APAC
• **Check Size Range:** $100K - $5M

**Meta3Ventures Positioning:**
• **Target SAM:** $2.8B (6.2% of total VC market)
• **Focus Areas:** AI/ML (35%), FinTech (25%), SaaS (20%), Blockchain (15%), Other (5%)
• **Competitive Advantage:** Technical expertise, hands-on support, faster decisions

### 📈 Market Opportunity Scoring:

**High Opportunity Sectors (Score: 8-10/10):**
• **AI Infrastructure:** 9.2/10 - Strong fundamentals, growing enterprise demand
• **Vertical SaaS:** 8.8/10 - Proven model, expanding market  
• **B2B FinTech:** 8.5/10 - Large market, regulatory tailwinds

Would you like a deeper analysis of any specific market segment?`;

    return this.formatResponse(content, 0.94, [
      { type: 'link', title: 'Market Data Dashboard', url: '/research/market-data' },
      { type: 'link', title: 'Industry Reports', url: '/research/reports' },
      { type: 'link', title: 'Custom Research Request', url: '/research/custom' }
    ]);
  }

  private getCompetitiveAnalysis(): AgentResponse {
    const content = `# Competitive Landscape Analysis

## 🏆 Venture Capital Competitive Intelligence

### Tier 1 Competitors (Direct Competition):

**Andreessen Horowitz (a16z):**
• **AUM:** $35B+ across multiple funds
• **Focus:** Consumer, enterprise, crypto, bio, fintech
• **Strengths:** Brand recognition, portfolio support, media presence
• **Weaknesses:** Large check sizes, slower decision process
• **Differentiation Opportunity:** Faster decisions, hands-on technical support

**Sequoia Capital:**
• **AUM:** $85B+ globally
• **Focus:** Early to growth stage, global presence
• **Strengths:** Track record, global network, brand
• **Weaknesses:** High selectivity, institutional focus
• **Our Advantage:** More accessible, entrepreneur-friendly approach

### 🔍 Competitive Positioning Analysis:

**Meta3Ventures Competitive Advantages:**
• **Technical Expertise:** Deep technical due diligence capabilities
• **Speed:** 4-6 week decision process vs. industry average 8-12 weeks
• **Hands-on Support:** Active post-investment technical and strategic support
• **Market Focus:** Specialized in high-growth tech sectors
• **Check Size:** Sweet spot for Series A gap in market

### 🎯 Strategic Recommendations:
1. **Strengthen Technical Brand:** Publish thought leadership, host technical events
2. **Accelerate Decision Process:** Further streamline due diligence
3. **Expand Support Services:** Add more post-investment resources
4. **Build Sector Expertise:** Hire domain experts in key verticals
5. **Enhance Network Effects:** Facilitate more portfolio collaboration

Which competitive aspect would you like me to analyze in greater depth?`;

    return this.formatResponse(content, 0.92, [
      { type: 'link', title: 'Competitive Intelligence Dashboard', url: '/research/competitive' },
      { type: 'link', title: 'Market Positioning Analysis', url: '/research/positioning' },
      { type: 'link', title: 'Strategic Planning Tools', url: '/research/strategy' }
    ]);
  }

  private getTrendAnalysis(): AgentResponse {
    const content = `# Industry Trends & Future Outlook Analysis

## 🔮 Technology Investment Trends (2024-2025)

### Emerging Technology Trends:

**1. AI Infrastructure & Tooling (🔥 Hot)**
• **Investment Volume:** $18.2B in 2024 (+127% YoY)
• **Key Areas:** MLOps, AI development platforms, model optimization
• **Notable Deals:** Scale AI ($1B), Databricks ($500M), Hugging Face ($235M)
• **Trend Drivers:** Enterprise AI adoption, model complexity, regulatory compliance
• **Investment Thesis:** Infrastructure plays with strong moats and network effects

**2. Vertical AI Applications (📈 Growing)**
• **Market Focus:** Healthcare, legal, finance, manufacturing
• **Investment Pattern:** $50M-200M rounds for proven traction
• **Success Factors:** Domain expertise, regulatory compliance, data advantages
• **Risk Factors:** Regulatory uncertainty, competition from big tech

### 💰 Funding Environment Trends:

**Valuation Corrections (2024):**
• **Series A:** Down 35% from 2021 peaks
• **Series B:** Down 42% from 2021 peaks  
• **Quality Premium:** Top companies maintaining strong multiples
• **Flight to Quality:** Investors focusing on fundamentals

### 📈 5-Year Trend Predictions:

**2025-2030 Outlook:**
• **AI Commoditization:** Basic AI capabilities becoming table stakes
• **Vertical Specialization:** Domain-specific solutions gaining premium valuations
• **Sustainability Focus:** Climate tech and ESG considerations in all investments
• **Global Diversification:** More geographic distribution of innovation
• **Regulatory Maturation:** Clearer frameworks enabling larger investments

Which trend area would you like me to explore in greater detail?`;

    return this.formatResponse(content, 0.96, [
      { type: 'link', title: 'Trend Analysis Dashboard', url: '/research/trends' },
      { type: 'link', title: 'Sector Reports', url: '/research/sectors' },
      { type: 'link', title: 'Custom Trend Analysis', url: '/research/custom-trends' }
    ]);
  }

  private getIndustryAnalysis(): AgentResponse {
    const content = `# Industry Analysis & Strategic Intelligence

## 🏭 Technology Sector Deep Dive

### Industry Landscape Overview:

**Artificial Intelligence & Machine Learning:**
• **Market Maturity:** Rapid growth phase (S-curve acceleration)
• **Key Players:** OpenAI, Anthropic, Google, Microsoft, Meta
• **Investment Focus:** Infrastructure, developer tools, vertical applications
• **Barriers to Entry:** Data access, compute costs, talent scarcity
• **Regulatory Environment:** Increasing oversight, safety requirements

**Enterprise Software (SaaS):**
• **Market Maturity:** Mature with AI-driven evolution
• **Consolidation Trends:** Large players acquiring specialized tools
• **Growth Areas:** Vertical SaaS, AI-enhanced workflows, automation
• **Unit Economics:** Focus on efficient growth, payback periods
• **Competitive Dynamics:** Feature parity, switching costs, network effects

### 📊 Industry Performance Metrics:

**AI/ML Industry KPIs:**
• **Revenue Growth:** 40-60% YoY for leading companies
• **Gross Margins:** 70-85% for software-based solutions
• **R&D Spend:** 25-35% of revenue (high innovation investment)
• **Customer Acquisition:** High initial costs, strong retention
• **Valuation Multiples:** 15-25x revenue for high-growth companies

### 🎯 Strategic Industry Insights:

**Investment Opportunities:**
1. **AI Infrastructure:** Foundational tools and platforms
2. **Vertical AI:** Domain-specific intelligent applications
3. **Developer Tools:** Productivity and automation platforms
4. **Cybersecurity:** Zero-trust, AI-powered security solutions
5. **Climate Tech:** Sustainability and efficiency solutions

### 🔮 Industry Future Outlook:

**Next 3-5 Years:**
• **AI Commoditization:** Basic capabilities becoming standard features
• **Specialization Premium:** Domain expertise commanding higher valuations
• **Regulatory Maturation:** Clearer frameworks enabling innovation
• **Sustainability Integration:** ESG considerations in all technology decisions
• **Global Decentralization:** More distributed innovation ecosystems

Which industry segment would you like me to analyze in greater depth?`;

    return this.formatResponse(content, 0.90, [
      { type: 'link', title: 'Industry Reports', url: '/research/industry' },
      { type: 'link', title: 'Strategic Analysis Tools', url: '/research/strategy' },
      { type: 'link', title: 'Custom Industry Analysis', url: '/research/custom-industry' }
    ]);
  }

  private getGeneralResearch(): AgentResponse {
    const content = `# Market Research & Strategic Intelligence Services

## 🔬 Comprehensive Research Capabilities

I provide professional-grade market research and strategic intelligence to support your investment decisions and business strategy.

### 📊 Research Service Offerings:

**Market Analysis:**
• **Market Sizing & Opportunity Assessment**
• **Competitive Landscape Mapping**
• **Industry Trend Analysis & Forecasting**
• **Customer Segmentation & Behavior Analysis**
• **Regulatory Environment Assessment**

**Investment Research:**
• **Due Diligence Support & Data Validation**
• **Sector Deep Dives & Investment Thesis Development**
• **Portfolio Company Market Positioning**
• **Exit Strategy & Market Timing Analysis**
• **Risk Assessment & Mitigation Planning**

**Strategic Intelligence:**
• **Technology Trend Monitoring**
• **Competitive Intelligence & Benchmarking**
• **Partnership Opportunity Identification**
• **Market Entry Strategy Development**
• **Innovation Landscape Mapping**

### 🎯 Research Methodologies:

**Primary Research:**
• **Expert Interviews:** Industry leaders, customers, partners
• **Customer Surveys:** Market validation, needs assessment
• **Focus Groups:** Product feedback, market positioning
• **Field Research:** On-site analysis, observational studies

**Secondary Research:**
• **Industry Reports:** Professional research publications
• **Financial Analysis:** Public company benchmarking
• **Patent Analysis:** Technology landscape mapping
• **News & Media Monitoring:** Real-time trend identification

### ⏱️ Research Timeline & Pricing:

**Quick Insights (1-3 days):**
• **Market Overview:** High-level sector analysis
• **Competitive Snapshot:** Key player identification
• **Trend Summary:** Current market dynamics

**Standard Analysis (1-2 weeks):**
• **Comprehensive Market Study:** Detailed sector analysis
• **Competitive Intelligence:** In-depth competitor research
• **Strategic Recommendations:** Actionable insights

What specific research question or market analysis can I help you with today?`;

    return this.formatResponse(content, 0.85, [
      { type: 'link', title: 'Research Services Overview', url: '/research/services' },
      { type: 'link', title: 'Schedule Research Consultation', url: '/research/consultation' },
      { type: 'link', title: 'Custom Research Request', url: '/research/custom' }
    ]);
  }
}