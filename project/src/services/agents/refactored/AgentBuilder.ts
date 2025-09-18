/**
 * Agent Builder - Easy system to create new virtual agents
 */

import { BaseAgent } from './BaseAgent';
import { AgentCapabilities, AgentContext, AgentMessage, AgentResponse } from './types';
import { agentToolsSystem, AgentTool } from './AgentToolsSystem';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technical' | 'creative' | 'analytical' | 'support';
  systemPrompt: string;
  specialties: string[];
  tools: string[];
  triggerKeywords: string[];
  priority: number;
  examples: string[];
  playbook?: AgentPlaybook;
}

export interface AgentPlaybook {
  name: string;
  description: string;
  steps: PlaybookStep[];
  triggers: string[];
}

export interface PlaybookStep {
  id: string;
  name: string;
  description: string;
  action: 'ask_question' | 'use_tool' | 'provide_info' | 'make_recommendation';
  parameters?: unknown;
  nextStep?: string;
  conditions?: { [key: string]: unknown };
}

export class DynamicAgent extends BaseAgent {
  private template: AgentTemplate;
  private availableTools: AgentTool[];

  constructor(template: AgentTemplate) {
    super({
      id: template.id,
      name: template.name,
      description: template.description,
      specialties: template.specialties,
      tools: template.tools,
      canHandle: (message: string) => {
        const lowerMessage = message.toLowerCase();
        return template.triggerKeywords.some(keyword => 
          lowerMessage.includes(keyword.toLowerCase())
        );
      },
      priority: template.priority
    }, {
      preferredModel: 'llama3.2:3b',
      preferredProvider: 'ollama',
      enableLLM: true
    });

    this.template = template;
    this.availableTools = agentToolsSystem.getToolsForAgent(template.id);
  }

  async processMessage(message: string, context: AgentContext): Promise<AgentMessage> {
    try {
      // Check if we should use a playbook
      if (this.template.playbook && this.shouldUsePlaybook(message)) {
        return await this.executePlaybook(message, context);
      }

      // Use LLM with tools if available
      if (this.enableLLM) {
        const response = await this.generateLLMResponseWithTools(message, context);
        return this.createResponse(response.content, this.capabilities.id, {
          confidence: response.confidence,
          processingTime: response.processingTime,
          toolsUsed: response.toolsUsed
        });
      }

      // Fallback response
      return this.createResponse(
        this.getFallbackResponse(message).content,
        this.capabilities.id
      );
    } catch (error) {
      console.error(`Agent ${this.template.id} processing failed:`, error);
      return this.createResponse(
        this.getFallbackResponse(message).content,
        this.capabilities.id,
        { error: error instanceof Error ? error.message : 'Processing failed' }
      );
    }
  }

  analyzeRequest(message: string): AgentResponse {
    const lowerMessage = message.toLowerCase();
    let confidence = 0;

    // Check trigger keywords
    for (const keyword of this.template.triggerKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        confidence += 20;
      }
    }

    // Check specialties
    for (const specialty of this.template.specialties) {
      if (lowerMessage.includes(specialty.toLowerCase())) {
        confidence += 15;
      }
    }

    return {
      content: confidence > 30 ? 'I can help with that!' : 'Let me see what I can do.',
      confidence: Math.min(confidence, 100),
      agentId: this.template.id,
      timestamp: new Date()
    };
  }

  getFallbackResponse(message: string): AgentResponse {
    const responses = [
      `As a ${this.template.name.toLowerCase()}, I specialize in ${this.template.specialties.join(', ')}. How can I help you with that?`,
      `I'm here to assist with ${this.template.specialties.slice(0, 3).join(', ')}. What would you like to know?`,
      `My expertise includes ${this.template.specialties.join(', ')}. What specific area would you like help with?`
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      confidence: 70,
      agentId: this.template.id,
      timestamp: new Date()
    };
  }

  private async generateLLMResponseWithTools(message: string, context: AgentContext): Promise<any> {
    // Build enhanced system prompt with available tools
    const toolsDescription = this.availableTools.map(tool => 
      `- ${tool.name}: ${tool.description}`
    ).join('\n');

    const enhancedPrompt = `${this.template.systemPrompt}

Available Tools:
${toolsDescription}

When you need to use a tool, indicate it in your response with [TOOL:tool-id:parameters].
For example: [TOOL:market-analysis:{"industry":"fintech","region":"US"}]

Always provide helpful, accurate information based on your expertise in ${this.template.specialties.join(', ')}.`;

    // Generate initial response
    const response = await this.generateLLMResponse(message, enhancedPrompt, context);
    
    // Check if tools were requested
    const toolMatches = response.content.match(/\[TOOL:([^:]+):([^\]]+)\]/g);
    const toolsUsed: string[] = [];

    if (toolMatches) {
      for (const match of toolMatches) {
        const [, toolId, paramsStr] = match.match(/\[TOOL:([^:]+):([^\]]+)\]/) || [];
        
        if (toolId && this.availableTools.find(t => t.id === toolId)) {
          try {
            const params = JSON.parse(paramsStr);
            const toolResult = await agentToolsSystem.executeTool(toolId, params, context);
            
            // Replace tool call with result
            response.content = response.content.replace(
              match,
              `\n\n**Analysis Result:**\n${JSON.stringify(toolResult, null, 2)}\n`
            );
            
            toolsUsed.push(toolId);
          } catch (error) {
            response.content = response.content.replace(
              match,
              `\n\n*Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}*\n`
            );
          }
        }
      }
    }

    return {
      ...response,
      toolsUsed
    };
  }

  private shouldUsePlaybook(message: string): boolean {
    if (!this.template.playbook) return false;
    
    const lowerMessage = message.toLowerCase();
    return this.template.playbook.triggers.some(trigger => 
      lowerMessage.includes(trigger.toLowerCase())
    );
  }

  private async executePlaybook(message: string, context: AgentContext): Promise<AgentMessage> {
    const playbook = this.template.playbook!;
    const currentStep = playbook.steps[0];
    let response = `Following the ${playbook.name} process:\n\n`;

    // Execute playbook steps
    for (let i = 0; i < playbook.steps.length && i < 3; i++) { // Limit to 3 steps
      const step = playbook.steps[i];
      
      switch (step.action) {
        case 'ask_question':
          response += `**${step.name}:** ${step.description}\n`;
          break;
          
        case 'use_tool':
          if (step.parameters) {
            try {
              const toolResult = await agentToolsSystem.executeTool(
                (step.parameters as any).toolId,
                (step.parameters as any).params,
                context
              );
              response += `**${step.name}:** Analysis complete\n${JSON.stringify(toolResult, null, 2)}\n\n`;
            } catch (error) {
              response += `**${step.name}:** Tool execution failed\n\n`;
            }
          }
          break;
          
        case 'provide_info':
          response += `**${step.name}:** ${step.description}\n\n`;
          break;
          
        case 'make_recommendation':
          response += `**Recommendation:** ${step.description}\n\n`;
          break;
      }
    }

    return this.createResponse(response, this.capabilities.id, {
      playbook: playbook.name,
      stepsExecuted: Math.min(playbook.steps.length, 3)
    });
  }
}

export class AgentBuilder {
  private static instance: AgentBuilder;
  private templates: Map<string, AgentTemplate> = new Map();
  private agents: Map<string, DynamicAgent> = new Map();

  static getInstance(): AgentBuilder {
    if (!AgentBuilder.instance) {
      AgentBuilder.instance = new AgentBuilder();
      AgentBuilder.instance.initializeTemplates();
    }
    return AgentBuilder.instance;
  }

  private initializeTemplates(): void {
    // Business Development Agent Template
    this.addTemplate({
      id: 'business-development',
      name: 'Business Development Specialist',
      description: 'Expert in partnerships, growth strategies, and business expansion',
      category: 'business',
      systemPrompt: `You are a Business Development Specialist with expertise in partnerships, strategic alliances, and growth strategies. Help businesses identify opportunities, develop partnerships, and create expansion plans.`,
      specialties: ['Partnership Development', 'Strategic Alliances', 'Business Expansion', 'Growth Strategy', 'Deal Structuring'],
      tools: ['market-analysis', 'competitive-analysis'],
      triggerKeywords: ['partnership', 'business development', 'growth strategy', 'expansion', 'alliance'],
      priority: 75,
      examples: [
        'Help me identify potential partners for my SaaS company',
        'What are the best growth strategies for entering new markets?',
        'How do I structure a strategic partnership deal?'
      ]
    });

    // Product Strategy Agent Template
    this.addTemplate({
      id: 'product-strategy',
      name: 'Product Strategy Expert',
      description: 'Specialist in product management, roadmapping, and strategy',
      category: 'technical',
      systemPrompt: `You are a Product Strategy Expert with deep knowledge of product management, roadmapping, user experience, and product-market fit. Help teams build better products and strategies.`,
      specialties: ['Product Management', 'Product Roadmapping', 'User Experience', 'Product-Market Fit', 'Feature Prioritization'],
      tools: ['market-analysis', 'competitive-analysis'],
      triggerKeywords: ['product strategy', 'roadmap', 'product management', 'user experience', 'features'],
      priority: 80,
      examples: [
        'Help me create a product roadmap for my mobile app',
        'How do I prioritize features for maximum user impact?',
        'What are the key metrics for measuring product-market fit?'
      ],
      playbook: {
        name: 'Product Strategy Assessment',
        description: 'Comprehensive product strategy evaluation',
        triggers: ['product strategy assessment', 'evaluate my product'],
        steps: [
          {
            id: 'step-1',
            name: 'Market Analysis',
            description: 'Analyze the target market and competitive landscape',
            action: 'use_tool',
            parameters: {
              toolId: 'market-analysis',
              params: { industry: 'technology', region: 'global' }
            }
          },
          {
            id: 'step-2',
            name: 'Competitive Positioning',
            description: 'Evaluate competitive positioning and differentiation',
            action: 'use_tool',
            parameters: {
              toolId: 'competitive-analysis',
              params: { industry: 'technology' }
            }
          },
          {
            id: 'step-3',
            name: 'Strategic Recommendations',
            description: 'Based on the analysis, here are my strategic recommendations for your product',
            action: 'make_recommendation'
          }
        ]
      }
    });
  }

  // Add a new agent template
  addTemplate(template: AgentTemplate): void {
    this.templates.set(template.id, template);
  }

  // Create agent from template
  createAgent(templateId: string, customizations?: Partial<AgentTemplate>): DynamicAgent | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const finalTemplate = customizations ? { ...template, ...customizations } : template;
    const agent = new DynamicAgent(finalTemplate);
    
    this.agents.set(finalTemplate.id, agent);
    return agent;
  }

  // Get all available templates
  getTemplates(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by category
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  // Create custom agent from scratch
  createCustomAgent(config: {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    specialties: string[];
    triggerKeywords: string[];
    priority?: number;
    tools?: string[];
    examples?: string[];
  }): DynamicAgent {
    const template: AgentTemplate = {
      category: 'business',
      priority: 70,
      tools: [],
      examples: [],
      ...config
    };

    this.addTemplate(template);
    return this.createAgent(template.id)!;
  }

  // Export agent configuration
  exportAgent(agentId: string): unknown {
    const template = this.templates.get(agentId);
    if (!template) return null;

    return {
      template,
      created: new Date(),
      version: '1.0'
    };
  }

  // Import agent configuration
  importAgent(config: any): DynamicAgent | null {
    if (!config.template) return null;
    
    this.addTemplate(config.template);
    return this.createAgent(config.template.id);
  }
}

export const agentBuilder = AgentBuilder.getInstance();
