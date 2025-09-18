import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * AnthropicProvider
 *
 * Connects to Anthropic API for Claude models
 * Uses environment variables VITE_ANTHROPIC_API_KEY
 */
export class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic (Claude)';
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
    
    console.log(`🔧 AnthropicProvider initialized: ${this.baseUrl}`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Anthropic API key not provided');
      return false;
    }

    try {
      const res = await fetch(`${this.baseUrl}/messages`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return res.ok;
    } catch (error) {
      console.warn('Anthropic not available:', error);
      return false;
    }
  }

  async generateResponse(request: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }): Promise<{
    id: string;
    content: string;
    model: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    responseTime: number;
    provider: string;
  }> {
    const startTime = performance.now();
    
    try {
      const response = await this.generate(request);
      const endTime = performance.now();
      
      return {
        id: `anthropic_${Date.now()}`,
        content: response,
        model: request.model,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        responseTime: endTime - startTime,
        provider: this.id
      };
    } catch (error) {
      console.error('Anthropic response generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  async generate(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }): Promise<string> {
    const modelName = params.model || 'claude-3-haiku-20240307';

    // Convert messages to Anthropic format
    const systemMessage = params.messages.find(m => m.role === 'system');
    const conversationMessages = params.messages.filter(m => m.role !== 'system');

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelName,
          messages: conversationMessages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 1000,
          system: systemMessage?.content || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
  }

  get rateLimit(): number {
    return 50; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new AnthropicProvider());
