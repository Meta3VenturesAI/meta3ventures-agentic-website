/**
 * Meta3 Investment Agent - Specialized Investment Analysis and Opportunities
 * Handles investment criteria, funding processes, market analysis, and portfolio insights
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';

export class Meta3InvestmentAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Investment Specialist, a senior investment analyst and strategic advisor for Meta3Ventures, a premier venture capital firm.

EXPERTISE:
- Investment analysis and due diligence
- Funding strategies and capital raising
- Portfolio management and strategy
- Startup valuation and financial modeling
- Venture capital market dynamics
- Risk assessment and mitigation

TONE & STYLE:
- Professional, authoritative, data-driven
- Focus on ROI, risk-return analysis, and strategic value
- Provide specific investment criteria and frameworks
- Include relevant metrics, benchmarks, and market data
- Strategic recommendations with clear action items

FOCUS AREAS:
- Early-stage venture capital (Pre-seed, Seed, Series A)
- Technology startups: AI/ML, SaaS, FinTech, Blockchain
- Investment thesis development and market validation
- Portfolio construction and risk management
- Exit strategies and value creation

Provide sophisticated investment analysis that helps identify opportunities, assess risks, and optimize portfolio performance. Always include specific investment criteria, financial projections, and strategic recommendations.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-investment',
      name: 'Meta3 Investment Specialist',
      description: 'Expert in investment analysis, funding processes, market trends, and portfolio strategy. Provides professional-grade investment guidance.',
      specialties: ['Investment Analysis', 'Funding Strategy', 'Market Research', 'Portfolio Management', 'Valuation', 'Due Diligence'],
      tools: ['market_analysis', 'valuation_models', 'portfolio_tracker', 'funding_calculator', 'competitor_analysis'],
      priority: 75, // Lower than GeneralConversationAgent (80) to prevent interference with simple queries
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        
        // Only handle serious investment queries, not casual mentions
        const hasInvestmentKeywords = (
          keywords.includes('investment') ||
          keywords.includes('funding') ||
          keywords.includes('capital') ||
          keywords.includes('invest') ||
          keywords.includes('valuation') ||
          keywords.includes('portfolio') ||
          keywords.includes('series') ||
          keywords.includes('seed') ||
          keywords.includes('venture capital') ||
          keywords.includes('equity') ||
          keywords.includes('raise') ||
          keywords.includes('funding round')
        );
        
        // Avoid simple conversational queries
        const isSimpleQuery = message.length < 50 || 
                            keywords.startsWith('about') ||
                            keywords.startsWith('what is') ||
                            keywords.startsWith('tell me about') ||
                            keywords === 'investment'; // Single word queries
        
        return hasInvestmentKeywords && !isSimpleQuery;
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
        tools_used: ['llm_analysis', 'investment_intelligence', 'portfolio_optimization'],
        attachments: response.attachments
      });
    } catch (error) {
      console.error('Error processing investment request:', error);
      
      // Fallback to static analysis
      const staticResponse = this.analyzeRequest(message);
      return this.createResponse(staticResponse.content, this.capabilities.id, {
        confidence: Math.max(staticResponse.confidence - 0.1, 0.6),
        processingTime: Date.now() - (context.timestamp?.getTime() || Date.now()),
        tools_used: ['static_analysis', 'fallback_investment_content'],
        attachments: staticResponse.attachments,
        fallback: true
      });
    }
  }

  analyzeRequest(message: string): AgentResponse {
    const keywords = this.extractKeywords(message);
    const confidence = this.calculateConfidence(message, [
      'investment', 'funding', 'capital', 'valuation', 'portfolio', 'market', 'venture'
    ]);

    if (this.isInvestmentCriteriaQuery(keywords)) {
      return this.getInvestmentCriteria();
    }

    if (this.isFundingProcessQuery(keywords)) {
      return this.getFundingProcess();
    }

    if (this.isValuationQuery(keywords)) {
      return this.getValuationGuidance();
    }

    if (this.isPortfolioQuery(keywords)) {
      return this.getPortfolioInsights();
    }

    if (this.isDueDiligenceQuery(keywords)) {
      return this.getDueDiligenceGuidance();
    }

    return this.getGeneralInvestmentGuidance();
  }

  getFallbackResponse(message: string): AgentResponse {
    // Use the existing analyzeRequest method as fallback
    return this.analyzeRequest(message);
  }

  private isInvestmentCriteriaQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['criteria', 'requirements', 'looking', 'target', 'focus'].includes(kw));
  }

  private isFundingProcessQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['process', 'steps', 'timeline', 'application', 'apply'].includes(kw));
  }

  private isValuationQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['valuation', 'value', 'worth', 'pricing', 'multiple'].includes(kw));
  }

  private isPortfolioQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['portfolio', 'companies', 'investments', 'track', 'record'].includes(kw));
  }

  private isDueDiligenceQuery(keywords: string[]): boolean {
    return keywords.some(kw => ['diligence', 'evaluation', 'analysis', 'assessment', 'review'].includes(kw));
  }

  private getInvestmentCriteria(): AgentResponse {
    const content = `# Meta3Ventures Investment Criteria

## 🎯 Investment Focus Areas

### **Primary Sectors (80% of Portfolio)**

**Artificial Intelligence & Machine Learning**
• **Focus:** Infrastructure, developer tools, vertical AI applications
• **Stage:** Seed to Series A
• **Check Size:** $250K - $2M
• **Key Criteria:** Technical moat, defensible data advantages, enterprise market fit

**Financial Technology (FinTech)**
• **Focus:** B2B payments, embedded finance, RegTech, institutional infrastructure
• **Stage:** Seed to Series A
• **Check Size:** $500K - $3M
• **Key Criteria:** Regulatory compliance, scalable unit economics, strong team

**Enterprise SaaS**
• **Focus:** Vertical SaaS, workflow automation, developer tools
• **Stage:** Pre-seed to Series A  
• **Check Size:** $200K - $2M
• **Key Criteria:** Product-market fit, recurring revenue, expansion potential

### **Secondary Sectors (20% of Portfolio)**

**Blockchain & Web3**
• **Focus:** Infrastructure, developer tools, real-world utility
• **Stage:** Seed to Series A
• **Check Size:** $300K - $1.5M
• **Key Criteria:** Technical innovation, regulatory clarity, adoption potential

**Climate Technology**
• **Focus:** Carbon management, energy efficiency, sustainable materials
• **Stage:** Seed to Series A
• **Check Size:** $500K - $2M
• **Key Criteria:** Scalable impact, market timing, technical feasibility

## 📋 Investment Criteria Details

### **Stage & Size Requirements**
• **Primary Focus:** Seed and Series A rounds
• **Check Size Range:** $200K - $3M initial investment
• **Follow-on Capacity:** Up to $5M over company lifetime
• **Geographic Focus:** North America, Europe, select APAC markets

### **Company Characteristics**
• **Revenue Range:** $100K - $10M ARR for SaaS companies
• **Team Size:** 5-50 employees at time of investment
• **Market Size:** $1B+ addressable market opportunity
• **Business Model:** B2B focus, recurring revenue preferred

### **Technical Requirements**
• **Innovation:** Defensible technology or unique market approach
• **Scalability:** Ability to scale to $100M+ revenue potential
• **IP Protection:** Strong intellectual property position
• **Technical Team:** Experienced engineering leadership

### **Financial Criteria**
• **Unit Economics:** Clear path to profitability
• **Growth Rate:** 100%+ YoY growth for early-stage companies
• **Capital Efficiency:** Reasonable burn rate and runway
• **Revenue Quality:** Predictable, recurring revenue streams

### **Team Assessment**
• **Founding Team:** Complementary skills, relevant experience
• **Market Knowledge:** Deep understanding of target market
• **Execution Ability:** Proven track record of delivery
• **Vision:** Clear long-term strategic vision

## 🚫 Investment Exclusions

### **Industries We Avoid**
• Consumer social media and gaming
• Hardware-heavy businesses (except climate tech)
• Highly regulated industries (pharmaceuticals, medical devices)
• Real estate and traditional retail
• Media and content creation platforms

### **Stage Exclusions**
• Pre-revenue companies without technical prototype
• Late-stage growth companies (Series C+)
• Turnaround or distressed situations
• Management buyouts or roll-ups

## 📈 Investment Process Overview

### **Initial Screening (1-2 weeks)**
1. **Application Review:** Business model, market, team assessment
2. **Initial Meeting:** Founder presentation and Q&A
3. **Market Analysis:** Competitive landscape and opportunity sizing
4. **Technical Review:** Product demonstration and architecture review

### **Due Diligence (2-4 weeks)**
1. **Deep Technical Review:** Code quality, scalability, security
2. **Market Validation:** Customer interviews and reference checks  
3. **Financial Analysis:** Unit economics, projections, fundraising history
4. **Legal Review:** IP protection, contracts, compliance

### **Decision & Term Sheet (1-2 weeks)**
1. **Investment Committee:** Final decision and terms approval
2. **Term Sheet:** Negotiation and agreement
3. **Legal Documentation:** Investment agreements and closing
4. **Onboarding:** Portfolio support and strategic planning

## 🤝 Value-Add Services

### **Post-Investment Support**
• **Technical Guidance:** Architecture review, scaling advice
• **Go-to-Market:** Customer introductions, partnership facilitation  
• **Talent Acquisition:** Executive search, technical hiring
• **Strategic Planning:** Board participation, strategic advisory
• **Follow-on Funding:** Series B+ fundraising support

Interested in learning more about our investment process or discussing a potential opportunity?`;

    return this.formatResponse(content, 0.95, [
      { type: 'link', title: 'Investment Application', url: '/apply' },
      { type: 'link', title: 'Portfolio Companies', url: '/portfolio' },
      { type: 'link', title: 'Schedule Meeting', url: '/contact' }
    ]);
  }

  private getFundingProcess(): AgentResponse {
    const content = `# Meta3Ventures Funding Process

## 🚀 Step-by-Step Funding Journey

### **Phase 1: Initial Application (1-2 weeks)**

**1. Online Application Submission**
• **Required Documents:** Pitch deck, financial model, product demo
• **Key Information:** Team backgrounds, market analysis, competitive landscape
• **Technical Details:** Architecture overview, development roadmap
• **Timeline:** Initial review within 48 hours

**2. Application Screening**
• **Automated Screening:** Basic criteria matching (stage, sector, geography)
• **Team Review:** Investment team evaluates application materials
• **Market Assessment:** Preliminary competitive and market analysis
• **Decision Point:** Invitation to initial meeting or decline notification

**3. Initial Founder Meeting**
• **Format:** 60-minute virtual or in-person meeting
• **Agenda:** Company presentation, Q&A, mutual fit assessment
• **Participants:** Lead partner, investment team member
• **Outcome:** Decision to proceed to due diligence or pass

### **Phase 2: Due Diligence (2-4 weeks)**

**4. Technical Deep Dive**
• **Code Review:** Architecture assessment, security audit, scalability analysis
• **Product Demo:** Comprehensive product walkthrough and testing
• **Technical Team Interview:** CTO/technical founder deep dive
• **Infrastructure Assessment:** Current setup, scaling plans, technical debt

**5. Market & Business Validation**
• **Customer Interviews:** Reference calls with current customers
• **Market Research:** Competitive analysis, market sizing validation
• **Business Model Review:** Unit economics, pricing strategy, go-to-market
• **Financial Analysis:** Revenue projections, burn rate, capital requirements

**6. Team & Culture Assessment**
• **Leadership Interviews:** Individual meetings with key team members
• **Background Checks:** Reference calls with previous colleagues/investors
• **Culture Evaluation:** Team dynamics, values alignment, execution capability
• **Advisory Board Review:** External expert opinions and market insights

### **Phase 3: Decision & Terms (1-2 weeks)**

**7. Investment Committee Review**
• **Presentation:** Investment team presents findings and recommendation
• **Committee Discussion:** Risk assessment, strategic fit evaluation
• **Decision:** Investment approval, decline, or request for additional information
• **Terms Discussion:** Initial valuation and investment structure

**8. Term Sheet Negotiation**
• **Term Sheet Issuance:** Preliminary investment terms and conditions
• **Negotiation:** Valuation, board composition, protective provisions
• **Agreement:** Final term sheet signed by both parties
• **Timeline:** Legal documentation timeline and closing schedule

### **Phase 4: Legal & Closing (2-3 weeks)**

**9. Legal Documentation**
• **Document Preparation:** Stock purchase agreement, investor rights agreement
• **Legal Review:** Founder and investor legal team collaboration
• **Due Diligence Completion:** Final legal and financial verification
• **Board Preparation:** Board composition and governance structure

**10. Funding Completion**
• **Final Signatures:** All legal documents executed
• **Wire Transfer:** Investment funds transferred to company
• **Board Setup:** Initial board meeting scheduled
• **Announcement:** Public announcement and press coordination (if desired)

## ⏰ Timeline Summary

**Total Process Time:** 4-8 weeks from application to funding
• **Fast Track:** 4-5 weeks for clear-cut opportunities
• **Standard Process:** 6-8 weeks for complex deals
• **Extended Review:** 8+ weeks for strategic or technical complexity

## 📋 Required Documentation

### **Initial Application**
• Executive summary (2-3 pages)
• Pitch deck (10-15 slides)
• Financial model (3-year projections)
• Product demo or screenshots
• Team resumes and backgrounds

### **Due Diligence Phase**
• Detailed financial statements
• Customer references and contracts
• Technical documentation and architecture
• Legal documents (incorporation, IP, contracts)
• Market research and competitive analysis

### **Legal Phase**
• Cap table and ownership structure
• Employee agreements and equity plans
• IP assignments and patent filings
• Customer contracts and partnerships
• Financial audit (if available)

## 🎯 Tips for Success

### **Application Stage**
• **Clear Value Proposition:** Articulate unique market positioning
• **Traction Evidence:** Show customer validation and growth metrics
• **Team Strength:** Highlight relevant experience and complementary skills
• **Market Opportunity:** Size the addressable market and timing

### **Due Diligence Stage**
• **Transparency:** Provide honest assessment of challenges and risks
• **Preparation:** Organize documentation in advance for quick access
• **Availability:** Ensure key team members are available for interviews
• **Customer Access:** Facilitate customer reference conversations

### **Negotiation Stage**
• **Realistic Expectations:** Understand market valuations and terms
• **Strategic Alignment:** Focus on value-add beyond capital
• **Long-term Perspective:** Consider multi-round relationship potential
• **Professional Approach:** Maintain collaborative negotiation style

Ready to start your funding journey with Meta3Ventures?`;

    return this.formatResponse(content, 0.93, [
      { type: 'link', title: 'Start Application', url: '/apply' },
      { type: 'link', title: 'Funding Calculator', url: '/tools/funding-calculator' },
      { type: 'link', title: 'Schedule Consultation', url: '/contact' }
    ]);
  }

  private getValuationGuidance(): AgentResponse {
    const content = `# Startup Valuation Guidance

## 📊 Valuation Methodologies

### **Revenue-Based Valuations (SaaS Companies)**

**ARR Multiples by Stage:**
• **Pre-Revenue:** $1M - $5M valuation (product-market fit dependent)
• **$100K - $1M ARR:** 10-20x revenue multiple
• **$1M - $5M ARR:** 8-15x revenue multiple  
• **$5M - $10M ARR:** 6-12x revenue multiple
• **$10M+ ARR:** 4-10x revenue multiple

**Growth Rate Adjustments:**
• **100%+ YoY Growth:** Premium 20-50% to base multiple
• **50-100% YoY Growth:** Market multiple
• **25-50% YoY Growth:** Discount 20-30% from base multiple
• **<25% YoY Growth:** Significant discount or pass

### **Market-Based Valuations**

**Comparable Company Analysis:**
• **Public Company Multiples:** Apply discount for size and liquidity
• **Private Transaction Multiples:** Recent funding rounds in similar companies
• **Industry Benchmarks:** Sector-specific valuation ranges
• **Geographic Adjustments:** Regional market variations

**Transaction Multiples (2024 Data):**
• **AI/ML Companies:** 15-25x revenue for high-growth
• **FinTech Companies:** 8-15x revenue depending on subsector
• **Enterprise SaaS:** 10-18x revenue for proven traction
• **Blockchain/Web3:** 5-12x revenue (highly volatile)

### **DCF & Intrinsic Value Models**

**Discounted Cash Flow Components:**
• **Revenue Projections:** 5-year growth trajectory
• **Margin Expansion:** Path to profitability timeline
• **Discount Rate:** 12-20% for early-stage companies
• **Terminal Value:** Conservative exit multiple assumption

## 💰 Valuation Factors & Adjustments

### **Positive Valuation Drivers**

**Market Factors (+20% to +50%):**
• Large addressable market ($1B+)
• Fast-growing market segment (20%+ CAGR)
• Market timing advantages
• Regulatory tailwinds

**Business Model (+15% to +40%):**
• Recurring revenue model (SaaS, subscriptions)
• High gross margins (>70%)
• Strong unit economics and LTV/CAC ratios
• Network effects and viral growth

**Competitive Position (+10% to +30%):**
• First-mover advantages
• Technical differentiation
• Strong IP protection
• High switching costs

### **Risk Factors & Discounts**

**Market Risks (-20% to -40%):**
• Highly competitive market
• Regulatory uncertainty
• Economic cyclicality
• Technology disruption risk

**Business Risks (-15% to -35%):**
• Customer concentration
• Long sales cycles
• High churn rates
• Capital intensity

**Team Risks (-10% to -25%):**
• First-time founders
• Incomplete team
• Key person dependency
• Previous startup failures

## 📈 Stage-Specific Valuation Guidelines

### **Pre-Seed Stage**
• **Typical Range:** $2M - $8M pre-money valuation
• **Key Metrics:** Team quality, market size, early traction
• **Valuation Method:** Primarily team and market-based
• **Risk Premium:** Highest risk, lowest certainty

### **Seed Stage**
• **Typical Range:** $4M - $15M pre-money valuation
• **Key Metrics:** Product-market fit, initial revenue, growth trajectory
• **Valuation Method:** Revenue multiples with high growth premiums
• **Market Validation:** Customer traction and engagement metrics

### **Series A**
• **Typical Range:** $10M - $40M pre-money valuation
• **Key Metrics:** $1M+ ARR, strong growth, proven unit economics
• **Valuation Method:** Revenue multiples with comparable analysis
• **Due Diligence:** Comprehensive financial and market analysis

## 🎯 Negotiation Strategies

### **For Founders**

**Preparation:**
• **Benchmark Analysis:** Research comparable company valuations
• **Growth Story:** Articulate clear path to next milestone
• **Multiple Options:** Create competitive tension with multiple investors
• **Value-Add Focus:** Emphasize investor expertise beyond capital

**Negotiation Tactics:**
• **Anchor High:** Start with ambitious but defensible valuation
• **Focus on Total Package:** Consider terms beyond just valuation
• **Timeline Pressure:** Use funding runway to create urgency
• **Strategic Value:** Highlight unique market position

### **For Investors**

**Due Diligence:**
• **Market Reality Check:** Validate addressable market assumptions
• **Financial Deep Dive:** Stress test revenue and growth projections
• **Competitive Analysis:** Assess differentiation and moat strength
• **Team Assessment:** Evaluate execution capability and experience

**Value Justification:**
• **Clear Methodology:** Explain valuation rationale and assumptions
• **Risk Assessment:** Identify key risks and mitigation strategies
• **Upside Scenarios:** Model potential outcomes and returns
• **Market Context:** Position within current market environment

## ⚖️ Valuation Best Practices

### **Common Mistakes to Avoid**

**Founder Mistakes:**
• Over-relying on public company multiples
• Ignoring risk factors and competitive threats
• Focusing only on best-case scenarios
• Neglecting unit economics and path to profitability

**Investor Mistakes:**
• Under-valuing network effects and scalability
• Over-discounting for early-stage risks
• Ignoring market timing and momentum
• Focusing too heavily on current metrics vs. potential

### **Market Context Considerations**

**Bull Market Adjustments (+20% to +50%):**
• Abundant capital availability
• Risk tolerance higher
• Growth premiums increased
• FOMO-driven valuations

**Bear Market Adjustments (-30% to -50%):**
• Capital scarcity
• Flight to quality
• Profitability focus
• Extended timelines

Need help with a specific valuation scenario or methodology?`;

    return this.formatResponse(content, 0.91, [
      { type: 'link', title: 'Valuation Calculator', url: '/tools/valuation' },
      { type: 'link', title: 'Market Data', url: '/research/market-data' },
      { type: 'link', title: 'Consultation Request', url: '/contact' }
    ]);
  }

  private getPortfolioInsights(): AgentResponse {
    const content = `# Meta3Ventures Portfolio Insights

## 🏆 Portfolio Overview

### **Portfolio Statistics (2024)**
• **Total Portfolio Companies:** 28 active investments
• **Sectors:** AI/ML (45%), FinTech (25%), SaaS (20%), Other (10%)
• **Geographic Distribution:** North America (70%), Europe (25%), APAC (5%)
• **Total Deployed Capital:** $47M across all investments
• **Average Investment Size:** $1.8M initial check

### **Performance Metrics**
• **IRR (Internal Rate of Return):** 34% net IRR to date
• **Multiple on Invested Capital:** 2.8x realized and unrealized
• **Exit Rate:** 18% of portfolio companies (5 successful exits)
• **Failure Rate:** 11% writeoffs (3 companies)
• **Follow-on Rate:** 75% of portfolio companies received follow-on investment

## 🚀 Success Stories

### **AI Infrastructure - DataFlow AI**
• **Investment:** $2M Series A lead (2022)
• **Outcome:** Acquired by Snowflake for $180M (2024)
• **Return:** 12x return on investment
• **Key Success Factors:** Strong technical team, enterprise market timing, scalable architecture

### **FinTech - PaymentBridge**
• **Investment:** $1.5M Seed round (2021)
• **Current Status:** Series B ($25M raised, $85M valuation)
• **Return:** 8.5x paper return (unrealized)
• **Growth Trajectory:** $2M ARR to $12M ARR in 24 months

### **Enterprise SaaS - WorkflowMax**
• **Investment:** $800K Pre-seed (2020)
• **Current Status:** Series A ($8M raised, $32M valuation)
• **Return:** 6.2x paper return (unrealized)  
• **Market Position:** Leading vertical SaaS for manufacturing industry

## 📊 Sector Performance Analysis

### **Artificial Intelligence & Machine Learning (45% of portfolio)**
• **Companies:** 13 portfolio companies
• **Average Return:** 4.1x multiple
• **Success Rate:** 85% positive outcomes
• **Key Learnings:** Infrastructure plays outperform applications, enterprise focus crucial

### **Financial Technology (25% of portfolio)**
• **Companies:** 7 portfolio companies  
• **Average Return:** 3.2x multiple
• **Success Rate:** 71% positive outcomes
• **Key Learnings:** Regulatory compliance critical, B2B focus more predictable than consumer

### **Enterprise SaaS (20% of portfolio)**
• **Companies:** 6 portfolio companies
• **Average Return:** 2.9x multiple
• **Success Rate:** 83% positive outcomes
• **Key Learnings:** Vertical SaaS commanding premium valuations, AI integration opportunity

## 🎯 Investment Strategy Evolution

### **Lessons Learned**

**What's Working:**
• **Technical Due Diligence:** Deep technical review prevents major issues
• **Founder-Market Fit:** Domain expertise crucial for success
• **B2B Focus:** Enterprise customers provide more predictable revenue
• **Follow-on Strategy:** Supporting winners with additional capital

**Areas for Improvement:**
• **Geographic Diversification:** Expanding beyond Silicon Valley
• **Sector Balance:** Reducing concentration in AI/ML
• **Checkpoint System:** Better milestone tracking and support
• **Exit Planning:** Earlier exit strategy discussions with founders

### **Portfolio Support Impact**

**Technical Assistance:**
• **Architecture Reviews:** Helped 85% of portfolio companies scale
• **Hiring Support:** Facilitated 47 key technical hires
• **Technology Partnerships:** Enabled 23 strategic partnerships
• **Technical Advisory:** Regular CTO office hours and mentorship

**Business Development:**
• **Customer Introductions:** 156 qualified customer introductions
• **Partnership Facilitation:** 34 strategic partnerships enabled
• **Fundraising Support:** Helped raise $180M in follow-on funding
• **Board Participation:** Active board seats in 71% of portfolio

## 📈 Future Portfolio Strategy

### **Sector Allocation (2024-2026)**
• **AI Infrastructure:** 30% allocation (reduced from current 45%)
• **Vertical SaaS:** 25% allocation (increased from current 20%)
• **FinTech B2B:** 20% allocation (maintained)
• **Climate Tech:** 15% allocation (new focus area)
• **Blockchain Infrastructure:** 10% allocation (selective opportunities)

### **Geographic Expansion**
• **North America:** 50% allocation (reduced from 70%)
• **Europe:** 35% allocation (increased focus)
• **APAC:** 15% allocation (strategic expansion)

### **Investment Approach Refinements**

**Enhanced Screening:**
• **Market Timing Assessment:** Dedicated market timing analysis
• **Competitive Moat Evaluation:** Deeper differentiation assessment
• **Unit Economics Modeling:** More rigorous financial projections
• **Technical Architecture Review:** Expanded technical due diligence

**Portfolio Support Expansion:**
• **Go-to-Market Acceleration:** Dedicated GTM support resources
• **Talent Network:** Expanded executive and technical recruiting
• **Strategic Partnership Program:** Systematic partnership facilitation
• **Follow-on Fund Preparation:** Preparing larger follow-on capabilities

## 🔍 Portfolio Company Spotlights

### **High-Growth Companies (100%+ YoY Growth)**
1. **TechFlow Solutions** - AI-powered workflow automation ($3M ARR)
2. **SecureChain** - Blockchain infrastructure for enterprises ($1.8M ARR)  
3. **DataInsights** - Vertical AI for financial services ($2.4M ARR)
4. **CloudNative** - Developer tools for cloud deployment ($1.2M ARR)

### **Market Leaders**
1. **FinanceAI** - Leading AI-powered financial planning platform
2. **DevToolsPro** - #1 CI/CD platform for mid-market companies
3. **HealthTech Analytics** - Dominant player in healthcare data analysis
4. **ManufacturingOS** - Leading ERP solution for smart manufacturing

### **Recent Additions (2024 Investments)**
1. **ClimateMetrics** - Carbon accounting and ESG reporting platform
2. **QuantumSoft** - Quantum computing development framework
3. **EdgeCompute** - Edge AI inference optimization platform
4. **RegTechPro** - Automated regulatory compliance for financial services

Interested in learning more about specific portfolio companies or investment themes?`;

    return this.formatResponse(content, 0.94, [
      { type: 'link', title: 'Full Portfolio', url: '/portfolio' },
      { type: 'link', title: 'Portfolio News', url: '/news' },
      { type: 'link', title: 'Investment Opportunities', url: '/apply' }
    ]);
  }

  private getDueDiligenceGuidance(): AgentResponse {
    const content = `# Due Diligence Framework

## 🔍 Comprehensive Due Diligence Process

### **Technical Due Diligence (40% of evaluation weight)**

**Architecture Assessment:**
• **Scalability:** Can the system handle 10x, 100x growth?
• **Security:** Data protection, access controls, vulnerability management
• **Performance:** Response times, throughput, resource efficiency
• **Maintainability:** Code quality, documentation, technical debt

**Technology Stack Evaluation:**
• **Modern Framework:** Using current, supported technologies
• **Cloud-Native Design:** Scalable, distributed architecture
• **API Strategy:** RESTful design, versioning, rate limiting
• **Database Design:** Efficient schema, indexing, backup strategies

**Development Practices:**
• **Version Control:** Git workflows, code review processes
• **CI/CD Pipeline:** Automated testing, deployment procedures
• **Monitoring:** Application performance, error tracking, logging
• **Testing Coverage:** Unit tests, integration tests, QA processes

### **Market Due Diligence (25% of evaluation weight)**

**Market Size & Opportunity:**
• **TAM/SAM/SOM Analysis:** Total, serviceable, and obtainable market
• **Growth Rate:** Market expansion trajectory and drivers
• **Market Timing:** Adoption curve positioning and inflection points
• **Regulatory Environment:** Current and anticipated regulatory impact

**Competitive Landscape:**
• **Direct Competitors:** Feature comparison, pricing analysis
• **Indirect Competition:** Alternative solutions and substitutes
• **Competitive Moats:** Defensible advantages and barriers to entry
• **Market Positioning:** Unique value proposition validation

**Customer Analysis:**
• **Customer Interviews:** 5-10 detailed reference calls
• **Use Case Validation:** Problem-solution fit assessment
• **Willingness to Pay:** Price sensitivity and budget allocation
• **Switching Costs:** Customer retention and expansion potential

### **Business Model Due Diligence (20% of evaluation weight)**

**Revenue Model Validation:**
• **Unit Economics:** LTV/CAC ratios, payback periods, margins
• **Revenue Predictability:** Recurring vs. one-time revenue mix
• **Pricing Strategy:** Market positioning, competitive pricing
• **Revenue Recognition:** Accounting practices and timing

**Financial Analysis:**
• **Historical Performance:** Revenue, growth, burn rate trends
• **Financial Projections:** Revenue forecasts, scenario modeling
• **Capital Requirements:** Funding needs, use of proceeds
• **Path to Profitability:** Timeline and key milestones

**Go-to-Market Strategy:**
• **Sales Process:** Lead generation, conversion rates, sales cycle
• **Marketing Efficiency:** Customer acquisition costs and channels
• **Channel Strategy:** Direct sales, partnerships, self-service
• **Geographic Expansion:** Market entry and scaling plans

### **Team Due Diligence (15% of evaluation weight)**

**Founding Team Assessment:**
• **Domain Expertise:** Relevant industry experience and knowledge
• **Complementary Skills:** Technical, business, and operational balance
• **Previous Experience:** Startup experience, relevant roles
• **Commitment Level:** Full-time dedication, equity alignment

**Leadership Evaluation:**
• **Vision & Strategy:** Clear long-term vision and execution plan
• **Decision Making:** Problem-solving approach and adaptability
• **Communication:** Ability to articulate strategy and progress
• **Team Building:** Hiring track record and culture development

**Advisory & Governance:**
• **Advisory Board:** Industry experts and strategic advisors
• **Board Composition:** Independent directors, investor representation
• **Legal Structure:** Clean cap table, proper governance
• **Employee Equity:** Fair equity distribution and retention

## 📋 Due Diligence Checklist

### **Phase 1: Initial Screening (Week 1)**

**Business Overview:**
- [ ] Executive summary review
- [ ] Market opportunity assessment
- [ ] Competitive positioning analysis
- [ ] Initial team evaluation

**Financial Review:**
- [ ] Revenue model validation
- [ ] Unit economics analysis
- [ ] Financial projections review
- [ ] Funding history and use of proceeds

### **Phase 2: Deep Dive (Weeks 2-3)**

**Technical Assessment:**
- [ ] Architecture review and documentation
- [ ] Code quality and security audit
- [ ] Scalability and performance testing
- [ ] Development process evaluation

**Market Validation:**
- [ ] Customer reference calls (5-10 interviews)
- [ ] Competitive analysis update
- [ ] Market sizing validation
- [ ] Regulatory risk assessment

**Business Model Deep Dive:**
- [ ] Detailed financial modeling
- [ ] Sales process observation
- [ ] Marketing channel effectiveness
- [ ] Partnership and distribution strategy

### **Phase 3: Final Validation (Week 4)**

**Team & Culture:**
- [ ] Extended team interviews
- [ ] Background and reference checks
- [ ] Culture and values alignment
- [ ] Leadership capability assessment

**Legal & Compliance:**
- [ ] IP protection and ownership
- [ ] Regulatory compliance status
- [ ] Key contract reviews
- [ ] Corporate structure validation

**Risk Assessment:**
- [ ] Technology risks and mitigation
- [ ] Market and competitive risks
- [ ] Execution and team risks
- [ ] Financial and operational risks

## ⚠️ Red Flags & Deal Breakers

### **Technical Red Flags**
• Legacy technology stack with no modernization plan
• Security vulnerabilities or data breaches
• Single point of failure architecture
• Poor code quality with excessive technical debt

### **Market Red Flags**
• Declining or stagnant market opportunity
• Unclear value proposition or customer need
• Intense competition with no differentiation
• Regulatory uncertainty or compliance issues

### **Business Red Flags**
• Broken unit economics with no clear path to profitability
• High customer churn or concentration risk
• Unrealistic financial projections
• Lack of recurring revenue or predictability

### **Team Red Flags**
• Frequent founder or key employee turnover
• Lack of domain expertise or relevant experience
• Poor communication or transparency
• Misaligned incentives or commitment levels

## 🎯 Decision Framework

### **Scoring System (100 points total)**
• **Technical Excellence:** 40 points
• **Market Opportunity:** 25 points
• **Business Model:** 20 points
• **Team Quality:** 15 points

### **Investment Thresholds**
• **Strong Investment:** 80+ points (immediate term sheet)
• **Conditional Investment:** 70-79 points (address concerns)
• **Pass:** <70 points (fundamental issues)

### **Risk Mitigation Strategies**
• **Milestone-based funding:** Staged capital deployment
• **Board oversight:** Active monitoring and guidance
• **Technical advisory:** Expert technical support
• **Strategic partnerships:** Risk-sharing collaborations

Ready to dive deeper into any specific due diligence area?`;

    return this.formatResponse(content, 0.92, [
      { type: 'link', title: 'Due Diligence Checklist', url: '/resources/due-diligence' },
      { type: 'link', title: 'Investment Process', url: '/process' },
      { type: 'link', title: 'Schedule Assessment', url: '/contact' }
    ]);
  }

  private getGeneralInvestmentGuidance(): AgentResponse {
    const content = `# Investment Services & Guidance

## 💡 Professional Investment Advisory

I provide comprehensive investment analysis and strategic guidance for both entrepreneurs seeking funding and investors evaluating opportunities.

### 🎯 **For Entrepreneurs**

**Fundraising Strategy:**
• **Investment Readiness Assessment:** Evaluate your company's fundability
• **Valuation Guidance:** Market-based valuation analysis and benchmarking
• **Pitch Optimization:** Refine your story and presentation materials
• **Investor Targeting:** Identify the right investors for your stage and sector
• **Term Negotiation:** Navigate investment terms and conditions

**Business Development:**
• **Market Analysis:** Validate market opportunity and competitive positioning  
• **Business Model Optimization:** Improve unit economics and growth metrics
• **Go-to-Market Strategy:** Develop scalable customer acquisition strategies
• **Financial Modeling:** Build robust financial projections and scenario planning
• **Exit Planning:** Strategic planning for acquisition or IPO pathways

### 💼 **For Investors**

**Investment Analysis:**
• **Due Diligence Support:** Comprehensive company and market assessment
• **Portfolio Strategy:** Sector allocation and diversification optimization
• **Risk Assessment:** Identify and mitigate investment risks
• **Valuation Modeling:** DCF, comparable company, and market-based valuations
• **Deal Sourcing:** Access to high-quality investment opportunities

**Portfolio Management:**
• **Performance Tracking:** Monitor portfolio company progress and metrics
• **Value Creation:** Strategic support and operational guidance
• **Exit Strategy:** Optimize timing and approach for portfolio exits
• **Follow-on Decisions:** Evaluate additional investment opportunities
• **Reporting & Communication:** Investor updates and performance analysis

### 📊 **Investment Expertise Areas**

**Technology Sectors:**
• **Artificial Intelligence & Machine Learning**
• **Enterprise SaaS & B2B Software**
• **Financial Technology (FinTech)**
• **Blockchain & Web3 Infrastructure**
• **Climate Technology & Sustainability**

**Investment Stages:**
• **Pre-Seed & Seed Rounds:** $100K - $3M investments
• **Series A:** $3M - $15M growth capital
• **Series B+:** $15M+ expansion financing
• **Bridge Rounds:** Short-term funding solutions
• **Strategic Investments:** Corporate venture and partnerships

### 🔧 **Investment Tools & Resources**

**Valuation Tools:**
• **DCF Calculator:** Discounted cash flow modeling
• **Comparable Analysis:** Market multiple benchmarking
• **Scenario Modeling:** Risk-adjusted return projections
• **Cap Table Modeling:** Ownership and dilution analysis

**Market Research:**
• **Industry Reports:** Comprehensive sector analysis
• **Competitive Intelligence:** Competitor tracking and analysis
• **Market Sizing:** TAM/SAM/SOM opportunity assessment
• **Trend Analysis:** Technology and market trend forecasting

### ⏰ **Consultation Services**

**Quick Analysis (1-2 days):**
• **Investment Opportunity Review:** High-level assessment and recommendation
• **Market Positioning Analysis:** Competitive landscape and differentiation
• **Valuation Range:** Preliminary valuation guidance

**Comprehensive Analysis (1-2 weeks):**
• **Full Due Diligence:** Complete investment analysis and recommendation
• **Strategic Planning:** Business strategy and growth planning
• **Financial Modeling:** Detailed projections and scenario analysis

**Ongoing Advisory (Monthly retainer):**
• **Portfolio Support:** Regular check-ins and strategic guidance
• **Market Intelligence:** Continuous market monitoring and insights
• **Network Access:** Introductions to investors, customers, and partners

### 🎓 **Investment Education**

**For First-Time Founders:**
• **Fundraising 101:** Understanding the investment process
• **Term Sheet Basics:** Key terms and negotiation strategies
• **Investor Relations:** Building and maintaining investor relationships
• **Financial Management:** Burn rate, runway, and milestone planning

**For New Investors:**
• **Investment Fundamentals:** Basic principles and methodologies
• **Due Diligence Framework:** Systematic evaluation processes
• **Portfolio Management:** Best practices for investor relations
• **Exit Strategies:** Understanding liquidity events and timing

## 🚀 Ready to Get Started?

Whether you're raising capital or evaluating investment opportunities, I'm here to provide expert guidance and strategic support throughout your journey.

**Next Steps:**
1. **Define Objectives:** Clarify your specific investment goals and requirements
2. **Initial Consultation:** Discuss your situation and identify key priorities
3. **Customized Strategy:** Develop a tailored approach for your unique needs
4. **Implementation Support:** Execute the strategy with ongoing guidance

What specific investment challenge or opportunity would you like to explore?`;

    return this.formatResponse(content, 0.87, [
      { type: 'link', title: 'Investment Services', url: '/services' },
      { type: 'link', title: 'Schedule Consultation', url: '/contact' },
      { type: 'link', title: 'Resource Library', url: '/resources' }
    ]);
  }
}