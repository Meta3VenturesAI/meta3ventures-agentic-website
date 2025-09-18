/**
 * Admin Agent Orchestrator - Simplified for Current Implementation
 * Manages routing and coordination between specialized agents
 */

import { AgentMessage, AgentContext, SessionInfo, OrchestratorStats, ConversationState } from './types';
import { 
  Meta3ResearchAgent,
  Meta3InvestmentAgent,
  VentureLaunchAgent,
  CompetitiveIntelligenceAgent,
  GeneralConversationAgent,
  Meta3SupportAgent,
  Meta3MarketingAgent,
  Meta3FinancialAgent,
  Meta3LegalAgent,
  Meta3LocalAgent
} from './agents';
import { Meta3PrimaryAgent } from './agents/Meta3PrimaryAgent';
import { BaseAgent } from './BaseAgent';
import { chatSessionManager, ChatSession } from './ChatSessionManager';
import { agentToolsSystem } from './AgentToolsSystem';
import { llmService } from './LLMService';
import { providerDetectionService } from './ProviderDetectionService';

export class AdminAgentOrchestrator {
  private sessions: Map<string, SessionInfo> = new Map();
  private agents: Map<string, BaseAgent> = new Map();
  private stats!: OrchestratorStats;
  private conversationState: Map<string, ConversationState> = new Map();

  constructor() {
    this.initializeAgents();
    this.initializeStats();
    console.log('🔧 Admin Agent Orchestrator initialized');
  }

  private initializeAgents(): void {
    // Initialize core agents
    const researchAgent = new Meta3ResearchAgent();
    const investmentAgent = new Meta3InvestmentAgent();
    
    // Initialize virtual agent specialists
    const ventureLaunchAgent = new VentureLaunchAgent();
    const competitiveIntelligenceAgent = new CompetitiveIntelligenceAgent();
    const generalConversationAgent = new GeneralConversationAgent();
    
    // Initialize specialized Meta3 agents
    const primaryAgent = new Meta3PrimaryAgent();
    const supportAgent = new Meta3SupportAgent();
    const marketingAgent = new Meta3MarketingAgent();
    const financialAgent = new Meta3FinancialAgent();
    const legalAgent = new Meta3LegalAgent();
    const localAgent = new Meta3LocalAgent();
    
    // Register all agents
    this.agents.set(researchAgent.getCapabilities().id, researchAgent);
    this.agents.set(investmentAgent.getCapabilities().id, investmentAgent);
    this.agents.set(ventureLaunchAgent.getCapabilities().id, ventureLaunchAgent);
    this.agents.set(competitiveIntelligenceAgent.getCapabilities().id, competitiveIntelligenceAgent);
    this.agents.set(generalConversationAgent.getCapabilities().id, generalConversationAgent);
    this.agents.set(primaryAgent.getCapabilities().id, primaryAgent);
    this.agents.set(supportAgent.getCapabilities().id, supportAgent);
    this.agents.set(marketingAgent.getCapabilities().id, marketingAgent);
    this.agents.set(financialAgent.getCapabilities().id, financialAgent);
    this.agents.set(legalAgent.getCapabilities().id, legalAgent);
    this.agents.set(localAgent.getCapabilities().id, localAgent);
    
    console.log(`Loaded ${this.agents.size} specialized agents`);
  }

  private initializeStats(): void {
    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      totalMessages: 0,
      agentUsage: {},
      averageResponseTime: 0,
      systemHealth: 'healthy'
    };
  }

  async processMessage(
    message: string, 
    context: AgentContext | string = 'admin-user', 
    sessionId?: string
  ): Promise<AgentMessage> {
    // Handle backward compatibility - if context is a string, it's userId
    const agentContext: AgentContext = typeof context === 'string' ? {
      sessionId: sessionId || this.generateSessionId(),
      userId: context,
      timestamp: new Date(),
      metadata: {}
    } : context;

    const actualSessionId = agentContext.sessionId;

    // Use ChatSessionManager for persistent sessions
    const chatSession = chatSessionManager.getOrCreateSession(
      agentContext.userId || 'anonymous',
      actualSessionId
    );

    // Add user message to chat session
    chatSessionManager.addMessage(chatSession.id, {
      id: `msg-${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date()
    });

    // Get session context for enhanced processing
    const sessionContext = chatSessionManager.getSessionContext(chatSession.id);
    
    // Get or create internal session for compatibility
    let session = this.sessions.get(actualSessionId);
    if (!session) {
      session = this.createSession(actualSessionId, agentContext.userId || 'anonymous');
      this.sessions.set(actualSessionId, session);
    }

    // Get or create conversation state
    let conversationState = this.conversationState.get(actualSessionId);
    if (!conversationState) {
      conversationState = this.createConversationState(actualSessionId, agentContext.userId || 'anonymous');
      this.conversationState.set(actualSessionId, conversationState);
    }

    // Check for redundant queries
    const messageKey = this.normalizeMessage(message);
    const repetitionCount = conversationState.repeatedQueries.get(messageKey) || 0;
    
    // If it's a repeated query, provide a shortened response
    const isRepeatedQuery = repetitionCount > 0;
    conversationState.repeatedQueries.set(messageKey, repetitionCount + 1);

    // Find best agent for this message
    const selectedAgent = this.selectAgent(message, conversationState);
    
    // Create enhanced context with conversation history, session context, and tools
    const enhancedContext: AgentContext = {
      sessionId: actualSessionId,
      userId: agentContext.userId,
      conversationHistory: sessionContext.recentMessages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        agentId: msg.agentId || 'system'
      })),
      currentAgent: selectedAgent.getCapabilities().id,
      timestamp: new Date(),
      metadata: {
        isRepeatedQuery,
        repetitionCount,
        conversationStage: conversationState.conversationStage,
        preferredResponseStyle: conversationState.preferredResponseStyle,
        userProfile: sessionContext.userProfile,
        keyTopics: sessionContext.keyTopics,
        conversationSummary: sessionContext.conversationSummary,
        availableTools: agentToolsSystem.getToolsForAgent(selectedAgent.getCapabilities().id),
        ...agentContext.metadata
      }
    };

    // Process message with enhanced context
    const startTime = Date.now();
    const response = await selectedAgent.processMessage(message, enhancedContext);
    const processingTime = Date.now() - startTime;

    // Update conversation state
    this.updateConversationState(conversationState, message, response, selectedAgent.getCapabilities().id);

    // Add assistant response to chat session
    chatSessionManager.addMessage(chatSession.id, {
      id: `msg-${Date.now()}-response`,
      content: response.content,
      role: 'assistant',
      timestamp: new Date(),
      agentId: selectedAgent.getCapabilities().id,
      metadata: {
        processingTime,
        toolsUsed: response.metadata?.toolsUsed || []
      }
    });

    // Update stats
    this.updateStats(selectedAgent.getCapabilities().id, processingTime);
    
    // Update session
    session.lastActivity = new Date();
    session.messageCount++;
    session.currentAgent = selectedAgent.getCapabilities().id;

    // Store message in conversation history
    if (!session.context.conversationHistory) {
      session.context.conversationHistory = [];
    }
    session.context.conversationHistory.push({
      id: this.generateSessionId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      agentId: 'user'
    });
    session.context.conversationHistory.push(response);

    return response;
  }

  private selectAgent(message: string, conversationState?: ConversationState): BaseAgent {
    let bestAgent: BaseAgent | null = null;
    const highestScore = -1;

    // Log agent evaluation for debugging
    console.log('🔍 Evaluating agents for message:', message.substring(0, 50) + '...');

    // Create a scoring system for better agent selection
    const candidateAgents = Array.from(this.agents.values()).map(agent => {
      const canHandle = agent.canHandle(message);
      const capabilities = agent.getCapabilities();
      let score = 0;

      if (canHandle) {
        // Base score from priority
        score = capabilities.priority;

        // Bonus for specialty matches
        const messageKeywords = message.toLowerCase().split(/\s+/);
        const specialtyMatches = capabilities.specialties.filter(specialty =>
          messageKeywords.some(word =>
            specialty.toLowerCase().includes(word) ||
            word.length > 3 && specialty.toLowerCase().includes(word)
          )
        ).length;

        score += specialtyMatches * 10; // 10 point bonus per specialty match

        // Contextual bonuses based on conversation history
        if (conversationState?.lastAgentUsed === capabilities.id) {
          score += 15; // Continuity bonus
        }

        // Check for explicit agent mentions
        if (message.toLowerCase().includes(capabilities.name.toLowerCase()) ||
            capabilities.specialties.some(spec =>
              message.toLowerCase().includes(spec.toLowerCase())
            )) {
          score += 25; // Explicit mention bonus
        }

        // Specific trigger word bonuses
        const triggerWords = {
          'venture-launch': ['startup', 'business plan', 'mvp', 'venture', 'founder'],
          'meta3-primary': ['meta3', 'about', 'company', 'ai', 'platform'],
          'general-conversation': ['hello', 'hi', 'help', 'general']
        };

        const agentTriggers = triggerWords[capabilities.id as keyof typeof triggerWords] || [];
        const triggerMatches = agentTriggers.filter(trigger =>
          message.toLowerCase().includes(trigger)
        ).length;

        score += triggerMatches * 20; // 20 point bonus per trigger match
      }

      console.log(`  ${capabilities.name}: canHandle=${canHandle}, baseScore=${capabilities.priority}, finalScore=${score}`);
      return { agent, score, canHandle };
    });

    // Find the best agent
    const bestCandidate = candidateAgents
      .filter(candidate => candidate.canHandle)
      .sort((a, b) => b.score - a.score)[0];

    if (bestCandidate) {
      bestAgent = bestCandidate.agent;
      console.log('✅ Selected agent:', bestAgent.getCapabilities().name, 'with score:', bestCandidate.score);
    } else {
      // Fallback to primary agent
      const primaryAgent = this.agents.get('meta3-primary');
      bestAgent = primaryAgent || Array.from(this.agents.values())[0];
      console.log('⚠️ No agent matched, using primary fallback:', bestAgent?.getCapabilities().name);
    }

    return bestAgent;
  }

  private createSession(sessionId: string, userId: string): SessionInfo {
    const now = new Date();
    return {
      sessionId,
      userId,
      currentAgent: 'meta3-primary',
      startTime: now,
      lastActivity: now,
      messageCount: 0,
      context: {
        sessionId,
        userId,
        conversationHistory: [],
        currentAgent: 'meta3-primary',
        timestamp: now
      },
      isActive: true
    };
  }

  private updateStats(agentId: string, processingTime: number): void {
    this.stats.totalMessages++;
    this.stats.agentUsage[agentId] = (this.stats.agentUsage[agentId] || 0) + 1;
    
    // Update average response time
    const totalTime = this.stats.averageResponseTime * (this.stats.totalMessages - 1);
    this.stats.averageResponseTime = (totalTime + processingTime) / this.stats.totalMessages;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for admin dashboard
  getSystemStats(): OrchestratorStats {
    this.stats.activeSessions = Array.from(this.sessions.values())
      .filter(s => s.isActive && Date.now() - s.lastActivity.getTime() < 30 * 60 * 1000).length;
    
    return { ...this.stats };
  }

  getAgentList(): Array<{ id: string; name: string; specialties: string[] }> {
    return Array.from(this.agents.values()).map(agent => {
      const caps = agent.getCapabilities();
      return {
        id: caps.id,
        name: caps.name,
        specialties: caps.specialties
      };
    });
  }

  async performSystemDiagnostics(): Promise<{
    orchestrator: { status: string; message: string };
    agents: Array<{ id: string; status: string; health: string }>;
    llmProviders: Array<{ id: string; status: string; available: boolean }>;
    performance: { cpu: number; memory: number; responseTime: number };
  }> {
    return {
      orchestrator: {
        status: 'operational',
        message: `${this.agents.size} agents loaded and ready`
      },
      agents: Array.from(this.agents.values()).map(agent => {
        const caps = agent.getCapabilities();
        return {
          id: caps.id,
          status: 'ready',
          health: 'good'
        };
      }),
      llmProviders: [
        { id: 'internal', status: 'ready', available: true }
      ],
      performance: {
        cpu: Math.random() * 30 + 20, // Mock CPU usage 20-50%
        memory: Math.random() * 40 + 30, // Mock memory usage 30-70%
        responseTime: this.stats.averageResponseTime
      }
    };
  }

  async getLLMProviders(): Promise<Array<{
    id: string;
    name: string;
    available: boolean;
    models: string[];
    latency?: number;
  }>> {
    try {
      // Use the enhanced provider detection service
      const detectedProviders = await providerDetectionService.detectAvailableProviders();
      
      // Convert to the expected format
      return detectedProviders.map(provider => ({
        id: provider.id,
        name: provider.name,
        available: provider.available,
        models: provider.id === 'fallback' ? ['fallback-agent'] : this.getModelsForProvider(provider.id),
        latency: provider.latency
      }));
    } catch (error) {
      console.error('Failed to get LLM providers:', error);
      
      // Return fallback provider as minimum
      return [
        {
          id: 'fallback',
          name: 'Fallback Agent',
          available: true,
          models: ['fallback-agent'],
          latency: 50
        }
      ];
    }
  }

  private getModelsForProvider(providerId: string): string[] {
    const modelMap: Record<string, string[]> = {
      'ollama': ['llama3.2:3b', 'llama3.2:1b', 'mistral:7b'],
      'vllm': ['mistral-7b-instruct', 'llama2-7b-chat'],
      'localai': ['gpt-3.5-turbo', 'llama2-chat'],
      'groq': ['llama3-8b-8192', 'mixtral-8x7b-32768'],
      'openai': ['gpt-4', 'gpt-3.5-turbo'],
      'anthropic': ['claude-3-sonnet', 'claude-3-haiku'],
      'deepseek': ['deepseek-chat', 'deepseek-coder'],
      'fallback': ['fallback-agent']
    };
    return modelMap[providerId] || ['default-model'];
  }

  async testLLMProvider(providerId: string): Promise<{
    success: boolean;
    error?: string;
    latency: number;
  }> {
    try {
      // Use the real LLM service to test the provider
      const result = await llmService.testConnection(providerId);
      
      return {
        success: result.success,
        error: result.error,
        latency: result.latency || 0
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any).message,
        latency: 0
      };
    }
  }

  getDeepAgentStats(): {
    totalAgents: number;
    activeAgents: number;
    completedTasks: number;
    averagePerformance: number;
  } {
    return {
      totalAgents: this.agents.size,
      activeAgents: this.agents.size,
      completedTasks: this.stats.totalMessages,
      averagePerformance: Math.min(this.stats.averageResponseTime / 1000, 5) // Convert to seconds, cap at 5
    };
  }

  /**
   * Configure LLM settings for a specific agent
   */
  configureAgent(agentId: string, config: {
    preferredModel?: string;
    preferredProvider?: string;
    enableLLM?: boolean;
  }): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) {
      console.error(`Agent ${agentId} not found`);
      return false;
    }

    try {
      agent.configureLLM(config);
      console.log(`✅ Agent ${agentId} configured:`, config);
      return true;
    } catch (error) {
      console.error(`Failed to configure agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Get LLM configuration for a specific agent
   */
  getAgentConfiguration(agentId: string): {
    preferredModel?: string;
    preferredProvider?: string;
    enableLLM: boolean;
  } | null {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return null;
    }

    return agent.getLLMConfiguration();
  }

  /**
   * Get all agent configurations
   */
  getAllAgentConfigurations(): Array<{
    id: string;
    name: string;
    preferredModel?: string;
    preferredProvider?: string;
    enableLLM: boolean;
  }> {
    const configs = [];
    
    for (const [id, agent] of this.agents.entries()) {
      const config = agent.getLLMConfiguration();
      const capabilities = agent.getCapabilities();
      
      configs.push({
        id,
        name: capabilities.name,
        ...config
      });
    }
    
    return configs;
  }

  /**
   * Test LLM functionality for a specific agent
   */
  async testAgentLLM(agentId: string, testMessage: string = "Hello, this is a test message."): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    processingTime: number;
  }> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        success: false,
        error: `Agent ${agentId} not found`,
        processingTime: 0
      };
    }

    const startTime = Date.now();
    
    try {
      // Create a test context
      const context: AgentContext = {
        sessionId: 'test-session',
        userId: 'test-user',
        conversationHistory: [],
        currentAgent: agentId,
        timestamp: new Date()
      };

      // Test the agent with a message
      const response = await agent.processMessage(testMessage, context);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        response: response.content,
        processingTime
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any).message,
        processingTime: Date.now() - startTime
      };
    }
  }

  // Conversation State Management Methods
  private createConversationState(sessionId: string, userId: string): ConversationState {
    return {
      sessionId,
      userId,
      topicsCovered: [],
      conversationStage: 'greeting',
      preferredResponseStyle: 'brief',
      repeatedQueries: new Map(),
    };
  }

  private normalizeMessage(message: string): string {
    // Normalize message for repetition detection
    return message.toLowerCase().trim().replace(/[?.!,]/g, '');
  }

  private updateConversationState(
    state: ConversationState,
    message: string,
    response: AgentMessage,
    agentId: string
  ): void {
    const lowerMessage = message.toLowerCase();

    // Update topics covered
    if (lowerMessage.includes('about')) {
      if (!state.topicsCovered.includes('about')) {
        state.topicsCovered.push('about');
      }
      state.lastAboutQuery = new Date();
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      state.lastGreeting = new Date();
    }

    // Update conversation stage
    if (lowerMessage.includes('investment') || lowerMessage.includes('funding')) {
      state.conversationStage = 'specialized';
    } else if (lowerMessage.includes('apply') || lowerMessage.includes('contact')) {
      state.conversationStage = 'action';
    } else if (state.topicsCovered.length > 0) {
      state.conversationStage = 'information';
    }

    // Track agent usage
    state.lastAgentUsed = agentId;

    // Adjust response style based on user behavior
    if (response.content && response.content.length > 300) {
      // If user engages with long responses, they might prefer detailed
      state.preferredResponseStyle = 'detailed';
    }
  }
}

// Create singleton instance
export const adminAgentOrchestrator = new AdminAgentOrchestrator();