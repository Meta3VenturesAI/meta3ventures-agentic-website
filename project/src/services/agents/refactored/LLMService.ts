/**
 * LLM Service - Real Open Source Model Integration
 * Handles actual API calls to various open source LLM providers
 */

import { auditLogger } from '../../../utils/audit-logger';
import { rateLimiter, RATE_LIMIT_CONFIGS } from '../../../utils/rate-limiter';
import { fallbackAgentService } from './FallbackAgentService';
import { providerRegistry } from './ProviderRegistry';

// Get agent proxy endpoint - uses relative path to avoid exposing server URLs
function getAgentEndpoint(): string {
  return import.meta.env.VITE_AGENT_PROXY_PATH ?? "/.netlify/functions/agent-proxy";
}

export interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'length' | 'content_filter';
  processingTime: number;
}

export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKeyRequired: boolean;
  supportedModels: string[];
  rateLimit: number; // requests per minute
  isAvailable(): Promise<boolean>;
  generateResponse(request: LLMRequest): Promise<LLMResponse>;
}

class OllamaProvider implements LLMProvider {
  id = 'ollama';
  name = 'Ollama (Local)';
  baseUrl = getAgentEndpoint();
  apiKeyRequired = false;
  supportedModels = [
    'qwen2.5:latest',
    'qwen2.5:7b',
    'qwen2.5:14b',
    'llama3.2:3b',
    'llama3.2:1b',
    'mistral:7b',
    'codellama:7b',
    'neural-chat:7b',
    'starling-lm:7b',
    'phi3:3.8b'
  ];
  rateLimit = 60;

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?provider=ollama&action=health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      console.warn('Ollama not available (may need CORS: OLLAMA_ORIGINS=* ollama serve):', error);
      return false;
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'ollama',
          payload: {
            model: request.model,
            messages: request.messages,
            options: {
              temperature: request.temperature || 0.7,
              num_predict: request.maxTokens || 1000,
              top_p: request.topP || 0.9
            },
            stream: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        id: `ollama_${Date.now()}`,
        content: data.message.content,
        model: request.model,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        },
        finishReason: 'stop',
        processingTime
      };

    } catch (error: unknown) {
      console.error('Ollama generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class GroqProvider implements LLMProvider {
  id = 'groq';
  name = 'Groq (Fast Inference)';
  baseUrl = 'https://api.groq.com/openai/v1';
  apiKeyRequired = true;
  supportedModels = [
    'llama3-8b-8192',
    'llama3-70b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it'
  ];
  rateLimit = 30;

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      } as unknown);
      return response.ok;
    } catch (error) {
      console.warn('Groq provider unavailable:', error);
      return false;
    }
  }

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('groq_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          top_p: request.topP || 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        id: data.id,
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        finishReason: data.choices[0].finish_reason,
        processingTime
      };

    } catch (error: unknown) {
      console.error('Groq generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class HuggingFaceProvider implements LLMProvider {
  id = 'huggingface';
  name = 'Hugging Face (Free)';
  baseUrl = 'https://api-inference.huggingface.co/models';
  apiKeyRequired = false; // Free tier available
  supportedModels = [
    'microsoft/DialoGPT-large',
    'microsoft/DialoGPT-medium',
    'facebook/blenderbot-400M-distill',
    'microsoft/GODEL-v1_1-large-seq2seq',
    'google/flan-t5-large',
    'google/flan-t5-xl', 
    'EleutherAI/gpt-j-6b',
    'EleutherAI/gpt-neo-2.7B',
    'bigscience/bloom-560m',
    'bigscience/bloom-1b1',
    'stabilityai/stablelm-tuned-alpha-7b',
    'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
    'HuggingFaceH4/zephyr-7b-beta',
    'microsoft/phi-2',
    'mistralai/Mistral-7B-Instruct-v0.1'
  ];
  rateLimit = 10; // Conservative for free tier

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a simple model to check availability
      const response = await fetch(`${this.baseUrl}/microsoft/DialoGPT-medium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: "test" })
      });
      return response.status !== 401; // 401 means API key required, others might work
    } catch (error) {
      console.warn('Hugging Face not available:', error);
      return false;
    }
  }

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('huggingface_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const response = await fetch(`${this.baseUrl}/${request.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: request.temperature || 0.7,
            max_new_tokens: request.maxTokens || 1000,
            top_p: request.topP || 0.9,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      const content = Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';

      return {
        id: `hf_${Date.now()}`,
        content: content.trim(),
        model: request.model,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4), // Rough estimate
          completionTokens: Math.ceil(content.length / 4),
          totalTokens: Math.ceil((prompt.length + content.length) / 4)
        },
        finishReason: 'stop',
        processingTime
      };

    } catch (error: unknown) {
      console.error('Hugging Face generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class OpenAIProvider implements LLMProvider {
  id = 'openai';
  name = 'OpenAI (GPT Models)';
  baseUrl = 'https://api.openai.com/v1';
  apiKeyRequired = true;
  supportedModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k'
  ];
  rateLimit = 60;

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('openai_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          top_p: request.topP || 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }

      return {
        id: data.id || `openai_${Date.now()}`,
        content: data.choices[0].message.content,
        model: data.model || request.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        finishReason: data.choices[0].finish_reason || 'stop',
        processingTime
      };
    } catch (error: unknown) {
      console.error('OpenAI generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic (Claude)';
  baseUrl = 'https://api.anthropic.com/v1';
  apiKeyRequired = true;
  supportedModels = [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ];
  rateLimit = 50;

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('anthropic_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    return !!apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: request.model,
          max_tokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7,
          messages: request.messages.filter(m => m.role !== 'system'),
          system: request.messages.find(m => m.role === 'system')?.content
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      if (!data.content?.[0]?.text) {
        throw new Error('Invalid response format from Anthropic API');
      }

      return {
        id: data.id || `anthropic_${Date.now()}`,
        content: data.content[0].text,
        model: data.model || request.model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        },
        finishReason: data.stop_reason || 'stop',
        processingTime
      };
    } catch (error: unknown) {
      console.error('Anthropic generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class CohereProvider implements LLMProvider {
  id = 'cohere';
  name = 'Cohere (Command Models)';
  baseUrl = 'https://api.cohere.ai/v1';
  apiKeyRequired = true;
  supportedModels = [
    'command-r-plus',
    'command-r',
    'command',
    'command-light'
  ];
  rateLimit = 100;

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_COHERE_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('cohere_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    return !!apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Cohere API key not configured');
    }
    
    const startTime = Date.now();

    try {
      const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          prompt,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          p: request.topP || 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cohere API error ${response.status}: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      if (!data.generations?.[0]?.text) {
        throw new Error('Invalid response format from Cohere API');
      }

      return {
        id: data.id || `cohere_${Date.now()}`,
        content: data.generations[0].text,
        model: request.model,
        usage: {
          promptTokens: data.meta?.billed_units?.input_tokens || 0,
          completionTokens: data.meta?.billed_units?.output_tokens || 0,
          totalTokens: (data.meta?.billed_units?.input_tokens || 0) + (data.meta?.billed_units?.output_tokens || 0)
        },
        finishReason: data.generations[0].finish_reason || 'stop',
        processingTime
      };
    } catch (error: unknown) {
      console.error('Cohere generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class ReplicateProvider implements LLMProvider {
  id = 'replicate';
  name = 'Replicate (Open Models)';
  baseUrl = 'https://api.replicate.com/v1';
  apiKeyRequired = true;
  supportedModels = [
    'meta/llama-2-70b-chat',
    'meta/llama-2-13b-chat',
    'meta/llama-2-7b-chat',
    'mistralai/mistral-7b-instruct-v0.1',
    'togethercomputer/alpaca-7b'
  ];
  rateLimit = 50;

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_REPLICATE_API_TOKEN;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('replicate_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    return !!apiKey;
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Replicate API token not configured');
    }
    
    const startTime = Date.now();

    try {
      const prompt = request.messages.map(m => `${m.role}: ${m.content}`).join('\n');

      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: this.getModelVersion(request.model),
          input: {
            prompt,
            temperature: request.temperature || 0.7,
            max_length: request.maxTokens || 1000,
            top_p: request.topP || 0.9
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Replicate API error ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
      
      // Replicate requires polling for completion
      let prediction = data;
      while (prediction.status === 'starting' || prediction.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await fetch(`${this.baseUrl}/predictions/${prediction.id}`, {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        prediction = await pollResponse.json();
      }

      const processingTime = Date.now() - startTime;

      if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
      }

      const content = Array.isArray(prediction.output) 
        ? prediction.output.join('') 
        : prediction.output || '';

      return {
        id: prediction.id || `replicate_${Date.now()}`,
        content,
        model: request.model,
        usage: {
          promptTokens: 0, // Replicate doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0
        },
        finishReason: 'stop',
        processingTime
      };
    } catch (error: unknown) {
      console.error('Replicate generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }

  private getModelVersion(model: string): string {
    const versions: Record<string, string> = {
      'meta/llama-2-70b-chat': '02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
      'meta/llama-2-13b-chat': 'f4e2de70d66816a838a89eeeb621910adffb0dd0baba3976c96980970978018d',
      'meta/llama-2-7b-chat': '13c3cdee13ee059ab779f0291d29054dab00a47dad8261375654de5540165fb0'
    };
    return versions[model] || versions['meta/llama-2-7b-chat'];
  }
}

class DeepSeekProvider implements LLMProvider {
  id = 'deepseek';
  name = 'DeepSeek (Chinese AI)';
  baseUrl = 'https://api.deepseek.com/v1';
  apiKeyRequired = true;
  supportedModels = [
    'deepseek-chat',
    'deepseek-coder',
    'deepseek-math',
    'deepseek-reasoner'
  ];
  rateLimit = 60;

  private getApiKey(): string | null {
    // Try environment variables first (Vite format)
    const envKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (envKey) return envKey;
    
    // Try localStorage
    const localKey = localStorage.getItem('deepseek_api_key');
    if (localKey) return localKey;
    
    // No API key available
    return null;
  }

  async isAvailable(): Promise<boolean> {
    const apiKey = this.getApiKey();
    if (!apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.warn('DeepSeek provider unavailable:', error);
      return false;
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          top_p: request.topP || 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        id: data.id,
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        finishReason: data.choices[0].finish_reason || 'stop',
        processingTime
      };
    } catch (error: unknown) {
      console.error('DeepSeek generation error:', error);
      throw new Error(`Failed to generate response: ${(error as any).message}`);
    }
  }
}

class LocalAIProvider implements LLMProvider {
  id = 'localai';
  name = 'LocalAI (Self-hosted)';
  baseUrl = getAgentEndpoint();
  apiKeyRequired = false;
  supportedModels = [
    'gpt-3.5-turbo',
    'gpt-4',
    'llama2-chat',
    'codellama-instruct',
    'mistral-instruct'
  ];
  rateLimit = 1000;

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}?provider=localai&action=health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'localai',
        payload: {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
          top_p: request.topP || 0.9
        }
      })
    });

    const data = await response.json();
    const processingTime = Date.now() - startTime;

    return {
      id: data.id,
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      finishReason: data.choices[0].finish_reason,
      processingTime
    };
  }
}

export class LLMService {
  private providers: Map<string, LLMProvider> = new Map();
  private fallbackChain: string[] = ['ollama', 'deepseek', 'groq', 'huggingface', 'localai', 'openai', 'anthropic', 'cohere', 'replicate'];
  private configuredKeys: Map<string, string> = new Map();

  constructor() {
    this.initializeProviders();
    this.loadStoredApiKeys();
    this.initializeProviderRegistry();
  }

  private initializeProviders(): void {
    // Free/Local Providers
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('huggingface', new HuggingFaceProvider());
    this.providers.set('localai', new LocalAIProvider());
    
    // Cloud Providers (API Key Required)
    this.providers.set('groq', new GroqProvider());
    this.providers.set('deepseek', new DeepSeekProvider());
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    this.providers.set('cohere', new CohereProvider());
    this.providers.set('replicate', new ReplicateProvider());
  }

  private initializeProviderRegistry(): void {
    // Import and register the new providers
    import('./providers/OllamaProvider');
    import('./providers/VllmProvider');
    
    console.log('🔧 Provider registry initialized with enhanced providers');
  }

  async getAvailableProviders(): Promise<Array<{ id: string; name: string; available: boolean; models: string[] }>> {
    const results = [];
    
    // Get providers from both the existing system and the new registry
    for (const [id, provider] of this.providers.entries()) {
      const available = await provider.isAvailable();
      results.push({
        id,
        name: provider.name,
        available,
        models: provider.supportedModels
      });
    }

    // Add providers from the new registry
    const registryProviders = providerRegistry.getAllProviders();
    for (const provider of registryProviders) {
      const available = await provider.isAvailable();
      results.push({
        id: provider.id,
        name: provider.name,
        available,
        models: ['dynamic'] // Registry providers support dynamic models
      });
    }

    // Always include fallback service as available
    const fallbackAvailable = await fallbackAgentService.isAvailable();
    results.push({
      id: 'fallback',
      name: 'Fallback Agent Service',
      available: fallbackAvailable,
      models: ['fallback-agent']
    });

    return results;
  }

  async testLLMProvider(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      auditLogger.logLLMInteraction(providerId, 'unknown', {
        action: 'test_provider',
        error: 'Provider not found'
      }, 'failure');
      return false;
    }

    try {
      auditLogger.logLLMInteraction(providerId, provider.supportedModels[0] || 'unknown', {
        action: 'test_provider_start',
        timestamp: new Date().toISOString()
      });

      // First check if provider is available
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        auditLogger.logLLMInteraction(providerId, provider.supportedModels[0] || 'unknown', {
          action: 'test_provider',
          error: 'Provider not available'
        }, 'failure');
        return false;
      }

      // Test with a simple request
      const testRequest: LLMRequest = {
        model: provider.supportedModels[0], // Use first supported model
        messages: [
          { role: 'user', content: 'Hello, this is a test. Please respond with "Test successful".' }
        ],
        temperature: 0.1,
        maxTokens: 50
      };

      const startTime = Date.now();
      const response = await provider.generateResponse(testRequest);
      const duration = Date.now() - startTime;
      
      // Check if response is valid
      const isValid = !!(response.content && response.content.length > 0);
      
      auditLogger.logLLMInteraction(providerId, testRequest.model, {
        action: 'test_provider',
        duration_ms: duration,
        response_length: response.content?.length || 0,
        tokens_used: response.usage?.totalTokens || 0,
        success: isValid
      }, isValid ? 'success' : 'failure');
      
      return isValid;
    } catch (error: unknown) {
      auditLogger.logLLMInteraction(providerId, provider.supportedModels[0] || 'unknown', {
        action: 'test_provider',
        error: (error as any).message,
        stack: (error as any).stack
      }, 'failure');
      return false;
    }
  }

  async generateResponse(
    model: string, 
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      preferredProvider?: string;
    } = {}
  ): Promise<LLMResponse> {
    
    // Determine provider based on model or preference
    let providerId = options.preferredProvider;
    
    if (!providerId) {
      // Find provider that supports this model
      for (const [id, provider] of this.providers.entries()) {
        if (provider.supportedModels.includes(model)) {
          const available = await provider.isAvailable();
          if (available) {
            providerId = id;
            break;
          }
        }
      }
    }

    if (!providerId) {
      throw new Error(`No available provider found for model: ${model}`);
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    const request: LLMRequest = {
      model,
      messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP
    };

    try {
      return await provider.generateResponse(request);
    } catch (error: unknown) {
      console.error(`Provider ${providerId} failed:`, error);
      
      // Try fallback providers
      for (const fallbackId of this.fallbackChain) {
        if (fallbackId === providerId) continue;
        
        const fallbackProvider = this.providers.get(fallbackId);
        if (!fallbackProvider) continue;

        const available = await fallbackProvider.isAvailable();
        if (!available) continue;

        // Find a compatible model for this provider
        const compatibleModel = fallbackProvider.supportedModels[0];
        if (!compatibleModel) continue;

        try {
          console.log(`🔄 Falling back to ${fallbackId} with model ${compatibleModel}`);
          const fallbackRequest = { ...request, model: compatibleModel };
          return await fallbackProvider.generateResponse(fallbackRequest);
        } catch (fallbackError) {
          console.error(`Fallback ${fallbackId} also failed:`, fallbackError);
          continue;
        }
      }

      // If all providers failed, use fallback service
      console.log('🔄 All LLM providers failed, using fallback agent service');
      try {
        return await fallbackAgentService.generateResponse(request);
      } catch (fallbackError) {
        console.error('Fallback agent service also failed:', fallbackError);
        throw error; // Throw original error if fallback also fails
      }
    }
  }

  async testConnection(providerId: string): Promise<{ success: boolean; error?: string; latency?: number }> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      return { success: false, error: 'Provider not found' };
    }

    const startTime = Date.now();
    
    try {
      const available = await provider.isAvailable();
      if (!available) {
        return { success: false, error: 'Provider not available' };
      }

      // Test with a simple request
      const testModel = provider.supportedModels[0];
      const testRequest: LLMRequest = {
        model: testModel,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10
      };

      await provider.generateResponse(testRequest);
      const latency = Date.now() - startTime;

      return { success: true, latency };

    } catch (error: unknown) {
      return { success: false, error: (error as any).message };
    }
  }

  /**
   * Load stored API keys from localStorage
   */
  private loadStoredApiKeys(): void {
    try {
      const keys = ['groq', 'openai', 'anthropic', 'cohere', 'replicate', 'huggingface', 'deepseek'];
      keys.forEach(provider => {
        const key = localStorage.getItem(`${provider}_api_key`);
        if (key) {
          this.configuredKeys.set(provider, key);
        }
      });
      console.log(`📦 Loaded ${this.configuredKeys.size} stored API keys`);
    } catch (error) {
      console.warn('Failed to load stored API keys:', error);
    }
  }

  /**
   * Configure API key for a provider
   */
  setApiKey(providerId: string, apiKey: string): boolean {
    const provider = this.providers.get(providerId);
    if (!provider) {
      console.error(`Provider ${providerId} not found`);
      return false;
    }

    if (!provider.apiKeyRequired) {
      console.warn(`Provider ${providerId} does not require an API key`);
      return false;
    }

    try {
      // Store in memory
      this.configuredKeys.set(providerId, apiKey);
      
      // Store in localStorage
      localStorage.setItem(`${providerId}_api_key`, apiKey);
      
      console.log(`✅ API key configured for ${providerId}`);
      return true;
    } catch (error) {
      console.error(`Failed to configure API key for ${providerId}:`, error);
      return false;
    }
  }

  /**
   * Remove API key for a provider
   */
  removeApiKey(providerId: string): boolean {
    try {
      // Remove from memory
      this.configuredKeys.delete(providerId);
      
      // Remove from localStorage
      localStorage.removeItem(`${providerId}_api_key`);
      
      console.log(`🗑️ API key removed for ${providerId}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove API key for ${providerId}:`, error);
      return false;
    }
  }

  /**
   * Check if API key is configured for a provider
   */
  hasApiKey(providerId: string): boolean {
    return this.configuredKeys.has(providerId) || !!localStorage.getItem(`${providerId}_api_key`);
  }

  /**
   * Get configured providers (those with API keys or that don't require them)
   */
  getConfiguredProviders(): Array<{ id: string; name: string; requiresKey: boolean; hasKey: boolean; models: string[] }> {
    const results = [];
    
    for (const [id, provider] of this.providers.entries()) {
      results.push({
        id,
        name: provider.name,
        requiresKey: provider.apiKeyRequired,
        hasKey: this.hasApiKey(id),
        models: provider.supportedModels
      });
    }

    return results;
  }

  /**
   * Get provider configuration requirements
   */
  getProviderRequirements(): Array<{
    id: string;
    name: string;
    apiKeyRequired: boolean;
    apiKeyConfigured: boolean;
    keySourceDescription: string;
    setupInstructions: string;
  }> {
    const requirements = [];
    
    for (const [id, provider] of this.providers.entries()) {
      const hasKey = this.hasApiKey(id);
      
      requirements.push({
        id,
        name: provider.name,
        apiKeyRequired: provider.apiKeyRequired,
        apiKeyConfigured: hasKey,
        keySourceDescription: this.getKeySourceDescription(id),
        setupInstructions: this.getSetupInstructions(id)
      });
    }

    return requirements;
  }

  private getKeySourceDescription(providerId: string): string {
    const sources: Record<string, string> = {
      'groq': 'Get your free API key from https://console.groq.com',
      'openai': 'Get your API key from https://platform.openai.com/account/api-keys',
      'anthropic': 'Get your API key from https://console.anthropic.com',
      'cohere': 'Get your API key from https://dashboard.cohere.ai',
      'replicate': 'Get your API token from https://replicate.com/account',
      'huggingface': 'Get your API key from https://huggingface.co/settings/tokens',
      'deepseek': 'Get your API key from https://platform.deepseek.com',
      'ollama': 'Install Ollama locally: https://ollama.ai',
      'localai': 'Set up LocalAI: https://github.com/go-skynet/LocalAI'
    };
    
    return sources[providerId] || 'Check provider documentation for API key information';
  }

  private getSetupInstructions(providerId: string): string {
    const instructions: Record<string, string> = {
      'groq': '1. Sign up at console.groq.com\n2. Generate an API key\n3. Configure in admin settings',
      'openai': '1. Sign up at platform.openai.com\n2. Add payment method\n3. Generate API key\n4. Configure in admin settings',
      'anthropic': '1. Sign up at console.anthropic.com\n2. Request access to API\n3. Generate API key\n4. Configure in admin settings',
      'cohere': '1. Sign up at dashboard.cohere.ai\n2. Generate API key\n3. Configure in admin settings',
      'replicate': '1. Sign up at replicate.com\n2. Add payment method\n3. Generate API token\n4. Configure in admin settings',
      'huggingface': '1. Sign up at huggingface.co\n2. Create access token\n3. Configure in admin settings',
      'deepseek': '1. Sign up at platform.deepseek.com\n2. Generate API key\n3. Configure in admin settings',
      'ollama': '1. Install Ollama: curl -fsSL https://ollama.ai/install.sh | sh\n2. Start server: ollama serve\n3. Enable CORS: OLLAMA_ORIGINS=* ollama serve',
      'localai': '1. Install LocalAI\n2. Configure models\n3. Start server on localhost:8080'
    };
    
    return instructions[providerId] || 'Check provider documentation for setup instructions';
  }

  /**
   * Bulk configure API keys from environment or object
   */
  configureFromEnvironment(): void {
    const envKeys = {
      'groq': import.meta.env.VITE_GROQ_API_KEY,
      'openai': import.meta.env.VITE_OPENAI_API_KEY,
      'anthropic': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'cohere': import.meta.env.VITE_COHERE_API_KEY,
      'replicate': import.meta.env.VITE_REPLICATE_API_TOKEN,
      'huggingface': import.meta.env.VITE_HUGGINGFACE_API_KEY,
      'deepseek': import.meta.env.VITE_DEEPSEEK_API_KEY
    };

    let configured = 0;
    for (const [providerId, key] of Object.entries(envKeys)) {
      if (key && key.trim()) {
        this.setApiKey(providerId, key.trim());
        configured++;
      }
    }

    if (configured > 0) {
      console.log(`🌍 Configured ${configured} API keys from environment`);
    }
  }

  /**
   * Export configuration (without sensitive data)
   */
  exportConfiguration(): {
    providers: string[];
    configuredProviders: string[];
    availabilityStatus: Record<string, boolean>;
  } {
    return {
      providers: Array.from(this.providers.keys()),
      configuredProviders: Array.from(this.configuredKeys.keys()),
      availabilityStatus: {} // Would need to be populated asynchronously
    };
  }

  /**
   * Health check for all providers
   */
  async performHealthCheck(): Promise<Record<string, { available: boolean; latency?: number; error?: string }>> {
    const results: Record<string, { available: boolean; latency?: number; error?: string }> = {};
    
    for (const [id, provider] of this.providers.entries()) {
      try {
        const startTime = Date.now();
        const available = await provider.isAvailable();
        const latency = Date.now() - startTime;
        
        results[id] = { available, latency };
      } catch (error: unknown) {
        results[id] = { available: false, error: (error as any).message };
      }
    }

    return results;
  }
}

export const llmService = new LLMService();