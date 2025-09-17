/**
 * Integration Test for External Files
 * 
 * Tests the actual integration of external files with our agent system
 * to ensure they work correctly in real agent interactions.
 */

import { ExternalIntegrationService } from '../ExternalIntegrationService';
import { agentToolsSystem } from '../AgentToolsSystem';

export class IntegrationTest {
  private externalService: ExternalIntegrationService;
  private toolsSystem: typeof agentToolsSystem;

  constructor() {
    this.externalService = ExternalIntegrationService.getInstance();
    this.toolsSystem = agentToolsSystem;
  }

  async runAllTests(): Promise<{
    success: boolean;
    results: Array<{
      test: string;
      success: boolean;
      error?: string;
      data?: unknown;
    }>;
  }> {
    const results: Array<{
      test: string;
      success: boolean;
      error?: string;
      data?: unknown;
    }> = [];

    console.log('🧪 Starting Integration Tests...');

    // Test 1: External Tool Loading
    try {
      const tools = this.externalService.getAllExternalTools();
      results.push({
        test: 'External Tool Loading',
        success: tools.length > 0,
        data: { toolCount: tools.length, toolIds: tools.map(t => t.id) }
      });
    } catch (error) {
      results.push({
        test: 'External Tool Loading',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Market Analysis Tool
    try {
      const marketTool = this.externalService.getExternalTool('market-analysis-external');
      if (marketTool) {
        const result = await marketTool.execute({ industry: 'ai' });
        results.push({
          test: 'Market Analysis Tool',
          success: result.success !== false,
          data: result
        });
      } else {
        results.push({
          test: 'Market Analysis Tool',
          success: false,
          error: 'Tool not found'
        });
      }
    } catch (error) {
      results.push({
        test: 'Market Analysis Tool',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Valuation Tool
    try {
      const valuationTool = this.externalService.getExternalTool('valuation-estimator-external');
      if (valuationTool) {
        const result = await valuationTool.execute({ 
          industry: 'ai', 
          revenue: 5, 
          growth: 0.3 
        });
        results.push({
          test: 'Valuation Tool',
          success: result.success !== false,
          data: result
        });
      } else {
        results.push({
          test: 'Valuation Tool',
          success: false,
          error: 'Tool not found'
        });
      }
    } catch (error) {
      results.push({
        test: 'Valuation Tool',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 4: Agent Tool Mapping
    try {
      const ventureLaunchTools = this.externalService.getToolsForAgent('venture-launch');
      results.push({
        test: 'Agent Tool Mapping',
        success: ventureLaunchTools.length > 0,
        data: { 
          agentId: 'venture-launch',
          toolCount: ventureLaunchTools.length,
          toolIds: ventureLaunchTools.map(t => t.id)
        }
      });
    } catch (error) {
      results.push({
        test: 'Agent Tool Mapping',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: External Provider Loading
    try {
      const providers = this.externalService.getAllExternalProviders();
      results.push({
        test: 'External Provider Loading',
        success: providers.length > 0,
        data: { 
          providerCount: providers.length,
          providerIds: providers.map(p => p.id)
        }
      });
    } catch (error) {
      results.push({
        test: 'External Provider Loading',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 6: Tool System Integration
    try {
      const externalTools = this.externalService.getAllExternalTools();
      results.push({
        test: 'Tool System Integration',
        success: externalTools.length > 0,
        data: { 
          externalTools: externalTools.length,
          externalToolIds: externalTools.map((t: any) => t.id)
        }
      });
    } catch (error) {
      results.push({
        test: 'Tool System Integration',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    const success = results.every(r => r.success);
    
    console.log('🧪 Integration Tests Complete:', {
      success,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      total: results.length
    });

    return { success, results };
  }

  async testSpecificTool(toolId: string, params: any): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }> {
    try {
      const tool = this.externalService.getExternalTool(toolId);
      if (!tool) {
        return {
          success: false,
          error: `Tool ${toolId} not found`
        };
      }

      const result = await tool.execute(params);
      return {
        success: result.success !== false,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testAgentInteraction(agentId: string, message: string): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }> {
    try {
      const tools = this.externalService.getToolsForAgent(agentId);
      const availableTools = tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description
      }));

      return {
        success: true,
        data: {
          agentId,
          message,
          availableTools,
          toolCount: tools.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
