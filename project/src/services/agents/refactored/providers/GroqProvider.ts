import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * GroqProvider
 *
 * Connects to Groq API for fast inference
 * Uses environment variables VITE_GROQ_API_KEY
 */
export class GroqProvider implements LLMProvider {
  id = 'groq';
  name = 'Groq (Fast Inference)';
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    
    console.log(`🔧 GroqProvider initialized: ${this.baseUrl}`);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Groq API key not provided');
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
      console.warn('Groq not available:', error);
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
        id: `groq_${Date.now()}`,
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
      console.error('Groq response generation error:', error);
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
    const modelName = params.model || 'llama3-8b-8192';

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
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Groq generation error:', error);
      throw new Error(`Failed to generate response: ${error}`);
    }
  }

  get supportedModels(): string[] {
    return ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'];
  }

  get rateLimit(): number {
    return 30; // requests per minute
  }

  get apiKeyRequired(): boolean {
    return true;
  }
}

// Register the provider
providerRegistry.register(new GroqProvider());
