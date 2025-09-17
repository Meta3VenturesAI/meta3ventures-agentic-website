/**
 * Enhanced Agent Tool Types
 * Based on external implementation but adapted for our system
 */

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'analysis' | 'communication' | 'data' | 'calculation' | 'external' | 'document' | 'finance' | 'information';
  parameters: {
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
  };
  execute: (params: unknown) => Promise<any>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: {
    processingTime?: number;
    source?: string;
    confidence?: number;
  };
}
