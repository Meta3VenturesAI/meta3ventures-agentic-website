/**
 * Meta3 Financial Agent - Financial Modeling and Analysis Specialist
 * Handles financial planning, modeling, valuation, and strategic financial guidance
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3FinancialAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Financial Specialist, an expert in startup financial modeling, valuation, and strategic financial planning.

EXPERTISE:
- Financial modeling and forecasting for startups
- Startup valuation and investment analysis
- Fundraising strategy and investor relations
- Financial planning and budgeting
- Unit economics and profitability analysis
- Cash flow management and burn rate optimization

TONE & STYLE:
- Analytical, precise, and data-driven
- Explain complex financial concepts clearly
- Provide actionable financial recommendations
- Use real financial metrics and benchmarks
- Balance optimism with financial realism

FOCUS AREAS:
- Early-stage startup financial modeling (Pre-seed to Series A)
- SaaS financial metrics and unit economics
- Venture capital valuation methodologies
- Financial due diligence preparation
- Investor pitch financial presentations
- Financial risk assessment and management

Always provide specific, quantifiable financial guidance with clear assumptions and methodologies.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-financial',
      name: 'Meta3 Financial Specialist',
      description: 'Financial modeling expert providing comprehensive financial analysis, valuation guidance, and strategic financial planning for tech startups.',
      specialties: [
        'Financial Modeling',
        'Startup Valuation',
        'Unit Economics',
        'Cash Flow Analysis',
        'Fundraising Strategy',
        'Financial Planning'
      ],
      tools: ['financial_models', 'valuation_calculator', 'cash_flow_planner', 'budget_tracker', 'scenario_analysis', 'investor_metrics'],
      priority: 76, // High priority for financial queries
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        const financialIndicators = [
          'financial', 'finance', 'money', 'budget', 'revenue', 'profit',
          'valuation', 'modeling', 'forecast', 'cash flow', 'burn rate',
          'fundraising', 'investor', 'metrics', 'unit economics', 'ltv',
          'cac', 'arr', 'mrr', 'churn', 'margins', 'profitability'
        ];
        
        const planningIndicators = [
          'planning', 'strategy', 'projection', 'scenario', 'analysis',
          'optimization', 'pricing', 'costs', 'expenses'
        ];
        
        return financialIndicators.some(indicator => keywords.includes(indicator)) ||
               planningIndicators.some(indicator => keywords.includes(indicator));
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
      console.error('Meta3FinancialAgent processing failed:', error);
      
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
      'financial', 'revenue', 'profit', 'valuation', 'modeling', 'cash flow'
    ]);

    if (this.isFinancialModeling(keywords)) {
      return this.getFinancialModeling();
    }

    if (this.isValuation(keywords)) {
      return this.getValuationGuidance();
    }

    if (this.isUnitEconomics(keywords)) {
      return this.getUnitEconomics();
    }

    if (this.isFundraising(keywords)) {
      return this.getFundraisingStrategy();
    }

    if (this.isCashFlowManagement(keywords)) {
      return this.getCashFlowManagement();
    }

    return this.getGeneralFinancial();
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('valuation') || lowerMessage.includes('worth')) {
      return this.formatResponse(
        "I'll help you understand your startup's valuation. Are you looking for pre-money valuation for fundraising, or need help with valuation methodologies and comparables?",
        0.9,
        [{ type: 'link', title: 'Valuation Calculator', url: '/tools/valuation-calculator' }]
      );
    }

    if (lowerMessage.includes('revenue') || lowerMessage.includes('profit')) {
      return this.formatResponse(
        "Revenue and profitability analysis is crucial for startup success. What specific financial metrics are you looking to improve - revenue growth, profit margins, or unit economics?",
        0.9,
        [{ type: 'link', title: 'Financial Dashboard', url: '/tools/financial-dashboard' }]
      );
    }

    if (lowerMessage.includes('fundraising') || lowerMessage.includes('investor')) {
      return this.formatResponse(
        "I can help you prepare financially for fundraising. Do you need help with financial projections, investor materials, or understanding valuation expectations?",
        0.88,
        [{ type: 'link', title: 'Fundraising Kit', url: '/resources/fundraising' }]
      );
    }

    return this.formatResponse(
      "I'm your financial modeling and analysis specialist. I can help with valuations, financial projections, unit economics, and fundraising preparation. What financial challenge can I assist you with?",
      0.8,
      [{ type: 'link', title: 'Financial Health Check', url: '/tools/financial-assessment' }]
    );
  }

  private isFinancialModeling(keywords: string[]): boolean {
    return keywords.some(kw => ['modeling', 'forecast', 'projection', 'planning', 'scenario'].includes(kw));
  }

  private isValuation(keywords: string[]): boolean {
    return keywords.some(kw => ['valuation', 'worth', 'value', 'pricing', 'multiple'].includes(kw));
  }

  private isUnitEconomics(keywords: string[]): boolean {
    return keywords.some(kw => ['unit economics', 'ltv', 'cac', 'margins', 'profitability'].includes(kw));
  }

  private isFundraising(keywords: string[]): boolean {
    return keywords.some(kw => ['fundraising', 'investor', 'funding', 'capital', 'round'].includes(kw));
  }

  private isCashFlowManagement(keywords: string[]): boolean {
    return keywords.some(kw => ['cash flow', 'burn rate', 'runway', 'expenses', 'budget'].includes(kw));
  }

  private getFinancialModeling(): AgentResponse {
    return this.formatResponse(
      `**Startup Financial Modeling Framework**

Here's a comprehensive approach to building robust financial models:

**📊 Core Financial Model Components:**

**Revenue Modeling:**
• **SaaS Metrics:** MRR, ARR, churn rates, expansion revenue
• **Growth Assumptions:** Customer acquisition, pricing strategy
• **Revenue Streams:** Subscription, one-time, services, partnerships
• **Seasonality Factors:** Industry-specific patterns and trends

**Cost Structure Analysis:**
• **Customer Acquisition Cost (CAC):** Blended and by-channel
• **Cost of Goods Sold (COGS):** Direct costs per customer/transaction
• **Operating Expenses:** Personnel, marketing, G&A, R&D
• **Variable vs Fixed:** Scale economics and margin expansion

**📈 Key Financial Projections (3-5 Years):**

**P&L Statement:**
• Revenue growth: Target 100-300% annually (early stage)
• Gross margins: Aim for 75-85% for SaaS
• Operating expenses: Scale efficiently with revenue
• Net income: Path to profitability by Year 3-4

**Cash Flow Statement:**
• Operating cash flow: Focus on unit economics
• Investment cash flow: CapEx and product development
• Financing cash flow: Fundraising and debt servicing
• Net cash position: Runway and burn rate optimization

**Balance Sheet:**
• Asset composition: Cash, receivables, IP
• Liability structure: Debt, deferred revenue
• Equity structure: Cap table and dilution scenarios

**🎯 Financial Model Best Practices:**

**Scenario Planning:**
• **Base Case:** Realistic growth assumptions (70% probability)
• **Upside Case:** Optimistic but achievable (15% probability)
• **Downside Case:** Conservative growth scenario (15% probability)

**Key Assumptions Documentation:**
• Market size and penetration rates
• Pricing and packaging strategy
• Customer acquisition and retention rates
• Operational efficiency improvements
• Competitive landscape changes

**📊 Model Validation Metrics:**
• **Revenue per Employee:** $150K+ for efficient SaaS
• **LTV:CAC Ratio:** Target 3:1 minimum, 5:1+ optimal
• **Payback Period:** <12 months for sustainable growth
• **Rule of 40:** Growth rate + profit margin ≥ 40%

What specific area of your financial model needs the most attention?`,
      0.94,
      [
        { type: 'link', title: 'Financial Model Template', url: '/tools/financial-model' },
        { type: 'link', title: 'Scenario Planner', url: '/tools/scenario-analysis' },
        { type: 'link', title: 'Model Validation', url: '/tools/model-checker' }
      ]
    );
  }

  private getValuationGuidance(): AgentResponse {
    return this.formatResponse(
      `**Startup Valuation Analysis & Methodology**

**💰 Valuation Methods for Tech Startups:**

**Revenue-Based Valuation (Most Common):**
• **SaaS Companies:** 5-15x ARR (depending on growth/margins)
• **Marketplace:** 10-20x Net Revenue (take rate dependent)
• **E-commerce:** 2-6x Revenue (based on margins/growth)
• **B2B Software:** 6-12x Revenue (enterprise vs SMB focus)

**Growth-Adjusted Valuations:**
• **High Growth (>100% YoY):** Premium 20-50% above base multiple
• **Moderate Growth (50-100%):** Market multiple ranges
• **Slower Growth (<50%):** 10-30% discount to base multiple

**📈 Stage-Based Valuation Ranges:**

**Pre-Seed ($250K - $2M):**
• Valuation: $1M - $8M pre-money
• Basis: Team, market size, early traction
• Key Metrics: Problem validation, initial customers

**Seed ($500K - $5M):**
• Valuation: $3M - $15M pre-money
• Basis: Product-market fit signals, revenue traction
• Key Metrics: MRR growth, customer retention

**Series A ($2M - $15M):**
• Valuation: $10M - $50M pre-money
• Basis: Scalable business model, strong unit economics
• Key Metrics: ARR, growth efficiency, market opportunity

**🎯 Valuation Drivers & Optimization:**

**Positive Valuation Drivers:**
• **High Growth Rate:** >100% YoY revenue growth
• **Strong Unit Economics:** LTV:CAC ratio >3:1
• **Large Market:** TAM >$10B, SAM >$1B
• **Defensibility:** Network effects, switching costs
• **Team Quality:** Previous exits, domain expertise

**Valuation Risks:**
• **High Customer Concentration:** >20% from single customer
• **Weak Retention:** High churn, negative cohorts
• **Competitive Threats:** Commoditization risk
• **Unit Economics:** Poor LTV:CAC ratios
• **Market Timing:** Early/late to market trends

**📊 Valuation Benchmarking:**

**Industry Multiples (2024 Market):**
• **AI/ML Software:** 8-20x Revenue
• **Vertical SaaS:** 6-12x Revenue  
• **Horizontal SaaS:** 5-10x Revenue
• **FinTech:** 4-12x Revenue
• **E-commerce Tools:** 3-8x Revenue

**Geographic Adjustments:**
• **Silicon Valley Premium:** 10-25% above market
• **Major Tech Hubs:** Market rate valuation
• **Secondary Markets:** 10-20% discount

What's your current revenue run rate and growth trajectory? I can help estimate your valuation range.`,
      0.92,
      [
        { type: 'link', title: 'Valuation Calculator', url: '/tools/valuation-calculator' },
        { type: 'link', title: 'Comparable Analysis', url: '/tools/comps-analysis' },
        { type: 'link', title: 'Valuation Report', url: '/tools/valuation-report' }
      ]
    );
  }

  private getUnitEconomics(): AgentResponse {
    return this.formatResponse(
      `**Unit Economics Analysis & Optimization**

**🔢 Core Unit Economics Metrics:**

**Customer Lifetime Value (LTV):**
• **Calculation:** Average Revenue Per User × Gross Margin % ÷ Churn Rate
• **SaaS Benchmark:** $3,000 - $50,000+ (depending on segment)
• **Improvement Levers:** Reduce churn, increase ARPU, improve margins

**Customer Acquisition Cost (CAC):**
• **Blended CAC:** Total sales & marketing spend ÷ customers acquired
• **Channel-Specific CAC:** Paid ads, content, referral, sales
• **Payback Period:** Months to recover CAC from gross profit

**📈 Unit Economics Framework:**

**LTV:CAC Ratio Analysis:**
• **<1:1** - Unsustainable, losing money per customer
• **1:1 to 3:1** - Survive but difficult to scale profitably
• **3:1 to 5:1** - Good, healthy unit economics for growth
• **>5:1** - Excellent, should invest more in acquisition

**Payback Period Optimization:**
• **<6 months** - Exceptional, can scale aggressively
• **6-12 months** - Good, sustainable growth possible
• **12-18 months** - Manageable with sufficient capital
• **>18 months** - Requires optimization before scaling

**💰 Revenue Optimization Strategies:**

**ARPU Improvement:**
• **Pricing Strategy:** Value-based pricing, packaging optimization
• **Upselling/Cross-selling:** Feature adoption, usage expansion
• **Customer Segmentation:** Tier pricing by value delivered
• **Annual Contracts:** 10-20% discount for annual commitment

**Churn Reduction:**
• **Onboarding Optimization:** Time to first value <7 days
• **Customer Success:** Proactive support, health scoring
• **Product Stickiness:** Increase switching costs, data lock-in
• **Pricing Psychology:** Anchor pricing, commitment escalation

**🎯 CAC Optimization Strategies:**

**Acquisition Efficiency:**
• **Channel Diversification:** Reduce dependency on paid channels
• **Organic Growth:** SEO, referrals, product-led growth
• **Sales Efficiency:** Improve conversion rates, cycle times
• **Targeting Precision:** ICP refinement, better qualification

**Marketing Optimization:**
• **Content Marketing:** Long-term, compounding growth
• **Referral Programs:** Leverage customer advocacy
• **Product-Led Growth:** Freemium, viral mechanics
• **Partnership Channels:** Co-marketing, integration partnerships

**📊 Industry Benchmarks by Segment:**

**B2B SaaS:**
• **SMB:** LTV $3K-15K, CAC $500-2K, Ratio 3-8:1
• **Mid-Market:** LTV $15K-100K, CAC $2K-10K, Ratio 5-15:1
• **Enterprise:** LTV $100K+, CAC $10K-50K, Ratio 5-20:1

**B2C/Consumer:**
• **Subscription:** LTV $50-500, CAC $10-100, Ratio 3-8:1
• **Marketplace:** LTV $100-1K, CAC $20-200, Ratio 4-10:1
• **E-commerce:** LTV $75-400, CAC $15-80, Ratio 3-8:1

What are your current LTV and CAC numbers? I can help identify optimization opportunities.`,
      0.90,
      [
        { type: 'link', title: 'Unit Economics Calculator', url: '/tools/unit-economics' },
        { type: 'link', title: 'Cohort Analysis Tool', url: '/tools/cohort-analysis' },
        { type: 'link', title: 'Optimization Guide', url: '/resources/unit-economics-guide' }
      ]
    );
  }

  private getFundraisingStrategy(): AgentResponse {
    return this.formatResponse(
      `**Fundraising Financial Strategy**

**💼 Financial Preparation for Fundraising:**

**Financial Documentation Required:**
• **Historical Financials:** 2-3 years P&L, cash flow, balance sheet
• **Financial Projections:** 3-5 year detailed forecasts
• **Unit Economics Model:** LTV, CAC, cohort analysis
• **Cap Table:** Current ownership, option pool, projections
• **Data Room:** Financial backup documentation

**📊 Key Financial Metrics Investors Focus On:**

**Growth Metrics:**
• **Revenue Growth:** MoM/YoY growth rates and consistency
• **Customer Growth:** User acquisition and activation rates
• **Market Expansion:** Geographic, vertical, or product expansion

**Efficiency Metrics:**
• **Unit Economics:** LTV:CAC ratios and payback periods
• **Sales Efficiency:** Magic number, sales productivity
• **Capital Efficiency:** Revenue per dollar raised
• **Operational Leverage:** Fixed cost absorption

**Profitability Path:**
• **Gross Margins:** Current and projected improvement
• **Contribution Margins:** Unit profitability analysis
• **Path to Profitability:** Timeline and key milestones
• **Rule of 40:** Growth + profitability balance

**🎯 Fundraising Financial Strategy by Stage:**

**Pre-Seed/Seed Fundraising:**
• **Focus:** Product-market fit, early traction validation
• **Key Metrics:** Customer interviews, pilot revenue, retention
• **Financial Ask:** 12-18 months runway for growth experiments
• **Use of Funds:** Product development, initial hires, customer acquisition

**Series A Fundraising:**
• **Focus:** Scalable business model, repeatable sales process
• **Key Metrics:** $1M+ ARR, strong growth, proven unit economics
• **Financial Ask:** 18-24 months runway for scaling
• **Use of Funds:** Sales & marketing, team scaling, market expansion

**💰 Financial Modeling for Investors:**

**Scenario Analysis:**
• **Base Case (70%):** Realistic projections with defensible assumptions
• **Upside Case (15%):** Optimistic but achievable growth scenario
• **Downside Case (15%):** Conservative assumptions and risk mitigation

**Sensitivity Analysis:**
• **Growth Rate Variations:** Impact on valuation and capital needs
• **Unit Economics Changes:** CAC and churn rate sensitivities
• **Market Timing:** Earlier/later adoption scenarios
• **Competitive Responses:** Pricing pressure and market share impact

**📈 Financial Presentation Best Practices:**

**Investor Deck Financials:**
• **Revenue Trajectory:** Clear growth story and inflection points
• **Unit Economics:** Simple, clear LTV:CAC presentation
• **Market Opportunity:** TAM/SAM/SOM with bottoms-up validation
• **Use of Funds:** Specific allocation with growth milestones
• **Financial Milestones:** 12, 24, 36-month targets

**Due Diligence Preparation:**
• **Data Accuracy:** Triple-check all financial data
• **Assumption Documentation:** Clear rationale for all projections
• **Variance Analysis:** Explain historical plan vs actual performance
• **Risk Assessment:** Identify and address financial risks proactively

What stage are you fundraising for and what's your current financial position?`,
      0.88,
      [
        { type: 'link', title: 'Fundraising Calculator', url: '/tools/fundraising-calculator' },
        { type: 'link', title: 'Financial Model Template', url: '/tools/investor-model' },
        { type: 'link', title: 'Due Diligence Checklist', url: '/resources/dd-checklist' }
      ]
    );
  }

  private getCashFlowManagement(): AgentResponse {
    return this.formatResponse(
      `**Cash Flow Management & Runway Optimization**

**💸 Cash Flow Analysis Framework:**

**Operating Cash Flow Components:**
• **Cash Inflows:** Customer payments, subscription renewals
• **Cash Outflows:** Payroll, rent, marketing, operations
• **Net Operating Cash Flow:** Primary business operations impact
• **Cash Conversion Cycle:** Time from expense to cash collection

**📊 Cash Flow Forecasting (13-Week Rolling):**

**Weekly Cash Flow Projections:**
• **Accounts Receivable:** Customer payment timing and collections
• **Accounts Payable:** Vendor payments and payroll scheduling  
• **Seasonal Variations:** Holiday, quarter-end, industry cycles
• **Growth Investments:** Hiring, marketing, infrastructure scaling

**Cash Flow Scenarios:**
• **Base Case:** Most likely cash flow projection
• **Optimistic:** Faster growth, better collections, delayed expenses
• **Pessimistic:** Slower growth, payment delays, unexpected costs

**🎯 Burn Rate Optimization:**

**Burn Rate Categories:**
• **Net Burn:** Total cash outflow minus cash inflow
• **Gross Burn:** Total cash outflows (all expenses)
• **Operational Burn:** Core business operations (excluding one-time costs)
• **Growth Burn:** Incremental spend for growth acceleration

**Burn Rate Benchmarks by Stage:**
• **Pre-Seed:** $15K-50K monthly burn
• **Seed:** $50K-200K monthly burn  
• **Series A:** $200K-500K monthly burn
• **Series B+:** $500K+ monthly burn

**⏰ Runway Management:**

**Runway Calculation:**
• **Current Runway:** Cash balance ÷ monthly net burn
• **Extended Runway:** Include committed funding, revenue growth
• **Minimum Viable Runway:** 6-12 months for operational stability
• **Fundraising Buffer:** 3-6 months additional for fundraising process

**Runway Extension Strategies:**
• **Revenue Acceleration:** Focus on fastest-growing, highest-margin revenue
• **Cost Optimization:** Eliminate non-essential expenses, renegotiate contracts
• **Payment Terms:** Improve collections, extend payables when possible
• **Bridge Funding:** Short-term capital to extend runway for main fundraising

**💡 Cash Management Best Practices:**

**Cash Preservation:**
• **Expense Categories:** Fixed vs variable, essential vs discretionary
• **Zero-Based Budgeting:** Justify every expense monthly
• **Scenario Planning:** Model different growth/burn scenarios monthly
• **Early Warning Systems:** Cash flow alerts at 9, 6, 3-month runway levels

**Working Capital Optimization:**
• **Accounts Receivable:** Net 15 payment terms, automated collections
• **Accounts Payable:** Strategic payment timing, early payment discounts
• **Inventory Management:** Just-in-time, demand forecasting
• **Contract Terms:** Annual prepayments, milestone-based payments

**📈 Cash Flow KPIs to Monitor:**

**Operational Metrics:**
• **Days Sales Outstanding (DSO):** Target <30 days for SaaS
• **Days Payable Outstanding (DPO):** Optimize for cash flow timing
• **Cash Conversion Cycle:** Minimize time from expense to cash
• **Monthly Recurring Cash Flow:** Predictable cash generation

**Growth-Adjusted Metrics:**
• **Burn Multiple:** Net burn ÷ net new ARR (target <1.5x)
• **Cash Efficiency:** Revenue per dollar of net burn
• **Growth-Adjusted Runway:** Runway accounting for revenue growth
• **Capital Intensity:** Cash burn per unit of growth

**🚨 Cash Flow Warning Signs:**
• **Accelerating Burn:** Month-over-month burn rate increases >20%
• **Declining Collections:** DSO increasing, payment terms lengthening
• **Revenue Concentration:** >30% revenue from single customer
• **Seasonal Vulnerability:** Predictable cash flow drops without reserves

What's your current monthly burn rate and runway situation?`,
      0.86,
      [
        { type: 'link', title: 'Cash Flow Planner', url: '/tools/cash-flow-planner' },
        { type: 'link', title: 'Burn Rate Calculator', url: '/tools/burn-calculator' },
        { type: 'link', title: 'Runway Optimizer', url: '/tools/runway-optimizer' }
      ]
    );
  }

  private getGeneralFinancial(): AgentResponse {
    return this.formatResponse(
      `**Comprehensive Financial Strategy for Tech Startups**

I'm your dedicated financial modeling and analysis specialist, helping startups build solid financial foundations and investor-ready projections.

**🏦 Financial Services I Provide:**

**Financial Modeling & Analysis:**
• **Financial Projections:** 3-5 year detailed financial models
• **Scenario Planning:** Base, upside, and downside financial scenarios
• **Unit Economics:** LTV, CAC, payback period optimization
• **Valuation Analysis:** Company valuation using multiple methodologies
• **Fundraising Models:** Investor-ready financial presentations

**📊 Startup Financial Health Assessment:**
• **Current State Analysis:** Revenue, expenses, cash flow evaluation
• **Benchmark Comparison:** Industry metrics and peer analysis
• **Growth Trajectory:** Historical performance and future projections
• **Risk Assessment:** Financial risks and mitigation strategies
• **Optimization Opportunities:** Cost reduction and revenue enhancement

**💼 Fundraising Financial Support:**
• **Due Diligence Preparation:** Financial documentation and data rooms
• **Investor Materials:** Financial sections of pitch decks and models
• **Valuation Negotiation:** Defend and justify company valuations
• **Term Sheet Analysis:** Financial implications of investment terms
• **Cap Table Modeling:** Dilution scenarios and option pool planning

**🎯 Financial Operations & Planning:**
• **Budget Management:** Annual and quarterly budget development
• **Cash Flow Management:** 13-week rolling cash flow forecasts
• **Burn Rate Optimization:** Runway extension and cost management
• **Revenue Operations:** Pricing strategy and revenue recognition
• **Financial Systems:** Accounting setup and financial controls

**📈 Key Financial Metrics I Track:**

**Growth Metrics:**
• **Revenue Growth:** MRR, ARR, YoY growth rates
• **Customer Metrics:** CAC, LTV, churn, cohort analysis
• **Efficiency Metrics:** Rule of 40, magic number, burn multiple

**Profitability Metrics:**
• **Gross Margins:** Product and customer segment margins
• **Unit Economics:** Customer-level profitability analysis
• **Operating Leverage:** Fixed cost absorption and scaling

**Capital Metrics:**
• **Cash Management:** Runway, burn rate, working capital
• **Investment Efficiency:** Capital deployed per unit of growth
• **Return Metrics:** ROI, IRR, cash-on-cash returns

**✅ Proven Financial Frameworks:**
• **SaaS Financial Models:** Subscription business modeling
• **Startup Valuation:** DCF, market multiples, risk-adjusted returns
• **Growth Investment:** Capital allocation for maximum ROI
• **Financial Controls:** Governance and risk management systems

What specific financial challenge can I help you solve today?`,
      0.84,
      [
        { type: 'link', title: 'Financial Assessment', url: '/tools/financial-assessment' },
        { type: 'link', title: 'Financial Consultation', url: '/consultation/financial' },
        { type: 'link', title: 'Financial Resources', url: '/resources/financial' }
      ]
    );
  }

  private getEmergencyFallback(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('valuation') || lowerMessage.includes('financial')) {
      return "I specialize in startup financial modeling, valuation, and strategic financial planning. What specific financial question can I help you with?";
    }
    
    return "I'm your financial specialist for startup modeling, valuation, and strategic planning. How can I assist with your financial needs?";
  }
}