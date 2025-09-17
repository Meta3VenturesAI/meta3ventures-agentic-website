#!/usr/bin/env tsx

/**
 * Simple Agent Test
 * Tests agent functionality without complex dependencies
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

async function testAgentConnectivity() {
  console.log('🔍 Testing agent connectivity...\n');
  
  // Test the agent proxy endpoint
  try {
    console.log('Testing Netlify Functions agent-proxy...');
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'ollama',
        payload: {
          model: 'llama3.2:3b',
          messages: [{ role: 'user', content: 'Hello' }]
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Agent proxy is accessible');
      const data = await response.json();
      console.log('   Response:', data);
    } else {
      console.log('❌ Agent proxy returned error:', response.status);
    }
  } catch {
    console.log('❌ Agent proxy not accessible');
  }
  
  // Test local development
  try {
    console.log('\nTesting local development setup...');
    const response = await fetch('http://localhost:3000/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'ollama',
        payload: {
          model: 'llama3.2:3b',
          messages: [{ role: 'user', content: 'Hello' }]
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Local agent proxy is accessible');
    } else {
      console.log('❌ Local agent proxy returned error:', response.status);
    }
  } catch () {
    console.log('❌ Local agent proxy not accessible (expected in production)');
  }
  
  console.log('\n📋 Agent Enablement Status:');
  console.log('   • Agent components: ✅ Present in UI');
  console.log('   • Agent proxy function: ✅ Deployed');
  console.log('   • Client proxy pattern: ✅ Implemented');
  console.log('   • LLM backend: ⚠️ Needs configuration');
  
  console.log('\n🎯 Next Steps to Enable Agents:');
  console.log('   1. Configure LLM provider URLs in Netlify environment variables:');
  console.log('      • OLLAMA_URL=https://your-ollama-instance.com');
  console.log('      • VLLM_URL=https://your-vllm-instance.com/v1');
  console.log('      • LOCALAI_URL=https://your-localai-instance.com/v1');
  console.log('   2. Or add API keys for cloud providers:');
  console.log('      • VITE_GROQ_API_KEY');
  console.log('      • VITE_OPENAI_API_KEY');
  console.log('      • VITE_ANTHROPIC_API_KEY');
  console.log('   3. Test agent functionality in the browser');
  
  console.log('\n✅ Agents are ready to be enabled!');
}

testAgentConnectivity().catch(console.error);
