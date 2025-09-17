import { providerRegistry, LLMProvider } from '../ProviderRegistry';

/**
 * OllamaProvider
 *
 * Connects to a locally running Ollama server to perform inference on
 * open‑source language models (e.g. Llama 3, Mistral).  Uses the
 * environment variables `VITE_OLLAMA_URL` (e.g. `http://localhost:11434`)
 * and `VITE_OLLAMA_MODEL` (e.g. `llama3` or `mistral`) to determine the
 * server endpoint and default model.
 */
export class OllamaProvider implements LLMProvider {
  id = 'ollama';
  name = 'Ollama (Local)';
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    // Pull configuration from the environment at runtime
    // Use Vite environment variable format for frontend
    this.baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
    this.defaultModel = import.meta.env.VITE_OLLAMA_MODEL || 'llama3';
    
    console.log(`🔧 OllamaProvider initialized: ${this.baseUrl} (model: ${this.defaultModel})`);
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return res.ok;
    } catch (error) {
      console.warn('Ollama not available:', error);
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
    
    // Convert messages to Ollama format
    const ollamaMessages = params.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const payload = {
      model: modelName,
      messages: ollamaMessages,
      options: {
        temperature: params.temperature ?? 0.7,
        num_predict: params.maxTokens ?? 1024,
        top_p: params.topP ?? 0.9
      },
      stream: false
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Ollama error: ${res.status} ${text}`);
      }

      const data = await res.json();
      return data.message?.content || '';
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Register provider globally upon import
const ollamaProvider = new OllamaProvider();
providerRegistry.register(ollamaProvider);
