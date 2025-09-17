/**
 * External Tool Adapter
 * 
 * Bridges external tool implementations with our internal AgentTool interface
 * This allows us to use the full external tool functionality while maintaining
 * compatibility with our existing agent system.
 */

import { AgentTool } from '../tools/types';

// Import external tool types
import type { AgentTool as ExternalTool } from '../../external/types';

export class ExternalToolAdapter implements AgentTool {
  constructor(
    private externalTool: ExternalTool,
    private toolId: string,
    private toolName: string,
    private toolDescription: string,
    private toolCategory: 'research' | 'analysis' | 'communication' | 'data' | 'calculation' | 'external' | 'document' | 'finance' | 'information'
  ) {}

  get id(): string {
    return this.toolId;
  }

  get name(): string {
    return this.toolName;
  }

  get description(): string {
    return this.toolDescription;
  }

  get category(): 'research' | 'analysis' | 'communication' | 'data' | 'calculation' | 'external' | 'document' | 'finance' | 'information' {
    return this.toolCategory;
  }

  get parameters(): {
    type: 'object';
    properties: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'integer';
        description: string;
        required?: boolean;
        default?: unknown;
      };
    };
    required?: string[];
  } {
    // Convert external tool parameters to our format
    const properties: unknown = {};
    const required: string[] = [];

    if (this.externalTool.parameters && this.externalTool.parameters.properties) {
      for (const [key, param] of Object.entries(this.externalTool.parameters.properties)) {
        const paramObj = param as unknown; // Type assertion for external tool parameters
        properties[key] = {
          type: paramObj.type || 'string',
          description: paramObj.description || '',
          required: paramObj.required || false,
          default: paramObj.default
        };

        if (paramObj.required) {
          required.push(key);
        }
      }
    }

    return {
      type: 'object',
      properties,
      required
    };
  }

  async execute(params: unknown): Promise<any> {
    try {
      // Call the external tool's execute method
      const result = await this.externalTool.execute(params);
      
      // Ensure the result is in our expected format
      return {
        success: true,
        data: result,
        metadata: {
          source: 'external-tool',
          toolId: this.toolId,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`External tool ${this.toolId} execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          source: 'external-tool',
          toolId: this.toolId,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}
