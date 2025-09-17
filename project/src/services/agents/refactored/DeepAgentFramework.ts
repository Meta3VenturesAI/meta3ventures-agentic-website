/**
 * Deep Agent Framework
 * Advanced reasoning and task decomposition for complex queries
 */

import { LLMService } from './LLMService';
import { AgentContext, AgentMessage } from './types';

export interface DeepTask {
  id: string;
  description: string;
  type: 'research' | 'analysis' | 'synthesis' | 'reasoning' | 'planning';
  priority: number;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
  metadata?: unknown;
}

export interface DeepAgentSession {
  id: string;
  originalQuery: string;
  tasks: DeepTask[];
  currentStep: number;
  status: 'planning' | 'executing' | 'synthesizing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  results: unknown[];
  reasoning: string[];
}

export class DeepAgentFramework {
  private static instance: DeepAgentFramework;
  private sessions: Map<string, DeepAgentSession> = new Map();
  private llmService: LLMService;

  constructor(llmService: LLMService) {
    this.llmService = llmService;
  }

  static getInstance(llmService: LLMService): DeepAgentFramework {
    if (!DeepAgentFramework.instance) {
      DeepAgentFramework.instance = new DeepAgentFramework(llmService);
    }
    return DeepAgentFramework.instance;
  }

  async processComplexQuery(
    query: string,
    context: AgentContext
  ): Promise<AgentMessage> {
    const sessionId = this.generateSessionId();
    
    // Step 1: Analyze query complexity
    const complexity = await this.analyzeQueryComplexity(query);
    
    if (complexity.score < 0.7) {
      // Not complex enough for deep processing, use regular agent
      return {
        id: sessionId,
        role: 'assistant',
        content: "This query doesn't require deep processing. I'll handle it with standard reasoning.",
        timestamp: new Date(),
        agentId: 'deep-agent-framework',
        metadata: {
          deepAgent: false,
          complexity: complexity.score
        }
      };
    }

    // Step 2: Create deep agent session
    const session = await this.createDeepSession(sessionId, query, complexity);
    this.sessions.set(sessionId, session);

    // Step 3: Execute deep reasoning process
    try {
      const result = await this.executeDeepReasoning(session, context);
      return result;
    } catch (error) {
      console.error('Deep agent processing failed:', error);
      return {
        id: sessionId,
        role: 'assistant',
        content: "I encountered an issue with deep processing. Let me provide a standard response instead.",
        timestamp: new Date(),
        agentId: 'deep-agent-framework',
        metadata: {
          deepAgent: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async analyzeQueryComplexity(query: string): Promise<{
    score: number;
    factors: string[];
    reasoning: string;
  }> {
    // Analyze query characteristics that indicate complexity
    const factors = [];
    let score = 0;

    // Length factor
    if (query.length > 100) {
      factors.push('Long query');
      score += 0.2;
    }

    // Multi-part questions
    const questionMarks = (query.match(/\?/g) || []).length;
    if (questionMarks > 1) {
      factors.push('Multiple questions');
      score += 0.3;
    }

    // Keywords indicating complexity
    const complexityKeywords = [
      'analyze', 'compare', 'evaluate', 'strategy', 'plan', 'comprehensive',
      'detailed', 'thorough', 'research', 'investigate', 'assess', 'review',
      'pros and cons', 'advantages and disadvantages', 'step by step'
    ];
    
    const foundKeywords = complexityKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      factors.push(`Complexity keywords: ${foundKeywords.join(', ')}`);
      score += Math.min(foundKeywords.length * 0.15, 0.4);
    }

    // Domain-specific complexity
    const domainKeywords = [
      'investment', 'funding', 'market analysis', 'due diligence',
      'business model', 'competitive analysis', 'financial projections',
      'regulatory', 'legal', 'compliance', 'risk assessment'
    ];
    
    const foundDomainKeywords = domainKeywords.filter(keyword =>
      query.toLowerCase().includes(keyword)
    );
    
    if (foundDomainKeywords.length > 0) {
      factors.push(`Domain complexity: ${foundDomainKeywords.join(', ')}`);
      score += Math.min(foundDomainKeywords.length * 0.1, 0.3);
    }

    // Conjunctions indicating multi-step reasoning
    const conjunctions = ['and then', 'after that', 'next', 'also', 'additionally'];
    const foundConjunctions = conjunctions.filter(conj =>
      query.toLowerCase().includes(conj)
    );
    
    if (foundConjunctions.length > 0) {
      factors.push('Multi-step reasoning indicators');
      score += 0.2;
    }

    return {
      score: Math.min(score, 1.0),
      factors,
      reasoning: `Query complexity score: ${score.toFixed(2)} based on: ${factors.join(', ')}`
    };
  }

  private async createDeepSession(
    sessionId: string,
    query: string,
    complexity: unknown
  ): Promise<DeepAgentSession> {
    // Decompose query into tasks
    const tasks = await this.decomposeQuery(query, complexity);
    
    return {
      id: sessionId,
      originalQuery: query,
      tasks,
      currentStep: 0,
      status: 'planning',
      startTime: new Date(),
      results: [],
      reasoning: [`Initiated deep processing for complex query: ${query}`]
    };
  }

  private async decomposeQuery(query: string, complexity: unknown): Promise<DeepTask[]> {
    const tasks: DeepTask[] = [];
    
    // Basic task decomposition based on query analysis
    if (complexity.factors.includes('Multiple questions')) {
      tasks.push({
        id: 'task-1',
        description: 'Break down multi-part question',
        type: 'analysis',
        priority: 1,
        dependencies: [],
        status: 'pending'
      });
    }

    if (complexity.factors.some((f: string) => f.includes('research') || f.includes('analyze'))) {
      tasks.push({
        id: 'task-2',
        description: 'Conduct research and analysis',
        type: 'research',
        priority: 2,
        dependencies: tasks.length > 0 ? [tasks[0].id] : [],
        status: 'pending'
      });
    }

    if (complexity.factors.some((f: string) => f.includes('Domain complexity'))) {
      tasks.push({
        id: 'task-3',
        description: 'Apply domain-specific expertise',
        type: 'analysis',
        priority: 3,
        dependencies: tasks.length > 0 ? [tasks[tasks.length - 1].id] : [],
        status: 'pending'
      });
    }

    // Always add synthesis task
    tasks.push({
      id: 'task-final',
      description: 'Synthesize findings into comprehensive response',
      type: 'synthesis',
      priority: 10,
      dependencies: tasks.map(t => t.id),
      status: 'pending'
    });

    return tasks;
  }

  private async executeDeepReasoning(
    session: DeepAgentSession,
    context: AgentContext
  ): Promise<AgentMessage> {
    session.status = 'executing';
    
    // Execute tasks in dependency order
    for (const task of session.tasks) {
      if (this.areTaskDependenciesMet(task, session.tasks)) {
        session.reasoning.push(`Executing: ${task.description}`);
        task.status = 'in_progress';
        
        try {
          const result = await this.executeTask(task, session, context);
          task.result = result;
          task.status = 'completed';
          session.results.push(result);
        } catch (error) {
          task.status = 'failed';
          session.reasoning.push(`Task failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Generate final response
    session.status = 'synthesizing';
    const finalResponse = await this.synthesizeResults(session, context);
    
    session.status = 'completed';
    session.endTime = new Date();
    
    return finalResponse;
  }

  private areTaskDependenciesMet(task: DeepTask, allTasks: DeepTask[]): boolean {
    return task.dependencies.every(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask?.status === 'completed';
    });
  }

  private async executeTask(
    task: DeepTask,
    session: DeepAgentSession,
    context: AgentContext
  ): Promise<any> {
    const prompt = this.buildTaskPrompt(task, session, context);
    
    try {
      const response = await this.llmService.generateResponse(
        'llama3.2:3b', // Default model, will be configurable
        [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user }
        ],
        {
          temperature: 0.6,
          maxTokens: 1500,
          preferredProvider: 'fallback' // Use fallback for now
        }
      );
      
      return {
        taskId: task.id,
        content: response.content,
        reasoning: `Completed ${task.type} task: ${task.description}`,
        processingTime: response.processingTime
      };
    } catch (error) {
      throw new Error(`Task execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildTaskPrompt(task: DeepTask, session: DeepAgentSession, context: AgentContext): {
    system: string;
    user: string;
  } {
    const systemPrompt = `You are a specialized AI assistant working on a complex task as part of a deep reasoning framework.

Task Type: ${task.type}
Task Description: ${task.description}
Priority: ${task.priority}

Previous Results: ${session.results.map(r => r.content).join('\n\n')}

Focus on providing detailed, accurate information for this specific task. Your response will be combined with other task results to form a comprehensive answer.`;

    const userPrompt = `Original Query: ${session.originalQuery}

Current Task: ${task.description}

Please provide a detailed response for this specific aspect of the query. Be thorough and accurate.`;

    return {
      system: systemPrompt,
      user: userPrompt
    };
  }

  private async synthesizeResults(
    session: DeepAgentSession,
    context: AgentContext
  ): Promise<AgentMessage> {
    const synthesisPrompt = `You are synthesizing results from multiple specialized tasks to answer a complex query.

Original Query: ${session.originalQuery}

Task Results:
${session.results.map((result, index) => 
  `${index + 1}. ${result.reasoning}\n${result.content}\n`
).join('\n')}

Reasoning Process:
${session.reasoning.join('\n')}

Please provide a comprehensive, well-structured response that integrates all the task results into a coherent answer. Include:
1. A clear, direct answer to the original query
2. Supporting details from the research and analysis
3. Any relevant recommendations or next steps
4. A brief summary of the reasoning process used

Make the response professional, thorough, and easy to understand.`;

    try {
      const response = await this.llmService.generateResponse(
        'llama3.2:3b',
        [
          { role: 'system', content: 'You are an expert at synthesizing complex information into clear, comprehensive responses.' },
          { role: 'user', content: synthesisPrompt }
        ],
        {
          temperature: 0.7,
          maxTokens: 2000,
          preferredProvider: 'fallback'
        }
      );

      return {
        id: session.id,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        agentId: 'deep-agent-framework',
        metadata: {
          deepAgent: true,
          sessionId: session.id,
          tasksCompleted: session.tasks.filter(t => t.status === 'completed').length,
          totalTasks: session.tasks.length,
          processingTime: session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0,
          reasoning: session.reasoning
        }
      };
    } catch (error) {
      // Fallback to basic synthesis
      const basicResponse = this.createBasicSynthesis(session);
      return {
        id: session.id,
        role: 'assistant',
        content: basicResponse,
        timestamp: new Date(),
        agentId: 'deep-agent-framework',
        metadata: {
          deepAgent: true,
          fallback: true,
          error: error instanceof Error ? error.message : 'Synthesis failed'
        }
      };
    }
  }

  private createBasicSynthesis(session: DeepAgentSession): string {
    const completedTasks = session.tasks.filter(t => t.status === 'completed');
    
    if (completedTasks.length === 0) {
      return "I attempted to process your complex query using deep reasoning, but encountered issues with the analysis. Let me provide a direct response based on my knowledge.";
    }

    return `Based on my deep analysis of your query "${session.originalQuery}", here's what I found:

${session.results.map((result, index) => 
  `${index + 1}. ${result.content}`
).join('\n\n')}

This analysis involved ${completedTasks.length} specialized tasks including ${completedTasks.map(t => t.type).join(', ')}. The deep reasoning process took ${Math.round((session.endTime ? session.endTime.getTime() - session.startTime.getTime() : 0) / 1000)} seconds to complete.`;
  }

  private generateSessionId(): string {
    return `deep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for admin dashboard
  getActiveSessions(): DeepAgentSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status !== 'completed');
  }

  getCompletedSessions(): DeepAgentSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'completed');
  }

  getSessionStats(): {
    total: number;
    active: number;
    completed: number;
    averageProcessingTime: number;
    successRate: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter(s => s.status === 'completed');
    const successful = completed.filter(s => s.tasks.every(t => t.status === 'completed'));
    
    return {
      total: sessions.length,
      active: sessions.filter(s => s.status === 'executing' || s.status === 'planning').length,
      completed: completed.length,
      averageProcessingTime: completed.length > 0 ? 
        completed.reduce((sum, s) => sum + (s.endTime ? s.endTime.getTime() - s.startTime.getTime() : 0), 0) / completed.length : 0,
      successRate: completed.length > 0 ? successful.length / completed.length : 0
    };
  }
}

export const deepAgentFramework = DeepAgentFramework.getInstance;
