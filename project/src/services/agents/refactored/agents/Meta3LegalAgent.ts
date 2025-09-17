/**
 * Meta3 Legal Agent - Legal Compliance and Contract Specialist
 * Handles legal guidance, contract review, compliance, and regulatory matters
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3LegalAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Legal Specialist, an expert in startup legal matters, contract law, and regulatory compliance for technology companies.

EXPERTISE:
- Startup legal formation and corporate governance
- Contract drafting, review, and negotiation
- Intellectual property protection and strategy
- Regulatory compliance and risk assessment
- Employment law and equity compensation
- Privacy law and data protection compliance

TONE & STYLE:
- Professional, authoritative, and risk-aware
- Clear explanations of legal concepts for non-lawyers
- Balanced advice considering business needs and legal protection
- Always recommend consulting qualified legal counsel for final decisions
- Use plain language to explain complex legal matters

IMPORTANT DISCLAIMERS:
- Provide general legal information, not legal advice
- Always recommend consulting with qualified attorneys
- Emphasize that laws vary by jurisdiction
- Highlight when professional legal review is essential
- Focus on risk awareness and best practices

Always provide practical legal guidance while emphasizing the importance of professional legal counsel.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-legal',
      name: 'Meta3 Legal Specialist',
      description: 'Legal expert providing comprehensive legal guidance, contract assistance, and compliance support for tech startups.',
      specialties: [
        'Corporate Law',
        'Contract Review',
        'Intellectual Property',
        'Regulatory Compliance',
        'Employment Law',
        'Privacy & Data Protection'
      ],
      tools: ['contract_templates', 'compliance_checker', 'ip_search', 'legal_research', 'document_review', 'risk_assessment'],
      priority: 77, // High priority for legal queries
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        const legalIndicators = [
          'legal', 'law', 'contract', 'agreement', 'terms', 'compliance',
          'intellectual property', 'ip', 'patent', 'trademark', 'copyright',
          'privacy', 'gdpr', 'ccpa', 'data protection', 'regulatory',
          'employment', 'equity', 'stock options', 'vesting', 'incorporation',
          'liability', 'risk', 'lawsuit', 'litigation', 'dispute'
        ];
        
        const contractIndicators = [
          'nda', 'non-disclosure', 'terms of service', 'privacy policy',
          'employment agreement', 'contractor agreement', 'partnership'
        ];
        
        return legalIndicators.some(indicator => keywords.includes(indicator)) ||
               contractIndicators.some(indicator => keywords.includes(indicator));
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
      console.error('Meta3LegalAgent processing failed:', error);
      
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
      'legal', 'contract', 'compliance', 'ip', 'privacy', 'employment'
    ]);

    if (this.isContractMatter(keywords)) {
      return this.getContractGuidance();
    }

    if (this.isIPMatter(keywords)) {
      return this.getIntellectualPropertyGuidance();
    }

    if (this.isComplianceMatter(keywords)) {
      return this.getComplianceGuidance();
    }

    if (this.isEmploymentMatter(keywords)) {
      return this.getEmploymentGuidance();
    }

    if (this.isPrivacyMatter(keywords)) {
      return this.getPrivacyGuidance();
    }

    if (this.isCorporateMatter(keywords)) {
      return this.getCorporateGuidance();
    }

    return this.getGeneralLegal();
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
      return this.formatResponse(
        "I can help you understand contract fundamentals and best practices. What type of contract are you working with - customer agreements, employment contracts, or partnership agreements? Remember to have important contracts reviewed by qualified legal counsel.",
        0.9,
        [{ type: 'link', title: 'Contract Templates', url: '/legal/contracts' }]
      );
    }

    if (lowerMessage.includes('compliance') || lowerMessage.includes('regulatory')) {
      return this.formatResponse(
        "Compliance is crucial for startup success. Are you dealing with data privacy regulations (GDPR, CCPA), industry-specific compliance, or general business compliance? I can provide guidance on best practices and requirements.",
        0.9,
        [{ type: 'link', title: 'Compliance Guide', url: '/legal/compliance' }]
      );
    }

    if (lowerMessage.includes('ip') || lowerMessage.includes('intellectual property')) {
      return this.formatResponse(
        "Intellectual property protection is vital for tech startups. Are you interested in patents, trademarks, copyrights, or trade secrets? I can explain the basics and help you develop an IP strategy.",
        0.88,
        [{ type: 'link', title: 'IP Protection Guide', url: '/legal/intellectual-property' }]
      );
    }

    return this.formatResponse(
      "I'm your legal specialist for startup matters. I can provide general legal guidance on contracts, compliance, IP, employment, and corporate matters. What legal question can I help you with? Remember, this is general information - consult qualified legal counsel for specific advice.",
      0.8,
      [{ type: 'link', title: 'Legal Resources', url: '/legal/resources' }]
    );
  }

  private isContractMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['contract', 'agreement', 'terms', 'nda', 'partnership'].includes(kw));
  }

  private isIPMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['intellectual property', 'ip', 'patent', 'trademark', 'copyright'].includes(kw));
  }

  private isComplianceMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['compliance', 'regulatory', 'regulation', 'gdpr', 'ccpa'].includes(kw));
  }

  private isEmploymentMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['employment', 'equity', 'stock options', 'vesting', 'employee'].includes(kw));
  }

  private isPrivacyMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['privacy', 'data protection', 'gdpr', 'ccpa', 'privacy policy'].includes(kw));
  }

  private isCorporateMatter(keywords: string[]): boolean {
    return keywords.some(kw => ['incorporation', 'corporate', 'governance', 'board', 'directors'].includes(kw));
  }

  private getContractGuidance(): AgentResponse {
    return this.formatResponse(
      `**Contract Guidance for Tech Startups**

⚖️ **IMPORTANT LEGAL DISCLAIMER:** This is general information, not legal advice. Always consult with qualified legal counsel for contract review and advice.

**📄 Essential Startup Contracts:**

**Customer Agreements:**
• **Terms of Service:** Platform usage rules, liability limitations
• **Privacy Policy:** Data collection and processing practices
• **Service Level Agreements (SLAs):** Performance guarantees, remedies
• **Master Service Agreements:** Framework for ongoing relationships

**Employment & Contractor Agreements:**
• **Employment Agreements:** At-will employment, compensation, benefits
• **Equity Agreements:** Stock options, vesting schedules, restrictions
• **Confidentiality Agreements:** Protect company trade secrets
• **Invention Assignment:** Ensure IP belongs to company

**Business Partnership Contracts:**
• **Non-Disclosure Agreements (NDAs):** One-way and mutual protection
• **Partnership Agreements:** Joint ventures, strategic alliances
• **Vendor/Supplier Agreements:** Service providers, software licenses
• **Integration Partner Agreements:** API usage, revenue sharing

**🔍 Key Contract Terms to Focus On:**

**Risk Allocation:**
• **Liability Limitations:** Cap financial exposure appropriately
• **Indemnification:** Protection from third-party claims
• **Insurance Requirements:** Professional liability, cyber insurance
• **Force Majeure:** Protection from unforeseeable circumstances

**Intellectual Property:**
• **IP Ownership:** Clear ownership of developed technology
• **License Grants:** Scope of rights granted to customers/partners
• **IP Indemnification:** Protection from IP infringement claims
• **Work-for-Hire:** Ensure contractor work belongs to company

**Performance & Termination:**
• **Performance Standards:** Clear deliverable definitions
• **Termination Rights:** For cause, convenience, material breach
• **Data Return/Destruction:** Customer data handling post-termination
• **Survival Provisions:** Terms that outlive contract termination

**💡 Contract Best Practices:**

**Negotiation Strategy:**
• **Standard Terms:** Develop company-friendly standard agreements
• **Red Lines:** Identify non-negotiable terms upfront
• **Alternative Proposals:** Have backup positions ready
• **Legal Review:** Involve counsel for complex or high-value deals

**Contract Management:**
• **Version Control:** Track contract amendments and modifications
• **Renewal Management:** Calendar key dates and renewal options
• **Compliance Monitoring:** Ensure ongoing compliance with terms
• **Document Retention:** Maintain complete contract records

**⚠️ Common Contract Pitfalls:**

**Dangerous Provisions to Avoid:**
• **Unlimited Liability:** Always negotiate liability caps
• **Broad Indemnification:** Limit scope to company's actual actions
• **Assignment Restrictions:** Maintain ability to assign in M&A
• **Overly Restrictive Terms:** Balance protection with business flexibility

**Red Flags in Customer Contracts:**
• **Payment Terms >Net 30:** Cash flow impact
• **Automatic Renewals:** Without clear termination rights
• **Exclusive Arrangements:** Limiting business development options
• **Broad Most Favored Nation:** Pricing and terms complications

**📋 Contract Review Checklist:**
• **Business Terms:** Price, scope, timeline alignment
• **Legal Terms:** Liability, IP, termination, governing law
• **Operational Terms:** Implementation, support, training
• **Risk Assessment:** Insurance, indemnification, limitations

What specific type of contract are you working on? I can provide more targeted guidance.

**🚨 Remember:** Have all important contracts reviewed by qualified legal counsel before signing.`,
      0.94,
      [
        { type: 'link', title: 'Contract Templates', url: '/legal/contract-templates' },
        { type: 'link', title: 'Legal Counsel Directory', url: '/legal/find-counsel' },
        { type: 'link', title: 'Contract Review Checklist', url: '/legal/contract-checklist' }
      ]
    );
  }

  private getIntellectualPropertyGuidance(): AgentResponse {
    return this.formatResponse(
      `**Intellectual Property Strategy for Tech Startups**

⚖️ **IMPORTANT:** This is general IP information. Consult with qualified IP attorneys for specific guidance and filing strategies.

**🧠 Types of Intellectual Property Protection:**

**Patents (Utility Patents):**
• **What They Protect:** Novel, useful, non-obvious inventions
• **Duration:** 20 years from filing date
• **Cost:** $15K-25K for prosecution, plus maintenance fees
• **Best For:** Truly innovative technology, algorithms, hardware
• **Timeline:** 18-36 months for approval

**Trademarks:**
• **What They Protect:** Brand names, logos, slogans
• **Duration:** Indefinite with proper renewal (10-year terms)
• **Cost:** $1K-3K per class for registration
• **Best For:** Brand protection, company/product names
• **Timeline:** 6-12 months for registration

**Copyrights:**
• **What They Protect:** Original works of authorship (code, content)
• **Duration:** Lifetime + 70 years (works for hire: 95 years)
• **Cost:** $35-55 for basic registration
• **Best For:** Software code, documentation, creative content
• **Timeline:** 3-6 months for registration

**Trade Secrets:**
• **What They Protect:** Confidential business information
• **Duration:** Indefinite with proper protection
• **Cost:** Minimal (mainly process and documentation costs)
• **Best For:** Algorithms, customer lists, business processes
• **Requirements:** Reasonable secrecy measures

**🎯 IP Strategy by Startup Stage:**

**Pre-Seed/Seed Stage:**
• **Immediate Priorities:** Trademark registration, trade secret protection
• **Documentation:** Invention disclosures, IP assignment agreements
• **Budget Allocation:** 1-3% of funding for IP protection
• **Focus Areas:** Core technology, brand protection basics

**Series A Stage:**
• **Patent Portfolio:** File key patent applications
• **IP Audit:** Comprehensive IP assessment and gaps analysis
• **Competitive Analysis:** Monitor competitor IP filings
• **Budget Allocation:** 2-5% of funding for expanded IP strategy

**🔒 IP Protection Best Practices:**

**Internal IP Management:**
• **Employee Agreements:** IP assignment, confidentiality clauses
• **Contractor Agreements:** Work-for-hire provisions
• **Invention Disclosure Process:** Regular review of potentially patentable innovations
• **Trade Secret Protocols:** Access controls, marking confidential information

**External IP Considerations:**
• **Freedom to Operate (FTO):** Search for blocking patents
• **Competitive Intelligence:** Monitor competitor patent filings
• **Open Source Compliance:** Track and manage open source usage
• **Third-Party Licenses:** Negotiate favorable IP licensing terms

**💰 IP Valuation & Monetization:**

**IP as Business Asset:**
• **Valuation Methods:** Cost, market, income approaches
• **Licensing Revenue:** Generate income from IP portfolio
• **Cross-Licensing:** Exchange IP rights with competitors/partners
• **IP Insurance:** Protect against infringement claims

**IP in Fundraising:**
• **Due Diligence:** Clean IP ownership and non-infringement
• **Valuation Enhancement:** Strong IP portfolio increases company value
• **Risk Mitigation:** Reduce investor concerns about IP disputes
• **Competitive Moat:** Demonstrate defensible market position

**⚠️ Common IP Mistakes to Avoid:**

**Filing Errors:**
• **Premature Disclosure:** Public disclosure before filing
• **Inadequate Searches:** Missing prior art or conflicting marks
• **Poor Documentation:** Insufficient invention records
• **Geographic Gaps:** Missing key international markets

**Management Issues:**
• **Unclear Ownership:** Founder/employee IP assignment gaps
• **Trade Secret Leaks:** Inadequate confidentiality measures
• **Maintenance Lapses:** Missing renewal deadlines
• **Infringement Blindness:** Not monitoring for violations

**📊 IP Budget Planning:**

**Cost Categories:**
• **Filing Costs:** Attorney fees, government fees, searches
• **Maintenance:** Renewal fees, portfolio management
• **Enforcement:** Infringement actions, licensing negotiations
• **Insurance:** IP infringement insurance premiums

**Budget Allocation Guidelines:**
• **Early Stage:** 70% trademarks, 30% trade secrets
• **Growth Stage:** 50% patents, 30% trademarks, 20% enforcement
• **Scale Stage:** 40% patents, 25% trademarks, 35% enforcement/licensing

**🌍 International IP Considerations:**

**Key Markets for Tech Startups:**
• **US:** Primary market for most tech companies
• **EU:** Important for data/privacy-focused companies
• **China:** Manufacturing and large consumer market
• **Japan/Korea:** Technology and gaming focus

**Filing Strategies:**
• **Priority Filing:** Establish early filing dates
• **PCT Applications:** International patent strategy
• **Madrid Protocol:** International trademark registration
• **Regional Strategies:** EU trademark, design registrations

What specific IP challenges are you facing? I can provide more targeted guidance.

**🚨 Remember:** Consult with qualified IP attorneys for filing strategies and specific IP advice.`,
      0.92,
      [
        { type: 'link', title: 'IP Attorney Directory', url: '/legal/ip-attorneys' },
        { type: 'link', title: 'IP Strategy Template', url: '/legal/ip-strategy' },
        { type: 'link', title: 'Patent Search Tools', url: '/legal/patent-search' }
      ]
    );
  }

  private getComplianceGuidance(): AgentResponse {
    return this.formatResponse(
      `**Regulatory Compliance for Tech Startups**

⚖️ **IMPORTANT:** Compliance requirements vary by jurisdiction and industry. Consult with qualified legal counsel for specific compliance advice.

**📋 Core Compliance Areas for Tech Companies:**

**Data Privacy & Protection:**
• **GDPR (EU):** Consent, data rights, breach notification, DPO requirements
• **CCPA (California):** Consumer rights, opt-out, data sale restrictions
• **PIPEDA (Canada):** Privacy policy, consent, breach notification
• **Other State Laws:** Virginia, Colorado, Connecticut privacy laws

**Industry-Specific Compliance:**
• **Financial Services:** PCI DSS, SOX, banking regulations
• **Healthcare:** HIPAA, FDA regulations for health apps
• **Education:** FERPA, COPPA for educational technology
• **Government:** FedRAMP, FISMA for government contractors

**🛡️ Privacy Compliance Framework:**

**GDPR Compliance Essentials:**
• **Legal Basis:** Consent, contract, legitimate interest documentation
• **Data Mapping:** Inventory of personal data processing activities
• **Privacy Policies:** Clear, accessible privacy information
• **Data Subject Rights:** Access, rectification, erasure, portability
• **Breach Response:** 72-hour notification to supervisory authority
• **Data Protection Officer (DPO):** Required for certain processing activities

**CCPA Compliance Requirements:**
• **Privacy Policy Updates:** Required disclosures about data practices
• **Consumer Rights:** Right to know, delete, opt-out of sale
• **Opt-Out Mechanisms:** "Do Not Sell My Personal Information" links
• **Employee Training:** Staff awareness of privacy requirements
• **Vendor Management:** Third-party data processing agreements

**🔧 Compliance Implementation:**

**Privacy by Design:**
• **Data Minimization:** Collect only necessary personal data
• **Purpose Limitation:** Use data only for stated purposes
• **Storage Limitation:** Retain data only as long as necessary
• **Security Measures:** Appropriate technical and organizational measures

**Documentation Requirements:**
• **Records of Processing Activities (ROPA):** Comprehensive data inventory
• **Privacy Impact Assessments (PIAs):** For high-risk processing
• **Consent Records:** Proof of valid consent collection
• **Breach Documentation:** Incident response and notification records

**📊 Compliance Program Development:**

**Assessment & Planning:**
• **Compliance Audit:** Current state assessment against requirements
• **Gap Analysis:** Identify areas needing improvement
• **Risk Assessment:** Evaluate compliance risks and priorities
• **Implementation Roadmap:** Phased approach to compliance

**Policies & Procedures:**
• **Privacy Policy:** Public-facing privacy information
• **Internal Policies:** Employee data handling procedures
• **Incident Response Plan:** Data breach response procedures
• **Training Materials:** Staff education on compliance requirements

**⚠️ Common Compliance Mistakes:**

**Privacy Policy Errors:**
• **Generic Templates:** Not tailored to actual business practices
• **Outdated Information:** Not updated for business changes
• **Unclear Language:** Complex legal jargon instead of plain language
• **Missing Disclosures:** Incomplete information about data practices

**Implementation Gaps:**
• **Lack of Documentation:** Insufficient records of compliance efforts
• **Inadequate Training:** Staff unaware of compliance requirements
• **Third-Party Risks:** Vendors not meeting compliance standards
• **Technical Gaps:** Systems not configured for compliance requirements

**💼 Compliance Management:**

**Ongoing Obligations:**
• **Regular Audits:** Annual compliance assessment and updates
• **Policy Updates:** Keep policies current with law changes
• **Staff Training:** Ongoing education on compliance requirements
• **Vendor Management:** Ensure third-party compliance

**Compliance Monitoring:**
• **Key Performance Indicators (KPIs):** Compliance metrics and reporting
• **Incident Tracking:** Monitor and address compliance issues
• **Regulatory Updates:** Stay informed about law changes
• **Best Practice Reviews:** Benchmark against industry standards

**🌍 International Compliance Considerations:**

**Multi-Jurisdictional Compliance:**
• **Data Residency:** Requirements for data storage location
• **Cross-Border Transfers:** Adequate protection for international transfers
• **Local Representatives:** Required representatives in certain jurisdictions
• **Language Requirements:** Local language privacy policies

**Emerging Regulations:**
• **AI Governance:** Upcoming AI regulation frameworks
• **Biometric Data:** Specialized protection requirements
• **Cookie Laws:** Enhanced consent requirements
• **Sector-Specific Rules:** Industry-tailored compliance requirements

**📈 Compliance Budget Planning:**

**Cost Categories:**
• **Legal Counsel:** Compliance advice and policy development
• **Technology Solutions:** Privacy management platforms
• **Staff Training:** Compliance education programs
• **Audit & Assessment:** Regular compliance reviews

**ROI of Compliance:**
• **Risk Mitigation:** Avoid regulatory fines and penalties
• **Customer Trust:** Enhanced reputation and customer confidence
• **Business Enablement:** Facilitate international expansion
• **Competitive Advantage:** Differentiate through privacy leadership

What specific compliance requirements are you trying to address?

**🚨 Remember:** Compliance requirements are complex and change frequently. Work with qualified legal counsel for comprehensive compliance strategies.`,
      0.90,
      [
        { type: 'link', title: 'Compliance Checklist', url: '/legal/compliance-checklist' },
        { type: 'link', title: 'Privacy Policy Generator', url: '/legal/privacy-policy' },
        { type: 'link', title: 'Compliance Counsel', url: '/legal/compliance-lawyers' }
      ]
    );
  }

  private getEmploymentGuidance(): AgentResponse {
    return this.formatResponse(
      `**Employment Law & Equity for Tech Startups**

⚖️ **IMPORTANT:** Employment law varies significantly by jurisdiction. Consult with qualified employment attorneys for specific guidance.

**👥 Employment Law Essentials:**

**Employee vs. Contractor Classification:**
• **Employee Factors:** Control over work, integration, economic dependence
• **Contractor Factors:** Independence, specialized skills, business risk
• **Consequences:** Tax obligations, benefits, labor law protections
• **Best Practices:** Proper documentation, regular classification review

**At-Will Employment:**
• **General Rule:** Either party can terminate without cause
• **Exceptions:** Discrimination, retaliation, public policy violations
• **Documentation:** Performance issues, disciplinary actions
• **Termination Procedures:** Consistent, documented processes

**📄 Essential Employment Documents:**

**Employment Agreements:**
• **Job Description:** Clear role, responsibilities, reporting structure
• **Compensation:** Salary, bonuses, benefits, review periods
• **Confidentiality:** Protection of company trade secrets
• **IP Assignment:** All work product belongs to company
• **Non-Compete/Non-Solicit:** Reasonable geographic and time limits

**Employee Handbook:**
• **Company Policies:** Code of conduct, anti-discrimination policies
• **Benefits Information:** Health insurance, PTO, retirement plans
• **Technology Policies:** Acceptable use, BYOD, remote work
• **Complaint Procedures:** Harassment reporting, grievance processes

**💰 Equity Compensation:**

**Stock Option Plans:**
• **Option Pool:** 10-20% of shares reserved for employees
• **Exercise Price:** Fair market value at grant date
• **Vesting Schedule:** Typically 4 years with 1-year cliff
• **Types:** ISOs (employees), NSOs (contractors/advisors)

**Equity Best Practices:**
• **Board Approval:** All equity grants require board authorization
• **Fair Market Valuation:** Regular 409A valuations for private companies
• **Tax Planning:** Consider tax implications for recipients
• **Communication:** Clear explanation of equity value and vesting

**🎯 Vesting Structures:**

**Standard Vesting:**
• **4-Year Vest:** 25% per year, standard for most employees
• **1-Year Cliff:** No vesting until 1 year of service
• **Monthly Vesting:** After cliff, monthly vesting common
• **Acceleration:** Single/double trigger for acquisition events

**Founder Vesting:**
• **Reverse Vesting:** Company can repurchase unvested shares
• **Acceleration Events:** Change of control, termination scenarios
• **Early Exercise:** Allow exercise before vesting (83b election)
• **Buyback Rights:** Company right of first refusal

**⚠️ Common Employment Law Issues:**

**Classification Errors:**
• **Misclassified Workers:** Independent contractors treated as employees
• **Exempt vs Non-Exempt:** Overtime obligations for non-exempt employees
• **Intern Programs:** Must meet specific educational requirements
• **Consultant Relationships:** Proper documentation and independence

**Equity Complications:**
• **409A Valuation Gaps:** Outdated valuations affecting option pricing
• **Tax Obligations:** Unexpected tax events for option exercises
• **Vesting Disputes:** Termination timing affecting vesting schedules
• **Securities Compliance:** Proper exemptions for private company shares

**🌍 Remote Work Considerations:**

**Multi-State Employment:**
• **Tax Obligations:** Withholding requirements in work states
• **Labor Law Compliance:** Different states have varying requirements
• **Workers' Compensation:** Coverage in all work locations
• **Unemployment Insurance:** State-specific requirements

**International Employees:**
• **Visa Requirements:** H-1B, L-1, O-1 work authorization
• **Local Employment Laws:** Country-specific requirements
• **Tax Treaties:** International tax planning considerations
• **Benefits Portability:** Health insurance and retirement plans

**📊 Employment Compliance Program:**

**Policy Development:**
• **Anti-Discrimination:** Protected class protections
• **Anti-Harassment:** Prevention and reporting procedures
• **Equal Pay:** Compensation equity analysis
• **Workplace Safety:** OSHA compliance, COVID-19 protocols

**Training Requirements:**
• **Manager Training:** Legal responsibilities, proper documentation
• **Harassment Prevention:** Required in many jurisdictions
• **Safety Training:** Industry-specific safety requirements
• **Compliance Updates:** Regular training on law changes

**💡 Employment Best Practices:**

**Hiring Process:**
• **Job Descriptions:** Clear, non-discriminatory requirements
• **Interview Training:** Legal interview questions and techniques
• **Background Checks:** Compliant screening procedures
• **Reference Checks:** Proper documentation and consent

**Performance Management:**
• **Regular Reviews:** Documented performance feedback
• **Improvement Plans:** Clear expectations and timelines
• **Disciplinary Actions:** Progressive discipline with documentation
• **Termination Procedures:** Consistent, documented processes

**📋 Employment Law Checklist:**

**Startup Formation:**
• **Employment Classification:** Proper worker classification
• **Equity Plans:** Board-approved stock option plans
• **Employment Agreements:** Standardized, compliant agreements
• **Handbook Development:** Comprehensive policies and procedures

**Ongoing Compliance:**
• **Regular Audits:** Employment law compliance reviews
• **Policy Updates:** Keep policies current with law changes
• **Training Programs:** Regular compliance education
• **Documentation:** Maintain proper employment records

What specific employment law questions do you have?

**🚨 Remember:** Employment law is complex and varies by location. Consult with qualified employment attorneys for specific guidance.`,
      0.88,
      [
        { type: 'link', title: 'Employment Attorney Directory', url: '/legal/employment-lawyers' },
        { type: 'link', title: 'Equity Calculator', url: '/legal/equity-calculator' },
        { type: 'link', title: 'Employment Templates', url: '/legal/employment-templates' }
      ]
    );
  }

  private getPrivacyGuidance(): AgentResponse {
    return this.formatResponse(
      `**Privacy Law & Data Protection for Tech Companies**

⚖️ **IMPORTANT:** Privacy laws are complex and evolving. Consult with qualified privacy attorneys for specific guidance.

**🔒 Major Privacy Regulations:**

**GDPR (General Data Protection Regulation - EU):**
• **Scope:** EU residents' personal data processing
• **Key Principles:** Lawfulness, fairness, transparency, purpose limitation
• **Individual Rights:** Access, rectification, erasure, portability, objection
• **Penalties:** Up to 4% of global annual revenue or €20M
• **Requirements:** DPO, DPIA, breach notification, consent management

**CCPA/CPRA (California Consumer Privacy Act):**
• **Scope:** California residents' personal information
• **Consumer Rights:** Know, delete, correct, opt-out, non-discrimination
• **Business Obligations:** Privacy policy, opt-out mechanisms, data mapping
• **Penalties:** Up to $2,500 per violation ($7,500 for intentional)
• **Enforcement:** California Attorney General, private right of action

**Other US State Laws:**
• **Virginia CDPA:** Similar rights and obligations to CCPA
• **Colorado CPA:** Consumer data protection with unique features
• **Connecticut CTDPA:** Comprehensive privacy law
• **Utah UCPA:** Business-friendly privacy framework

**🛡️ Privacy Program Implementation:**

**Data Mapping & Inventory:**
• **Data Categories:** Personal data types collected and processed
• **Processing Purposes:** Why data is collected and used
• **Legal Bases:** Consent, contract, legitimate interest documentation
• **Data Flows:** Internal and external data sharing
• **Retention Periods:** How long data is kept and deletion practices

**Privacy Policies & Notices:**
• **Comprehensive Disclosure:** Data practices, purposes, sharing
• **Plain Language:** Accessible, understandable explanations
• **Layered Notices:** Just-in-time privacy information
• **Regular Updates:** Keep current with business changes
• **Multi-Language:** Local language requirements

**🎯 Consent Management:**

**Valid Consent Requirements:**
• **Freely Given:** No coercion or bundling with service access
• **Specific:** Clear purpose for data processing
• **Informed:** Adequate information provided
• **Unambiguous:** Clear affirmative action required
• **Withdrawable:** Easy opt-out mechanisms

**Consent Management Platforms:**
• **Cookie Consent:** Granular control over tracking technologies
• **Preference Centers:** User-friendly privacy control interfaces
• **Consent Records:** Documentation of consent collection
• **Opt-Out Mechanisms:** "Do Not Sell" and similar rights

**⚠️ High-Risk Processing Activities:**

**Special Category Data:**
• **Sensitive Data:** Health, biometric, political, religious data
• **Enhanced Protection:** Explicit consent or legal basis required
• **Additional Safeguards:** Encryption, access controls, auditing
• **Impact Assessments:** DPIA required for high-risk processing

**Cross-Border Data Transfers:**
• **Adequacy Decisions:** EU Commission approved countries
• **Standard Contractual Clauses (SCCs):** EU-approved transfer mechanisms
• **Binding Corporate Rules (BCRs):** Internal data transfer rules
• **Additional Safeguards:** Encryption, pseudonymization, access controls

**📊 Privacy Impact Assessments (PIAs):**

**When Required:**
• **High Risk Processing:** Systematic profiling, large-scale processing
• **New Technologies:** AI, biometrics, automated decision-making
• **Sensitive Data:** Special category personal data processing
• **Surveillance:** Systematic monitoring of public areas

**PIA Components:**
• **Processing Description:** Detailed data processing activities
• **Necessity Assessment:** Proportionality and purpose evaluation
• **Risk Analysis:** Identification of privacy risks to individuals
• **Mitigation Measures:** Technical and organizational safeguards
• **Stakeholder Consultation:** Input from data subjects when appropriate

**🔧 Technical Privacy Safeguards:**

**Privacy by Design:**
• **Data Minimization:** Collect only necessary personal data
• **Purpose Limitation:** Use data only for stated purposes
• **Storage Limitation:** Delete data when no longer needed
• **Accuracy:** Keep personal data accurate and up-to-date

**Security Measures:**
• **Encryption:** Data at rest and in transit protection
• **Access Controls:** Role-based access to personal data
• **Audit Logging:** Track access to personal data
• **Regular Testing:** Security assessments and vulnerability testing

**💼 Privacy Governance:**

**Privacy Team Structure:**
• **Data Protection Officer (DPO):** Required for certain organizations
• **Privacy Officer:** Day-to-day privacy program management
• **Privacy Committee:** Cross-functional privacy oversight
• **Privacy Champions:** Departmental privacy liaisons

**Privacy Training:**
• **General Awareness:** All staff privacy training
• **Role-Specific Training:** Targeted training for data handlers
• **Developer Training:** Privacy-by-design implementation
• **Incident Response:** Breach response procedures

**📈 Privacy Program Metrics:**

**Compliance Metrics:**
• **Policy Compliance:** Adherence to privacy policies
• **Training Completion:** Staff privacy education rates
• **Incident Response:** Breach response timeliness
• **Rights Requests:** Data subject request response times

**Business Metrics:**
• **Customer Trust:** Privacy-related satisfaction scores
• **Competitive Advantage:** Privacy as differentiator
• **Risk Reduction:** Avoided regulatory penalties
• **Operational Efficiency:** Automated privacy processes

**🌍 International Privacy Considerations:**

**Regional Requirements:**
• **EU/UK:** GDPR/UK GDPR comprehensive frameworks
• **Asia-Pacific:** Emerging privacy laws in Singapore, Australia
• **Latin America:** Brazil LGPD, Argentina privacy laws
• **Middle East/Africa:** Developing privacy frameworks

**Global Privacy Program:**
• **Harmonized Approach:** Consistent privacy standards globally
• **Local Customization:** Adapt to specific legal requirements
• **Transfer Mechanisms:** Lawful international data transfers
• **Multi-Jurisdictional Compliance:** Coordinate across regions

What specific privacy compliance challenges are you facing?

**🚨 Remember:** Privacy law compliance is complex and rapidly evolving. Work with qualified privacy attorneys for comprehensive privacy strategies.`,
      0.86,
      [
        { type: 'link', title: 'Privacy Assessment Tool', url: '/legal/privacy-assessment' },
        { type: 'link', title: 'Privacy Policy Template', url: '/legal/privacy-policy-template' },
        { type: 'link', title: 'Privacy Attorneys', url: '/legal/privacy-lawyers' }
      ]
    );
  }

  private getCorporateGuidance(): AgentResponse {
    return this.formatResponse(
      `**Corporate Law & Governance for Tech Startups**

⚖️ **IMPORTANT:** Corporate formation and governance involve complex legal decisions. Consult with qualified corporate attorneys for specific guidance.

**🏢 Business Formation Options:**

**Delaware C-Corporation (Most Common for VC-Backed Startups):**
• **Advantages:** Favorable corporate law, investor familiarity, flexibility
• **Tax Treatment:** Double taxation, but allows tax-free reorganizations
• **Stock Classes:** Common and preferred stock structures
• **Court System:** Specialized Chancery Court for business disputes

**LLC (Limited Liability Company):**
• **Advantages:** Tax flexibility, simpler governance, member protection
• **Tax Treatment:** Pass-through taxation (default), can elect corporate taxation
• **Management:** Member-managed or manager-managed structures
• **Considerations:** Limited ability to raise VC funding, exit complexities

**Other Structures:**
• **S-Corporation:** Pass-through taxation, but limited to 100 shareholders
• **B-Corporation:** Benefit corporation with social/environmental mission
• **Public Benefit Corporation:** Delaware structure balancing profit and purpose

**📋 Corporate Governance Framework:**

**Board of Directors:**
• **Composition:** Independent directors, investor representatives, founders
• **Responsibilities:** Strategic oversight, major decision approval, CEO evaluation
• **Meetings:** Regular board meetings, documented minutes
• **Committees:** Audit, compensation, nominating committees (as needed)

**Shareholder Rights:**
• **Voting Rights:** Election of directors, major corporate actions
• **Information Rights:** Financial statements, inspection rights
• **Tag-Along Rights:** Ability to participate in founder share sales
• **Anti-Dilution Rights:** Protection against down-round dilution

**🎯 Key Corporate Documents:**

**Formation Documents:**
• **Certificate of Incorporation:** Corporate name, purpose, authorized shares
• **Bylaws:** Internal governance rules and procedures
• **Initial Board Resolutions:** Directors, officers, bank accounts, equity plans
• **Organizational Consent:** Written consents in lieu of meetings

**Ongoing Governance:**
• **Board Minutes:** Regular documentation of board decisions
• **Shareholder Consents:** Written approvals for corporate actions
• **Annual Reports:** Required state filings and tax returns
• **Stock Ledger:** Accurate records of share ownership

**💰 Equity Structure & Cap Table:**

**Initial Cap Table:**
• **Founder Shares:** Common stock with vesting provisions
• **Option Pool:** 10-20% reserved for employee equity
• **Advisor Shares:** 0.25-1% for strategic advisors
• **Future Rounds:** Reserved space for investor shares

**Equity Management:**
• **409A Valuations:** Independent fair market value determinations
• **Stock Option Plans:** Board-approved equity incentive plans
• **Cap Table Software:** Accurate tracking of ownership changes
• **Securities Compliance:** Proper exemptions for private offerings

**⚠️ Common Corporate Mistakes:**

**Formation Issues:**
• **Wrong Entity Type:** Choosing inappropriate business structure
• **Inadequate Documentation:** Missing or incomplete corporate records
• **Improper Capitalization:** Insufficient initial capital contribution
• **Tax Elections:** Missing beneficial tax elections (83b, S-corp)

**Governance Problems:**
• **Informal Operations:** Failure to follow corporate formalities
• **Inadequate Minutes:** Poor documentation of board decisions
• **Conflicts of Interest:** Improper related-party transactions
• **Compliance Lapses:** Missing required filings and reports

**📊 Corporate Compliance Program:**

**Regular Obligations:**
• **Annual Reports:** State-required annual filings
• **Tax Returns:** Federal and state corporate tax returns
• **Board Meetings:** Regular board meetings with proper notice
• **Shareholder Meetings:** Annual meetings and special meetings as needed

**Record Keeping:**
• **Corporate Records:** Minute books, stock ledgers, material contracts
• **Financial Records:** Accounting records, audit documentation
• **Legal Documents:** Corporate formation, material agreements
• **Compliance Documentation:** Regulatory filings, licenses

**🔧 Corporate Technology & Automation:**

**Legal Tech Solutions:**
• **Cap Table Management:** Automated equity tracking and reporting
• **Board Portal Software:** Secure document sharing and meeting management
• **Contract Management:** Centralized contract storage and tracking
• **Compliance Monitoring:** Automated reminders and deadline tracking

**Document Management:**
• **Version Control:** Track document changes and approvals
• **Access Controls:** Secure document sharing with board/investors
• **Backup Systems:** Redundant storage of critical documents
• **Digital Signatures:** Electronic signing for efficiency

**🌍 International Considerations:**

**Multi-Jurisdictional Operations:**
• **Foreign Qualifications:** Register to do business in operational states
• **International Subsidiaries:** Local incorporation requirements
• **Tax Planning:** International tax structure optimization
• **Regulatory Compliance:** Local law compliance in operating jurisdictions

**Cross-Border Transactions:**
• **Investment Structures:** Foreign investment considerations
• **Transfer Pricing:** Intercompany pricing for international operations
• **Withholding Taxes:** International payment tax obligations
• **FCPA Compliance:** Foreign corrupt practices considerations

**📈 Preparing for Growth & Exit:**

**Investor Readiness:**
• **Clean Cap Table:** Accurate ownership records
• **Good Standing:** Current with all regulatory requirements
• **Proper Documentation:** Complete corporate records
• **Financial Systems:** Auditable accounting systems

**Exit Preparation:**
• **Corporate Hygiene:** Clean up governance and documentation issues
• **Legal Compliance:** Ensure full regulatory compliance
• **IP Protection:** Secure intellectual property rights
• **Contract Review:** Assess material contract terms

What specific corporate governance questions do you have?

**🚨 Remember:** Corporate law decisions have long-term implications. Work with qualified corporate attorneys for formation and governance matters.`,
      0.84,
      [
        { type: 'link', title: 'Corporate Attorney Directory', url: '/legal/corporate-lawyers' },
        { type: 'link', title: 'Formation Checklist', url: '/legal/formation-checklist' },
        { type: 'link', title: 'Governance Templates', url: '/legal/governance-templates' }
      ]
    );
  }

  private getGeneralLegal(): AgentResponse {
    return this.formatResponse(
      `**Comprehensive Legal Guidance for Tech Startups**

⚖️ **IMPORTANT DISCLAIMER:** I provide general legal information, not legal advice. Always consult with qualified attorneys for specific legal matters.

**🏛️ Legal Services I Provide:**

**Corporate & Business Law:**
• **Entity Formation:** Corporation, LLC, partnership structures
• **Corporate Governance:** Board management, shareholder agreements
• **Equity & Compensation:** Stock options, vesting, cap table management
• **Contract Law:** Terms of service, employment agreements, partnerships
• **Business Transactions:** M&A, financing, licensing agreements

**🔒 Intellectual Property & Privacy:**
• **IP Strategy:** Patents, trademarks, copyrights, trade secrets
• **Privacy Compliance:** GDPR, CCPA, data protection frameworks
• **Technology Law:** Software licensing, open source compliance
• **Brand Protection:** Trademark registration and enforcement
• **Trade Secret Protection:** Confidentiality and non-disclosure

**👥 Employment & Compliance:**
• **Employment Law:** Hiring, termination, classification issues
• **Regulatory Compliance:** Industry-specific regulations
• **Risk Management:** Legal risk assessment and mitigation
• **Dispute Resolution:** Contract disputes, employment issues
• **International Law:** Cross-border legal considerations

**📋 Legal Risk Assessment:**

**High-Priority Legal Areas:**
• **Corporate Formation:** Proper business structure and documentation
• **IP Protection:** Secure intellectual property rights early
• **Employment Compliance:** Avoid classification and wage/hour issues
• **Privacy/Data Protection:** Comply with applicable privacy laws
• **Contract Management:** Protect interests in key agreements

**Common Legal Risks:**
• **Inadequate Documentation:** Missing or incomplete legal agreements
• **IP Vulnerabilities:** Unprotected intellectual property
• **Employment Issues:** Misclassification, equity disputes
• **Privacy Violations:** Non-compliance with data protection laws
• **Regulatory Non-Compliance:** Industry-specific requirement violations

**💼 Legal Technology & Efficiency:**

**Legal Tech Solutions:**
• **Contract Management:** Automated contract review and storage
• **Compliance Monitoring:** Regulatory requirement tracking
• **IP Management:** Patent and trademark portfolio management
• **Privacy Tools:** Data mapping and consent management
• **Legal Research:** AI-powered legal research platforms

**Cost-Effective Legal Strategies:**
• **Template Agreements:** Standardized contracts for common situations
• **Legal Insurance:** Coverage for certain legal risks
• **Alternative Legal Services:** Fixed-fee and subscription legal services
• **Self-Service Tools:** Legal document automation platforms
• **Preventive Measures:** Proactive legal planning to avoid disputes

**🎯 Legal Budget Planning:**

**Startup Stage Legal Costs:**
• **Formation (Pre-Seed):** $3K-10K for incorporation and initial documents
• **Growth (Seed/Series A):** $25K-75K annually for ongoing legal needs
• **Scale (Series B+):** $100K+ annually for complex legal matters
• **Transaction Costs:** 3-7% of deal value for M&A transactions

**Cost Management:**
• **Relationship Building:** Develop relationships with startup-friendly lawyers
• **Efficiency Tools:** Use legal technology to reduce routine costs
• **Budget Planning:** Allocate 2-5% of funding for legal expenses
• **Risk Assessment:** Invest in high-risk areas, economize on routine matters

**📚 Legal Resource Library:**

**Document Templates:**
• **Employment Agreements:** Employee and contractor templates
• **Privacy Policies:** GDPR and CCPA compliant templates
• **Terms of Service:** Platform and SaaS agreement templates
• **NDA Templates:** Mutual and one-way confidentiality agreements
• **Corporate Resolutions:** Board and shareholder action templates

**Compliance Checklists:**
• **Formation Checklist:** Steps for proper entity formation
• **Employment Compliance:** Hiring and management best practices
• **Privacy Compliance:** Data protection requirement checklists
• **IP Protection:** Intellectual property strategy guidelines
• **Contract Review:** Key terms and risk assessment guides

**⚠️ When to Seek Legal Counsel:**

**Immediate Legal Help Needed:**
• **Threatened Litigation:** Demand letters, cease and desist notices
• **Regulatory Investigation:** Government inquiry or investigation
• **Major Contracts:** High-value or complex agreement negotiations
• **IP Disputes:** Patent, trademark, or copyright conflicts
• **Employment Issues:** Discrimination claims, wrongful termination

**Proactive Legal Planning:**
• **Fundraising:** Prepare for investor due diligence
• **Business Expansion:** Enter new markets or jurisdictions
• **Product Launch:** New product legal risk assessment
• **Team Building:** Employment law compliance for scaling teams
• **Strategic Partnerships:** Joint ventures and strategic alliances

**🔍 Finding the Right Legal Counsel:**

**Attorney Selection Criteria:**
• **Startup Experience:** Focus on technology and startup clients
• **Industry Knowledge:** Understanding of your specific industry
• **Fee Structure:** Transparent, startup-friendly pricing
• **Communication Style:** Accessible and responsive
• **Network Connections:** Relationships with investors and other professionals

**Working with Lawyers:**
• **Clear Objectives:** Define specific legal goals and priorities
• **Budget Discussions:** Establish fee arrangements upfront
• **Regular Communication:** Maintain ongoing relationship
• **Preventive Approach:** Address legal issues before they become problems
• **Documentation:** Keep organized records of legal matters

What specific legal area needs your immediate attention?

**🚨 Remember:** Legal issues can have significant business consequences. Don't delay in seeking qualified legal counsel for important matters.`,
      0.82,
      [
        { type: 'link', title: 'Legal Assessment', url: '/legal/assessment' },
        { type: 'link', title: 'Find Legal Counsel', url: '/legal/find-lawyers' },
        { type: 'link', title: 'Legal Resource Library', url: '/legal/resources' }
      ]
    );
  }

  private getEmergencyFallback(_message: string): string {
    return "⚖️ I'm your legal specialist for startup matters. I provide general legal information on contracts, compliance, IP, employment, and corporate law. Remember, this is general information - always consult qualified legal counsel for specific advice. What legal question can I help you with?";
  }
}