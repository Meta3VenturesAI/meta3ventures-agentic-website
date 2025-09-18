/**
 * LLM Integration Tests
 * Tests for the integrated LLM service and agent functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { llmService } from '../services/agents/refactored/LLMService';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';
import { Meta3ResearchAgent } from '../services/agents/refactored/agents/Meta3ResearchAgent';
import { Meta3InvestmentAgent } from '../services/agents/refactored/agents/Meta3InvestmentAgent';

// Mock localStorage for browser environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock fetch for API calls
global.fetch = vi.fn();

describe('LLM Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize LLM service with providers', async () => {
    expect(llmService).toBeDefined();
    
    // Mock successful provider check
    (fetch as any).mockResolvedValueOnce({
      ok: false, // Ollama not available in test environment
      json: () => Promise.resolve({})
    });

    const providers = await llmService.getAvailableProviders();
    expect(providers).toBeInstanceOf(Array);
    expect(providers.length).toBeGreaterThan(0);
    
    // Should have at least the main providers
    const providerIds = providers.map(p => p.id);
    expect(providerIds).toContain('ollama');
    expect(providerIds).toContain('groq');
    expect(providerIds).toContain('openai');
    expect(providerIds).toContain('anthropic');
  });

  it('should handle provider availability checking gracefully', async () => {
    // Mock network error
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const providers = await llmService.getAvailableProviders();
    const ollamaProvider = providers.find(p => p.id === 'ollama');
    
    expect(ollamaProvider).toBeDefined();
    expect(ollamaProvider?.available).toBe(false);
  });

  it('should test provider connections', async () => {
    // Mock failed connection
    (fetch as any).mockRejectedValueOnce(new Error('Connection refused'));

    const result = await llmService.testConnection('ollama');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Provider not available');
  });
});

describe('Agent System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize admin agent orchestrator', () => {
    expect(adminAgentOrchestrator).toBeDefined();
    
    const agentList = adminAgentOrchestrator.getAgentList();
    expect(agentList).toBeInstanceOf(Array);
    expect(agentList.length).toBeGreaterThan(0);
    
    // Should have research and investment agents
    const agentIds = agentList.map(a => a.id);
    expect(agentIds).toContain('meta3-research');
    expect(agentIds).toContain('meta3-investment');
  });

  it('should provide LLM providers through orchestrator', async () => {
    // Mock provider response
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    });

    const providers = await adminAgentOrchestrator.getLLMProviders();
    expect(providers).toBeInstanceOf(Array);
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should configure agent LLM settings', () => {
    const config = {
      preferredModel: 'llama3.2:3b',
      preferredProvider: 'ollama',
      enableLLM: true
    };

    const success = adminAgentOrchestrator.configureAgent('meta3-research', config);
    expect(success).toBe(true);

    const retrievedConfig = adminAgentOrchestrator.getAgentConfiguration('meta3-research');
    expect(retrievedConfig).toMatchObject(config);
  });

  it('should handle agent configuration for non-existent agent', () => {
    const success = adminAgentOrchestrator.configureAgent('non-existent', {
      enableLLM: false
    });
    expect(success).toBe(false);

    const config = adminAgentOrchestrator.getAgentConfiguration('non-existent');
    expect(config).toBeNull();
  });

  it('should get all agent configurations', () => {
    const configs = adminAgentOrchestrator.getAllAgentConfigurations();
    expect(configs).toBeInstanceOf(Array);
    expect(configs.length).toBeGreaterThan(0);
    
    configs.forEach(config => {
      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('enableLLM');
      expect(typeof config.enableLLM).toBe('boolean');
    });
  });
});

describe('Agent LLM Integration', () => {
  let researchAgent: Meta3ResearchAgent;
  let investmentAgent: Meta3InvestmentAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    researchAgent = new Meta3ResearchAgent();
    investmentAgent = new Meta3InvestmentAgent();
  });

  it('should initialize agents with LLM capabilities', () => {
    expect(researchAgent).toBeDefined();
    expect(investmentAgent).toBeDefined();

    const researchConfig = researchAgent.getLLMConfiguration();
    const investmentConfig = investmentAgent.getLLMConfiguration();

    expect(researchConfig.enableLLM).toBe(true);
    expect(investmentConfig.enableLLM).toBe(true);
  });

  it('should configure agent LLM preferences', () => {
    const newConfig = {
      preferredModel: 'mixtral-8x7b-32768',
      preferredProvider: 'groq',
      enableLLM: false
    };

    researchAgent.configureLLM(newConfig);
    const retrievedConfig = researchAgent.getLLMConfiguration();
    
    expect(retrievedConfig).toMatchObject(newConfig);
  });

  it('should handle message processing with LLM fallback', async () => {
    // Disable LLM to test fallback
    researchAgent.configureLLM({ enableLLM: false });

    const context = {
      sessionId: 'test-session',
      userId: 'test-user',
      conversationHistory: [],
      currentAgent: 'meta3-research',
      timestamp: new Date()
    };

    const response = await researchAgent.processMessage('market analysis', context);
    
    expect(response).toBeDefined();
    expect(response.content).toBeTruthy();
    expect(response.agentId).toBe('meta3-research');
    expect(response.metadata).toBeDefined();
  });

  it('should process agent messages through orchestrator', async () => {
    const response = await adminAgentOrchestrator.processMessage(
      'What is the current market size for AI?',
      'test-user',
      'test-session'
    );

    expect(response).toBeDefined();
    expect(response.content).toBeTruthy();
    expect(response.agentId).toBeTruthy();
  });

  it('should route messages to appropriate agents', async () => {
    // Research query
    const researchResponse = await adminAgentOrchestrator.processMessage(
      'market research and competitive analysis',
      'test-user'
    );
    expect(researchResponse.agentId).toBe('competitive-intelligence');

    // Investment query
    const investmentResponse = await adminAgentOrchestrator.processMessage(
      'investment criteria and funding strategy',
      'test-user'
    );
    expect(investmentResponse.agentId).toBe('meta3-financial');
  });
});

describe('LLM Provider Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should test individual LLM providers through orchestrator', async () => {
    // Mock failed connection (expected in test environment)
    (fetch as any).mockRejectedValueOnce(new Error('Connection refused'));

    const result = await adminAgentOrchestrator.testLLMProvider('ollama');
    
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('latency');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.latency).toBe('number');
    
    // In test environment, connection should fail
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('should test agent LLM functionality', async () => {
    const result = await adminAgentOrchestrator.testAgentLLM(
      'meta3-research',
      'Test message for research agent'
    );

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('processingTime');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.processingTime).toBe('number');
    
    // Should succeed with fallback content even if LLM fails
    expect(result.success).toBe(true);
    expect(result.response).toBeTruthy();
  });
});

describe('System Statistics and Health', () => {
  it('should provide system statistics', () => {
    const stats = adminAgentOrchestrator.getSystemStats();
    
    expect(stats).toHaveProperty('totalSessions');
    expect(stats).toHaveProperty('activeSessions');
    expect(stats).toHaveProperty('totalMessages');
    expect(stats).toHaveProperty('agentUsage');
    expect(stats).toHaveProperty('averageResponseTime');
    expect(stats).toHaveProperty('systemHealth');
  });

  it('should perform system diagnostics', async () => {
    const diagnostics = await adminAgentOrchestrator.performSystemDiagnostics();
    
    expect(diagnostics).toHaveProperty('orchestrator');
    expect(diagnostics).toHaveProperty('agents');
    expect(diagnostics).toHaveProperty('llmProviders');
    expect(diagnostics).toHaveProperty('performance');
    
    expect(diagnostics.orchestrator.status).toBe('operational');
    expect(diagnostics.agents).toBeInstanceOf(Array);
    expect(diagnostics.llmProviders).toBeInstanceOf(Array);
  });

  it('should provide deep agent statistics', () => {
    const deepStats = adminAgentOrchestrator.getDeepAgentStats();
    
    expect(deepStats).toHaveProperty('totalAgents');
    expect(deepStats).toHaveProperty('activeAgents');
    expect(deepStats).toHaveProperty('completedTasks');
    expect(deepStats).toHaveProperty('averagePerformance');
    
    expect(typeof deepStats.totalAgents).toBe('number');
    expect(deepStats.totalAgents).toBeGreaterThan(0);
  });
});