/**
 * Enhanced Context Manager - Professional context awareness for virtual agents
 * Provides rich context, memory, and user profile integration for better AI responses
 */

import { chatSessionManager } from './refactored/ChatSessionManager';

export interface EnhancedUserProfile {
  id: string;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  industry?: string;
  interests: string[];
  stage: 'discovery' | 'evaluation' | 'partnership' | 'support';
  previousConversations: ConversationSummary[];
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}

export interface ConversationSummary {
  sessionId: string;
  agentId: string;
  date: Date;
  topics: string[];
  keyInsights: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  duration: number; // in minutes
}

export interface UserPreferences {
  communicationStyle: 'formal' | 'casual' | 'technical';
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  focusAreas: string[];
  timezone?: string;
  language: string;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
  };
}

export interface EnhancedContext {
  userProfile: EnhancedUserProfile;
  currentSession: {
    sessionId: string;
    agentId: string;
    startTime: Date;
    messageCount: number;
    topics: string[];
    currentIntent?: string;
  };
  conversationHistory: {
    recent: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
      agentId: string;
    }>;
    summary: string;
    keyTopics: string[];
  };
  relatedContext: {
    previousSessions: ConversationSummary[];
    relatedTopics: string[];
    suggestedActions: string[];
  };
  businessContext: {
    companyStage?: 'idea' | 'mvp' | 'early' | 'growth' | 'scale';
    fundingStage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'later';
    industry?: string;
    teamSize?: number;
    currentChallenges?: string[];
  };
}

class EnhancedContextManager {
  private userProfiles: Map<string, EnhancedUserProfile> = new Map();
  private conversationSummaries: Map<string, ConversationSummary[]> = new Map();

  /**
   * Get or create enhanced user profile
   */
  async getOrCreateUserProfile(userId: string, initialData?: Partial<EnhancedUserProfile>): Promise<EnhancedUserProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        id: userId,
        interests: [],
        stage: 'discovery',
        previousConversations: [],
        preferences: {
          communicationStyle: 'formal',
          responseLength: 'detailed',
          focusAreas: [],
          language: 'en',
          notificationSettings: {
            email: true,
            inApp: true
          }
        },
        createdAt: new Date(),
        lastActive: new Date(),
        ...initialData
      } as EnhancedUserProfile;
      
      this.userProfiles.set(userId, profile);
      this.saveUserProfile(profile);
    }
    
    return profile;
  }

  /**
   * Update user profile with new information
   */
  async updateUserProfile(userId: string, updates: Partial<EnhancedUserProfile>): Promise<EnhancedUserProfile> {
    const profile = await this.getOrCreateUserProfile(userId);
    const updatedProfile = { ...profile, ...updates, lastActive: new Date() };
    
    this.userProfiles.set(userId, updatedProfile);
    this.saveUserProfile(updatedProfile);
    
    return updatedProfile;
  }

  /**
   * Generate enhanced context for agent interactions
   */
  async generateEnhancedContext(
    userId: string, 
    sessionId: string, 
    agentId: string,
    currentMessage?: string
  ): Promise<EnhancedContext> {
    const userProfile = await this.getOrCreateUserProfile(userId);
    const session = chatSessionManager.getOrCreateSession(userId, sessionId, agentId);
    const conversationHistory = this.getConversationHistory(sessionId, userId);
    const relatedContext = await this.getRelatedContext(userId, agentId);
    
    // Analyze current intent if message provided
    const currentIntent = currentMessage ? this.analyzeIntent(currentMessage) : undefined;
    
    // Update user interests based on conversation
    if (currentMessage) {
      await this.updateUserInterests(userId, currentMessage, agentId);
    }

    return {
      userProfile,
      currentSession: {
        sessionId,
        agentId,
        startTime: session?.startTime || new Date(),
        messageCount: session?.messages?.length || 0,
        topics: session?.context?.keyTopics || [],
        currentIntent
      },
      conversationHistory: {
        recent: conversationHistory.slice(-10).filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp,
          agentId: m.agentId || agentId
        })), // Last 10 messages (exclude system)
        summary: this.generateConversationSummary(conversationHistory),
        keyTopics: this.extractKeyTopics(conversationHistory)
      },
      relatedContext,
      businessContext: this.generateBusinessContext(userProfile, conversationHistory)
    };
  }

  /**
   * Analyze user intent from message
   */
  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Intent patterns
    const intentPatterns = {
      'information_seeking': ['what is', 'how does', 'explain', 'tell me about', 'help me understand'],
      'problem_solving': ['how do i', 'how can i', 'help me', 'i need to', 'struggling with'],
      'decision_making': ['should i', 'which is better', 'recommend', 'advice', 'best approach'],
      'action_planning': ['create', 'build', 'develop', 'implement', 'start', 'launch'],
      'evaluation': ['review', 'analyze', 'assess', 'evaluate', 'feedback', 'opinion'],
      'comparison': ['vs', 'versus', 'compare', 'difference', 'better than'],
      'troubleshooting': ['error', 'problem', 'issue', 'not working', 'broken', 'fix']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        return intent;
      }
    }

    return 'general_inquiry';
  }

  /**
   * Update user interests based on conversation
   */
  private async updateUserInterests(userId: string, message: string, agentId: string): Promise<void> {
    const interests = this.extractInterests(message, agentId);
    const profile = await this.getOrCreateUserProfile(userId);
    
    // Add new interests (avoid duplicates)
    const newInterests = interests.filter(interest => !profile.interests.includes(interest));
    if (newInterests.length > 0) {
      profile.interests.push(...newInterests);
      await this.updateUserProfile(userId, { interests: profile.interests });
    }
  }

  /**
   * Extract interests from message based on agent context
   */
  private extractInterests(message: string, agentId: string): string[] {
    const lowerMessage = message.toLowerCase();
    const interests: string[] = [];

    // Agent-specific interest extraction
    const interestPatterns = {
      'venture-launch': ['startup', 'mvp', 'product development', 'business plan', 'market validation'],
      'meta3-investment': ['funding', 'investors', 'valuation', 'pitch deck', 'due diligence'],
      'meta3-research': ['market research', 'competitive analysis', 'industry trends', 'market size'],
      'meta3-marketing': ['marketing strategy', 'brand building', 'customer acquisition', 'growth hacking'],
      'meta3-financial': ['financial modeling', 'unit economics', 'burn rate', 'runway', 'metrics']
    };

    const patterns = interestPatterns[agentId as keyof typeof interestPatterns] || [];
    patterns.forEach(pattern => {
      if (lowerMessage.includes(pattern)) {
        interests.push(pattern);
      }
    });

    // General technology interests
    const techPatterns = ['ai', 'blockchain', 'fintech', 'saas', 'mobile app', 'web app', 'api'];
    techPatterns.forEach(tech => {
      if (lowerMessage.includes(tech)) {
        interests.push(tech);
      }
    });

    return interests;
  }

  /**
   * Get conversation history for context
   */
  private getConversationHistory(sessionId: string, userId: string) {
    const session = chatSessionManager.getOrCreateSession(userId, sessionId);
    return session?.messages || [];
  }

  /**
   * Get related context from previous conversations
   */
  private async getRelatedContext(userId: string, agentId: string) {
    const userProfile = await this.getOrCreateUserProfile(userId);
    const previousSessions = userProfile.previousConversations
      .filter(conv => conv.agentId === agentId)
      .slice(-5); // Last 5 sessions with this agent

    const relatedTopics = [...new Set(
      previousSessions.flatMap(session => session.topics)
    )];

    const suggestedActions = this.generateSuggestedActions(userProfile, agentId);

    return {
      previousSessions,
      relatedTopics,
      suggestedActions
    };
  }

  /**
   * Generate conversation summary
   */
  private generateConversationSummary(messages: unknown[]): string {
    if (messages.length === 0) return 'No previous conversation';
    
    const topics = this.extractKeyTopics(messages);
    const userQuestions = messages.filter((m: any) => m.role === 'user').length;
    
    return `Discussed ${topics.join(', ')} over ${userQuestions} questions`;
  }

  /**
   * Extract key topics from conversation
   */
  private extractKeyTopics(messages: unknown[]): string[] {
    const topics: string[] = [];
    const topicPatterns = [
      'startup', 'funding', 'investment', 'marketing', 'product', 'team', 'strategy',
      'market', 'customer', 'revenue', 'growth', 'technology', 'competition'
    ];

    messages.forEach((message: any) => {
      if (message.content) {
        const content = message.content.toLowerCase();
        topicPatterns.forEach(topic => {
          if (content.includes(topic) && !topics.includes(topic)) {
            topics.push(topic);
          }
        });
      }
    });

    return topics.slice(0, 5); // Top 5 topics
  }

  /**
   * Generate business context
   */
  private generateBusinessContext(profile: EnhancedUserProfile, messages: unknown[]) {
    const context: unknown = {};
    
    // Infer company stage from conversation
    const stageKeywords = {
      'idea': ['idea', 'concept', 'thinking about'],
      'mvp': ['mvp', 'prototype', 'minimum viable'],
      'early': ['launched', 'early customers', 'traction'],
      'growth': ['scaling', 'growth', 'expanding'],
      'scale': ['enterprise', 'large scale', 'international']
    };

    const fundingKeywords = {
      'pre-seed': ['pre-seed', 'friends and family'],
      'seed': ['seed round', 'seed funding'],
      'series-a': ['series a', 'series-a'],
      'series-b': ['series b', 'series-b'],
      'later': ['series c', 'growth stage']
    };

    // Analyze messages for context clues
    const allContent = messages.map((m: any) => m.content).join(' ').toLowerCase();
    
    for (const [stage, keywords] of Object.entries(stageKeywords)) {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        (context as any).companyStage = stage;
        break;
      }
    }

    for (const [stage, keywords] of Object.entries(fundingKeywords)) {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        (context as any).fundingStage = stage;
        break;
      }
    }

    (context as any).industry = (profile as any).industry;
    
    return context;
  }

  /**
   * Generate suggested actions based on context
   */
  private generateSuggestedActions(profile: EnhancedUserProfile, agentId: string): string[] {
    const actions: string[] = [];
    
    const agentActions = {
      'venture-launch': [
        'Create business plan template',
        'Market validation checklist',
        'MVP development roadmap',
        'Competitive analysis framework'
      ],
      'meta3-investment': [
        'Pitch deck review',
        'Financial projections template',
        'Investor research list',
        'Due diligence preparation'
      ],
      'meta3-research': [
        'Market sizing analysis',
        'Competitor landscape mapping',
        'Industry trend report',
        'Customer survey design'
      ]
    };

    return agentActions[agentId as keyof typeof agentActions] || [];
  }

  /**
   * Save user profile (in production, this would go to database)
   */
  private saveUserProfile(profile: EnhancedUserProfile): void {
    try {
      localStorage.setItem(`user_profile_${profile.id}`, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  /**
   * Load user profile from storage
   */
  private loadUserProfile(userId: string): EnhancedUserProfile | null {
    try {
      const stored = localStorage.getItem(`user_profile_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load user profile:', error);
      return null;
    }
  }
}

export const enhancedContextManager = new EnhancedContextManager();
export default enhancedContextManager;
