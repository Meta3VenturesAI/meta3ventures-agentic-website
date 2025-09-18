import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * DeepSeekProvider
 *
 * Connects to DeepSeek API for advanced AI capabilities
 * Uses environment variables VITE_DEEPSEEK_URL and VITE_DEEPSEEK_MODEL
 */
export class DeepSeekProvider implements LLMProvider {
  id = 'deepseek';
  name = 'DeepSeek (Advanced AI)';
  private baseUrl: string;
  private defaultModel: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_DEEPSEEK_URL || 'http://localhost:8082/v1';
    this.defaultModel = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';
    this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
    
    console.log(`🔧 DeepSeekProvider initialized: ${this.baseUrl} (model: ${this.defaultModel})`);
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
      console.warn('DeepSeek not available:', error);
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
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('DeepSeek generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['deepseek-chat', 'deepseek-coder', 'deepseek-math'];
  }

  get rateLimit(): number {
    return 60; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new DeepSeekProvider());
