#!/usr/bin/env node

// Simple test script to validate agent functionality
import { adminAgentOrchestrator } from './src/services/agents/refactored/AdminAgentOrchestrator.js';

async function testAgentSystem() {
  console.log('🚀 Testing Meta3Ventures Agent System...\n');
  
  try {
    // Test 1: Investment Query
    console.log('📊 Test 1: Investment Query');
    const investmentResponse = await adminAgentOrchestrator.processMessage(
      'I want to learn about your investment criteria and funding process',
      'test-user-1'
    );
    console.log('✅ Investment Agent Response:', investmentResponse.content.substring(0, 200) + '...');
    console.log('🎯 Agent Used:', investmentResponse.agentId);
    console.log('⏱️  Processing Time:', investmentResponse.metadata?.processingTime + 'ms\n');

    // Test 2: Research Query  
    console.log('🔍 Test 2: Research Query');
    const researchResponse = await adminAgentOrchestrator.processMessage(
      'Can you provide market analysis for AI startups and competitive landscape?',
      'test-user-2'
    );
    console.log('✅ Research Agent Response:', researchResponse.content.substring(0, 200) + '...');
    console.log('🎯 Agent Used:', researchResponse.agentId);
    console.log('⏱️  Processing Time:', researchResponse.metadata?.processingTime + 'ms\n');

    // Test 3: General Company Query
    console.log('🏢 Test 3: General Company Query');
    const companyResponse = await adminAgentOrchestrator.processMessage(
      'Tell me about Meta3Ventures and your team',
      'test-user-3'
    );
    console.log('✅ Primary Agent Response:', companyResponse.content.substring(0, 200) + '...');
    console.log('🎯 Agent Used:', companyResponse.agentId);
    console.log('⏱️  Processing Time:', companyResponse.metadata?.processingTime + 'ms\n');

    // Test 4: System Statistics
    console.log('📈 Test 4: System Statistics');
    const stats = adminAgentOrchestrator.getSystemStats();
    console.log('✅ System Stats:', JSON.stringify(stats, null, 2));

    // Test 5: Agent List
    console.log('\n🤖 Test 5: Available Agents');
    const agents = adminAgentOrchestrator.getAgentList();
    agents.forEach(agent => {
      console.log(`✅ ${agent.name} (${agent.id}): ${agent.specialties.join(', ')}`);
    });

    console.log('\n🎉 All Agent Tests Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Agent Test Failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testAgentSystem().catch(console.error);