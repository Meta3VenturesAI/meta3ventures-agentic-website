#!/usr/bin/env node

/**
 * Test script to validate the agent system is working properly
 */

const { adminAgentOrchestrator } = require('./src/services/agents/refactored/AdminAgentOrchestrator.ts');

async function testAgentSystem() {
  console.log('🧪 Testing Agent System...\n');
  
  try {
    // Test 1: Check agent loading
    console.log('📋 Available Agents:');
    const agents = adminAgentOrchestrator.getAgentList();
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.id})`);
      console.log(`   Specialties: ${agent.specialties.join(', ')}\n`);
    });
    
    // Test 2: Test agent routing with different messages
    const testMessages = [
      'Hello',
      'I need help with my API integration',
      'What is Meta3Ventures about?',
      'I want to apply for funding',
      'I need marketing advice for my startup',
      'Help me with financial projections',
      'What are the legal requirements for startups?',
      'I want to expand to a new market locally'
    ];
    
    console.log('🎯 Testing Agent Routing:');
    for (const message of testMessages) {
      try {
        console.log(`\nMessage: "${message}"`);
        const response = await adminAgentOrchestrator.processMessage(message, 'test-user');
        console.log(`Agent: ${response.agentId}`);
        console.log(`Response: ${response.content.substring(0, 100)}...`);
        console.log(`Confidence: ${response.metadata?.confidence || 'N/A'}`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    // Test 3: System diagnostics
    console.log('\n🔍 System Diagnostics:');
    const diagnostics = await adminAgentOrchestrator.performSystemDiagnostics();
    console.log(JSON.stringify(diagnostics, null, 2));
    
    // Test 4: LLM Providers
    console.log('\n🤖 LLM Providers:');
    const providers = await adminAgentOrchestrator.getLLMProviders();
    providers.forEach(provider => {
      console.log(`${provider.name}: ${provider.available ? '✅' : '❌'}`);
      console.log(`  Models: ${provider.models.slice(0, 3).join(', ')}${provider.models.length > 3 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAgentSystem();