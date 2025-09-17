/**
 * Shared type definitions for agent tools and providers.
 */

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: unknown;
  execute: (params: unknown) => Promise<any>;
}