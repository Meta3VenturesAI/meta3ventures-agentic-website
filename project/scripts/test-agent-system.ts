#!/usr/bin/env tsx

/**
 * Comprehensive Agent System Test
 * Tests all aspects of the agent system after fixes
 */

// Mock environment for Node.js
if (typeof import.meta === 'undefined') {
  (global as unknown).import = {
    meta: {
      env: {
        DEV: false,
        PROD: true
      }
    }
  };
}

async function testAgentSystem() {
  console.log('🧪 COMPREHENSIVE AGENT SYSTEM TEST\n');
  console.log('Testing all fixes and enhancements...\n');

  let totalTests = 0;
  let passedTests = 0;

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    totalTests++;
    console.log(`🔍 Testing: ${testName}`);
    try {
      const result = await testFn();
      if (result) {
        console.log(`   ✅ PASS\n`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL\n`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  };

  // Test 1: Agent Proxy Health Check (GET requests)
  await runTest('Agent Proxy Health Check - Fallback Provider', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=fallback&action=health');
    return response.ok;
  });

  await runTest('Agent Proxy Health Check - Ollama Provider', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=ollama&action=health');
    const data = await response.json();
    // Should return 200 but with configured: false
    return response.ok && data.provider === 'ollama';
  });

  // Test 2: Agent Proxy Chat Completion (POST requests)
  await runTest('Agent Proxy Chat Completion - POST Method', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'fallback',
        payload: {
          model: 'fallback-agent',
          messages: [{ role: 'user', content: 'Hello' }]
        }
      })
    });
    return response.status !== 405; // Should not be "Method not allowed"
  });

  // Test 3: Provider Detection Service
  await runTest('Provider Detection Service - Fallback Always Available', async () => {
    // This test would require importing the service, which has Node.js compatibility issues
    // For now, we'll test the concept by checking if the endpoint responds correctly
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=fallback&action=health');
    const data = await response.json();
    return data.success === true && data.provider === 'fallback';
  });

  // Test 4: Multiple Provider Health Checks
  const providers = ['ollama', 'vllm', 'localai', 'groq', 'openai', 'fallback'];
  for (const provider of providers) {
    await runTest(`Provider Health Check - ${provider}`, async () => {
      const response = await fetch(`https://meta3ventures.com/.netlify/functions/agent-proxy?provider=${provider}&action=health`);
      return response.ok; // Should return 200 regardless of configuration
    });
  }

  // Test 5: CORS and Method Support
  await runTest('CORS Support - OPTIONS Request', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  });

  await runTest('Method Support - GET Allowed', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=fallback&action=health');
    return response.status !== 405;
  });

  await runTest('Method Support - POST Allowed', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'fallback', payload: { model: 'test', messages: [] } })
    });
    return response.status !== 405;
  });

  // Test 6: Error Handling
  await runTest('Error Handling - Missing Provider Parameter', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?action=health');
    return response.status === 400;
  });

  await runTest('Error Handling - Invalid Action', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=test&action=invalid');
    return response.status === 400;
  });

  await runTest('Error Handling - Missing POST Body', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return response.status === 400;
  });

  // Summary
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('   The agent system fixes are working correctly.');
    console.log('   Admin dashboard should now show proper provider status.');
    console.log('   VirtualAssistant should be functional with fallback responses.');
  } else if (passedTests > totalTests * 0.8) {
    console.log('\n✅ MOSTLY WORKING!');
    console.log('   Most fixes are working correctly.');
    console.log('   Some providers may need additional configuration.');
  } else {
    console.log('\n⚠️ ISSUES DETECTED!');
    console.log('   Some critical fixes may not be working properly.');
    console.log('   Check the failed tests above for details.');
  }

  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Test the admin dashboard in your browser');
  console.log('   2. Try the VirtualAssistant chat widget');
  console.log('   3. Check provider status in admin panel');
  console.log('   4. Configure additional LLM providers if needed');
}

testAgentSystem().catch(console.error);
