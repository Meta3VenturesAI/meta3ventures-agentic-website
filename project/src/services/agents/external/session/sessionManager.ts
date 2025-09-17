/**
 * SessionManager
 *
 * Maintains persistent sessions for the Meta3 virtual assistant.  Each session
 * stores messages exchanged between the user and the assistant, as well as
 * user profile data.  In production, this module should be backed by a
 * database (e.g. Supabase, PostgreSQL).  For demonstration purposes a
 * simple in-memory map is used.
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  name?: string;
  email?: string;
  company?: string;
  interest?: string;
  [key: string]: unknown;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  userProfile: UserProfile;
  createdAt: Date;
}

class SessionManager {
  private sessions: Map<string, UserSession> = new Map();

  /**
   * Retrieves an existing session or creates a new one if it doesn't exist.
   * If no sessionId is provided, a new one is generated.
   */
  getOrCreateSession(userId: string, sessionId?: string): UserSession {
    const id = sessionId || this.generateSessionId();
    let session = this.sessions.get(id);
    if (!session) {
      session = {
        sessionId: id,
        userId,
        messages: [],
        userProfile: {},
        createdAt: new Date()
      };
      this.sessions.set(id, session);
    }
    return session;
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
    }
  }

  getConversationHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId)?.messages || [];
  }

  updateUserProfile(sessionId: string, profile: Partial<UserProfile>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.userProfile = { ...session.userProfile, ...profile };
    }
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Export a singleton instance
export const sessionManager = new SessionManager();