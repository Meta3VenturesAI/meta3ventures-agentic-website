/**
 * Test Runner for Agent Integration
 * 
 * Runs comprehensive tests to verify external file integration
 * and provides detailed reporting on functionality.
 */

import { IntegrationTest } from './IntegrationTest';

export class TestRunner {
  private integrationTest: IntegrationTest;

  constructor() {
    this.integrationTest = new IntegrationTest();
  }

  async runComprehensiveTest(): Promise<void> {
    console.log('🚀 Starting Comprehensive Agent Integration Test...\n');

    // Run all integration tests
    const testResults = await this.integrationTest.runAllTests();
    
    console.log('\n📊 INTEGRATION TEST RESULTS:');
    console.log('================================');
    
    testResults.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${result.test}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.data) {
        console.log(`   Data:`, JSON.stringify(result.data, null, 2));
      }
      console.log('');
    });

    const successRate = (testResults.results.filter(r => r.success).length / testResults.results.length) * 100;
    console.log(`📈 Overall Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`🎯 Tests Passed: ${testResults.results.filter(r => r.success).length}/${testResults.results.length}`);

    // Test specific tool interactions
    console.log('\n🔧 TESTING SPECIFIC TOOL INTERACTIONS:');
    console.log('=====================================');

    await this.testToolInteractions();

    // Test agent interactions
    console.log('\n🤖 TESTING AGENT INTERACTIONS:');
    console.log('==============================');

    await this.testAgentInteractions();

    console.log('\n✅ Comprehensive Test Complete!');
  }

  private async testToolInteractions(): Promise<void> {
    const toolTests = [
      {
        name: 'Market Analysis - AI Industry',
        toolId: 'market-analysis-external',
        params: { industry: 'ai' }
      },
      {
        name: 'Market Analysis - Fintech Industry',
        toolId: 'market-analysis-external',
        params: { industry: 'fintech' }
      },
      {
        name: 'Valuation - AI Startup',
        toolId: 'valuation-estimator-external',
        params: { industry: 'ai', revenue: 10, growth: 0.5 }
      },
      {
        name: 'Valuation - Fintech Startup',
        toolId: 'valuation-estimator-external',
        params: { industry: 'fintech', revenue: 5, growth: 0.3 }
      },
      {
        name: 'Business Plan - AI Company',
        toolId: 'business-plan-generator-external',
        params: { 
          company: 'TestAI Corp', 
          industry: 'ai', 
          product: 'AI-powered analytics platform' 
        }
      },
      {
        name: 'Pitch Deck - SaaS Startup',
        toolId: 'pitch-deck-generator-external',
        params: { 
          company: 'SaaS Solutions Inc', 
          industry: 'saas', 
          product: 'Cloud-based project management',
          traction: '1000+ active users, $50K MRR'
        }
      },
      {
        name: 'KPI Dashboard - Growth Stage',
        toolId: 'kpi-dashboard-external',
        params: { 
          arr: 2, 
          growth: 0.25, 
          churn: 0.05, 
          cac: 2000, 
          runway: 18 
        }
      },
      {
        name: 'Knowledge Search - Funding',
        toolId: 'knowledge-base-search-external',
        params: { 
          query: 'startup funding stages',
          topK: 3
        }
      }
    ];

    for (const test of toolTests) {
      try {
        console.log(`\n🔍 Testing: ${test.name}`);
        const result = await this.integrationTest.testSpecificTool(test.toolId, test.params);
        
        if (result.success) {
          console.log(`   ✅ Success`);
          if (result.data) {
            console.log(`   📊 Result:`, JSON.stringify(result.data, null, 2));
          }
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async testAgentInteractions(): Promise<void> {
    const agentTests = [
      {
        agentId: 'venture-launch',
        message: 'I need help launching my AI startup'
      },
      {
        agentId: 'meta3-investment',
        message: 'What is the valuation for my fintech company?'
      },
      {
        agentId: 'meta3-research',
        message: 'Analyze the AI market for me'
      },
      {
        agentId: 'meta3-financial',
        message: 'Review my startup KPIs'
      }
    ];

    for (const test of agentTests) {
      try {
        console.log(`\n🤖 Testing Agent: ${test.agentId}`);
        console.log(`   Message: "${test.message}"`);
        
        const result = await this.integrationTest.testAgentInteraction(test.agentId, test.message);
        
        if (result.success) {
          console.log(`   ✅ Agent configured correctly`);
          if (result.data) {
            console.log(`   🛠️  Available Tools: ${(result.data as any).toolCount}`);
            console.log(`   📋 Tools: ${(result.data as any).availableTools.map((t: any) => t.name).join(', ')}`);
          }
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async runQuickTest(): Promise<boolean> {
    console.log('⚡ Running Quick Integration Test...');
    
    try {
      const testResults = await this.integrationTest.runAllTests();
      const success = testResults.results.every(r => r.success);
      
      if (success) {
        console.log('✅ Quick test passed - all systems operational');
      } else {
        console.log('❌ Quick test failed - some systems have issues');
        testResults.results.forEach((result, index) => {
          if (!result.success) {
            console.log(`   ❌ Test ${index + 1}: ${result.test} - ${result.error}`);
          }
        });
      }
      
      return success;
    } catch (error) {
      console.log('❌ Quick test error:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}
