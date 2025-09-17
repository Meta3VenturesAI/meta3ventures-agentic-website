/**
 * LLM Provider Interface
 * Defines the contract for all LLM providers (OSS and closed-source)
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface LLMChatRequest {
  messages: LLMMessage[];
  system?: string;
  tools?: LLMTool[];
  seed?: number;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LLMChatResponse {
  text: string;
  usage?: LLMUsage;
  tool_calls?: LLMToolCall[];
  finish_reason?: 'stop' | 'tool_calls' | 'length' | 'content_filter';
}

export interface LLMProvider {
  /**
   * Send a chat request to the LLM provider
   */
  chat(_request: LLMChatRequest): Promise<LLMChatResponse>;
  
  /**
   * Check if the provider is available and healthy
   */
  healthCheck(): Promise<boolean>;
  
  /**
   * Get provider information
   */
  getInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  };
}

export interface LLMProviderConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * Error types for LLM operations
 */
export class LLMError extends Error {
  constructor(
    message: string,
    public _code: string,
    public statusCode?: number,
    public provider?: string
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

export class LLMTimeoutError extends LLMError {
  constructor(provider: string, timeout: number) {
    super(`Request to ${provider} timed out after ${timeout}ms`, 'TIMEOUT', 408, provider);
    this.name = 'LLMTimeoutError';
  }
}

export class LLMRateLimitError extends LLMError {
  constructor(provider: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${provider}`, 'RATE_LIMIT', 429, provider);
    this.name = 'LLMRateLimitError';
  }
}

export class LLMQuotaExceededError extends LLMError {
  constructor(provider: string) {
    super(`Quota exceeded for ${provider}`, 'QUOTA_EXCEEDED', 402, provider);
    this.name = 'LLMQuotaExceededError';
  }
}
