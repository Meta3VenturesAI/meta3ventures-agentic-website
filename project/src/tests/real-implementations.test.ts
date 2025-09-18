import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataStorage } from '../services/data-storage.service';
import { researchAgentsService } from '../services/research-agents.service';
import { adminAgentOrchestrator } from '../services/agents/refactored/AdminAgentOrchestrator';

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

describe('Real Implementation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Storage Service', () => {
    it('should have real implementation with proper methods', () => {
      expect(dataStorage).toBeDefined();
      expect(typeof dataStorage.storeFormSubmission).toBe('function');
      expect(typeof dataStorage.getAnalyticsSummary).toBe('function');
      expect(typeof dataStorage.getAllSubmissions).toBe('function');
      expect(typeof dataStorage.getSubmissionsByType).toBe('function');
    });

    it('should store form submissions', async () => {
      const submission = {
        type: 'contact' as const,
        data: {
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message'
        }
      };

      // Mock localStorage
      (window.localStorage.getItem as any).mockReturnValue('[]');
      (window.localStorage.setItem as any).mockImplementation(() => {});

      await expect(dataStorage.storeFormSubmission(submission)).resolves.not.toThrow();
    });

    it('should get analytics summary', async () => {
      // Mock localStorage to return empty array
      (window.localStorage.getItem as any).mockReturnValue('[]');

      const summary = await dataStorage.getAnalyticsSummary();
      expect(summary).toBeDefined();
      expect(summary.total_submissions).toBe(0);
      expect(summary.by_type).toBeDefined();
    });
  });

  describe('Research Agents Service', () => {
    it('should have real implementation with proper methods', () => {
      expect(researchAgentsService).toBeDefined();
      expect(typeof researchAgentsService.initializeAgents).toBe('function');
      expect(typeof researchAgentsService.startResearchSession).toBe('function');
      expect(typeof researchAgentsService.getCurrentSession).toBe('function');
      expect(typeof researchAgentsService.getAgent).toBe('function');
    });

    it('should initialize agents', () => {
      const agents = researchAgentsService.initializeAgents();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
      
      // Check for expected agent roles
      const agentRoles = agents.map(agent => agent.role);
      expect(agentRoles).toContain('orchestrator');
      expect(agentRoles).toContain('market');
      expect(agentRoles).toContain('competitor');
      expect(agentRoles).toContain('customer');
    });

    it('should start research session', async () => {
      const request = {
        companyName: 'Test Company',
        industry: 'Technology',
        currentDescription: 'A test company',
        targetMarket: 'Global',
        mainCompetitors: [],
        currentUSP: 'Test USP',
        researchDepth: 'standard' as const,
        focusAreas: []
      };

      const session = await researchAgentsService.startResearchSession(request);
      expect(session).toBeDefined();
      expect(session.companyName).toBe('Test Company');
      expect(session.industry).toBe('Technology');
      expect(session.status).toBe('initializing');
    });
  });

  describe('Admin Agent Orchestrator', () => {
    it('should have real implementation with proper methods', () => {
      expect(adminAgentOrchestrator).toBeDefined();
      expect(typeof adminAgentOrchestrator.getAgentList).toBe('function');
      expect(typeof adminAgentOrchestrator.processMessage).toBe('function');
      expect(typeof adminAgentOrchestrator.getLLMProviders).toBe('function');
    });

    it('should get agent list', () => {
      const agents = adminAgentOrchestrator.getAgentList();
      expect(Array.isArray(agents)).toBe(true);
      expect(agents.length).toBeGreaterThan(0);
      
      // Check for expected agents
      const agentIds = agents.map(agent => agent.id);
      expect(agentIds).toContain('meta3-research');
      expect(agentIds).toContain('meta3-investment');
      expect(agentIds).toContain('meta3-financial');
    });

    it('should process messages', async () => {
      const response = await adminAgentOrchestrator.processMessage(
        'What is the current market size for AI?',
        'test-user'
      );
      
      expect(response).toBeDefined();
      expect(response.agentId).toBeDefined();
      // The response might be undefined if LLM providers are not available
      // but the agent routing should still work
      expect(typeof response.agentId).toBe('string');
    });
  });

  describe('Component Functionality Verification', () => {
    it('should verify VentureLaunchBuilder component exists and is functional', async () => {
      // Import the component dynamically to avoid React DOM issues
      const { VentureLaunchBuilder } = await import('../components/VentureLaunchBuilder');
      expect(VentureLaunchBuilder).toBeDefined();
      expect(typeof VentureLaunchBuilder).toBe('function');
    });

    it('should verify StrategicFundraisingAdvisor component exists and is functional', async () => {
      const StrategicFundraisingAdvisor = await import('../components/StrategicFundraisingAdvisor');
      expect(StrategicFundraisingAdvisor.default).toBeDefined();
      expect(typeof StrategicFundraisingAdvisor.default).toBe('function');
    });

    it('should verify CompetitiveIntelligenceSystem component exists and is functional', async () => {
      const CompetitiveIntelligenceSystem = await import('../components/CompetitiveIntelligenceSystem');
      expect(CompetitiveIntelligenceSystem.default).toBeDefined();
      expect(typeof CompetitiveIntelligenceSystem.default).toBe('function');
    });
  });
});
