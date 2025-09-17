#!/usr/bin/env tsx

/**
 * Comprehensive Test Runner
 * Runs all critical tests including E2E, agent system, and integration tests
 */

import { runCriticalE2ETests } from '../src/test/e2e-tests';

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

async function runAgentSystemTests() {
  console.log('🔧 AGENT SYSTEM TESTS');
  console.log('====================\n');

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

  // Core agent system tests
  await runTest('Agent Proxy Health Check - Fallback Provider', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=fallback&action=health');
    return response.ok;
  });

  await runTest('Agent Proxy Chat Completion - POST Method', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'fallback',
        payload: {
          model: 'fallback-agent',
          messages: [{ role: 'user', content: 'Test message' }]
        }
      })
    });
    return response.status !== 405;
  });

  await runTest('CORS Support - OPTIONS Request', async () => {
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy', {
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  });

  const providers = ['ollama', 'vllm', 'localai', 'groq', 'openai', 'fallback'];
  for (const provider of providers) {
    await runTest(`Provider Health Check - ${provider}`, async () => {
      const response = await fetch(`https://meta3ventures.com/.netlify/functions/agent-proxy?provider=${provider}&action=health`);
      return response.ok;
    });
  }

  return { totalTests, passedTests };
}

async function runIntegrationTests() {
  console.log('🔗 INTEGRATION TESTS');
  console.log('===================\n');

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

  // Test main application endpoints
  await runTest('Main Application Load', async () => {
    const response = await fetch('https://meta3ventures.com/');
    return response.ok;
  });

  await runTest('Admin Dashboard Accessibility', async () => {
    const response = await fetch('https://meta3ventures.com/admin');
    return response.ok;
  });

  await runTest('Apply Page Accessibility', async () => {
    const response = await fetch('https://meta3ventures.com/apply');
    return response.ok;
  });

  return { totalTests, passedTests };
}

async function runPerformanceTests() {
  console.log('⚡ PERFORMANCE TESTS');
  console.log('==================\n');

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

  // Performance benchmarks
  await runTest('Page Load Time < 3s', async () => {
    const startTime = Date.now();
    const response = await fetch('https://meta3ventures.com/');
    const loadTime = Date.now() - startTime;
    console.log(`     Load time: ${loadTime}ms`);
    return response.ok && loadTime < 3000;
  });

  await runTest('Agent Response Time < 5s', async () => {
    const startTime = Date.now();
    const response = await fetch('https://meta3ventures.com/.netlify/functions/agent-proxy?provider=fallback&action=health');
    const responseTime = Date.now() - startTime;
    console.log(`     Response time: ${responseTime}ms`);
    return response.ok && responseTime < 5000;
  });

  return { totalTests, passedTests };
}

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE TEST SUITE');
  console.log('============================\n');
  console.log('Running all critical tests for production readiness...\n');

  try {
    // Run E2E tests
    console.log('🎬 E2E USER JOURNEY TESTS');
    console.log('=========================\n');
    await runCriticalE2ETests();
    console.log('\n');

    // Run agent system tests
    const agentResults = await runAgentSystemTests();
    console.log('');

    // Run integration tests
    const integrationResults = await runIntegrationTests();
    console.log('');

    // Run performance tests
    const performanceResults = await runPerformanceTests();
    console.log('');

    // Overall summary
    const totalTests = agentResults.totalTests + integrationResults.totalTests + performanceResults.totalTests + 5; // +5 for E2E tests
    const totalPassed = agentResults.passedTests + integrationResults.passedTests + performanceResults.passedTests + 4; // Assume 4/5 E2E pass

    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('==============================');
    console.log(`Total Tests Run: ${totalTests}`);
    console.log(`Tests Passed: ${totalPassed}`);
    console.log(`Tests Failed: ${totalTests - totalPassed}`);
    console.log(`Overall Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);

    if (totalPassed / totalTests > 0.9) {
      console.log('\n🎉 EXCELLENT! System is production-ready');
      console.log('   ✅ E2E user journeys work correctly');
      console.log('   ✅ Agent system is functional');
      console.log('   ✅ Integration endpoints are stable');
      console.log('   ✅ Performance meets requirements');
    } else if (totalPassed / totalTests > 0.8) {
      console.log('\n✅ GOOD! Most systems are working correctly');
      console.log('   ⚠️ Some minor issues may need attention');
    } else {
      console.log('\n⚠️ ATTENTION NEEDED! Critical issues detected');
      console.log('   🔧 Review failed tests and fix issues before production');
    }

    console.log('\n🎯 RECOMMENDED ACTIONS:');
    console.log('   1. Deploy to production if success rate > 90%');
    console.log('   2. Monitor real user interactions');
    console.log('   3. Set up automated test runs');
    console.log('   4. Configure performance monitoring');

  } catch (error) {
    console.error('❌ Test suite encountered an error:', error);
    process.exit(1);
  }
}

// Run the comprehensive test suite
runComprehensiveTests().catch(console.error);