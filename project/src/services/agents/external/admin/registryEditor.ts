import * as fs from 'fs';
import * as yaml from 'yaml';

/**
 * registryEditor
 *
 * Utility functions for loading, updating and saving the agent registry
 * YAML file.  These functions should be invoked from the admin
 * dashboard to allow non‑technical users to manage agent definitions.
 *
 * Note: in a browser environment you will need to provide alternative
 * implementations for file I/O.
 */

export interface AgentDefinition {
  id: string;
  name: string;
  model_backends: { primary: string; fallback: string };
  capabilities: string[];
  tools: string[];
  prompt_file: string;
}

export interface RegistryData {
  agents: AgentDefinition[];
}

export function loadRegistry(path: string): RegistryData {
  const content = fs.readFileSync(path, 'utf-8');
  return yaml.parse(content);
}

export function updateAgent(registry: RegistryData, agentId: string, updates: Partial<AgentDefinition>): RegistryData {
  const idx = registry.agents.findIndex(a => a.id === agentId);
  if (idx === -1) throw new Error(`Agent '${agentId}' not found`);
  registry.agents[idx] = { ...registry.agents[idx], ...updates } as AgentDefinition;
  return registry;
}

export function saveRegistry(path: string, registry: RegistryData): void {
  const yamlStr = yaml.stringify(registry);
  fs.writeFileSync(path, yamlStr, 'utf-8');
}