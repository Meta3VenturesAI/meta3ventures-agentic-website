import { BaseAgent } from '../BaseAgent';
import { AgentContext, AgentMessage, AgentCapabilities, AgentResponse } from '../types';
import { ResponseController, ResponseContext } from '../ResponseController';

export class GeneralConversationAgent extends BaseAgent {
  constructor() {
    super({
      id: 'general-conversation',
      name: 'General Conversation Assistant',
      description: 'Handles greetings, basic queries, and general conversation with natural flow',
      specialties: [
        'Natural conversation',
        'Greetings and introductions', 
        'Basic company information',
        'General guidance and navigation',
        'Follow-up questions'
      ],
      tools: ['conversation', 'navigation', 'general_info'],
      canHandle: (message: string) => {
        const lowerMessage = message.toLowerCase().trim();
        
        // Handle conversations that don't need specialized knowledge
        const conversationalIndicators = [
          'hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
          'about', 'help', 'what', 'who', 'how', 'where', 'info', 'information', 
          'tell me', 'can you', 'do you', 'thanks', 'thank you'
        ];
        
        // Simple messages that don't require specialized agents
        const isSimple = message.length < 100 && message.split(' ').length <= 10;
        const hasConversationalIndicators = conversationalIndicators.some(indicator => 
          lowerMessage.includes(indicator)
        );
        
        // Don't handle if it's clearly investment or research focused
        const isSpecialized = this.isSpecializedTopic(lowerMessage);
        
        return (hasConversationalIndicators || isSimple) && !isSpecialized;
      },
      priority: 80 // Higher priority for general conversation to catch before specialized agents
    });
  }

  private isSpecializedTopic(message: string): boolean {
    const specialized = [
      'investment', 'funding', 'capital', 'venture', 'portfolio', 'due diligence',
      'market research', 'analysis', 'competitive', 'intelligence', 'swot',
      'market sizing', 'tam', 'sam', 'som', 'fundraising', 'series a', 'seed',
      'detailed analysis', 'comprehensive report', 'industry trends'
    ];
    return specialized.some(topic => message.includes(topic));
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
      
      if (this.enableLLM && responseContext.responseComplexity !== 'minimal') {
        try {
          baseResponse = await this.generateLLMResponse(
            message,
            this.buildConversationalPrompt(responseContext),
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
      console.error('GeneralConversationAgent processing failed:', error);
      
      // Emergency fallback with minimal response
      const emergencyResponse = this.getEmergencyFallback(message);
      return this.createResponse(
        emergencyResponse,
        this.getCapabilities().id,
        { confidence: 0.6, error: (error as Error).message }
      );
    }
  }

  analyzeRequest(message: string): AgentResponse {
    // Legacy method - now handled by processMessage with ResponseController
    return this.getFallbackResponse(message);
  }

  private buildConversationalPrompt(responseContext: ResponseContext): string {
    const basePrompt = `You are Meta3's friendly AI assistant. You provide natural, conversational responses.`;
    
    switch (responseContext.messageType) {
      case 'greeting':
        return `${basePrompt} The user is greeting you. Respond warmly and briefly (1-2 sentences). Ask how you can help.`;
      case 'about':
        return `${basePrompt} The user wants to know about Meta3Ventures. Give a brief, engaging overview (2-3 sentences) of what we do.`;
      case 'simple_question':
        return `${basePrompt} Answer the user's question directly and concisely (1-3 sentences). If relevant, offer to help with next steps.`;
      case 'follow_up':
        return `${basePrompt} The user is asking for more information. Provide helpful details while keeping it conversational and focused.`;
      default:
        return `${basePrompt} Respond helpfully and naturally to the user's message. Keep it conversational and concise.`;
    }
  }

  getFallbackResponse(message: string, responseContext?: ResponseContext): AgentResponse {
    const lowerMessage = message.toLowerCase().trim();
    
    // Use context if available, otherwise determine from message
    const contextType = responseContext?.messageType || this.guessMessageType(lowerMessage);

    switch (contextType) {
      case 'greeting':
        return this.formatResponse(
          "Hi! I'm Meta3's AI assistant. How can I help you today?",
          0.95,
          [{ type: 'link', title: 'About Meta3', url: '/about' }]
        );

      case 'about':
        return this.formatResponse(
          "Meta3Ventures is an AI-focused venture studio that partners with entrepreneurs to build transformative companies. We combine capital, expertise, and strategic partnerships to accelerate growth in AI and emerging technologies.",
          0.9,
          [
            { type: 'link', title: 'Our Services', url: '/services' },
            { type: 'link', title: 'View Portfolio', url: '/portfolio' }
          ]
        );

      case 'simple_question':
        if (lowerMessage.includes('help')) {
          return this.formatResponse(
            "I can help you learn about Meta3Ventures, our investment approach, portfolio companies, or partnership opportunities. What specifically interests you?",
            0.8
          );
        }
        return this.formatResponse(
          "I'm here to help! Could you tell me more about what you're looking for?",
          0.7
        );

      default:
        return this.formatResponse(
          "Thanks for reaching out! I'm here to help with information about Meta3Ventures. What would you like to know?",
          0.75
        );
    }
  }

  private guessMessageType(message: string): ResponseContext['messageType'] {
    if (['hello', 'hi', 'hey', 'greetings'].some(g => message.includes(g))) {
      return 'greeting';
    }
    if (message.includes('about') || message.includes('meta3') || message.includes('what')) {
      return 'about';
    }
    return 'simple_question';
  }

  private getEmergencyFallback(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I help you today?";
    }
    if (lowerMessage.includes('about')) {
      return "Meta3Ventures is an AI-focused venture studio. We partner with entrepreneurs to build innovative companies.";
    }
    return "I'm here to help! What would you like to know about Meta3Ventures?";
  }
}