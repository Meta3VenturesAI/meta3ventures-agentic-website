/**
 * Core Types for Refactored Agent System
 * Clean, maintainable type definitions
 */

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId: string;
  attachments?: AgentAttachment[];
  suggestedActions?: AgentSuggestedAction[];
  metadata?: {
    confidence?: number;
    processingTime?: number;
    tools_used?: string[];
    [key: string]: unknown;
  };
}

export interface AgentAttachment {
  type: 'link' | 'document' | 'action';
  title: string;
  url?: string;
  content?: string;
}

export interface AgentSuggestedAction {
  id: string;
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface AgentContext {
  sessionId: string;
  userId?: string;
  conversationHistory?: AgentMessage[];
  currentAgent?: string;
  timestamp?: Date;
  userProfile?: UserProfile;
  metadata?: Record<string, unknown>;
}

export interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface LLMResponse {
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

export interface UserProfile {
  id: string;
  interests: string[];
  conversationStyle: 'friendly' | 'professional' | 'technical';
  expertise: string[];
  goals: string[];
  preferences: Record<string, unknown>;
}

export interface AgentCapabilities {
  id: string;
  name: string;
  description: string;
  specialties: string[];
  tools: string[];
  canHandle: (_message: string) => boolean;
  priority: number; // Higher number = higher priority for routing
}

export interface AgentResponse {
  content: string;
  confidence: number;
  nextActions?: string[];
  toolCalls?: unknown[];
  attachments?: AgentAttachment[];
  suggestedAgent?: string; // Suggest switching to another agent
  agentId?: string; // ID of the responding agent
  timestamp?: Date; // When the response was generated
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  currentAgent: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  context: AgentContext;
  isActive: boolean;
}

export interface AgentConfig {
  llmProvider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableTools?: boolean;
  enablePlaybooks?: boolean;
  responseStyle?: 'conversational' | 'detailed' | 'concise';
}

export interface OrchestratorStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  agentUsage: Record<string, number>;
  averageResponseTime: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}

export interface ConversationState {
  sessionId: string;
  userId: string;
  topicsCovered: string[];
  lastGreeting?: Date;
  lastAboutQuery?: Date;
  conversationStage: 'greeting' | 'information' | 'action' | 'specialized';
  preferredResponseStyle: 'brief' | 'detailed';
  repeatedQueries: Map<string, number>;
  lastAgentUsed?: string;
}