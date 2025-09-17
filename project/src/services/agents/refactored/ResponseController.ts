/**
 * Smart Response Controller - Context-aware response management
 * Prevents template dumping and ensures appropriate response sizes
 */

export interface ResponseContext {
  messageType: 'greeting' | 'about' | 'simple_question' | 'complex_request' | 'follow_up';
  conversationLength: number;
  previousTopics: string[];
  userIntent: 'information' | 'action' | 'support' | 'investment' | 'research';
  responseComplexity: 'minimal' | 'brief' | 'detailed';
}

export interface ControlledResponse {
  content: string;
  attachments?: Array<{
    type: 'link' | 'action';
    title: string;
    url?: string;
    action?: string;
  }>;
  quickActions?: Array<{
    label: string;
    value: string;
  }>;
  shouldEndHere?: boolean;
}

export class ResponseController {
  private static readonly RESPONSE_LIMITS = {
    greeting: { maxChars: 150, maxAttachments: 2 },
    about: { maxChars: 300, maxAttachments: 3 },
    simple_question: { maxChars: 200, maxAttachments: 2 },
    complex_request: { maxChars: 600, maxAttachments: 4 },
    follow_up: { maxChars: 250, maxAttachments: 2 }
  };

  /**
   * Analyze message to determine appropriate response context
   */
  static analyzeMessageContext(
    message: string, 
    conversationHistory: Array<{ content: string; sender: string }> = []
  ): ResponseContext {
    const lowerMessage = message.toLowerCase().trim();
    const conversationLength = conversationHistory.length;
    const previousTopics = this.extractPreviousTopics(conversationHistory);

    // Detect message type
    let messageType: ResponseContext['messageType'] = 'simple_question';
    
    if (this.isGreeting(lowerMessage, conversationLength)) {
      messageType = 'greeting';
    } else if (this.isAboutQuery(lowerMessage)) {
      messageType = 'about';
    } else if (this.isComplexRequest(lowerMessage)) {
      messageType = 'complex_request';
    } else if (this.isFollowUp(lowerMessage, previousTopics)) {
      messageType = 'follow_up';
    }

    // Detect user intent
    const userIntent = this.detectUserIntent(lowerMessage);
    
    // Determine response complexity
    const responseComplexity = this.determineComplexity(messageType, userIntent, conversationLength);

    return {
      messageType,
      conversationLength,
      previousTopics,
      userIntent,
      responseComplexity
    };
  }

  /**
   * Control and format response based on context
   */
  static controlResponse(
    rawResponse: string,
    context: ResponseContext,
    attachments: unknown[] = []
  ): ControlledResponse {
    const limits = this.RESPONSE_LIMITS[context.messageType];
    
    // Truncate content if too long
    let controlledContent = rawResponse;
    if (rawResponse.length > limits.maxChars) {
      controlledContent = this.intelligentTruncate(rawResponse, limits.maxChars, context);
    }

    // Limit attachments
    const controlledAttachments = this.filterAttachments(attachments, limits.maxAttachments, context);

    // Add progressive disclosure for truncated content
    const shouldAddMore = rawResponse.length > limits.maxChars;
    if (shouldAddMore) {
      controlledContent += "\n\nWould you like more details on any specific aspect?";
    }

    return {
      content: controlledContent,
      attachments: controlledAttachments,
      quickActions: this.generateContextualActions(context),
      shouldEndHere: context.messageType === 'greeting' && context.conversationLength === 0
    };
  }

  private static isGreeting(message: string, conversationLength: number): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'];
    return greetings.some(g => message.includes(g)) || 
           (conversationLength === 0 && message.length < 20);
  }

  private static isAboutQuery(message: string): boolean {
    const aboutIndicators = ['about', 'what is', 'tell me about', 'who are', 'meta3', 'company', 'what do you do'];
    return aboutIndicators.some(indicator => message.includes(indicator));
  }

  private static isComplexRequest(message: string): boolean {
    const complexIndicators = [
      'analysis', 'research', 'detailed', 'comprehensive', 'market sizing',
      'competitive landscape', 'investment thesis', 'due diligence', 'strategy'
    ];
    return complexIndicators.some(indicator => message.includes(indicator)) ||
           message.split(' ').length > 15; // Long questions are often complex
  }

  private static isFollowUp(message: string, previousTopics: string[]): boolean {
    const followUpIndicators = ['more about', 'tell me more', 'elaborate', 'details', 'explain further'];
    return followUpIndicators.some(indicator => message.includes(indicator)) ||
           previousTopics.some(topic => message.includes(topic));
  }

  private static detectUserIntent(message: string): ResponseContext['userIntent'] {
    if (message.includes('invest') || message.includes('funding') || message.includes('capital')) {
      return 'investment';
    }
    if (message.includes('research') || message.includes('analysis') || message.includes('market')) {
      return 'research';
    }
    if (message.includes('help') || message.includes('support') || message.includes('problem')) {
      return 'support';
    }
    if (message.includes('apply') || message.includes('contact') || message.includes('schedule')) {
      return 'action';
    }
    return 'information';
  }

  private static determineComplexity(
    messageType: ResponseContext['messageType'],
    userIntent: ResponseContext['userIntent'],
    conversationLength: number
  ): ResponseContext['responseComplexity'] {
    if (messageType === 'greeting' || messageType === 'follow_up') {
      return 'minimal';
    }
    if (messageType === 'complex_request' || userIntent === 'research') {
      return conversationLength < 2 ? 'brief' : 'detailed';
    }
    return 'brief';
  }

  private static intelligentTruncate(content: string, maxChars: number, context: ResponseContext): string {
    if (content.length <= maxChars) return content;

    // Find a good breaking point (sentence or paragraph)
    const sentences = content.split('. ');
    let truncated = '';
    
    for (const sentence of sentences) {
      if ((truncated + sentence + '. ').length > maxChars) {
        break;
      }
      truncated += sentence + '. ';
    }

    // If no good break point, just cut at word boundary
    if (truncated.length < maxChars * 0.5) {
      const words = content.split(' ');
      truncated = '';
      for (const word of words) {
        if ((truncated + word + ' ').length > maxChars) {
          break;
        }
        truncated += word + ' ';
      }
    }

    return truncated.trim();
  }

  private static filterAttachments(attachments: unknown[], maxAttachments: number, context: ResponseContext) {
    if (!attachments || attachments.length <= maxAttachments) {
      return attachments?.slice(0, 3).map(att => ({ // Convert to standard format
        type: (att.type === 'link' ? 'link' : 'action') as 'link' | 'action',
        title: att.title,
        url: att.url,
        action: att.action
      }));
    }

    // Prioritize attachments based on context
    const prioritized = attachments.sort((a, b) => {
      const aScore = this.getAttachmentScore(a, context);
      const bScore = this.getAttachmentScore(b, context);
      return bScore - aScore;
    });

    return prioritized.slice(0, maxAttachments).map(att => ({
      type: (att.type === 'link' ? 'link' : 'action') as 'link' | 'action',
      title: att.title,
      url: att.url,
      action: att.action
    }));
  }

  private static getAttachmentScore(attachment: unknown, context: ResponseContext): number {
    let score = 0;
    
    if (context.userIntent === 'investment' && 
        (attachment.title?.toLowerCase().includes('invest') || 
         attachment.title?.toLowerCase().includes('funding'))) {
      score += 10;
    }
    
    if (context.userIntent === 'action' && 
        (attachment.title?.toLowerCase().includes('apply') ||
         attachment.title?.toLowerCase().includes('contact'))) {
      score += 10;
    }

    if (attachment.type === 'action') score += 5; // Prioritize actionable items
    
    return score;
  }

  private static generateContextualActions(context: ResponseContext): Array<{ label: string; value: string }> {
    switch (context.messageType) {
      case 'greeting':
        return [
          { label: 'About Meta3', value: 'about' },
          { label: 'Investment Opportunities', value: 'investment' },
          { label: 'Apply for Funding', value: 'apply' }
        ];
      
      case 'about':
        return [
          { label: 'View Portfolio', value: 'portfolio' },
          { label: 'Our Services', value: 'services' },
          { label: 'Contact Us', value: 'contact' }
        ];
      
      case 'simple_question':
        return [
          { label: 'Tell me more', value: 'more_details' },
          { label: 'How can I get started?', value: 'get_started' }
        ];
      
      default:
        return [];
    }
  }

  private static extractPreviousTopics(conversationHistory: Array<{ content: string; sender: string }>): string[] {
    const topics = new Set<string>();
    
    for (const message of conversationHistory) {
      if (message.sender === 'user') {
        const words = message.content.toLowerCase().split(' ');
        const topicWords = ['investment', 'research', 'funding', 'portfolio', 'analysis', 'market', 'about'];
        
        for (const word of words) {
          if (topicWords.includes(word)) {
            topics.add(word);
          }
        }
      }
    }
    
    return Array.from(topics);
  }
}