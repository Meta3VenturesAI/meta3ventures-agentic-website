import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * OpenAIProvider
 *
 * Connects to OpenAI API for GPT models
 * Uses environment variables VITE_OPENAI_API_KEY
 */
export class OpenAIProvider implements LLMProvider {
  id = 'openai';
  name = 'OpenAI (GPT)';
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    
    console.log(`🔧 OpenAIProvider initialized: ${this.baseUrl}`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('OpenAI API key not provided');
      return false;
    }

    try {
      const res = await fetch(`${this.baseUrl}/models`, { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return res.ok;
    } catch (error) {
      console.warn('OpenAI not available:', error);
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
        id: `openai_${Date.now()}`,
        content: response,
        model: request.model,
        usage: {
          promptTokens: 0, // Would be provided by actual API
          completionTokens: 0,
          totalTokens: 0
        },
        responseTime: endTime - startTime,
        provider: this.id
      };
    } catch (error) {
      console.error('OpenAI response generation error:', error);
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
    const modelName = params.model || 'gpt-3.5-turbo';

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.maxTokens || 1000,
          top_p: params.topP || 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'];
  }

  get rateLimit(): number {
    return 60; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new OpenAIProvider());
