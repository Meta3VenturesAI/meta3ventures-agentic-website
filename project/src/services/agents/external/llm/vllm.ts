import { providerRegistry, LLMProvider } from './provider';

/**
 * VllmProvider
 *
 * This provider connects to a [vLLM](https://github.com/vllm-project/vllm)
 * inference server using the OpenAI chat completions API schema.  Use
 * environment variables `VLLM_URL` (e.g. `http://localhost:8000/v1`)
 * and `VLLM_MODEL` (e.g. `llama-3-8b-instruct`) to configure the
 * endpoint and default model.
 */
export class VllmProvider implements LLMProvider {
  id = 'vllm';
  name = 'vLLM (Open Source)';
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_VLLM_URL || 'http://localhost:8000/v1';
    this.defaultModel = import.meta.env.VITE_VLLM_MODEL || 'llama-3-8b-instruct';
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/models`, { method: 'GET' });
      return res.ok;
    } catch {
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
  }
}

// Register provider on import
providerRegistry.register(new VllmProvider());