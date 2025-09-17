/**
 * Chat Session Manager - Persistent chat sessions with context and memory
 */

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  agentId?: string;
  metadata?: unknown;
}

export interface ChatSession {
  id: string;
  userId: string;
  agentId?: string; // Primary agent for this session
  title: string;
  messages: ChatMessage[];
  context: {
    userProfile?: {
      name?: string;
      company?: string;
      interests?: string[];
      stage?: 'discovery' | 'evaluation' | 'partnership' | 'support';
    };
    conversationSummary?: string;
    keyTopics?: string[];
    actionItems?: string[];
    preferences?: {
      communicationStyle?: 'formal' | 'casual' | 'technical';
      preferredAgent?: string;
      language?: string;
    };
  };
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed' | 'archived';
  tags?: string[];
}

export class ChatSessionManager {
  private static instance: ChatSessionManager;
  private sessions: Map<string, ChatSession> = new Map();
  private userSessions: Map<string, string[]> = new Map(); // userId -> sessionIds

  static getInstance(): ChatSessionManager {
    if (!ChatSessionManager.instance) {
      ChatSessionManager.instance = new ChatSessionManager();
    }
    return ChatSessionManager.instance;
  }

  // Create new chat session
  createSession(userId: string, agentId?: string, title?: string): ChatSession {
    const sessionId = this.generateSessionId();
    const session: ChatSession = {
      id: sessionId,
      userId,
      agentId,
      title: title || this.generateSessionTitle(agentId),
      messages: [],
      context: {},
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'active',
      tags: []
    };

    this.sessions.set(sessionId, session);
    
    // Track user sessions
    const userSessionList = this.userSessions.get(userId) || [];
    userSessionList.push(sessionId);
    this.userSessions.set(userId, userSessionList);

    return session;
  }

  // Get existing session or create new one
  getOrCreateSession(userId: string, sessionId?: string, agentId?: string): ChatSession {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastActivity = new Date();
      return session;
    }

    // Get user's most recent active session
    const userSessions = this.getUserSessions(userId);
    const activeSession = userSessions.find(s => s.status === 'active');
    
    if (activeSession && !agentId) {
      activeSession.lastActivity = new Date();
      return activeSession;
    }

    // Create new session
    return this.createSession(userId, agentId);
  }

  // Add message to session
  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.messages.push(message);
    session.lastActivity = new Date();
    
    // Update context based on message
    this.updateSessionContext(session, message);
  }

  // Get session context for agent processing
  getSessionContext(sessionId: string): {
    recentMessages: ChatMessage[];
    conversationSummary: string;
    userProfile: unknown;
    keyTopics: string[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        recentMessages: [],
        conversationSummary: '',
        userProfile: {},
        keyTopics: []
      };
    }

    // Get last 10 messages for context
    const recentMessages = session.messages.slice(-10);
    
    return {
      recentMessages,
      conversationSummary: session.context.conversationSummary || '',
      userProfile: session.context.userProfile || {},
      keyTopics: session.context.keyTopics || []
    };
  }

  // Update session context based on conversation
  private updateSessionContext(session: ChatSession, message: ChatMessage): void {
    // Extract user information
    if (message.role === 'user') {
      this.extractUserInfo(session, message.content);
      this.extractTopics(session, message.content);
    }

    // Update conversation summary every 5 messages
    if (session.messages.length % 5 === 0) {
      this.generateConversationSummary(session);
    }
  }

  private extractUserInfo(session: ChatSession, content: string): void {
    const lowerContent = content.toLowerCase();
    
    // Extract company mentions
    const companyPatterns = [
      /(?:my company|we are|our company is|i work at|i'm from) ([a-zA-Z0-9\s]+)/i,
      /(?:company called|startup called|business called) ([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = content.match(pattern);
      if (match) {
        session.context.userProfile = session.context.userProfile || {};
        session.context.userProfile.company = match[1].trim();
        break;
      }
    }

    // Extract stage/intent
    if (lowerContent.includes('funding') || lowerContent.includes('investment')) {
      session.context.userProfile = session.context.userProfile || {};
      session.context.userProfile.stage = 'evaluation';
    } else if (lowerContent.includes('partner') || lowerContent.includes('apply')) {
      session.context.userProfile = session.context.userProfile || {};
      session.context.userProfile.stage = 'partnership';
    }
  }

  private extractTopics(session: ChatSession, content: string): void {
    const topics = session.context.keyTopics || [];
    const lowerContent = content.toLowerCase();
    
    const topicKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'blockchain',
      'funding', 'investment', 'venture capital', 'startup', 'fintech',
      'saas', 'software', 'technology', 'innovation', 'market analysis',
      'business plan', 'strategy', 'growth', 'scaling', 'partnership'
    ];

    for (const keyword of topicKeywords) {
      if (lowerContent.includes(keyword) && !topics.includes(keyword)) {
        topics.push(keyword);
      }
    }

    session.context.keyTopics = topics.slice(-10); // Keep last 10 topics
  }

  private generateConversationSummary(session: ChatSession): void {
    const messages = session.messages.slice(-10);
    const summary = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content.substring(0, 100)}`)
      .join('\n');
    
    session.context.conversationSummary = summary;
  }

  // Get user's chat sessions
  getUserSessions(userId: string): ChatSession[] {
    const sessionIds = this.userSessions.get(userId) || [];
    const sessions = sessionIds
      .map(id => this.sessions.get(id))
      .filter((session): session is ChatSession => Boolean(session));
    
    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  // Archive old sessions
  archiveInactiveSessions(daysInactive: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    for (const session of this.sessions.values()) {
      if (session.lastActivity < cutoffDate && session.status === 'active') {
        session.status = 'archived';
      }
    }
  }

  // Export session data
  exportSession(sessionId: string): unknown {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      ...session,
      messageCount: session.messages.length,
      duration: session.lastActivity.getTime() - session.startTime.getTime(),
      exportedAt: new Date()
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionTitle(agentId?: string): string {
    const agentNames: { [key: string]: string } = {
      'meta3-research': 'Market Research Discussion',
      'meta3-investment': 'Investment Consultation',
      'venture-launch': 'Startup Planning Session',
      'competitive-intelligence': 'Competitive Analysis',
      'meta3-marketing': 'Marketing Strategy Chat',
      'meta3-financial': 'Financial Planning',
      'meta3-legal': 'Legal Consultation',
      'meta3-support': 'Support Session',
      'meta3-local': 'Local Market Discussion',
      'general-conversation': 'General Chat'
    };

    return agentNames[agentId || 'general-conversation'] || 'Chat Session';
  }
}

export const chatSessionManager = ChatSessionManager.getInstance();
