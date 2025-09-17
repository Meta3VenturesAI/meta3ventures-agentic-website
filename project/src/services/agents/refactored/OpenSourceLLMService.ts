/**
 * Open Source LLM Service
 * Pre-configured service for popular open source models with optimized settings
 */

export interface OpenSourceModel {
  id: string;
  name: string;
  provider: 'groq' | 'huggingface' | 'ollama' | 'together' | 'replicate';
  modelId: string;
  contextLength: number;
  strengths: string[];
  useCase: 'general' | 'coding' | 'reasoning' | 'creative' | 'analysis';
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'good';
  requiresApiKey: boolean;
  free: boolean;
}

export class OpenSourceLLMService {
  private static instance: OpenSourceLLMService;
  private preConfiguredModels: OpenSourceModel[] = [
    // Groq Models (Fast, Free Tier Available)
    {
      id: 'llama-3.1-70b-versatile',
      name: 'Llama 3.1 70B (Groq)',
      provider: 'groq',
      modelId: 'llama-3.1-70b-versatile',
      contextLength: 32768,
      strengths: ['General conversation', 'Reasoning', 'Analysis'],
      useCase: 'general',
      speed: 'fast',
      quality: 'high',
      requiresApiKey: true,
      free: true
    },
    {
      id: 'llama-3.1-8b-instant',
      name: 'Llama 3.1 8B (Groq)',
      provider: 'groq',
      modelId: 'llama-3.1-8b-instant',
      contextLength: 8192,
      strengths: ['Fast responses', 'General chat', 'Quick analysis'],
      useCase: 'general',
      speed: 'fast',
      quality: 'good',
      requiresApiKey: true,
      free: true
    },
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B (Groq)',
      provider: 'groq',
      modelId: 'mixtral-8x7b-32768',
      contextLength: 32768,
      strengths: ['Multilingual', 'Complex reasoning', 'Long context'],
      useCase: 'reasoning',
      speed: 'fast',
      quality: 'high',
      requiresApiKey: true,
      free: true
    },
    
    // Hugging Face Models (Free, No API Key for some)
    {
      id: 'microsoft-dialoGPT-large',
      name: 'DialoGPT Large',
      provider: 'huggingface',
      modelId: 'microsoft/DialoGPT-large',
      contextLength: 1024,
      strengths: ['Conversational', 'Natural dialogue', 'Personality'],
      useCase: 'general',
      speed: 'medium',
      quality: 'good',
      requiresApiKey: false,
      free: true
    },
    {
      id: 'google-flan-t5-large',
      name: 'FLAN-T5 Large',
      provider: 'huggingface',
      modelId: 'google/flan-t5-large',
      contextLength: 512,
      strengths: ['Instruction following', 'Q&A', 'Summarization'],
      useCase: 'analysis',
      speed: 'medium',
      quality: 'good',
      requiresApiKey: false,
      free: true
    },
    
    // Ollama Models (Local, Completely Free)
    {
      id: 'llama3.2-3b',
      name: 'Llama 3.2 3B (Ollama)',
      provider: 'ollama',
      modelId: 'llama3.2:3b',
      contextLength: 8192,
      strengths: ['Local processing', 'Privacy', 'Fast inference'],
      useCase: 'general',
      speed: 'fast',
      quality: 'good',
      requiresApiKey: false,
      free: true
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B (Ollama)',
      provider: 'ollama',
      modelId: 'mistral:7b',
      contextLength: 8192,
      strengths: ['Instruction following', 'Reasoning', 'Coding'],
      useCase: 'coding',
      speed: 'medium',
      quality: 'high',
      requiresApiKey: false,
      free: true
    },
    {
      id: 'codellama-7b',
      name: 'Code Llama 7B (Ollama)',
      provider: 'ollama',
      modelId: 'codellama:7b',
      contextLength: 4096,
      strengths: ['Code generation', 'Code analysis', 'Programming help'],
      useCase: 'coding',
      speed: 'medium',
      quality: 'high',
      requiresApiKey: false,
      free: true
    }
  ];

  static getInstance(): OpenSourceLLMService {
    if (!OpenSourceLLMService.instance) {
      OpenSourceLLMService.instance = new OpenSourceLLMService();
    }
    return OpenSourceLLMService.instance;
  }

  getAvailableModels(): OpenSourceModel[] {
    return this.preConfiguredModels;
  }

  getModelsByProvider(provider: string): OpenSourceModel[] {
    return this.preConfiguredModels.filter(model => model.provider === provider);
  }

  getModelsByUseCase(useCase: string): OpenSourceModel[] {
    return this.preConfiguredModels.filter(model => model.useCase === useCase);
  }

  getFreeModels(): OpenSourceModel[] {
    return this.preConfiguredModels.filter(model => model.free);
  }

  getModelsWithoutApiKey(): OpenSourceModel[] {
    return this.preConfiguredModels.filter(model => !model.requiresApiKey);
  }

  getRecommendedModel(useCase: 'general' | 'coding' | 'reasoning' | 'creative' | 'analysis' = 'general'): OpenSourceModel {
    const modelsForUseCase = this.getModelsByUseCase(useCase);
    
    if (modelsForUseCase.length === 0) {
      // Fallback to general use case
      return this.getModelsByUseCase('general')[0] || this.preConfiguredModels[0];
    }

    // Prioritize by: free > fast > high quality
    const sorted = modelsForUseCase.sort((a, b) => {
      if (a.free !== b.free) return a.free ? -1 : 1;
      if (a.speed !== b.speed) {
        const speedOrder = { fast: 0, medium: 1, slow: 2 };
        return speedOrder[a.speed] - speedOrder[b.speed];
      }
      if (a.quality !== b.quality) {
        const qualityOrder = { high: 0, good: 1, medium: 2 };
        return qualityOrder[a.quality] - qualityOrder[b.quality];
      }
      return 0;
    });

    return sorted[0];
  }

  getModelById(id: string): OpenSourceModel | null {
    return this.preConfiguredModels.find(model => model.id === id) || null;
  }

  getOptimizedSettings(modelId: string): {
    temperature: number;
    maxTokens: number;
    topP: number;
    topK?: number;
    repetitionPenalty?: number;
  } {
    const model = this.getModelById(modelId);
    
    if (!model) {
      return {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9
      };
    }

    // Optimized settings based on model characteristics
    const settings = {
      temperature: 0.7,
      maxTokens: Math.min(1000, Math.floor(model.contextLength * 0.3)),
      topP: 0.9
    };

    // Model-specific optimizations
    switch (model.useCase) {
      case 'coding':
        settings.temperature = 0.3; // More deterministic for code
        settings.topP = 0.8;
        break;
      case 'reasoning':
        settings.temperature = 0.5; // Balanced for reasoning
        settings.maxTokens = Math.min(1500, Math.floor(model.contextLength * 0.4));
        break;
      case 'creative':
        settings.temperature = 0.9; // More creative
        settings.topP = 0.95;
        break;
      case 'analysis':
        settings.temperature = 0.4; // Focused analysis
        settings.maxTokens = Math.min(2000, Math.floor(model.contextLength * 0.5));
        break;
    }

    return settings;
  }

  getSetupInstructions(modelId: string): {
    provider: string;
    instructions: string[];
    environmentVars?: string[];
    testCommand?: string;
  } {
    const model = this.getModelById(modelId);
    if (!model) {
      return {
        provider: 'unknown',
        instructions: ['Model not found']
      };
    }

    switch (model.provider) {
      case 'groq':
        return {
          provider: 'Groq',
          instructions: [
            '1. Sign up for free Groq account at console.groq.com',
            '2. Generate API key in dashboard',
            '3. Add to Netlify environment variables',
            '4. Test connection in admin panel'
          ],
          environmentVars: ['VITE_GROQ_API_KEY'],
          testCommand: 'Test LLM Provider: Groq'
        };

      case 'huggingface':
        return {
          provider: 'Hugging Face',
          instructions: [
            '1. Create account at huggingface.co (optional for some models)',
            '2. Generate API token in settings (if needed)',
            '3. Add to environment variables',
            '4. Test connection'
          ],
          environmentVars: ['VITE_HUGGINGFACE_API_KEY'],
          testCommand: 'Test LLM Provider: Hugging Face'
        };

      case 'ollama':
        return {
          provider: 'Ollama',
          instructions: [
            '1. Install Ollama locally: curl -fsSL https://ollama.ai/install.sh | sh',
            '2. Start Ollama server: ollama serve',
            `3. Pull model: ollama pull ${model.modelId}`,
            '4. Configure CORS: OLLAMA_ORIGINS=* ollama serve',
            '5. Set Netlify environment variable for production'
          ],
          environmentVars: ['OLLAMA_URL'],
          testCommand: 'Test LLM Provider: Ollama'
        };

      default:
        return {
          provider: model.provider,
          instructions: ['Setup instructions not available for this provider']
        };
    }
  }
}

export const openSourceLLMService = OpenSourceLLMService.getInstance();
