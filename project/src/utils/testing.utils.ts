/**
 * Essential Testing Utilities
 * Provides core testing helpers without complex dependencies
 */

import { appConfig } from '../config/app.config';

interface MockAgentConfig {
  id?: string;
  name?: string;
  specialties?: string[];
}

// Mock implementations for testing
export const mockAppConfig = {
  ...appConfig,
  environment: 'test' as const,
  features: {
    ...appConfig.features,
    agents: true,
    analytics: false,
    errorTracking: false,
  },
  services: {
    ...appConfig.services,
    supabase: {
      url: 'http://localhost:54321',
      anonKey: 'test-key'
    }
  }
};

// Mock fetch for API testing
export const createMockFetch = (responses: Record<string, unknown>) => {
  return (url: string) => {
    const response = responses[url];
    if (!response) {
      return Promise.reject(new Error(`No mock response for ${url}`));
    }

    return Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data)),
    });
  };
};

// Agent system test utilities
export const createMockAgent = (overrides: Partial<MockAgentConfig> = {}) => ({
  id: 'test-agent',
  name: 'Test Agent',
  specialties: ['testing', 'mocking'],
  getCapabilities: () => ({
    id: 'test-agent',
    name: 'Test Agent',
    description: 'A test agent for unit testing',
    specialties: ['testing', 'mocking'],
    tools: [],
    canHandle: () => true,
    priority: 1
  }),
  generateResponse: () => Promise.resolve({
    content: 'Test response',
    confidence: 95,
    agentId: 'test-agent',
    timestamp: new Date()
  }),
  ...overrides
});

interface MockLLMResponse {
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

// Mock LLM service responses
export const createMockLLMResponse = (overrides: Partial<MockLLMResponse> = {}) => ({
  id: `test-${Date.now()}`,
  content: 'Mock LLM response',
  model: 'test-model',
  usage: {
    promptTokens: 10,
    completionTokens: 15,
    totalTokens: 25
  },
  finishReason: 'stop' as const,
  processingTime: 100,
  ...overrides
});

// Error testing utilities
export const createTestError = (type: 'network' | 'validation' | 'system' = 'system') => {
  switch (type) {
    case 'network':
      return new Error('Network request failed');
    case 'validation':
      return new Error('Validation failed: invalid input');
    case 'system':
      return new Error('ReferenceError: undefined variable');
    default:
      return new Error('Test error');
  }
};

// Performance testing utilities
export const measurePerformance = async (fn: () => Promise<unknown> | unknown) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  return {
    result,
    duration: end - start,
    memory: (performance as unknown).memory ? {
      used: (performance as unknown).memory.usedJSHeapSize,
      total: (performance as unknown).memory.totalJSHeapSize,
      limit: (performance as unknown).memory.jsHeapSizeLimit
    } : null
  };
};

// Mock localStorage for testing
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
};

// Component testing helpers
export const waitForElement = async (selector: string, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        return;
      }
      
      setTimeout(checkElement, 100);
    };
    
    checkElement();
  });
};

// Form testing utilities
export const fillForm = async (formData: Record<string, string>) => {
  for (const [name, value] of Object.entries(formData)) {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

// API testing utilities
export const createMockApiResponse = (data: unknown, options: { delay?: number; error?: boolean } = {}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options.error) {
        reject(new Error('Mock API error'));
      } else {
        resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(data),
          text: () => Promise.resolve(JSON.stringify(data))
        });
      }
    }, options.delay || 0);
  });
};

// Test data generators
export const generateTestUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides
});

export const generateTestBlogPost = (overrides: Partial<any> = {}) => ({
  id: 'test-post-123',
  title: 'Test Blog Post',
  content: 'This is a test blog post content.',
  author: 'Test Author',
  publishedAt: new Date().toISOString(),
  tags: ['test', 'blog'],
  ...overrides
});

// Accessibility testing helpers
export const checkA11y = async (element: HTMLElement) => {
  const issues: string[] = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image at index ${index} missing alt text`);
    }
  });

  // Check for form labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = id ? element.querySelector(`label[for="${id}"]`) : null;
    if (!label && !input.getAttribute('aria-label')) {
      issues.push(`Form input at index ${index} missing label or aria-label`);
    }
  });

  // Check for heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > previousLevel + 1) {
      issues.push(`Heading hierarchy issue at index ${index}: jumped from h${previousLevel} to h${level}`);
    }
    previousLevel = level;
  });

  return issues;
};

export default {
  createMockFetch,
  createMockAgent,
  createMockLLMResponse,
  createTestError,
  measurePerformance,
  createMockLocalStorage,
  waitForElement,
  fillForm,
  createMockApiResponse,
  generateTestUser,
  generateTestBlogPost,
  checkA11y,
  mockAppConfig
};
