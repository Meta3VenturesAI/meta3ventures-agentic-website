#!/usr/bin/env tsx

/**
 * Agent Enablement Script
 * Enables agents by testing all available LLM providers and configuring the best available ones
 */

import { llmService } from '../src/services/agents/refactored/LLMService';

interface ProviderStatus {
  id: string;
  name: string;
  available: boolean;
  models: string[];
  latency?: number;
  error?: string;
}

async function testAllProviders(): Promise<ProviderStatus[]> {
  console.log('🔍 Testing all available LLM providers...');
  
  const providers = await llmService.getAvailableProviders();
  const results: ProviderStatus[] = [];
  
  for (const provider of providers) {
    console.log(`  Testing ${provider.name}...`);
    const start = Date.now();
    
    try {
      const isAvailable = await llmService.testLLMProvider(provider.id);
      const latency = Date.now() - start;
      
      results.push({
        id: provider.id,
        name: provider.name,
        available: isAvailable,
        models: provider.models,
        latency: isAvailable ? latency : undefined,
        error: isAvailable ? undefined : 'Provider not available'
      });
      
      if (isAvailable) {
        console.log(`    ✅ ${provider.name} - Available (${latency}ms)`);
      } else {
        console.log(`    ❌ ${provider.name} - Not available`);
      }
    } catch (error) {
      results.push({
        id: provider.id,
        name: provider.name,
        available: false,
        models: provider.models,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.log(`    ❌ ${provider.name} - Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return results;
}

async function enableAgents(): Promise<void> {
  console.log('🚀 Enabling Meta3 AI Agents...\n');
  
  // Test all providers
  const providerStatuses = await testAllProviders();
  
  // Find available providers
  const availableProviders = providerStatuses.filter(p => p.available);
  const unavailableProviders = providerStatuses.filter(p => !p.available);
  
  console.log('\n📊 Provider Status Summary:');
  console.log(`  ✅ Available: ${availableProviders.length}`);
  console.log(`  ❌ Unavailable: ${unavailableProviders.length}`);
  
  if (availableProviders.length > 0) {
    console.log('\n🎯 Available Providers:');
    availableProviders.forEach(provider => {
      console.log(`  • ${provider.name} (${provider.id}) - ${provider.latency}ms`);
      console.log(`    Models: ${provider.models.slice(0, 3).join(', ')}${provider.models.length > 3 ? '...' : ''}`);
    });
    
    console.log('\n✅ Agents are now ENABLED!');
    console.log('   The VirtualAssistant and other agent components should now be functional.');
    
    // Save status for reference
    const fs = await import('fs');
    await fs.promises.mkdir('artifacts/launch/agents', { recursive: true });
    await fs.promises.writeFile(
      'artifacts/launch/agents/enabled_providers.json',
      JSON.stringify(availableProviders, null, 2)
    );
    
  } else {
    console.log('\n⚠️ No LLM providers are currently available.');
    console.log('   To enable agents, you need to:');
    console.log('   1. Set up API keys for cloud providers (Groq, OpenAI, Anthropic, etc.)');
    console.log('   2. Or configure local providers (Ollama, vLLM, LocalAI)');
    console.log('   3. Or deploy the Netlify Functions agent-proxy with backend URLs');
    
    console.log('\n📋 Required Environment Variables:');
    console.log('   For Cloud Providers:');
    console.log('   • VITE_GROQ_API_KEY');
    console.log('   • VITE_OPENAI_API_KEY');
    console.log('   • VITE_ANTHROPIC_API_KEY');
    console.log('   • VITE_DEEPSEEK_API_KEY');
    console.log('   • VITE_COHERE_API_KEY');
    console.log('   • VITE_HUGGINGFACE_API_KEY');
    
    console.log('\n   For Netlify Functions (agent-proxy):');
    console.log('   • OLLAMA_URL');
    console.log('   • VLLM_URL');
    console.log('   • LOCALAI_URL');
  }
  
  // Show unavailable providers for debugging
  if (unavailableProviders.length > 0) {
    console.log('\n🔍 Unavailable Providers:');
    unavailableProviders.forEach(provider => {
      console.log(`  • ${provider.name} (${provider.id}) - ${provider.error}`);
    });
  }
}

async function main() {
  try {
    await enableAgents();
    process.exit(0);
  } catch (error) {
    console.error('💥 Agent enablement failed:', error);
    process.exit(1);
  }
}

main();
