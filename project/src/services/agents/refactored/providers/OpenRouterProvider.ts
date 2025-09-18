import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * OpenRouterProvider
 *
 * Connects to OpenRouter API for multiple model access
 * Uses environment variables VITE_OPENROUTER_API_KEY
 */
export class OpenRouterProvider implements LLMProvider {
  id = 'openrouter';
  name = 'OpenRouter (Multi-Model)';
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    
    console.log(`🔧 OpenRouterProvider initialized: ${this.baseUrl}`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('OpenRouter API key not provided');
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
      console.warn('OpenRouter not available:', error);
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
        id: `openrouter_${Date.now()}`,
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
      console.error('OpenRouter response generation error:', error);
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
    const modelName = params.model || 'meta-llama/llama-3.1-8b-instruct:free';

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://meta3ventures.com',
          'X-Title': 'Meta3Ventures AI Platform'
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
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenRouter generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return [
      'meta-llama/llama-3.1-8b-instruct:free',
      'meta-llama/llama-3.1-70b-instruct',
      'mistralai/mistral-7b-instruct:free',
      'google/gemini-pro-1.5',
      'anthropic/claude-3-haiku',
      'openai/gpt-3.5-turbo'
    ];
  }

  get rateLimit(): number {
    return 100; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new OpenRouterProvider());
