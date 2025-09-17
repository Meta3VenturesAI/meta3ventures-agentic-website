/**
 * LLM Provider Registry and Interface
 * 
 * This module defines a minimal interface for language model providers and
 * exports a registry for dynamically registering and retrieving providers.
 * Based on the external implementation but adapted for our TypeScript/React environment.
 */

export interface LLMProvider {
  /** A short unique identifier for the provider (e.g. "ollama", "vllm") */
  id: string;
  /** Human‑readable provider name */
  name: string;
  /** Returns true if the provider is available (e.g. the server is reachable) */
  isAvailable(): Promise<boolean>;
  /**
   * Generates a completion given a system prompt, user messages and optional
   * generation parameters.  Returns the assistant's reply as a string.
   */
  generate(_params: {
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }): Promise<string>;
}

/**
 * ProviderRegistry maintains a mapping of provider IDs to provider instances.
 * Providers should register themselves in their module so that other parts
 * of the system can discover and use them without explicit imports.
 */
export class ProviderRegistry {
  private providers: Map<string, LLMProvider> = new Map();

  register(provider: LLMProvider): void {
    this.providers.set(provider.id, provider);
    console.log(`✅ Registered LLM provider: ${provider.name} (${provider.id})`);
  }

  getProvider(id: string): LLMProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  getAvailableProviders(): Promise<LLMProvider[]> {
    return Promise.all(
      this.getAllProviders().map(async (provider) => {
        const isAvailable = await provider.isAvailable();
        return isAvailable ? provider : null;
      })
    ).then(providers => providers.filter(Boolean) as LLMProvider[]);
  }

  async getBestProvider(): Promise<LLMProvider | null> {
    const availableProviders = await this.getAvailableProviders();
    if (availableProviders.length === 0) {
      return null;
    }
    
    // Return the first available provider (could be enhanced with priority logic)
    return availableProviders[0];
  }

  clear(): void {
    this.providers.clear();
  }

  size(): number {
    return this.providers.size;
  }
}

/** A global registry instance to be used throughout the agent system */
export const providerRegistry = new ProviderRegistry();
