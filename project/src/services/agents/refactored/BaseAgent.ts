/**
 * Base Agent Class - Foundation for all specialized agents
 * Provides common functionality and enforces consistent interface
 */

import { AgentMessage, AgentContext, AgentCapabilities, AgentResponse, AgentAttachment } from './types';
import { llmService, LLMResponse } from './LLMService';
import { auditLogger } from '../../../utils/audit-logger';

export abstract class BaseAgent {
  protected capabilities: AgentCapabilities;
  protected preferredModel?: string;
  protected preferredProvider?: string;
  protected enableLLM: boolean = true;

  constructor(capabilities: AgentCapabilities, options: { 
    preferredModel?: string; 
    preferredProvider?: string; 
    enableLLM?: boolean;
  } = {}) {
    this.capabilities = capabilities;
    this.preferredModel = options.preferredModel;
    this.preferredProvider = options.preferredProvider;
    this.enableLLM = options.enableLLM ?? true;
  }

  // Abstract methods that must be implemented by each agent
  abstract processMessage(message: string, context: AgentContext): Promise<AgentMessage>;
  abstract analyzeRequest(message: string): AgentResponse;
  
  // Abstract method for fallback content - must be implemented by each agent
  abstract getFallbackResponse(message: string): AgentResponse;

  // Common functionality shared by all agents
  getCapabilities(): AgentCapabilities {
    return this.capabilities;
  }

  canHandle(message: string): boolean {
    return this.capabilities.canHandle(message);
  }

  validateInput(message: string): { isValid: boolean; suggestions?: string[] } {
    if (!message || message.trim().length === 0) {
      return {
        isValid: false,
        suggestions: ['Please provide a message or question.']
      };
    }

    if (message.length > 2000) {
      return {
        isValid: false,
        suggestions: ['Message is too long. Please keep it under 2000 characters.']
      };
    }

    return { isValid: true };
  }

  protected generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected createResponse(
    content: string, 
    agentId: string, 
    metadata?: Record<string, unknown>
  ): AgentMessage {
    return {
      id: this.generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      agentId,
      metadata
    };
  }

  protected extractKeywords(message: string): string[] {
    const words = message.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been'].includes(word));
    
    return [...new Set(words)];
  }

  protected calculateConfidence(message: string, keywords: string[]): number {
    const messageKeywords = this.extractKeywords(message);
    const matches = messageKeywords.filter(kw => 
      keywords.some(agentKw => kw.includes(agentKw) || agentKw.includes(kw))
    );
    
    if (messageKeywords.length === 0) return 0;
    
    const baseConfidence = matches.length / messageKeywords.length;
    const lengthBonus = Math.min(message.length / 100, 0.2); // Bonus for detailed messages
    
    return Math.min(baseConfidence + lengthBonus, 1.0);
  }

  protected formatResponse(
    content: string, 
    confidence: number = 0.8, 
    attachments?: unknown[]
  ): AgentResponse {
    return {
      content,
      confidence,
      attachments: (attachments || []) as AgentAttachment[]
    };
  }

  /**
   * Generate LLM-enhanced response with RAG integration and fallback to static content
   */
  protected async generateLLMResponse(
    message: string,
    systemPrompt: string,
    context?: AgentContext
  ): Promise<AgentResponse> {
    // If LLM is disabled, use fallback immediately
    if (!this.enableLLM) {
      auditLogger.logLLMInteraction('disabled', 'none', {
        action: 'llm_disabled_fallback',
        agentId: this.capabilities.id,
        message: message.substring(0, 100) + '...'
      });
      return this.getFallbackResponse(message);
    }

    try {
      const startTime = Date.now();
      
      // Enhance system prompt with available tools
      let enhancedSystemPrompt = systemPrompt;

      // Get available tools for this agent
      let availableTools: unknown[] = [];
      try {
        const { agentToolsSystem } = await import('./AgentToolsSystem');
        availableTools = agentToolsSystem.getToolsForAgent(this.capabilities.id);

        if (availableTools.length > 0) {
          const toolsDescription = availableTools.map((tool: any) =>
            `- ${tool.name}: ${tool.description}`
          ).join('\n');

          enhancedSystemPrompt += `\n\nAvailable Tools:\n${toolsDescription}\n\nWhen you need to use a tool, indicate it in your response with [TOOL:tool-id:parameters].\nFor example: [TOOL:market-analysis:{"industry":"fintech","region":"US"}]`;
        }
      } catch (error) {
        console.warn('Failed to load agent tools, continuing without tools:', error);
        // Fallback to context-provided tools
        availableTools = (context?.metadata?.availableTools as unknown[]) || [];
        if (availableTools.length > 0) {
          const toolsDescription = availableTools.map((tool: any) =>
            `- ${tool.name}: ${tool.description}`
          ).join('\n');
          enhancedSystemPrompt += `\n\nAvailable Tools:\n${toolsDescription}\n\nWhen you need to use a tool, indicate it in your response with [TOOL:tool-id:parameters].\nFor example: [TOOL:market-analysis:{"industry":"fintech","region":"US"}]`;
        }
      }

      // Add context information if available
      if (context?.metadata?.userProfile) {
        enhancedSystemPrompt += `\n\nUser Context: ${JSON.stringify(context.metadata.userProfile)}`;
      }
      
      if (context?.metadata?.conversationSummary) {
        enhancedSystemPrompt += `\n\nConversation Summary: ${context.metadata.conversationSummary}`;
      }

      // RAG Integration - Add relevant knowledge to the context
      try {
        const { RAGService } = await import('./rag/RAGService');
        const ragService = RAGService.getInstance();

        // Search for relevant information based on the message
        const ragResponse = await ragService.search({
          query: message,
          topK: 3,
          threshold: 0.15,
          includeMetadata: true
        });

        if (ragResponse.success && ragResponse.data && ragResponse.data.results.length > 0) {
          const relevantKnowledge = ragResponse.data.results
            .map(result => `${result.document.metadata.title}: ${result.document.content}`)
            .join('\n\n');

          enhancedSystemPrompt += `\n\nRelevant Knowledge Base Information:\n${relevantKnowledge}`;

          auditLogger.logLLMInteraction('rag', 'knowledge-retrieval', {
            action: 'rag_knowledge_added',
            agentId: this.capabilities.id,
            results_count: ragResponse.data.results.length,
            query: message.substring(0, 100)
          });
        }
      } catch (error) {
        console.warn('RAG integration failed, continuing without knowledge base:', error);
      }

      // Prepare messages for LLM
      const messages = [
        { role: 'system' as const, content: enhancedSystemPrompt },
        { role: 'user' as const, content: message }
      ];

      // Add conversation history if available
      if (context?.conversationHistory && context.conversationHistory.length > 0) {
        const recentHistory = context.conversationHistory.slice(-6); // Last 3 exchanges
        for (const historyItem of recentHistory) {
          if (historyItem.role === 'user') {
            messages.push({
              role: 'user' as const,
              content: historyItem.content
            });
          }
          // Skip assistant messages for now as they don't fit the LLM message format
          // In a more advanced implementation, we could transform them properly
        }
        // Add current user message at the end
        messages.push({ role: 'user' as const, content: message });
      }

      // Determine model and provider
      const model = this.preferredModel || 'qwen2.5:latest'; // Default to available local model
      const provider = this.preferredProvider;

      // Generate LLM response
      const llmResponse: LLMResponse = await llmService.generateResponse(
        model,
        messages,
        {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 0.9,
          preferredProvider: provider
        }
      );

      const processingTime = Date.now() - startTime;

      // Log successful LLM interaction
      auditLogger.logLLMInteraction(provider || 'auto', model, {
        action: 'llm_generation_success',
        agentId: this.capabilities.id,
        processing_time: processingTime,
        response_length: llmResponse.content.length,
        tokens_used: llmResponse.usage.totalTokens,
        finish_reason: llmResponse.finishReason
      }, 'success');

      // Execute tools if requested in the response
      let finalContent = llmResponse.content;
      const toolsUsed: string[] = [];
      
      if (availableTools.length > 0) {
        const toolMatches = finalContent.match(/\[TOOL:([^:]+):([^\]]+)\]/g);

        if (toolMatches) {
          const { agentToolsSystem } = await import('./AgentToolsSystem');

          for (const match of toolMatches) {
            const [, toolId, paramsStr] = match.match(/\[TOOL:([^:]+):([^\]]+)\]/) || [];

            if (toolId && availableTools.find((t: any) => t.id === toolId)) {
              try {
                const params = JSON.parse(paramsStr);
                const toolResult = await agentToolsSystem.executeTool(toolId, params, context);
                
                // Replace tool call with result
                finalContent = finalContent.replace(
                  match,
                  `\n\n**${(availableTools.find((t: any) => t.id === toolId) as any)?.name || 'Tool'} Result:**\n${this.formatToolResult(toolResult)}\n`
                );
                
                toolsUsed.push(toolId);
              } catch (error) {
                finalContent = finalContent.replace(
                  match,
                  `\n\n*Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}*\n`
                );
              }
            }
          }
        }
      }

      // Calculate confidence based on LLM response quality
      const confidence = this.calculateLLMConfidence(llmResponse);

      return this.formatResponse(finalContent, confidence, [{
        type: 'llm_metadata',
        model: llmResponse.model,
        processingTime: llmResponse.processingTime,
        tokensUsed: llmResponse.usage.totalTokens,
        toolsUsed
      }]);

    } catch (error: unknown) {
      // Log LLM failure and fallback to static content
      auditLogger.logLLMInteraction(this.preferredProvider || 'auto', this.preferredModel || 'unknown', {
        action: 'llm_generation_failure',
        agentId: this.capabilities.id,
        error: (error as any).message,
        fallback_used: true
      }, 'failure');

      console.warn(`LLM generation failed for agent ${this.capabilities.id}, falling back to static content:`, error);
      
      // Return fallback response with reduced confidence
      const fallbackResponse = this.getFallbackResponse(message);
      return this.formatResponse(
        fallbackResponse.content, 
        Math.max(fallbackResponse.confidence - 0.2, 0.5), // Reduce confidence but keep reasonable
        [
          ...(fallbackResponse.attachments || []),
          {
            type: 'fallback_notice',
            reason: 'LLM unavailable',
            originalError: (error as any).message
          }
        ]
      );
    }
  }

  /**
   * Calculate confidence score based on LLM response quality
   */
  private formatToolResult(result: unknown): string {
    if (typeof result === 'object') {
      return '```json\n' + JSON.stringify(result, null, 2) + '\n```';
    }
    return String(result);
  }

  private calculateLLMConfidence(response: LLMResponse): number {
    let confidence = 0.8; // Base confidence for LLM responses

    // Adjust based on response length
    if (response.content.length < 50) {
      confidence -= 0.2; // Very short responses are less confident
    } else if (response.content.length > 500) {
      confidence += 0.1; // Detailed responses are more confident
    }

    // Adjust based on finish reason
    if (response.finishReason === 'length') {
      confidence -= 0.1; // Cut off due to length limit
    } else if (response.finishReason === 'content_filter') {
      confidence -= 0.3; // Content filter triggered
    }

    // Adjust based on processing time (faster is sometimes better for simple queries)
    if (response.processingTime > 10000) { // More than 10 seconds
      confidence -= 0.1;
    }

    return Math.max(Math.min(confidence, 1.0), 0.3); // Clamp between 0.3 and 1.0
  }

  /**
   * Configure LLM preferences for this agent instance
   */
  public configureLLM(options: {
    preferredModel?: string;
    preferredProvider?: string;
    enableLLM?: boolean;
  }): void {
    this.preferredModel = options.preferredModel ?? this.preferredModel;
    this.preferredProvider = options.preferredProvider ?? this.preferredProvider;
    this.enableLLM = options.enableLLM ?? this.enableLLM;

    auditLogger.logSystem('agent_llm_configured', {
      agentId: this.capabilities.id,
      preferredModel: this.preferredModel,
      preferredProvider: this.preferredProvider,
      enableLLM: this.enableLLM
    });
  }

  /**
   * Get current LLM configuration for this agent
   */
  public getLLMConfiguration(): {
    preferredModel?: string;
    preferredProvider?: string;
    enableLLM: boolean;
  } {
    return {
      preferredModel: this.preferredModel,
      preferredProvider: this.preferredProvider,
      enableLLM: this.enableLLM
    };
  }
}