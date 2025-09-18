import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * MistralProvider
 *
 * Connects to Mistral API for Mistral models
 * Uses environment variables VITE_MISTRAL_API_KEY
 */
export class MistralProvider implements LLMProvider {
  id = 'mistral';
  name = 'Mistral (Open Source)';
  private apiKey: string;
  private baseUrl: string = 'https://api.mistral.ai/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
    
    console.log(`🔧 MistralProvider initialized: ${this.baseUrl}`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Mistral API key not provided');
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
      console.warn('Mistral not available:', error);
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
        id: `mistral_${Date.now()}`,
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
      console.error('Mistral response generation error:', error);
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
    const modelName = params.model || 'mistral-small-latest';

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
        throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Mistral generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['mistral-tiny', 'mistral-small-latest', 'mistral-medium-latest', 'mistral-large-latest'];
  }

  get rateLimit(): number {
    return 40; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new MistralProvider());
