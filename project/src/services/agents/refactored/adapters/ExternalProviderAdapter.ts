/**
 * External Provider Adapter
 * 
 * Bridges external provider implementations with our internal LLMProvider interface
 * This allows us to use the full external provider functionality while maintaining
 * compatibility with our existing LLM service.
 */

import { LLMProvider } from '../LLMService';

// Import external provider types
import type { LLMProvider as ExternalLLMProvider } from '../../external/llm/provider';

export class ExternalProviderAdapter implements LLMProvider {
  private _supportedModels: string[] = ['dynamic'];

  constructor(
    private _externalProvider: ExternalLLMProvider,
    private _providerId: string,
    private _providerName: string,
    supportedModels: string[] = ['dynamic']
  ) {
    this._supportedModels = supportedModels;
  }

  get id(): string {
    return this.providerId;
  }

  get name(): string {
    return this.providerName;
  }

  get supportedModels(): string[] {
    return this._supportedModels;
  }

  get baseUrl(): string {
    return 'external-provider';
  }

  get apiKeyRequired(): boolean {
    return false;
  }

  get rateLimit(): number {
    return 100; // requests per minute
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await this.externalProvider.isAvailable();
    } catch (error) {
      console.warn(`External provider ${this.providerId} availability check failed:`, error);
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
    try {
      // Convert our parameters to external provider format
      const externalParams = {
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        maxTokens: params.maxTokens ?? 1024,
        topP: params.topP ?? 0.9
      };

      const result = await this.externalProvider.generate(externalParams);
      return result;
    } catch (error) {
      console.error(`External provider ${this.providerId} generation failed:`, error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateResponse(request: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
  }): Promise<{
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
  }> {
    const startTime = Date.now();
    const content = await this.generate(request);
    const processingTime = Date.now() - startTime;

    return {
      id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      model: request.model,
      usage: {
        promptTokens: request.messages.reduce((acc, msg) => acc + msg.content.length / 4, 0), // Rough estimation
        completionTokens: content.length / 4,
        totalTokens: request.messages.reduce((acc, msg) => acc + msg.content.length / 4, 0) + content.length / 4
      },
      finishReason: 'stop' as const,
      processingTime
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.isAvailable();
    } catch (error) {
      console.error(`External provider ${this.providerId} connection test failed:`, error);
      return false;
    }
  }
}
