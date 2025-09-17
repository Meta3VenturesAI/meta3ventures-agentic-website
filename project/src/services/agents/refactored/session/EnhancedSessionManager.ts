/**
 * Enhanced Session Manager
 * 
 * Advanced session management with user profiles, conversation history,
 * and persistent storage for improved agent interactions.
 */

import { sessionManager } from '../../external/session/sessionManager';
import { RAGService } from '../rag/RAGService';

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  industry?: string;
  role?: string;
  interests?: string[];
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
    dataSharing?: boolean;
  };
  metadata?: {
    createdAt: Date;
    lastActive: Date;
    totalSessions: number;
    totalMessages: number;
  };
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  currentTopic?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      toolUsed?: string;
      confidence?: number;
      processingTime?: number;
    };
  }>;
  userIntent?: string;
  suggestedActions?: string[];
  knowledgeBase?: {
    relevantDocuments: string[];
    searchHistory: string[];
  };
}

export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  duration: number;
  messageCount: number;
  toolUsage: { [toolId: string]: number };
  topics: string[];
  satisfaction?: number;
  createdAt: Date;
  endedAt: Date;
}

export class EnhancedSessionManager {
  private static instance: EnhancedSessionManager;
  private ragService: RAGService;
  private userProfiles: Map<string, UserProfile> = new Map();
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private sessionAnalytics: Map<string, SessionAnalytics> = new Map();

  constructor() {
    this.ragService = RAGService.getInstance();
  }

  static getInstance(): EnhancedSessionManager {
    if (!EnhancedSessionManager.instance) {
      EnhancedSessionManager.instance = new EnhancedSessionManager();
    }
    return EnhancedSessionManager.instance;
  }

  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const userId = profileData.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const profile: UserProfile = {
      id: userId,
      name: profileData.name,
      email: profileData.email,
      company: profileData.company,
      industry: profileData.industry,
      role: profileData.role,
      interests: profileData.interests || [],
      preferences: {
        language: 'en',
        timezone: 'UTC',
        notifications: true,
        dataSharing: false,
        ...profileData.preferences
      },
      metadata: {
        createdAt: new Date(),
        lastActive: new Date(),
        totalSessions: 0,
        totalMessages: 0
      }
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      metadata: {
        ...profile.metadata!,
        lastActive: new Date()
      }
    };

    this.userProfiles.set(userId, updatedProfile);
    return updatedProfile;
  }

  async createConversationContext(sessionId: string, userId: string): Promise<ConversationContext> {
    const context: ConversationContext = {
      sessionId,
      userId,
      conversationHistory: [],
      knowledgeBase: {
        relevantDocuments: [],
        searchHistory: []
      }
    };

    this.conversationContexts.set(sessionId, context);
    return context;
  }

  async getConversationContext(sessionId: string): Promise<ConversationContext | null> {
    return this.conversationContexts.get(sessionId) || null;
  }

  async addMessage(
    sessionId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    metadata?: unknown
  ): Promise<void> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return;

    context.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      metadata
    });

    // Update user profile message count
    const profile = this.userProfiles.get(context.userId);
    if (profile && profile.metadata) {
      profile.metadata.totalMessages++;
      profile.metadata.lastActive = new Date();
    }
  }

  async updateConversationContext(
    sessionId: string, 
    updates: Partial<ConversationContext>
  ): Promise<void> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return;

    const updatedContext: ConversationContext = {
      ...context,
      ...updates
    };

    this.conversationContexts.set(sessionId, updatedContext);
  }

  async searchKnowledgeForContext(sessionId: string, query: string): Promise<any> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return null;

    // Search knowledge base
    const searchResult = await this.ragService.search({
      query,
      topK: 3,
      includeMetadata: true
    });

    if (searchResult.success && searchResult.data) {
      // Update context with relevant documents
      const documentIds = searchResult.data.results.map(r => r.document.id);
      context.knowledgeBase!.relevantDocuments = [
        ...new Set([...context.knowledgeBase!.relevantDocuments, ...documentIds])
      ];
      context.knowledgeBase!.searchHistory.push(query);
    }

    return searchResult;
  }

  async getConversationSummary(sessionId: string): Promise<{
    messageCount: number;
    duration: number;
    topics: string[];
    keyInsights: string[];
  }> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return { messageCount: 0, duration: 0, topics: [], keyInsights: [] };

    const messages = context.conversationHistory;
    const messageCount = messages.length;
    
    const duration = messages.length > 0 
      ? messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime()
      : 0;

    // Extract topics from conversation
    const topics = this.extractTopics(messages);
    
    // Generate key insights
    const keyInsights = this.generateKeyInsights(messages, context);

    return {
      messageCount,
      duration,
      topics,
      keyInsights
    };
  }

  private extractTopics(messages: ConversationContext['conversationHistory']): string[] {
    const topics = new Set<string>();
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Simple topic extraction based on keywords
      if (content.includes('funding') || content.includes('investment')) {
        topics.add('Funding & Investment');
      }
      if (content.includes('market') || content.includes('analysis')) {
        topics.add('Market Analysis');
      }
      if (content.includes('valuation') || content.includes('valuation')) {
        topics.add('Valuation');
      }
      if (content.includes('business plan') || content.includes('strategy')) {
        topics.add('Business Planning');
      }
      if (content.includes('pitch') || content.includes('presentation')) {
        topics.add('Pitch Deck');
      }
      if (content.includes('metrics') || content.includes('kpi')) {
        topics.add('Metrics & KPIs');
      }
    });

    return Array.from(topics);
  }

  private generateKeyInsights(
    messages: ConversationContext['conversationHistory'], 
    context: ConversationContext
  ): string[] {
    const insights: string[] = [];
    
    // Analyze user intent
    if (context.userIntent) {
      insights.push(`User intent: ${context.userIntent}`);
    }

    // Analyze tool usage
    const toolUsage = new Map<string, number>();
    messages.forEach(message => {
      if (message.metadata?.toolUsed) {
        toolUsage.set(message.metadata.toolUsed, (toolUsage.get(message.metadata.toolUsed) || 0) + 1);
      }
    });

    if (toolUsage.size > 0) {
      const mostUsedTool = Array.from(toolUsage.entries()).sort((a, b) => b[1] - a[1])[0];
      insights.push(`Most used tool: ${mostUsedTool[0]} (${mostUsedTool[1]} times)`);
    }

    // Analyze conversation length
    if (messages.length > 10) {
      insights.push('Extended conversation - user engaged deeply');
    }

    // Analyze knowledge base usage
    if (context.knowledgeBase!.relevantDocuments.length > 0) {
      insights.push(`Referenced ${context.knowledgeBase!.relevantDocuments.length} knowledge documents`);
    }

    return insights;
  }

  async endSession(sessionId: string): Promise<SessionAnalytics | null> {
    const context = this.conversationContexts.get(sessionId);
    if (!context) return null;

    const startTime = context.conversationHistory[0]?.timestamp || new Date();
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // Calculate tool usage
    const toolUsage: { [toolId: string]: number } = {};
    context.conversationHistory.forEach(message => {
      if (message.metadata?.toolUsed) {
        toolUsage[message.metadata.toolUsed] = (toolUsage[message.metadata.toolUsed] || 0) + 1;
      }
    });

    const analytics: SessionAnalytics = {
      sessionId,
      userId: context.userId,
      duration,
      messageCount: context.conversationHistory.length,
      toolUsage,
      topics: this.extractTopics(context.conversationHistory),
      createdAt: startTime,
      endedAt: endTime
    };

    this.sessionAnalytics.set(sessionId, analytics);

    // Update user profile
    const profile = this.userProfiles.get(context.userId);
    if (profile && profile.metadata) {
      profile.metadata.totalSessions++;
    }

    // Clean up context
    this.conversationContexts.delete(sessionId);

    return analytics;
  }

  async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
    return this.sessionAnalytics.get(sessionId) || null;
  }

  async getUserAnalytics(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageSessionDuration: number;
    mostUsedTools: { toolId: string; count: number }[];
    commonTopics: string[];
  }> {
    const userSessions = Array.from(this.sessionAnalytics.values())
      .filter(session => session.userId === userId);

    const totalSessions = userSessions.length;
    const totalMessages = userSessions.reduce((sum, session) => sum + session.messageCount, 0);
    const averageSessionDuration = totalSessions > 0 
      ? userSessions.reduce((sum, session) => sum + session.duration, 0) / totalSessions
      : 0;

    // Calculate most used tools
    const toolUsage = new Map<string, number>();
    userSessions.forEach(session => {
      Object.entries(session.toolUsage).forEach(([toolId, count]) => {
        toolUsage.set(toolId, (toolUsage.get(toolId) || 0) + count);
      });
    });

    const mostUsedTools = Array.from(toolUsage.entries())
      .map(([toolId, count]) => ({ toolId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate common topics
    const topicCount = new Map<string, number>();
    userSessions.forEach(session => {
      session.topics.forEach(topic => {
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      });
    });

    const commonTopics = Array.from(topicCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic)
      .slice(0, 5);

    return {
      totalSessions,
      totalMessages,
      averageSessionDuration,
      mostUsedTools,
      commonTopics
    };
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    return Array.from(this.userProfiles.values());
  }

  async getAllSessionAnalytics(): Promise<SessionAnalytics[]> {
    return Array.from(this.sessionAnalytics.values());
  }
}
