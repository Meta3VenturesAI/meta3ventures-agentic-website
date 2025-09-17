/**
 * Fallback Agent Service
 * Provides agent functionality even when LLM providers are not available
 * Uses mock responses and fallback logic to ensure agents remain functional
 */

import { LLMRequest, LLMResponse } from './types';

export class FallbackAgentService {
  private static instance: FallbackAgentService;
  private isEnabled = true;

  static getInstance(): FallbackAgentService {
    if (!FallbackAgentService.instance) {
      FallbackAgentService.instance = new FallbackAgentService();
    }
    return FallbackAgentService.instance;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    if (!this.isEnabled) {
      throw new Error('Fallback agent service is disabled');
    }

    // Generate contextual responses based on the request
    const response = this.generateFallbackResponse(request);
    
    return {
      id: `fallback_${Date.now()}`,
      content: response,
      model: 'fallback-agent',
      usage: {
        promptTokens: request.messages.reduce((acc, msg) => acc + msg.content.length, 0),
        completionTokens: response.length,
        totalTokens: request.messages.reduce((acc, msg) => acc + msg.content.length, 0) + response.length
      },
      finishReason: 'stop' as const,
      processingTime: 100 + Math.random() * 200 // Simulate processing time
    };
  }

  private generateFallbackResponse(request: LLMRequest): string {
    const lastMessage = request.messages[request.messages.length - 1]?.content.toLowerCase() || '';
    
    // Context-aware fallback responses
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      return "Hello! I'm Meta3's AI Assistant. I'm currently running in fallback mode while we set up the full LLM infrastructure. I can still help you with general questions about Meta3 Ventures, our investment focus, and how we can support your startup journey. What would you like to know?";
    }
    
    if (lastMessage.includes('investment') || lastMessage.includes('funding')) {
      return "Meta3 Ventures focuses on AI and deep tech investments. We typically invest in early-stage startups with strong technical teams and innovative AI solutions. Our investment range is typically $100K-$2M in seed to Series A rounds. Would you like to learn more about our investment criteria or apply for funding?";
    }
    
    if (lastMessage.includes('ai') || lastMessage.includes('artificial intelligence')) {
      return "Meta3 Ventures is passionate about AI innovation. We invest in companies building the next generation of AI technologies, from foundational models to applied AI solutions. Our portfolio includes companies working on computer vision, natural language processing, robotics, and more. What specific AI area interests you?";
    }
    
    if (lastMessage.includes('startup') || lastMessage.includes('company')) {
      return "Starting a company is an exciting journey! Meta3 Ventures provides not just funding but also strategic support, technical guidance, and access to our network of industry experts. We help startups navigate the challenges of building AI-powered products and scaling their businesses. What stage is your startup at?";
    }
    
    if (lastMessage.includes('help') || lastMessage.includes('support')) {
      return "I'm here to help! I can assist you with questions about Meta3 Ventures, our investment process, AI technologies, startup advice, and more. While I'm running in fallback mode, I still have access to our knowledge base and can provide valuable insights. What specific help do you need?";
    }
    
    if (lastMessage.includes('contact') || lastMessage.includes('reach')) {
      return "You can reach Meta3 Ventures through our website at meta3ventures.com, or use our contact form. We're always interested in hearing from innovative entrepreneurs and AI researchers. You can also apply directly through our application portal if you're seeking investment. How can I help you get in touch?";
    }
    
    // Default response
    return "Thank you for your message! I'm Meta3's AI Assistant, currently running in fallback mode while we configure the full LLM infrastructure. I can help you with questions about Meta3 Ventures, our investment focus, AI technologies, and startup guidance. Could you please rephrase your question or let me know what specific information you're looking for?";
  }

  async isAvailable(): Promise<boolean> {
    return this.isEnabled;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getStatus(): { enabled: boolean; mode: string } {
    return {
      enabled: this.isEnabled,
      mode: 'fallback'
    };
  }
}

export const fallbackAgentService = FallbackAgentService.getInstance();
