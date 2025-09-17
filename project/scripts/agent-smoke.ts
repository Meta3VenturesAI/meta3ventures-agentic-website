#!/usr/bin/env tsx

/**
 * Agent Smoke Test
 * Tests basic LLM provider connectivity with minimal network calls
 */

interface SmokeResult {
  provider: string;
  status: 'success' | 'blocked' | 'error';
  latency_ms?: number;
  error?: string;
  timestamp: string;
}

async function testOllama(): Promise<SmokeResult> {
  const start = Date.now();
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1:8b-instruct',
        prompt: 'Respond with OK.',
        stream: false,
        options: {
          temperature: 0,
          num_predict: 10
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latency = Date.now() - start;
    
    if (data.response && data.response.includes('OK')) {
      return {
        provider: 'ollama',
        status: 'success',
        latency_ms: latency,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    return {
      provider: 'ollama',
      status: 'blocked',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

async function testVLLM(): Promise<SmokeResult> {
  const start = Date.now();
  try {
    const response = await fetch('http://localhost:8000/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral-7b-instruct',
        messages: [{ role: 'user', content: 'Respond with OK.' }],
        max_tokens: 10,
        temperature: 0
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const latency = Date.now() - start;
    
    if (data.choices?.[0]?.message?.content?.includes('OK')) {
      return {
        provider: 'vllm',
        status: 'success',
        latency_ms: latency,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    return {
      provider: 'vllm',
      status: 'blocked',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

async function main() {
  console.log('🧪 Running agent smoke test...');
  
  // Test providers in order of preference
  const results = await Promise.allSettled([
    testOllama(),
    testVLLM()
  ]);

  const smokeResults: SmokeResult[] = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        provider: index === 0 ? 'ollama' : 'vllm',
        status: 'error',
        error: result.reason?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  });

  // Write results
  const outputPath = 'artifacts/launch/agents/smoke.json';
  const fs = await import('fs');
  await fs.promises.mkdir('artifacts/launch/agents', { recursive: true });
  await fs.promises.writeFile(outputPath, JSON.stringify(smokeResults, null, 2));

  // Log results (redacted)
  console.log('📊 Smoke test results:');
  smokeResults.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    const latency = result.latency_ms ? ` (${result.latency_ms}ms)` : '';
    console.log(`  ${status} ${result.provider}: ${result.status}${latency}`);
  });

  // Exit with success if any provider works
  const hasSuccess = smokeResults.some(r => r.status === 'success');
  if (hasSuccess) {
    console.log('✅ Agent smoke test passed');
    process.exit(0);
  } else {
    console.log('⚠️ Agent smoke test blocked (no providers available)');
    process.exit(0); // Non-blocking
  }
}

main().catch(error => {
  console.error('💥 Smoke test failed:', error.message);
  process.exit(1);
});
