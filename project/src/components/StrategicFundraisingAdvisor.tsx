import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, Send, Minimize2, Maximize2, TrendingUp,
  DollarSign, FileText, Users, Target, BarChart, Shield,
  Briefcase, Award, Calendar, CheckCircle, AlertCircle,
  FileCheck, PresentationIcon, Calculator, Globe, Zap,
  ChevronRight, Download, ExternalLink, Info
} from 'lucide-react';
import { dataStorage } from '../services/data-storage.service';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
import AgentAuthGuard from './auth/AgentAuthGuard';
import toast from 'react-hot-toast';

interface FundraisingMessage {
  id: string;
  type: 'user' | 'advisor';
  content: string;
  timestamp: Date;
  stage?: 'preparation' | 'execution' | 'negotiation' | 'closing';
  attachments?: {
    type: 'document' | 'checklist' | 'template' | 'calculator' | 'resource';
    title: string;
    description?: string;
    items?: string[];
    url?: string;
    completed?: boolean[];
  }[];
  insights?: {
    type: 'tip' | 'warning' | 'best-practice';
    content: string;
  }[];
  actions?: {
    label: string;
    action: string;
    primary?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface FundraisingContext {
  stage: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'later';
  targetAmount?: number;
  runway?: number;
  currentMRR?: number;
  previousRound?: {
    amount: number;
    valuation: number;
    date: Date;
  };
  readinessScore?: number;
  sessionId: string;
}

interface FundraisingStage {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  duration: string;
  deliverables: string[];
}

const StrategicFundraisingAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<FundraisingMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Use the admin agent orchestrator for proper LLM integration
  
  const [context, setContext] = useState<FundraisingContext>({
    stage: 'seed',
    sessionId: `sfa-${Date.now()}`
  });
  const [activePhase, setActivePhase] = useState<string>('assessment');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fundraisingPhases = [
    { id: 'assessment', name: 'Readiness Assessment', icon: Shield, progress: 0 },
    { id: 'preparation', name: 'Preparation', icon: FileText, progress: 0 },
    { id: 'materials', name: 'Materials Creation', icon: PresentationIcon, progress: 0 },
    { id: 'outreach', name: 'Investor Outreach', icon: Users, progress: 0 },
    { id: 'negotiation', name: 'Negotiation', icon: Briefcase, progress: 0 },
    { id: 'closing', name: 'Closing & Legal', icon: Award, progress: 0 }
  ];

  const quickPrompts = [
    'Assess My Readiness',
    'Review Pitch Deck',
    'Valuation Strategy',
    'Investor List',
    'Due Diligence Prep',
    'Term Sheet Review'
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: FundraisingMessage = {
        id: '1',
        type: 'advisor',
        content: `Welcome to the Strategic Fundraising Advisor! 💰

I'm here to guide you through every aspect of your fundraising journey - from initial preparation to closing the deal. My approach is based on proven strategies from successful raises across hundreds of startups.

Let's start by understanding where you are in your fundraising journey.`,
        timestamp: new Date(),
        stage: 'preparation',
        insights: [
          {
            type: 'tip',
            content: 'Most successful fundraises take 3-6 months from start to close. Planning is crucial.'
          }
        ],
        actions: [
          { label: 'Start Readiness Assessment', action: 'assessment', primary: true, icon: Shield },
          { label: 'Review My Pitch Deck', action: 'pitch-review', icon: FileText },
          { label: 'Calculate Valuation', action: 'valuation', icon: Calculator },
          { label: 'Build Investor List', action: 'investors', icon: Users }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processFundraisingAdvice = async (userInput: string, actionType?: string): Promise<FundraisingMessage> => {
    const msgId = Date.now().toString();
    
    try {
      // Use real AI investment agent for intelligent responses
      const contextMessage = `Strategic Fundraising context: ${actionType || 'general advice'}. Funding stage: ${context.stage}. Target: ${context.targetAmount ? `$${context.targetAmount}` : 'not specified'}`;
      
      const agentResponse = await adminAgentOrchestrator.processMessage(userInput, {
        sessionId: context.sessionId,
        userId: 'fundraising-advisor-user',
        timestamp: new Date(),
        metadata: { 
          component: 'StrategicFundraisingAdvisor',
          actionType,
          context: contextMessage,
          fundingStage: context.stage,
          preferredAgent: 'meta3-investment'
        }
      });

      // Convert agent response to FundraisingMessage format
      return {
        id: msgId,
        type: 'advisor',
        content: agentResponse.content,
        timestamp: new Date(),
        stage: 'preparation',
        attachments: agentResponse.attachments?.map((att: any) => ({
          type: att.type as 'document' | 'checklist' | 'template' | 'calculator' | 'resource',
          title: att.title,
          description: att.content,
          url: att.url,
          items: att.content ? [att.content] : undefined,
          completed: undefined
        })) || [],
        insights: [
          {
            type: 'tip' as const,
            content: 'Powered by AI - responses are tailored to your specific fundraising context and market conditions.'
          }
        ],
        actions: agentResponse.suggestedActions?.map((action: any) => ({
          label: action.label,
          action: action.action,
          primary: false,
          icon: DollarSign
        })) || []
      };
    } catch (error) {
      console.error('LLM Investment Agent error:', error);
      toast.error('AI fundraising advisor temporarily unavailable. Using backup response.');
    }

    // Static fallback logic for when LLM fails
    const lowerInput = userInput.toLowerCase();

    // Readiness Assessment
    if (actionType === 'assessment' || lowerInput.includes('ready') || lowerInput.includes('assess')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `Let's assess your fundraising readiness across key dimensions. This will help us identify strengths and areas needing attention.

**Fundraising Readiness Assessment:**

I'll evaluate your startup across 8 critical areas:
1. **Traction & Metrics** - Revenue, growth rate, key KPIs
2. **Team Strength** - Experience, completeness, advisory board
3. **Market Opportunity** - TAM, growth potential, timing
4. **Product Maturity** - Development stage, differentiation, IP
5. **Business Model** - Unit economics, scalability, margins
6. **Financial Planning** - Runway, burn rate, projections
7. **Legal Structure** - Incorporation, cap table, IP ownership
8. **Pitch Materials** - Deck quality, financial model, data room`,
        timestamp: new Date(),
        stage: 'preparation',
        attachments: [
          {
            type: 'checklist',
            title: 'Pre-Fundraising Checklist',
            items: [
              'Delaware C-Corp or equivalent structure',
              'Clean cap table with vesting schedules',
              'IP assignments from all contributors',
              '12-18 months financial projections',
              'Product roadmap for next 24 months',
              'Key metrics dashboard',
              'Customer references ready',
              'Data room organized'
            ],
            completed: Array(8).fill(false)
          },
          {
            type: 'calculator',
            title: 'Readiness Score Calculator',
            description: 'Calculate your fundraising readiness score based on 25+ factors'
          }
        ],
        insights: [
          {
            type: 'best-practice',
            content: 'Companies with readiness scores above 75% close rounds 2x faster on average.'
          }
        ],
        actions: [
          { label: 'Take Full Assessment', action: 'full-assessment', primary: true },
          { label: 'Quick Score Check', action: 'quick-score' },
          { label: 'Gap Analysis', action: 'gap-analysis' }
        ]
      };
    }

    // Pitch Deck Review
    if (actionType === 'pitch-review' || lowerInput.includes('pitch') || lowerInput.includes('deck')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `I'll help you create a compelling pitch deck that tells your story effectively. A great deck is crucial - investors often decide within the first 3 minutes.

**Essential Pitch Deck Structure (10-15 slides):**

1. **Title & Vision** - Company name, tagline, contact info
2. **Problem** - Clear, relatable pain point with market evidence
3. **Solution** - Your unique approach and why now
4. **Product Demo** - Show, don't just tell
5. **Market Opportunity** - TAM, SAM, SOM with sources
6. **Business Model** - How you make money, unit economics
7. **Traction** - Revenue, users, growth, partnerships
8. **Competition** - Honest positioning and differentiation
9. **Go-to-Market** - Customer acquisition strategy
10. **Team** - Relevant experience and advisors
11. **Financials** - Historical + 3-year projections
12. **Ask** - Amount, use of funds, milestones

**Bonus slides for appendix:** Technical architecture, customer testimonials, detailed financials`,
        timestamp: new Date(),
        stage: 'preparation',
        attachments: [
          {
            type: 'template',
            title: 'Series A Pitch Deck Template',
            description: 'Proven template used in $100M+ raises',
            url: '/templates/pitch-deck-series-a'
          },
          {
            type: 'checklist',
            title: 'Pitch Deck Review Criteria',
            items: [
              'Clear problem statement in <30 seconds',
              'Quantified market opportunity with sources',
              'Compelling traction metrics above the fold',
              'Realistic financial projections',
              'Strong team slide with relevant experience',
              'Clear use of funds tied to milestones',
              'Professional design and consistent branding',
              'Supporting data in appendix'
            ]
          }
        ],
        insights: [
          {
            type: 'tip',
            content: 'The average investor spends 3:44 reviewing a pitch deck. Make every slide count.'
          },
          {
            type: 'warning',
            content: 'Avoid jargon and buzzwords. Use concrete metrics and examples instead.'
          }
        ],
        actions: [
          { label: 'Review My Deck', action: 'deck-review', primary: true },
          { label: 'Storytelling Tips', action: 'storytelling' },
          { label: 'Design Best Practices', action: 'design-tips' }
        ]
      };
    }

    // Valuation Strategy
    if (actionType === 'valuation' || lowerInput.includes('valuation') || lowerInput.includes('worth')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `Let's develop your valuation strategy. Setting the right valuation is crucial - too high and you'll struggle to raise, too low and you'll give away too much equity.

**Valuation Framework:**

**1. Market Comparables Method**
• Recent rounds in your sector
• Revenue multiples (3-15x ARR typical for SaaS)
• User/customer multiples

**2. Scorecard Method**
• Team strength (0-30%)
• Market size (0-25%)
• Product/Technology (0-15%)
• Competition (0-10%)
• Marketing/Sales (0-10%)
• Need for additional investment (0-5%)
• Other factors (0-5%)

**3. VC Method**
• Exit valuation estimate
• Target ROI (typically 10-30x)
• Work backwards to current valuation

**Current Market Benchmarks (2024):**
• Pre-seed: $4-8M pre-money
• Seed: $8-15M pre-money
• Series A: $20-50M pre-money
• Series B: $50-150M pre-money`,
        timestamp: new Date(),
        stage: 'negotiation',
        attachments: [
          {
            type: 'calculator',
            title: 'Valuation Calculator',
            description: 'Calculate your valuation using multiple methods'
          },
          {
            type: 'resource',
            title: 'Comparable Companies Database',
            description: 'Recent funding rounds in your sector',
            url: '/resources/comparables'
          }
        ],
        insights: [
          {
            type: 'best-practice',
            content: 'Leave room for negotiation. Start 20-30% above your target valuation.'
          },
          {
            type: 'tip',
            content: 'Focus on building competitive tension rather than setting a high initial price.'
          }
        ],
        actions: [
          { label: 'Calculate Valuation', action: 'calc-valuation', primary: true },
          { label: 'View Comparables', action: 'comparables' },
          { label: 'Dilution Planning', action: 'dilution' }
        ]
      };
    }

    // Investor Outreach
    if (actionType === 'investors' || lowerInput.includes('investor') || lowerInput.includes('vc')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `Let's build your investor outreach strategy. Success comes from targeting the right investors with the right message at the right time.

**Investor Targeting Framework:**

**1. Build Your Target List**
• **Tier 1 (Dream):** 10-15 perfect-fit investors
• **Tier 2 (Strong):** 20-30 good-fit investors
• **Tier 3 (Backup):** 30-40 possible investors

**2. Research Criteria**
• Stage focus (matches your round)
• Sector expertise (invested in similar companies)
• Check size ($500K-$5M typical)
• Geographic preference
• Recent investment activity
• Partner expertise

**3. Outreach Strategy**
• Start with Tier 3 to practice and refine pitch
• Move to Tier 2 once you have momentum
• Approach Tier 1 with strong traction/interest

**4. Introduction Paths (ranked by effectiveness)**
1. Warm intro from portfolio CEO (70% response rate)
2. Warm intro from advisor/investor (50% response)
3. Warm intro from service provider (30% response)
4. Cold outreach with strong hook (5-10% response)`,
        timestamp: new Date(),
        stage: 'execution',
        attachments: [
          {
            type: 'template',
            title: 'Investor CRM Template',
            description: 'Track your fundraising pipeline',
            url: '/templates/investor-crm'
          },
          {
            type: 'document',
            title: 'Email Templates',
            description: 'Proven outreach and follow-up templates'
          },
          {
            type: 'checklist',
            title: 'Investor Research Checklist',
            items: [
              'Investment thesis alignment',
              'Stage and check size match',
              'Recent investments in sector',
              'Partner background research',
              'Portfolio company overlaps',
              'Potential warm intro paths',
              'Investment pace/frequency',
              'Fund size and dry powder'
            ]
          }
        ],
        insights: [
          {
            type: 'tip',
            content: 'Create urgency with a clear timeline: "We\'re looking to close our round by [date]"'
          },
          {
            type: 'best-practice',
            content: 'Parallel process: aim to have 5-7 partner meetings per week during active fundraising.'
          }
        ],
        actions: [
          { label: 'Build Investor List', action: 'build-list', primary: true },
          { label: 'Craft Outreach Email', action: 'email-template' },
          { label: 'Find Warm Intros', action: 'warm-intros' }
        ]
      };
    }

    // Due Diligence Preparation
    if (actionType === 'due-diligence' || lowerInput.includes('diligence') || lowerInput.includes('data room')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `Due diligence can make or break your round. Being prepared accelerates closing and builds investor confidence. Let's get your data room ready.

**Complete Data Room Structure:**

**1. Corporate & Legal**
• Certificate of incorporation
• Bylaws and amendments
• Cap table (detailed with vesting)
• Stock purchase agreements
• Board minutes and consents
• IP assignments
• Employment agreements
• Vendor contracts

**2. Financial**
• Historical financials (3 years if available)
• Monthly burn rate analysis
• Revenue recognition policy
• Customer cohort analysis
• Unit economics breakdown
• Financial projections (3-5 years)
• Budget vs actuals

**3. Product & Technology**
• Product roadmap
• Technical architecture
• Security & compliance docs
• Development methodology
• Key technical hires plan

**4. Sales & Marketing**
• Sales pipeline and forecast
• Customer contracts (redacted)
• Customer references
• Marketing strategy and CAC
• Pricing strategy evolution

**5. Team & Operations**
• Org chart (current and planned)
• Key hire pipeline
• Compensation philosophy
• Option pool planning`,
        timestamp: new Date(),
        stage: 'execution',
        attachments: [
          {
            type: 'checklist',
            title: 'Data Room Checklist',
            items: [
              'All corporate documents current',
              'Financial statements reviewed',
              'Customer contracts organized',
              'IP assignments complete',
              'Employment agreements signed',
              'Cap table up to date',
              'Board minutes documented',
              'Regulatory compliance docs',
              'Insurance policies current',
              'Material contracts reviewed'
            ]
          },
          {
            type: 'template',
            title: 'Data Room Index Template',
            description: 'Professional data room organization',
            url: '/templates/data-room-index'
          }
        ],
        insights: [
          {
            type: 'warning',
            content: 'Missing or poorly organized documents can delay closing by weeks. Prepare early.'
          },
          {
            type: 'tip',
            content: 'Use a virtual data room service for professional presentation and tracking.'
          }
        ],
        actions: [
          { label: 'Data Room Audit', action: 'audit-dataroom', primary: true },
          { label: 'Legal Review Checklist', action: 'legal-checklist' },
          { label: 'Financial Deep Dive', action: 'financial-prep' }
        ]
      };
    }

    // Term Sheet & Negotiation
    if (lowerInput.includes('term sheet') || lowerInput.includes('negotiat')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `Term sheet negotiation is where deals are won or lost. Let's ensure you understand the key terms and negotiation strategies.

**Key Term Sheet Components:**

**Economic Terms:**
• **Valuation** - Pre/post-money distinction critical
• **Option Pool** - Usually 10-20%, impacts dilution
• **Liquidation Preference** - 1x non-participating standard
• **Anti-dilution** - Broad-based weighted average preferred
• **Dividends** - Non-cumulative typical

**Control Terms:**
• **Board Composition** - Balance is key
• **Protective Provisions** - Standard vs overreaching
• **Information Rights** - Monthly/quarterly reporting
• **Pro-rata Rights** - Future round participation
• **Drag Along/Tag Along** - Exit facilitation

**Negotiation Strategies:**
1. **Create Competition** - Multiple term sheets = leverage
2. **Focus on What Matters** - Valuation, board control, liquidation
3. **Trade-offs** - Give on small items to win big ones
4. **Use Advisors** - Lawyers for terms, advisors for strategy
5. **Think Long-term** - Consider future round implications

**Red Flags to Avoid:**
• Participating preferred (double-dip on exit)
• Full ratchet anti-dilution
• Excessive board control
• Redemption rights
• Multiple liquidation preference`,
        timestamp: new Date(),
        stage: 'negotiation',
        attachments: [
          {
            type: 'document',
            title: 'Term Sheet Analyzer',
            description: 'Understand the impact of each term'
          },
          {
            type: 'resource',
            title: 'Standard Terms Database',
            description: 'Market standard terms by stage',
            url: '/resources/standard-terms'
          }
        ],
        insights: [
          {
            type: 'best-practice',
            content: 'Get a experienced startup lawyer. The $10-20K cost pays for itself in better terms.'
          },
          {
            type: 'warning',
            content: 'Never sign a term sheet without legal review, no matter the time pressure.'
          }
        ],
        actions: [
          { label: 'Review My Term Sheet', action: 'review-terms', primary: true },
          { label: 'Negotiation Simulator', action: 'negotiate-sim' },
          { label: 'Find Legal Counsel', action: 'find-lawyer' }
        ]
      };
    }

    // Financial Modeling
    if (lowerInput.includes('financial') || lowerInput.includes('model') || lowerInput.includes('projection')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `A robust financial model is essential for fundraising. It demonstrates your understanding of the business and path to profitability.

**Financial Model Components:**

**Revenue Model:**
• Revenue streams breakdown
• Pricing strategy and evolution
• Customer acquisition forecast
• Churn and retention assumptions
• Market penetration timeline

**Cost Structure:**
• Fixed vs variable costs
• Headcount plan by department
• Customer acquisition costs (CAC)
• Infrastructure and tool costs
• Gross margin evolution

**Key Metrics to Model:**
• Monthly Recurring Revenue (MRR/ARR)
• Gross margins (target 70-80% for SaaS)
• CAC payback period (<12 months ideal)
• LTV/CAC ratio (>3x healthy)
• Burn rate and runway
• Path to profitability

**Scenario Planning:**
• Base case (realistic)
• Upside case (achievable with perfect execution)
• Downside case (stress test)

**Investor Expectations:**
• 3-5 year projections
• Monthly detail for Year 1
• Quarterly for Years 2-3
• Annual for Years 4-5
• Clear assumptions documented`,
        timestamp: new Date(),
        attachments: [
          {
            type: 'template',
            title: 'SaaS Financial Model Template',
            description: 'Complete model with all key metrics',
            url: '/templates/financial-model'
          },
          {
            type: 'calculator',
            title: 'Unit Economics Calculator',
            description: 'Calculate CAC, LTV, and payback period'
          }
        ],
        insights: [
          {
            type: 'tip',
            content: 'Build your model bottoms-up (customers × price) not top-down (% of market).'
          },
          {
            type: 'best-practice',
            content: 'Include sensitivity analysis to show understanding of key growth drivers.'
          }
        ],
        actions: [
          { label: 'Build Financial Model', action: 'build-model', primary: true },
          { label: 'Review Assumptions', action: 'review-assumptions' },
          { label: 'Benchmark Metrics', action: 'benchmark' }
        ]
      };
    }

    // Closing Process
    if (lowerInput.includes('closing') || lowerInput.includes('close the round')) {
      return {
        id: msgId,
        type: 'advisor',
        content: `The closing process requires careful coordination. Let's ensure a smooth path from term sheet to wire transfer.

**Closing Timeline (typically 3-6 weeks):**

**Week 1-2: Final Diligence**
• Complete any remaining diligence items
• Final reference checks
• Background checks on founders

**Week 2-3: Legal Documentation**
• Stock Purchase Agreement (SPA)
• Investors' Rights Agreement (IRA)
• Right of First Refusal Agreement (ROFR)
• Voting Agreement
• Side letters if applicable

**Week 3-4: Final Steps**
• Board approval and consents
• Update cap table
• File amended certificate
• Issue stock certificates
• Press release preparation

**Critical Success Factors:**
• Responsive legal counsel
• Clean cap table
• No surprise diligence issues
• Clear communication with all parties
• Parallel processing where possible

**Common Delays to Avoid:**
• Missing signatures
• Unresolved IP assignments
• Outstanding convertible notes
• Regulatory approvals
• Foreign investor complications`,
        timestamp: new Date(),
        stage: 'closing',
        attachments: [
          {
            type: 'checklist',
            title: 'Closing Checklist',
            items: [
              'Term sheet signed by all parties',
              'Legal counsel engaged',
              'Final diligence items cleared',
              'Definitive agreements drafted',
              'Board resolutions prepared',
              'Wire instructions confirmed',
              'Stock certificates ready',
              'Press release drafted',
              'Investor updates prepared',
              'Celebration planned!'
            ]
          },
          {
            type: 'document',
            title: 'Closing Timeline Template',
            description: 'Detailed timeline with responsibilities'
          }
        ],
        insights: [
          {
            type: 'tip',
            content: 'Maintain momentum - delays kill deals. Set clear deadlines and stick to them.'
          },
          {
            type: 'warning',
            content: 'Don\'t announce publicly until wires are received. Things can still fall apart.'
          }
        ],
        actions: [
          { label: 'Closing Checklist', action: 'closing-checklist', primary: true },
          { label: 'Legal Timeline', action: 'legal-timeline' },
          { label: 'Post-Close Planning', action: 'post-close' }
        ]
      };
    }

    // Default strategic response
    return {
      id: msgId,
      type: 'advisor',
      content: `I understand you're asking about "${userInput}". Let me provide strategic guidance on this.

Based on your query, here are the key considerations:

• Understand investor psychology and what they're looking for
• Build a compelling narrative backed by strong metrics
• Create competitive tension through parallel processing
• Be prepared for extensive due diligence
• Negotiate from a position of strength

Which specific aspect would you like to explore deeper?`,
      timestamp: new Date(),
      insights: [
        {
          type: 'tip',
          content: 'Fundraising is a full-time job. Dedicate proper resources or it will take twice as long.'
        }
      ],
      actions: [
        { label: 'Get Specific Advice', action: 'specific-advice' },
        { label: 'View Resources', action: 'resources' },
        { label: 'Connect with Experts', action: 'experts' }
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: FundraisingMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Store the conversation
    await dataStorage.storeFormSubmission({
      type: 'chat',
      data: {
        message: inputValue,
        context: 'strategic-fundraising-advisor',
        sessionId: context.sessionId
      },
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        sessionId: context.sessionId
      }
    });

    // Simulate advisor processing
    setTimeout(async () => {
      const response = await processFundraisingAdvice(inputValue);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleActionClick = async (action: string) => {
    setIsTyping(true);
    setTimeout(async () => {
      const response = await processFundraisingAdvice('', action);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-50 group"
        aria-label="Open Strategic Fundraising Advisor"
      >
        <DollarSign className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          $
        </span>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Strategic Fundraising Advisor
        </div>
      </button>
    );
  }

  return (
    <AgentAuthGuard agentName="Strategic Fundraising Advisor">
      <div className={`fixed ${isMinimized ? 'bottom-24 right-6' : 'bottom-0 right-0 sm:bottom-24 sm:right-6'} z-50 transition-all`}>
      <div className={`bg-white dark:bg-gray-800 ${isMinimized ? 'w-80' : 'w-full sm:w-[500px]'} ${isMinimized ? 'h-14' : 'h-[600px]'} sm:rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <DollarSign className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-yellow-400 h-2 w-2 rounded-full animate-pulse"></span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Strategic Fundraising Advisor</h3>
              {!isMinimized && (
                <p className="text-xs text-green-100">AI-Powered Fundraising Guidance</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Progress Tracker */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Fundraising Journey</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">6 phases</span>
              </div>
              <div className="flex space-x-1">
                {fundraisingPhases.map((phase, idx) => {
                  const Icon = phase.icon;
                  return (
                    <div
                      key={phase.id}
                      className="flex-1 relative group"
                      onClick={() => setActivePhase(phase.id)}
                    >
                      <div className={`h-2 rounded-full transition-all ${
                        activePhase === phase.id 
                          ? 'bg-green-500' 
                          : phase.progress > 0 
                            ? 'bg-green-300' 
                            : 'bg-gray-300 dark:bg-gray-500'
                      }`}>
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          <Icon className="h-3 w-3 inline mr-1" />
                          {phase.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.type === 'advisor' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Strategic Advisor</span>
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-4 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md'
                    }`}>
                      <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                      
                      {message.insights && (
                        <div className="mt-4 space-y-2">
                          {message.insights.map((insight, idx) => (
                            <div key={idx} className={`flex items-start space-x-2 p-2 rounded-lg ${
                              insight.type === 'tip' ? 'bg-blue-50 dark:bg-blue-900/30' :
                              insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                              'bg-green-50 dark:bg-green-900/30'
                            }`}>
                              <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                insight.type === 'tip' ? 'text-blue-600 dark:text-blue-400' :
                                insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-green-600 dark:text-green-400'
                              }`} />
                              <span className="text-xs">{insight.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.attachments && (
                        <div className="mt-4 space-y-2">
                          {message.attachments.map((attachment, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {attachment.type === 'template' && <FileText className="h-4 w-4 text-blue-600" />}
                                  {attachment.type === 'checklist' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                  {attachment.type === 'calculator' && <Calculator className="h-4 w-4 text-purple-600" />}
                                  {attachment.type === 'document' && <FileCheck className="h-4 w-4 text-indigo-600" />}
                                  <span className="text-sm font-medium">{attachment.title}</span>
                                </div>
                                {attachment.url && (
                                  <ExternalLink className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              {attachment.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{attachment.description}</p>
                              )}
                              {attachment.items && (
                                <ul className="space-y-1">
                                  {attachment.items.map((item, i) => (
                                    <li key={i} className="flex items-start text-xs">
                                      <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.actions && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(action.action)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center space-x-1 ${
                                action.primary
                                  ? 'bg-white text-green-600 hover:bg-green-50 shadow-sm'
                                  : message.type === 'user'
                                    ? 'bg-green-500/20 text-white hover:bg-green-500/30'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {action.icon && <action.icon className="h-3 w-3" />}
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(prompt);
                      handleSendMessage();
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Coming Soon:</strong> Full web app with advanced tools, investor matching, and collaborative features
                </span>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about fundraising, pitch decks, valuations..."
                  className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
    </AgentAuthGuard>
  );
};

export default StrategicFundraisingAdvisor;