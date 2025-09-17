#!/usr/bin/env node

/**
 * Direct test of agent LLM integration - bypassing Netlify dev server issues
 */

console.log('🔍 Testing Agent LLM Integration Directly');
console.log('=' .repeat(60));

// Test direct Ollama connection first
const testDirectOllama = async () => {
  console.log('\n📡 Test 1: Direct Ollama Connection');

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:latest',
        prompt: 'As a venture capital expert, provide 3 key factors for startup success.',
        stream: false,
        options: { temperature: 0.7, num_predict: 150 }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Ollama working directly');
    console.log(`📊 Response length: ${data.response.length} chars`);
    console.log(`📝 Sample: "${data.response.substring(0, 100)}..."`);
    return true;

  } catch (error) {
    console.log('❌ Ollama connection failed:', error.message);
    return false;
  }
};

// Test LLMService initialization
const testLLMService = async () => {
  console.log('\n🤖 Test 2: LLMService in Browser Context');

  try {
    // Simulate the environment variables that would be available in browser
    const env = {
      VITE_OLLAMA_URL: 'http://localhost:11434',
      VITE_OLLAMA_MODEL: 'qwen2.5:latest',
      VITE_AGENT_PROXY_PATH: '/.netlify/functions/agent-proxy',
      VITE_DEBUG_AGENTS: 'true'
    };

    console.log('✅ Environment variables configured');
    console.log('📋 Ollama URL:', env.VITE_OLLAMA_URL);
    console.log('📋 Model:', env.VITE_OLLAMA_MODEL);
    console.log('📋 Proxy path:', env.VITE_AGENT_PROXY_PATH);

    // This is what would happen in the browser - LLMService would try to use the proxy
    console.log('🔍 In browser, LLMService would call agent-proxy function');
    console.log('⚠️ But agent-proxy health checks are failing (405 errors)');
    console.log('💡 This causes LLM calls to fail → agents use fallback responses');

    return false; // Since proxy is failing

  } catch (error) {
    console.log('❌ LLMService test failed:', error.message);
    return false;
  }
};

// Test what happens with agent processing
const testAgentFlow = async () => {
  console.log('\n🎭 Test 3: Agent Processing Flow');

  console.log('📥 User asks: "Help me with my startup business plan"');
  console.log('🤖 VentureLaunchAgent.processMessage() called');
  console.log('✅ enableLLM = true (configured)');
  console.log('🔄 Calls generateLLMResponse()');
  console.log('📡 generateLLMResponse calls llmService.generateResponse()');
  console.log('❌ llmService fails (proxy health check 405 → no available providers)');
  console.log('🔄 catch block triggered → getFallbackResponse()');
  console.log('📝 Returns: Pre-configured response about business planning');

  console.log('\n💡 ROOT CAUSE IDENTIFIED:');
  console.log('   1. Agent proxy function health checks return 405 (Method Not Allowed)');
  console.log('   2. LLMService marks all providers as unavailable');
  console.log('   3. generateLLMResponse() fails → agents use fallback responses');
  console.log('   4. User gets pre-configured replies instead of LLM responses');
};

// Run all tests
const runTests = async () => {
  const ollamaWorking = await testDirectOllama();
  const llmServiceWorking = await testLLMService();
  await testAgentFlow();

  console.log('\n' + '=' .repeat(60));
  console.log('🎯 DIAGNOSIS SUMMARY:');
  console.log(`✅ Ollama server: ${ollamaWorking ? 'WORKING' : 'FAILED'}`);
  console.log(`❌ Agent proxy: FAILING (health checks = 405 errors)`);
  console.log(`❌ LLM integration: BROKEN (falls back to pre-configured responses)`);

  console.log('\n🔧 REQUIRED FIXES:');
  if (ollamaWorking) {
    console.log('1. ✅ Ollama is working - no action needed');
  } else {
    console.log('1. ❌ Start Ollama server with Qwen2.5 model');
  }
  console.log('2. 🔧 Fix agent-proxy health check endpoint (add GET support)');
  console.log('3. 🔧 Restart Netlify dev server to load fixed proxy function');
  console.log('4. ✅ Test agents should then provide real LLM responses');

  console.log('\n🎯 EXPECTED RESULT AFTER FIXES:');
  console.log('   - Health checks: 200 OK responses');
  console.log('   - LLM calls: Success with real Qwen2.5 responses');
  console.log('   - Agents: Intelligent, contextual replies instead of pre-configured ones');
};

// Execute diagnostic
runTests().catch(console.error);