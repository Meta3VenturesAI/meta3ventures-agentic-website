/**
 * Centralized Application Configuration
 * Consolidates all environment variables and app settings
 */

export interface AppConfig {
  // App metadata
  version: string;
  environment: 'development' | 'production' | 'test';
  buildTime: string;
  
  // Feature flags
  features: {
    agents: boolean;
    analytics: boolean;
    backups: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
  };
  
  // External services
  services: {
    supabase: {
      url: string;
      anonKey: string;
    };
    analytics: {
      gaId?: string;
    };
    formspree: {
      endpoint?: string;
    };
  };
  
  // Agent system
  agents: {
    enabled: boolean;
    fallbackEnabled: boolean;
    providers: {
      ollama: {
        url?: string;
        enabled?: boolean;
        defaultModel?: string;
      };
      vllm: {
        url?: string;
        enabled?: boolean;
        defaultModel?: string;
      };
      localai: {
        url?: string;
        enabled?: boolean;
        defaultModel?: string;
      };
      huggingface: {
        apiKey?: string;
        enabled?: boolean;
      };
      groq: {
        apiKey?: string;
        enabled?: boolean;
      };
    };
  };
  
  // Performance settings
  performance: {
    maxLongTaskDuration: number;
    maxPageLoadTime: number;
    backupInterval: number;
    maxBackups: number;
  };
}

// Load and validate configuration
const loadConfig = (): AppConfig => {
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;
  
  return {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: isDev ? 'development' : isProd ? 'production' : 'test',
    buildTime: new Date().toISOString(),
    
    features: {
      agents: import.meta.env.VITE_AGENTS_DISABLED !== 'true',
      analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
      backups: import.meta.env.VITE_ENABLE_BACKUPS !== 'false',
      errorTracking: isProd || import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
      performanceMonitoring: isProd || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
    },
    
    services: {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      analytics: {
        gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      },
      formspree: {
        endpoint: import.meta.env.VITE_FORMSPREE_ENDPOINT,
      },
    },
    
    agents: {
      enabled: import.meta.env.VITE_AGENTS_DISABLED !== 'true',
      fallbackEnabled: true,
      providers: {
        ollama: {
          url: import.meta.env.OLLAMA_URL || 'http://localhost:11434',
          enabled: !!import.meta.env.OLLAMA_URL,
          defaultModel: import.meta.env.VITE_DEFAULT_OLLAMA_MODEL || 'llama3.2:3b',
        },
        vllm: {
          url: import.meta.env.VLLM_URL || 'http://localhost:8000',
          enabled: !!import.meta.env.VLLM_URL,
          defaultModel: import.meta.env.VITE_DEFAULT_VLLM_MODEL || 'meta-llama/Llama-2-7b-chat-hf',
        },
        localai: {
          url: import.meta.env.LOCALAI_URL || 'http://localhost:8080',
          enabled: !!import.meta.env.LOCALAI_URL,
          defaultModel: import.meta.env.VITE_DEFAULT_LOCALAI_MODEL || 'ggml-gpt4all-j',
        },
        huggingface: {
          apiKey: import.meta.env.HUGGINGFACE_API_KEY || '',
          enabled: !!import.meta.env.HUGGINGFACE_API_KEY,
        },
        groq: {
          apiKey: import.meta.env.VITE_GROQ_API_KEY,
          enabled: !!import.meta.env.VITE_GROQ_API_KEY,
        },
      },
    },
    
    performance: {
      maxLongTaskDuration: 50,
      maxPageLoadTime: 3000,
      backupInterval: 3600000, // 1 hour
      maxBackups: 24,
    },
  };
};

// Validate required configuration
const validateConfig = (config: AppConfig): void => {
  const errors: string[] = [];
  
  if (!config.services.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!config.services.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors);
    if (config.environment === 'production') {
      throw new Error(`Invalid configuration: ${errors.join(', ')}`);
    }
  }
};

// Export singleton configuration
export const appConfig = loadConfig();

// Validate configuration on load
validateConfig(appConfig);

// Make config available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown).__APP_CONFIG__ = appConfig;
}

export default appConfig;
