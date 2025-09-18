import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * GrokProvider
 *
 * Connects to Grok API (xAI's AI model)
 * Uses environment variables VITE_GROK_URL and VITE_GROK_MODEL
 */
export class GrokProvider implements LLMProvider {
  id = 'grok';
  name = 'Grok (xAI)';
  private baseUrl: string;
  private defaultModel: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_GROK_URL || 'https://api.x.ai/v1';
    this.defaultModel = import.meta.env.VITE_GROK_MODEL || 'grok-beta';
    this.apiKey = import.meta.env.VITE_GROK_API_KEY || '';
    
    console.log(`🔧 GrokProvider initialized: ${this.baseUrl} (model: ${this.defaultModel})`);
  }

  async isAvailable(): Promise<boolean> {
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
      console.warn('Grok not available:', error);
      return false;
    }
  }

  async generate(params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }): Promise<string> {
    const modelName = params.model || this.defaultModel;

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
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Grok generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['grok-beta', 'grok-2'];
  }

  get rateLimit(): number {
    return 30; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new GrokProvider());
