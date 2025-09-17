#!/usr/bin/env node

/**
 * Debug Agent LLM Flow - Trace exactly what happens when agents try to use LLMs
 */

console.log('🔍 DEBUGGING AGENT LLM FLOW');
console.log('=' .repeat(60));

// Test 1: Check if LLM Service can be loaded
console.log('\n1. Testing LLM Service Import...');

try {
    // This simulates what happens in the browser
    console.log('✅ Would import LLMService from browser context');
    console.log('📍 File: src/services/agents/refactored/LLMService.ts');

    // Test 2: Check fallback chain priority
    console.log('\n2. Testing Fallback Chain...');
    const fallbackChain = ['ollama', 'deepseek', 'groq', 'huggingface', 'localai', 'openai', 'anthropic', 'cohere', 'replicate'];
    console.log('📋 Provider Priority:', fallbackChain);

    // Test 3: Check what happens with Ollama provider
    console.log('\n3. Testing Ollama Provider...');
    console.log('🔗 Expected baseUrl:', 'http://localhost:11434');
    console.log('🤖 Expected model:', 'qwen2.5:latest');

    // Test 4: Simulate the actual agent flow
    console.log('\n4. Simulating Agent LLM Request Flow...');
    console.log('📥 Agent calls: llmService.generateResponse()');
    console.log('🔍 LLMService looks for provider supporting: qwen2.5:latest');
    console.log('🎯 Should find: Ollama provider');
    console.log('📡 Should call: OllamaProvider.generateResponse()');
    console.log('🌐 Should POST to: http://localhost:11434/api/generate');

    // Test 5: Check what would happen if Ollama fails
    console.log('\n5. Fallback Behavior...');
    console.log('❌ If Ollama fails → Try DeepSeek (needs API key)');
    console.log('❌ If DeepSeek fails → Try Groq (needs API key)');
    console.log('❌ If all fail → Use FallbackAgentService');

    console.log('\n6. Expected vs Actual Behavior...');
    console.log('🎯 EXPECTED: Agent gets LLM response from Qwen2.5');
    console.log('⚠️ ACTUAL: Agent falls back to pre-configured responses');
    console.log('🐛 LIKELY ISSUE: LLM providers failing, triggering fallback mode');

    console.log('\n7. Diagnostic Questions...');
    console.log('❓ Is llmService.generateResponse() actually being called?');
    console.log('❓ Are all LLM providers failing health checks?');
    console.log('❓ Is the agent using fallback responses instead of LLM?');
    console.log('❓ Are there errors in the browser console?');

} catch (error) {
    console.log('❌ Failed to analyze LLM flow:', error.message);
}

console.log('\n' + '=' .repeat(60));
console.log('🧪 NEXT STEPS TO DEBUG:');
console.log('1. Check browser console at: http://localhost:3000/manual-agent-test.html');
console.log('2. Look for LLM-related errors when testing agents');
console.log('3. Verify if generateLLMResponse() is being called');
console.log('4. Check if agents are hitting try/catch fallback blocks');
console.log('5. Confirm agent proxy function is working correctly');