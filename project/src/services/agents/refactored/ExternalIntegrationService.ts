/**
 * External Integration Service
 * 
 * Properly integrates external files with our agent system
 * This replaces the simplified implementations with the full external functionality
 */

import { AgentTool } from './tools/types';
import { ExternalToolAdapter } from './adapters/ExternalToolAdapter';
import { ExternalProviderAdapter } from './adapters/ExternalProviderAdapter';

// Import external implementations
import { marketAnalysisTool as externalMarketTool } from '../external/tools/marketAnalysisTool';
import { valuationTool as externalValuationTool } from '../external/tools/valuationTool';
import { businessPlanTool as externalBusinessPlanTool } from '../external/tools/businessPlanTool';
import { pitchDeckTool as externalPitchDeckTool } from '../external/tools/pitchDeckTool';
import { kpiDashboardTool as externalKpiDashboardTool } from '../external/tools/kpiDashboardTool';
import { retrievalTool as externalRetrievalTool } from '../external/tools/retrievalTool';

// Import external providers
import { OllamaProvider as ExternalOllamaProvider } from '../external/llm/ollama';
import { VllmProvider as ExternalVllmProvider } from '../external/llm/vllm';

export class ExternalIntegrationService {
  private static instance: ExternalIntegrationService;
  private externalTools: Map<string, AgentTool> = new Map();
  private externalProviders: Map<string, any> = new Map();

  static getInstance(): ExternalIntegrationService {
    if (!ExternalIntegrationService.instance) {
      ExternalIntegrationService.instance = new ExternalIntegrationService();
      ExternalIntegrationService.instance.initializeExternalTools();
      ExternalIntegrationService.instance.initializeExternalProviders();
    }
    return ExternalIntegrationService.instance;
  }

  private initializeExternalTools(): void {
    console.log('🔧 Initializing external tools...');

    // Market Analysis Tool
    const marketTool = new ExternalToolAdapter(
      externalMarketTool,
      'market-analysis-external',
      'Market Analysis (External)',
      'Advanced market analysis with real data and insights',
      'analysis'
    );
    this.externalTools.set('market-analysis-external', marketTool);

    // Valuation Tool
    const valuationTool = new ExternalToolAdapter(
      externalValuationTool,
      'valuation-estimator-external',
      'Valuation Estimator (External)',
      'Advanced valuation with industry multiples and stage adjustments',
      'finance'
    );
    this.externalTools.set('valuation-estimator-external', valuationTool);

    // Business Plan Tool
    const businessPlanTool = new ExternalToolAdapter(
      externalBusinessPlanTool,
      'business-plan-generator-external',
      'Business Plan Generator (External)',
      'Comprehensive business plan generation with industry-specific content',
      'document'
    );
    this.externalTools.set('business-plan-generator-external', businessPlanTool);

    // Pitch Deck Tool
    const pitchDeckTool = new ExternalToolAdapter(
      externalPitchDeckTool,
      'pitch-deck-generator-external',
      'Pitch Deck Generator (External)',
      'Professional pitch deck generation with structured templates',
      'document'
    );
    this.externalTools.set('pitch-deck-generator-external', pitchDeckTool);

    // KPI Dashboard Tool
    const kpiDashboardTool = new ExternalToolAdapter(
      externalKpiDashboardTool,
      'kpi-dashboard-external',
      'KPI Dashboard (External)',
      'Advanced KPI analysis with health scores and recommendations',
      'analysis'
    );
    this.externalTools.set('kpi-dashboard-external', kpiDashboardTool);

    // Retrieval Tool
    const retrievalTool = new ExternalToolAdapter(
      externalRetrievalTool,
      'knowledge-base-search-external',
      'Knowledge Base Search (External)',
      'Advanced semantic search with vector embeddings',
      'information'
    );
    this.externalTools.set('knowledge-base-search-external', retrievalTool);

    console.log(`✅ Initialized ${this.externalTools.size} external tools`);
  }

  private initializeExternalProviders(): void {
    console.log('🔧 Initializing external providers...');

    // Ollama Provider
    const ollamaProvider = new ExternalProviderAdapter(
      new ExternalOllamaProvider(),
      'ollama-external',
      'Ollama (External)',
      ['llama3', 'mistral', 'codellama', 'phi3']
    );
    this.externalProviders.set('ollama-external', ollamaProvider);

    // vLLM Provider
    const vllmProvider = new ExternalProviderAdapter(
      new ExternalVllmProvider(),
      'vllm-external',
      'vLLM (External)',
      ['llama-3-8b-instruct', 'llama-3-70b-instruct', 'mistral-7b-instruct']
    );
    this.externalProviders.set('vllm-external', vllmProvider);

    console.log(`✅ Initialized ${this.externalProviders.size} external providers`);
  }

  getExternalTools(): Map<string, AgentTool> {
    return this.externalTools;
  }

  getExternalProviders(): Map<string, any> {
    return this.externalProviders;
  }

  getExternalTool(toolId: string): AgentTool | undefined {
    return this.externalTools.get(toolId);
  }

  getExternalProvider(providerId: string): unknown {
    return this.externalProviders.get(providerId);
  }

  getAllExternalTools(): AgentTool[] {
    return Array.from(this.externalTools.values());
  }

  getAllExternalProviders(): unknown[] {
    return Array.from(this.externalProviders.values());
  }

  // Get tools for specific agent types with external tools prioritized
  getToolsForAgent(agentId: string): AgentTool[] {
    const agentToolMap: { [key: string]: string[] } = {
      'meta3-research': ['market-analysis-external', 'knowledge-base-search-external'],
      'meta3-investment': ['valuation-estimator-external', 'market-analysis-external', 'knowledge-base-search-external'],
      'meta3-financial': ['valuation-estimator-external', 'kpi-dashboard-external', 'knowledge-base-search-external'],
      'competitive-intelligence': ['market-analysis-external', 'knowledge-base-search-external'],
      'venture-launch': [
        'market-analysis-external', 
        'business-plan-generator-external', 
        'pitch-deck-generator-external', 
        'valuation-estimator-external', 
        'knowledge-base-search-external'
      ],
      'meta3-marketing': ['market-analysis-external', 'knowledge-base-search-external'],
      'meta3-legal': ['knowledge-base-search-external'],
      'meta3-support': ['knowledge-base-search-external'],
      'meta3-local': ['market-analysis-external', 'knowledge-base-search-external'],
      'general-conversation': ['knowledge-base-search-external']
    };

    const toolIds = agentToolMap[agentId] || ['knowledge-base-search-external'];
    return toolIds.map(id => this.externalTools.get(id)).filter(Boolean) as AgentTool[];
  }
}
