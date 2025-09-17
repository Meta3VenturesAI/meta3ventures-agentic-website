/**
 * Meta3 Support Agent - Technical Support and Problem Resolution Specialist
 * Handles technical issues, platform support, integration guidance, and troubleshooting
 */

import { BaseAgent } from '../BaseAgent';
import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class Meta3SupportAgent extends BaseAgent {
  private systemPrompt = `You are Meta3 Support Specialist, a technical expert providing comprehensive support for Meta3Ventures platform and services.

EXPERTISE:
- Technical troubleshooting and problem resolution
- Platform integration and API guidance
- Software bugs and error diagnostics
- System configuration and setup assistance
- User account and access management

TONE & STYLE:
- Professional, helpful, and solution-focused
- Clear step-by-step instructions
- Empathetic to user frustrations
- Provide actionable solutions and alternatives
- Use technical terms appropriately but explain when needed

APPROACH:
- Quickly identify the root cause of issues
- Provide immediate workarounds when available
- Offer detailed resolution steps
- Escalate complex issues when appropriate
- Follow up with prevention tips

Always prioritize user experience and provide multiple solution paths when possible.`;

  constructor() {
    const capabilities: AgentCapabilities = {
      id: 'meta3-support',
      name: 'Meta3 Support Specialist',
      description: 'Technical support expert providing troubleshooting, platform guidance, and problem resolution assistance.',
      specialties: [
        'Technical Troubleshooting',
        'Platform Integration',
        'API Support',
        'Bug Resolution',
        'User Account Management',
        'System Configuration'
      ],
      tools: ['diagnostics', 'logging', 'api_testing', 'configuration', 'escalation'],
      priority: 85, // High priority for support requests
      canHandle: (message: string) => {
        const keywords = message.toLowerCase();
        const supportIndicators = [
          'help', 'issue', 'problem', 'error', 'bug', 'broken', 'not working',
          'support', 'troubleshoot', 'fix', 'resolve', 'assistance',
          'api', 'integration', 'setup', 'configuration', 'access',
          'login', 'account', 'password', 'permission', 'authentication'
        ];
        
        const urgencyIndicators = [
          'urgent', 'critical', 'emergency', 'down', 'crash', 'failure'
        ];
        
        return supportIndicators.some(indicator => keywords.includes(indicator)) ||
               urgencyIndicators.some(indicator => keywords.includes(indicator));
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
      console.error('Meta3SupportAgent processing failed:', error);
      
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
      'help', 'support', 'issue', 'problem', 'error', 'bug', 'api', 'integration'
    ]);

    if (this.isUrgentIssue(message)) {
      return this.getUrgentSupportResponse(message);
    }

    if (this.isAPIIssue(keywords)) {
      return this.getAPISupport();
    }

    if (this.isLoginIssue(keywords)) {
      return this.getLoginSupport();
    }

    if (this.isIntegrationIssue(keywords)) {
      return this.getIntegrationSupport();
    }

    if (this.isBugReport(keywords)) {
      return this.getBugReportGuidance();
    }

    return this.getGeneralSupport();
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    if (this.isUrgentIssue(message)) {
      return this.getUrgentSupportResponse(message);
    }

    if (lowerMessage.includes('api') || lowerMessage.includes('integration')) {
      return this.formatResponse(
        "I can help you with API integration issues. What specific problem are you encountering? Please share any error messages you're seeing.",
        0.9,
        [{ type: 'link', title: 'API Documentation', url: '/docs/api' }]
      );
    }

    if (lowerMessage.includes('login') || lowerMessage.includes('access')) {
      return this.formatResponse(
        "I'll help you resolve your login or access issue. Are you unable to sign in, or is it a permission-related problem?",
        0.9,
        [{ type: 'link', title: 'Account Support', url: '/support/account' }]
      );
    }

    return this.formatResponse(
      "I'm here to help you resolve any technical issues. Can you describe the specific problem you're experiencing?",
      0.8,
      [{ type: 'link', title: 'Support Center', url: '/support' }]
    );
  }

  private isUrgentIssue(message: string): boolean {
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'down', 'crash', 'broken', 'not working'];
    return urgentKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isAPIIssue(keywords: string[]): boolean {
    return keywords.some(kw => ['api', 'endpoint', 'authentication', 'token', 'integration'].includes(kw));
  }

  private isLoginIssue(keywords: string[]): boolean {
    return keywords.some(kw => ['login', 'signin', 'access', 'password', 'account', 'authentication'].includes(kw));
  }

  private isIntegrationIssue(keywords: string[]): boolean {
    return keywords.some(kw => ['integration', 'setup', 'configuration', 'connection', 'webhook'].includes(kw));
  }

  private isBugReport(keywords: string[]): boolean {
    return keywords.some(kw => ['bug', 'error', 'issue', 'problem', 'crash', 'failure'].includes(kw));
  }

  private getUrgentSupportResponse(_message: string): AgentResponse {
    return this.formatResponse(
      `🚨 **URGENT ISSUE DETECTED** - I'm prioritizing your request.

I understand this is an urgent issue. Let me help you immediately:

**Immediate Actions:**
1. **Contact Priority Support:** support@meta3ventures.com (mark as URGENT)
2. **Phone Support:** +1 (415) 555-0123 (Press 1 for urgent technical issues)
3. **Live Chat:** Available 24/7 for critical issues

**Quick Troubleshooting:**
• Try refreshing your browser/clearing cache
• Check if the issue persists in an incognito/private window
• Verify your internet connection is stable

**What I Need to Help:**
• Describe exactly what you were trying to do
• What error message are you seeing (if any)?
• When did this start happening?

I'm standing by to provide immediate assistance.`,
      0.95,
      [
        { type: 'link', title: '🔥 Emergency Support', url: '/support/urgent' },
        { type: 'link', title: '📞 Call Support', url: 'tel:+14155550123' },
        { type: 'link', title: '💬 Live Chat', url: '/support/chat' }
      ]
    );
  }

  private getAPISupport(): AgentResponse {
    return this.formatResponse(
      `**API Integration Support**

I can help you resolve your API integration issue:

**Common API Problems & Solutions:**
• **Authentication Errors:** Check your API key is valid and has correct permissions
• **Rate Limiting:** Implement exponential backoff and respect rate limits
• **Endpoint Issues:** Verify you're using the correct API endpoint URLs
• **Data Format:** Ensure request/response formats match our API specification

**Debug Steps:**
1. Check your API key in the admin dashboard
2. Review the API documentation for the specific endpoint
3. Test with our API explorer tool
4. Check server logs for detailed error messages

**Need Immediate Help?**
• Share your API endpoint and error message
• Provide your request headers (excluding sensitive data)
• Let me know what you're trying to accomplish

I can guide you through the specific solution for your use case.`,
      0.92,
      [
        { type: 'link', title: 'API Documentation', url: '/docs/api' },
        { type: 'link', title: 'API Explorer', url: '/tools/api-explorer' },
        { type: 'link', title: 'Authentication Guide', url: '/docs/auth' }
      ]
    );
  }

  private getLoginSupport(): AgentResponse {
    return this.formatResponse(
      `**Login & Access Support**

I'll help you resolve your login or access issue:

**Quick Solutions:**
• **Password Reset:** Use the "Forgot Password" link on the login page
• **Account Locked:** Wait 15 minutes or contact support for immediate unlock
• **Two-Factor Issues:** Use backup codes or contact support to reset 2FA
• **Browser Issues:** Try incognito mode or a different browser

**Common Access Problems:**
• Expired session - simply log in again
• Permissions changed - contact your administrator
• Account deactivated - reach out to our team

**Still Can't Access?**
1. Clear your browser cache and cookies
2. Disable browser extensions temporarily
3. Check if you're using the correct login URL
4. Verify your account email address

I can help you get back into your account quickly.`,
      0.90,
      [
        { type: 'link', title: 'Password Reset', url: '/auth/reset-password' },
        { type: 'link', title: 'Account Recovery', url: '/support/account-recovery' },
        { type: 'link', title: 'Contact Support', url: '/support/contact' }
      ]
    );
  }

  private getIntegrationSupport(): AgentResponse {
    return this.formatResponse(
      `**Integration Setup Support**

I'll guide you through your integration setup:

**Step-by-Step Integration Process:**
1. **API Key Generation:** Create keys in your admin dashboard
2. **Endpoint Configuration:** Set up the correct API endpoints
3. **Authentication Setup:** Implement proper authentication flow
4. **Data Mapping:** Configure data field mappings
5. **Testing & Validation:** Test the integration thoroughly

**Common Integration Challenges:**
• **Webhook Configuration:** Ensure URLs are publicly accessible and HTTPS
• **Data Synchronization:** Set up proper error handling and retry logic
• **Rate Limiting:** Implement appropriate throttling mechanisms
• **Security:** Follow our security best practices

**Integration Types We Support:**
• REST API integrations
• Webhook event handling
• OAuth 2.0 authentication
• Custom SDK implementations

What type of integration are you working on? I can provide specific guidance.`,
      0.88,
      [
        { type: 'link', title: 'Integration Guide', url: '/docs/integrations' },
        { type: 'link', title: 'SDK Downloads', url: '/tools/sdks' },
        { type: 'link', title: 'Sample Code', url: '/docs/examples' }
      ]
    );
  }

  private getBugReportGuidance(): AgentResponse {
    return this.formatResponse(
      `**Bug Report & Issue Resolution**

Thank you for reporting this issue. Here's how I can help:

**To Expedite Resolution, Please Provide:**
• **Steps to reproduce** the issue
• **Expected behavior** vs what actually happened
• **Browser/device information** you're using
• **Screenshots or error messages** if available
• **When the issue started** occurring

**Immediate Troubleshooting:**
1. Try refreshing the page or restarting the application
2. Check if the issue happens in different browsers
3. Verify if other users are experiencing the same problem
4. Look for any recent changes to your setup

**How We Handle Bug Reports:**
• **Critical bugs:** Fixed within 24 hours
• **High priority:** Resolved within 3-5 days
• **Standard bugs:** Fixed in next release cycle
• **Feature requests:** Evaluated for roadmap inclusion

I'll make sure your issue gets the attention it deserves and keep you updated on progress.`,
      0.85,
      [
        { type: 'link', title: 'Bug Report Form', url: '/support/bug-report' },
        { type: 'link', title: 'System Status', url: '/status' },
        { type: 'link', title: 'Feature Requests', url: '/feedback/features' }
      ]
    );
  }

  private getGeneralSupport(): AgentResponse {
    return this.formatResponse(
      `**Meta3 Technical Support**

I'm here to help you resolve any technical issues or questions:

**How I Can Assist You:**
• **Platform Issues:** Login problems, feature bugs, performance issues
• **API Support:** Integration help, authentication, debugging
• **Account Management:** Access permissions, settings configuration
• **Setup Guidance:** Initial setup, configuration assistance
• **Troubleshooting:** Step-by-step problem resolution

**Support Channels:**
• **Live Chat:** Instant help during business hours
• **Email:** support@meta3ventures.com (24-48 hour response)
• **Phone:** +1 (415) 555-0123 for urgent issues
• **Knowledge Base:** Self-service articles and guides

**Response Times:**
• **Critical issues:** Immediate response
• **Standard support:** Within 4 business hours
• **General inquiries:** Within 24 hours

What specific issue can I help you resolve today?`,
      0.80,
      [
        { type: 'link', title: 'Live Chat Support', url: '/support/chat' },
        { type: 'link', title: 'Knowledge Base', url: '/support/kb' },
        { type: 'link', title: 'Contact Support', url: '/support/contact' }
      ]
    );
  }

  private getEmergencyFallback(message: string): string {
    if (this.isUrgentIssue(message)) {
      return "🚨 URGENT: For immediate assistance, call +1 (415) 555-0123 or email support@meta3ventures.com with 'URGENT' in the subject.";
    }
    
    return "I'm here to help with technical support. For immediate assistance, please contact support@meta3ventures.com or use our live chat.";
  }
}