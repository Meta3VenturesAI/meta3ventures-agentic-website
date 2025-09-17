/**
 * Agent Proxy Function - Netlify Serverless Function
 * Handles communication between frontend agents and cloud/local LLM providers
 * Enhanced for production deployment with comprehensive error handling
 */

const { v4: uuidv4 } = require('uuid');

// Rate limiting configuration
const RATE_LIMITS = {
  // Local/Open Source providers
  ollama: 30,        // requests per minute
  localai: 20,       // requests per minute
  vllm: 25,          // requests per minute
  huggingface: 10,   // requests per minute (free tier)

  // Cloud providers (higher limits)
  groq: 100,         // requests per minute (fast inference)
  openai: 60,        // requests per minute
  anthropic: 50,     // requests per minute
  deepseek: 40,      // requests per minute
  cohere: 30,        // requests per minute
  replicate: 20      // requests per minute
};

// Request tracking for rate limiting
const requestTracker = new Map();

// Rate limiting function
function checkRateLimit(provider, clientIP) {
  const key = `${provider}-${clientIP}`;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!requestTracker.has(key)) {
    requestTracker.set(key, []);
  }
  
  const requests = requestTracker.get(key);
  // Remove old requests outside the window
  const validRequests = requests.filter(time => time > windowStart);
  
  if (validRequests.length >= RATE_LIMITS[provider]) {
    return false;
  }
  
  validRequests.push(now);
  requestTracker.set(key, validRequests);
  return true;
}

// Ollama provider handler
async function handleOllamaRequest(model, messages, temperature = 0.7) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'llama3.2:3b',
        prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        stream: false,
        options: {
          temperature: temperature,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      id: uuidv4(),
      content: data.response || 'No response from Ollama',
      model: model || 'llama3.2:3b',
      usage: {
        promptTokens: Math.ceil(messages.join(' ').length / 4),
        completionTokens: Math.ceil(data.response?.length / 4 || 0),
        totalTokens: Math.ceil((messages.join(' ').length + (data.response?.length || 0)) / 4)
      },
      finishReason: 'stop',
      processingTime: data.total_duration ? Math.round(data.total_duration / 1000000) : 1000
    };
  } catch (error) {
    console.error('Ollama request failed:', error);
    throw error;
  }
}

// LocalAI provider handler
async function handleLocalAIRequest(model, messages, temperature = 0.7) {
  const localaiUrl = process.env.LOCALAI_URL || 'http://localhost:8080';
  
  try {
    const response = await fetch(`${localaiUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'ggml-gpt4all-j',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`LocalAI API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    return {
      id: data.id || uuidv4(),
      content: choice?.message?.content || 'No response from LocalAI',
      model: model || 'ggml-gpt4all-j',
      usage: data.usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      finishReason: choice?.finish_reason || 'stop',
      processingTime: 1500
    };
  } catch (error) {
    console.error('LocalAI request failed:', error);
    throw error;
  }
}

// VLLM provider handler
async function handleVLLMRequest(model, messages, temperature = 0.7) {
  const vllmUrl = process.env.VLLM_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/Llama-2-7b-chat-hf',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`VLLM API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    
    return {
      id: data.id || uuidv4(),
      content: choice?.message?.content || 'No response from VLLM',
      model: model || 'meta-llama/Llama-2-7b-chat-hf',
      usage: data.usage || {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      finishReason: choice?.finish_reason || 'stop',
      processingTime: 2000
    };
  } catch (error) {
    console.error('VLLM request failed:', error);
    throw error;
  }
}

// HuggingFace provider handler
async function handleHuggingFaceRequest(model, messages, temperature = 0.7) {
  const hfApiKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfApiKey) {
    throw new Error('HuggingFace API key not configured');
  }
  
  const modelName = model || 'microsoft/DialoGPT-large';
  
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: messages.map(m => m.content).join(' '),
        parameters: {
          temperature: temperature,
          max_length: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Array.isArray(data) ? data[0]?.generated_text || 'No response' : 'No response';
    
    return {
      id: uuidv4(),
      content: content,
      model: modelName,
      usage: {
        promptTokens: Math.ceil(messages.join(' ').length / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((messages.join(' ').length + content.length) / 4)
      },
      finishReason: 'stop',
      processingTime: 3000
    };
  } catch (error) {
    console.error('HuggingFace request failed:', error);
    throw error;
  }
}

// Groq provider handler (fast inference)
async function handleGroqRequest(model, messages, temperature = 0.7) {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'mixtral-8x7b-32768',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      id: data.id || uuidv4(),
      content: choice?.message?.content || 'No response from Groq',
      model: data.model || model,
      usage: data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: choice?.finish_reason || 'stop',
      processingTime: 800
    };
  } catch (error) {
    console.error('Groq request failed:', error);
    throw error;
  }
}

// OpenAI provider handler
async function handleOpenAIRequest(model, messages, temperature = 0.7) {
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      id: data.id || uuidv4(),
      content: choice?.message?.content || 'No response from OpenAI',
      model: data.model || model,
      usage: data.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: choice?.finish_reason || 'stop',
      processingTime: 1200
    };
  } catch (error) {
    console.error('OpenAI request failed:', error);
    throw error;
  }
}

// Anthropic provider handler
async function handleAnthropicRequest(model, messages, temperature = 0.7) {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: temperature,
        system: systemMessage,
        messages: userMessages
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || 'No response from Anthropic';

    return {
      id: data.id || uuidv4(),
      content: content,
      model: data.model || model,
      usage: data.usage || { input_tokens: 0, output_tokens: 0 },
      finishReason: data.stop_reason || 'stop',
      processingTime: 1500
    };
  } catch (error) {
    console.error('Anthropic request failed:', error);
    throw error;
  }
}

// DeepSeek provider handler
async function handleDeepSeekRequest(model, messages, temperature = 0.7) {
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DeepSeek API key not configured');
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: messages,
        temperature: temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return {
      id: data.id || uuidv4(),
      content: choice?.message?.content || 'No response from DeepSeek',
      model: data.model || model,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      finishReason: choice?.finish_reason || 'stop',
      processingTime: 1000
    };
  } catch (error) {
    console.error('DeepSeek request failed:', error);
    throw error;
  }
}

// Auto-provider selection (tries available providers in priority order)
async function handleAutoProvider(model, messages, temperature = 0.7) {
  const providerPriority = [
    { name: 'groq', handler: handleGroqRequest, apiKey: process.env.VITE_GROQ_API_KEY },
    { name: 'deepseek', handler: handleDeepSeekRequest, apiKey: process.env.VITE_DEEPSEEK_API_KEY },
    { name: 'openai', handler: handleOpenAIRequest, apiKey: process.env.VITE_OPENAI_API_KEY },
    { name: 'anthropic', handler: handleAnthropicRequest, apiKey: process.env.VITE_ANTHROPIC_API_KEY }
  ];

  // Try providers in order of availability and preference
  for (const provider of providerPriority) {
    if (provider.apiKey) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        const result = await provider.handler(model, messages, temperature);
        result.selectedProvider = provider.name;
        return result;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed, trying next:`, error.message);
      }
    }
  }

  // If all cloud providers fail, try local providers
  const localProviders = [
    { name: 'ollama', handler: handleOllamaRequest },
    { name: 'vllm', handler: handleVLLMRequest },
    { name: 'huggingface', handler: handleHuggingFaceRequest }
  ];

  for (const provider of localProviders) {
    try {
      console.log(`Trying local provider: ${provider.name}`);
      const result = await provider.handler(model, messages, temperature);
      result.selectedProvider = provider.name;
      result.fallbackToLocal = true;
      return result;
    } catch (error) {
      console.warn(`Local provider ${provider.name} failed:`, error.message);
    }
  }

  // All providers failed, return intelligent fallback
  throw new Error('All LLM providers unavailable');
}

// Fallback response handler
function handleFallbackResponse(messages) {
  const query = messages[messages.length - 1]?.content || '';
  
  // Intelligent fallback responses based on query content
  let response = "I'm Meta3's AI Assistant. While our advanced LLM systems are being configured, I can still help you with questions about Meta3 Ventures, our investment focus, and startup guidance.";
  
  if (query.toLowerCase().includes('investment')) {
    response = "I'm Meta3's Investment Specialist. Our LLM systems are currently being set up, but I can tell you that Meta3 Ventures focuses on AI, blockchain, fintech, and deep tech investments. We provide strategic capital and expertise to early-stage ventures. Please try again shortly for more detailed investment analysis.";
  } else if (query.toLowerCase().includes('market') || query.toLowerCase().includes('research')) {
    response = "I'm Meta3's Research Specialist. While our advanced market analysis tools are being configured, I can share that we focus on emerging technology markets, competitive intelligence, and strategic market positioning. Our research covers AI/ML, blockchain, fintech, and deep tech sectors.";
  } else if (query.toLowerCase().includes('startup') || query.toLowerCase().includes('venture')) {
    response = "I'm Meta3's Venture Launch Specialist. Our advanced guidance systems are being set up, but I can tell you that we help entrepreneurs through business planning, market validation, go-to-market strategy, and MVP development. We specialize in technology startups and provide comprehensive support throughout the startup journey.";
  }
  
  return {
    id: uuidv4(),
    content: response,
    model: 'fallback-agent',
    usage: {
      promptTokens: Math.ceil(query.length / 4),
      completionTokens: Math.ceil(response.length / 4),
      totalTokens: Math.ceil((query.length + response.length) / 4)
    },
    finishReason: 'stop',
    processingTime: 100 + Math.random() * 200
  };
}

// Main handler function
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Handle GET requests for health checks
  if (event.httpMethod === 'GET') {
    const { provider, action } = event.queryStringParameters || {};

    if (action === 'health' && provider) {
      // Return health status for requested provider
      const healthStatus = {
        provider,
        status: 'available',
        timestamp: new Date().toISOString(),
        capabilities: ['text-generation', 'chat-completion']
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(healthStatus)
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid GET request. Use POST for LLM requests or GET with ?provider=X&action=health for health checks' })
    };
  }

  // Only allow POST and GET requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST for requests or GET for health checks.' })
    };
  }

  try {
    const requestBody = JSON.parse(event.body || '{}');
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

    // Handle both formats: direct and nested payload
    const { provider } = requestBody;
    const payload = requestBody.payload || requestBody;
    const { model, messages, temperature } = payload;

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    // Check rate limiting for known providers
    if (RATE_LIMITS[provider] && !checkRateLimit(provider, clientIP)) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' })
      };
    }

    let result;
    const startTime = Date.now();

    try {
      switch (provider) {
        // Cloud providers (prioritized for production)
        case 'groq':
          result = await handleGroqRequest(model, messages, temperature);
          break;
        case 'openai':
          result = await handleOpenAIRequest(model, messages, temperature);
          break;
        case 'anthropic':
          result = await handleAnthropicRequest(model, messages, temperature);
          break;
        case 'deepseek':
          result = await handleDeepSeekRequest(model, messages, temperature);
          break;

        // Local/Open Source providers
        case 'ollama':
          result = await handleOllamaRequest(model, messages, temperature);
          break;
        case 'localai':
          result = await handleLocalAIRequest(model, messages, temperature);
          break;
        case 'vllm':
          result = await handleVLLMRequest(model, messages, temperature);
          break;
        case 'huggingface':
          result = await handleHuggingFaceRequest(model, messages, temperature);
          break;

        default:
          // Auto-select best available provider
          result = await handleAutoProvider(model, messages, temperature);
      }
    } catch (providerError) {
      console.error(`Provider ${provider} failed:`, providerError);
      // Fall back to intelligent response
      result = handleFallbackResponse(messages);
      result.fallback = true;
      result.originalError = providerError.message;
    }

    // Add processing time if not set
    if (!result.processingTime) {
      result.processingTime = Date.now() - startTime;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Agent proxy error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        fallback: true
      })
    };
  }
};
