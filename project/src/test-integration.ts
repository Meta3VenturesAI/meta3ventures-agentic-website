/**
 * Integration Test Script
 * 
 * Run this script to test the external file integration
 * Usage: npm run test:integration
 */

import { TestRunner } from './services/agents/refactored/test/TestRunner';

async function runIntegrationTest() {
  console.log('🧪 Meta3Ventures Agent Integration Test');
  console.log('=====================================\n');

  const testRunner = new TestRunner();
  
  try {
    // Run comprehensive test
    await testRunner.runComprehensiveTest();
    
    console.log('\n🎉 Integration test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
runIntegrationTest();
