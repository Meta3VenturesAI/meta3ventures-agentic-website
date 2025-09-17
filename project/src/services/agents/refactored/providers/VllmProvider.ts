import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * VllmProvider
 *
 * This provider connects to a [vLLM](https://github.com/vllm-project/vllm)
 * inference server using the OpenAI chat completions API schema.  Use
 * environment variables `VITE_VLLM_URL` (e.g. `http://localhost:8000/v1`)
 * and `VITE_VLLM_MODEL` (e.g. `llama-3-8b-instruct`) to configure the
 * endpoint and default model.
 */
export class VllmProvider implements LLMProvider {
  id = 'vllm';
  name = 'vLLM (Open Source)';
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    // Use Vite environment variable format for frontend
    this.baseUrl = import.meta.env.VITE_VLLM_URL || 'http://localhost:8000/v1';
    this.defaultModel = import.meta.env.VITE_VLLM_MODEL || 'llama-3-8b-instruct';
    
    console.log(`🔧 VllmProvider initialized: ${this.baseUrl} (model: ${this.defaultModel})`);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch (error) {
      console.warn('vLLM not available:', error);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 1024,
          top_p: params.topP ?? 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`vLLM error: ${response.status} ${text}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content?.trim() || '';
    } catch (error) {
      console.error('vLLM generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Register provider globally upon import
const vllmProvider = new VllmProvider();
providerRegistry.register(vllmProvider);
