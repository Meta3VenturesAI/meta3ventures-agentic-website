/**
 * Provider Detection Service
 * Intelligently detects and manages available LLM providers with fallback support
 */

interface ProviderStatus {
  id: string;
  name: string;
  available: boolean;
  configured: boolean;
  latency?: number;
  error?: string;
  type: 'cloud' | 'local' | 'fallback';
  priority: number;
}

export class ProviderDetectionService {
  private static instance: ProviderDetectionService;
  private providerCache: Map<string, ProviderStatus> = new Map();
  private lastCheck: Date | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ProviderDetectionService {
    if (!ProviderDetectionService.instance) {
      ProviderDetectionService.instance = new ProviderDetectionService();
    }
    return ProviderDetectionService.instance;
  }

  async detectAvailableProviders(): Promise<ProviderStatus[]> {
    // Check cache first
    if (this.lastCheck && Date.now() - this.lastCheck.getTime() < this.cacheTimeout) {
      return Array.from(this.providerCache.values());
    }

    const providers: ProviderStatus[] = [];

    // Define provider configurations with priority
    const providerConfigs = [
      // Cloud providers (high priority if configured)
      { id: 'groq', name: 'Groq', type: 'cloud' as const, priority: 90, envKey: 'VITE_GROQ_API_KEY' },
      { id: 'openai', name: 'OpenAI', type: 'cloud' as const, priority: 85, envKey: 'VITE_OPENAI_API_KEY' },
      { id: 'anthropic', name: 'Anthropic', type: 'cloud' as const, priority: 80, envKey: 'VITE_ANTHROPIC_API_KEY' },
      { id: 'deepseek', name: 'DeepSeek', type: 'cloud' as const, priority: 75, envKey: 'VITE_DEEPSEEK_API_KEY' },
      
      // Local providers (medium priority if configured)
      { id: 'ollama', name: 'Ollama', type: 'local' as const, priority: 60, endpoint: '/.netlify/functions/agent-proxy' },
      { id: 'vllm', name: 'vLLM', type: 'local' as const, priority: 55, endpoint: '/.netlify/functions/agent-proxy' },
      { id: 'localai', name: 'LocalAI', type: 'local' as const, priority: 50, endpoint: '/.netlify/functions/agent-proxy' },
      
      // Fallback provider (always available, lowest priority)
      { id: 'fallback', name: 'Fallback Agent', type: 'fallback' as const, priority: 10 }
    ];

    // Test each provider
    for (const config of providerConfigs) {
      const status = await this.testProvider(config);
      providers.push(status);
      this.providerCache.set(config.id, status);
    }

    this.lastCheck = new Date();
    return providers.sort((a, b) => b.priority - a.priority);
  }

  private async testProvider(config: unknown): Promise<ProviderStatus> {
    const startTime = Date.now();

    try {
      // Special handling for fallback provider
      if (config.id === 'fallback') {
        return {
          id: config.id,
          name: config.name,
          available: true,
          configured: true,
          latency: 50, // Simulated latency
          type: config.type,
          priority: config.priority
        };
      }

      // Test cloud providers by checking API key
      if (config.type === 'cloud') {
        const hasApiKey = !!(import.meta.env as unknown)[config.envKey];
        return {
          id: config.id,
          name: config.name,
          available: hasApiKey,
          configured: hasApiKey,
          latency: hasApiKey ? 100 + Math.random() * 200 : undefined,
          error: hasApiKey ? undefined : 'API key not configured',
          type: config.type,
          priority: hasApiKey ? config.priority : config.priority - 50
        };
      }

      // Test local providers via health check
      if (config.type === 'local') {
        const response = await fetch(`${config.endpoint}?provider=${config.id}&action=health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          const latency = Date.now() - startTime;
          
          return {
            id: config.id,
            name: config.name,
            available: data.success || false,
            configured: data.configured || false,
            latency: data.success ? latency : undefined,
            error: data.success ? undefined : data.error || 'Health check failed',
            type: config.type,
            priority: data.success ? config.priority : config.priority - 30
          };
        } else {
          return {
            id: config.id,
            name: config.name,
            available: false,
            configured: false,
            error: `HTTP ${response.status}`,
            type: config.type,
            priority: config.priority - 30
          };
        }
      }

      // Default case
      return {
        id: config.id,
        name: config.name,
        available: false,
        configured: false,
        error: 'Unknown provider type',
        type: config.type,
        priority: config.priority - 50
      };

    } catch (error) {
      return {
        id: config.id,
        name: config.name,
        available: false,
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        type: config.type,
        priority: config.priority - 50
      };
    }
  }

  async getBestProvider(): Promise<ProviderStatus | null> {
    const providers = await this.detectAvailableProviders();
    const availableProviders = providers.filter(p => p.available);
    
    if (availableProviders.length === 0) {
      return null;
    }

    // Return the highest priority available provider
    return availableProviders[0];
  }

  async getProvidersByType(type: 'cloud' | 'local' | 'fallback'): Promise<ProviderStatus[]> {
    const providers = await this.detectAvailableProviders();
    return providers.filter(p => p.type === type);
  }

  clearCache(): void {
    this.providerCache.clear();
    this.lastCheck = null;
  }

  getProviderStatus(providerId: string): ProviderStatus | null {
    return this.providerCache.get(providerId) || null;
  }
}

export const providerDetectionService = ProviderDetectionService.getInstance();
