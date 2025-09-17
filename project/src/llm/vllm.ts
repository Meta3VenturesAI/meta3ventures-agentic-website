/**
 * vLLM LLM Provider
 * Implements the LLMProvider interface for vLLM OpenAI-compatible API
 */

import type {
  LLMProvider,
  LLMProviderConfig,
  LLMChatRequest,
  LLMChatResponse,
  LLMMessage,
  LLMUsage,
  LLMToolCall
} from './provider.js';
import {
  LLMError,
  LLMTimeoutError
} from './provider.js';
import { handleLLMError } from './errors.js';
export class VLLMProvider implements LLMProvider {
  private config: LLMProviderConfig;
  private baseUrl: string;

  constructor(config: LLMProviderConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config
    };
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  async chat(request: LLMChatRequest): Promise<LLMChatResponse> {
    const { messages, system, tools, seed, temperature = 0.7, max_tokens = 4096, stream = false } = request;
    
    // Prepare messages for OpenAI format
    const openaiMessages = this.prepareMessages(messages, system);
    
    const payload = {
      model: this.config.model,
      messages: openaiMessages,
      temperature,
      max_tokens,
      stream,
      ...(seed && { seed }),
      ...(tools && { tools: this.prepareTools(tools) })
    };

    try {
      const response = await this.makeRequest('/v1/chat/completions', payload);
      
      const choice = response.choices?.[0];
      if (!choice) {
        throw new Error('No response choices received');
      }

      return {
        text: choice.message?.content || '',
        usage: this.parseUsage(response.usage),
        tool_calls: this.parseToolCalls(choice.message?.tool_calls),
        finish_reason: this.parseFinishReason(choice.finish_reason)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/v1/models', {});
      return Array.isArray(response.data) && response.data.length > 0;
    } catch (error) {
      console.warn('vLLM health check failed:', error);
      return false;
    }
  }

  getInfo() {
    return {
      name: 'vLLM',
      version: '1.0.0',
      capabilities: ['chat', 'tools', 'streaming', 'gpu-optimized']
    };
  }

  private prepareMessages(messages: LLMMessage[], system?: string): LLMMessage[] {
    const preparedMessages = [...messages];
    
    if (system) {
      preparedMessages.unshift({
        role: 'system',
        content: system
      });
    }
    
    return preparedMessages;
  }

  private prepareTools(tools: unknown[]): unknown[] {
    // vLLM uses OpenAI-compatible tool format
    return tools.map(tool => ({
      type: tool.type,
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }
    }));
  }

  private parseUsage(usage: unknown): LLMUsage | undefined {
    if (!usage) {
      return undefined;
    }

    return {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0
    };
  }

  private parseToolCalls(toolCalls: unknown[]): LLMToolCall[] | undefined {
    if (!toolCalls || toolCalls.length === 0) {
      return undefined;
    }

    return toolCalls.map(call => ({
      id: call.id || `call_${Date.now()}`,
      type: 'function',
      function: {
        name: call.function?.name || '',
        arguments: JSON.stringify(call.function?.arguments || {})
      }
    }));
  }

  private parseFinishReason(finishReason: string): 'stop' | 'tool_calls' | 'length' | 'content_filter' {
    switch (finishReason) {
      case 'tool_calls':
        return 'tool_calls';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'stop':
      default:
        return 'stop';
    }
  }

  private async makeRequest(endpoint: string, payload: unknown): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      handleLLMError('vllm.generate', e);
    }  }

  private handleError(error: unknown): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    if (error.name === 'AbortError') {
      return new LLMTimeoutError('vLLM', this.config.timeout!);
    }

    return new LLMError(
      error.message || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      error.status || 500,
      'vLLM'
    );
  }
}

/**
 * Create a vLLM provider instance
 */
export function createVLLMProvider(config: LLMProviderConfig): VLLMProvider {
  return new VLLMProvider(config);
}
