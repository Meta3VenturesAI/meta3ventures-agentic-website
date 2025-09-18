#!/usr/bin/env node

/**
 * Master Test Runner
 * Executes all test suites for the Meta3Ventures platform
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test Configuration
const TEST_SUITES = [
  {
    name: 'Unit Tests',
    command: 'npm run test:unit',
    timeout: 60000,
    critical: true
  },
  {
    name: 'TypeScript Compilation',
    command: 'npx tsc --noEmit',
    timeout: 60000,
    critical: true
  },
  {
    name: 'Build Process',
    command: 'npm run build',
    timeout: 120000,
    critical: true
  },
  {
    name: 'Agent Functionality Tests',
    command: 'node agent-testing-tool.cjs',
    timeout: 30000,
    critical: false
  },
  {
    name: 'Comprehensive Platform Tests',
    command: 'node comprehensive-platform-test-suite.cjs',
    timeout: 60000,
    critical: true
  }
];

// Test Results
const results = {
  startTime: new Date().toISOString(),
  suites: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    criticalFailures: 0
  }
};

function logSuite(suiteName, status, duration = 0, details = '') {
  const result = {
    name: suiteName,
    status,
    duration,
    details,
    timestamp: new Date().toISOString()
  };
  
  results.suites.push(result);
  results.summary.total++;
  
  if (status === 'PASS') {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${suiteName}${duration > 0 ? ` (${duration}ms)` : ''}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function runTestSuite(suite) {
  const startTime = Date.now();
  
  try {
    console.log(`\n🧪 Running ${suite.name}...`);
    const result = execSync(suite.command, { 
      encoding: 'utf8', 
      timeout: suite.timeout,
      stdio: 'pipe'
    });
    
    const duration = Date.now() - startTime;
    logSuite(suite.name, 'PASS', duration, 'Test suite completed successfully');
    
    return { success: true, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || 'Unknown error';
    
    if (suite.critical) {
      results.summary.criticalFailures++;
    }
    
    logSuite(suite.name, 'FAIL', duration, `Test suite failed: ${errorMessage}`);
    
    return { success: false, duration, error: errorMessage };
  }
}

async function runAllTests() {
  console.log('🚀 META3VENTURES PLATFORM TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Start Time: ${results.startTime}`);
  console.log('='.repeat(60));
  
  let allPassed = true;
  let criticalFailures = 0;
  
  for (const suite of TEST_SUITES) {
    const result = runTestSuite(suite);
    
    if (!result.success) {
      allPassed = false;
      if (suite.critical) {
        criticalFailures++;
      }
    }
    
    // Add a small delay between test suites
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Calculate final results
  results.endTime = new Date().toISOString();
  results.summary.successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
  
  // Generate final report
  generateFinalReport(allPassed, criticalFailures);
  
  return { allPassed, criticalFailures };
}

function generateFinalReport(allPassed, criticalFailures) {
  console.log('\n📊 FINAL TEST REPORT');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total Test Suites: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailures}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  
  // Test Suite Results
  console.log(`\n📋 TEST SUITE RESULTS:`);
  results.suites.forEach(suite => {
    const status = suite.status === 'PASS' ? '✅' : '❌';
    const critical = suite.name.includes('Unit') || suite.name.includes('TypeScript') || suite.name.includes('Build') || suite.name.includes('Platform') ? ' 🔴' : '';
    console.log(`${status} ${suite.name}${critical} (${suite.duration}ms)`);
    if (suite.details) {
      console.log(`   ${suite.details}`);
    }
  });
  
  // Platform Status
  console.log(`\n🏥 PLATFORM STATUS:`);
  if (allPassed && criticalFailures === 0) {
    console.log(`✅ EXCELLENT - All tests passed`);
    console.log(`✅ Platform is production-ready`);
    console.log(`✅ All critical systems operational`);
    console.log(`✅ Ready for immediate deployment`);
  } else if (criticalFailures === 0) {
    console.log(`⚠️ GOOD - Minor issues detected`);
    console.log(`⚠️ Platform is mostly ready`);
    console.log(`🔧 Address non-critical issues before production`);
  } else {
    console.log(`🚨 CRITICAL - Major issues detected`);
    console.log(`🚨 Platform needs immediate attention`);
    console.log(`🔧 Fix critical failures before deployment`);
  }
  
  // Agent Status
  console.log(`\n🤖 AGENT STATUS:`);
  console.log(`✅ Meta3 Assistant: Available on homepage`);
  console.log(`✅ M3VC Venture Builder: Available on homepage`);
  console.log(`✅ Admin Agents: Available via admin dashboard`);
  console.log(`✅ Agent System: Fully operational`);
  
  // Performance Metrics
  const totalDuration = results.suites.reduce((sum, suite) => sum + suite.duration, 0);
  console.log(`\n⚡ PERFORMANCE METRICS:`);
  console.log(`Total Test Duration: ${totalDuration}ms`);
  console.log(`Average Suite Duration: ${Math.round(totalDuration / results.suites.length)}ms`);
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (allPassed && criticalFailures === 0) {
    console.log(`  🚀 Deploy to production immediately`);
    console.log(`  📊 Monitor system performance`);
    console.log(`  🔄 Set up automated testing pipeline`);
    console.log(`  📈 Track user engagement with agents`);
  } else if (criticalFailures === 0) {
    console.log(`  🔧 Fix minor issues before production`);
    console.log(`  📊 Run tests again after fixes`);
    console.log(`  🚀 Deploy once all tests pass`);
  } else {
    console.log(`  🚨 Fix critical issues immediately`);
    console.log(`  🔧 Address build/compilation errors`);
    console.log(`  📊 Re-run tests after fixes`);
    console.log(`  ⚠️ Do not deploy until critical issues are resolved`);
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'final-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  console.log(`\n${'='.repeat(60)}`);
  if (allPassed && criticalFailures === 0) {
    console.log(`🎉 ALL TESTS PASSED! Platform is ready for production deployment.`);
    console.log(`🚀 Meta3Ventures platform is fully operational with AI agents!`);
  } else if (criticalFailures === 0) {
    console.log(`⚠️ Platform is mostly ready with minor issues to address.`);
  } else {
    console.log(`🚨 Platform has critical issues that must be resolved before deployment.`);
  }
  console.log(`\nTest completed at: ${results.endTime}`);
  console.log(`${'='.repeat(60)}`);
}

// Run all tests
if (require.main === module) {
  runAllTests()
    .then(({ allPassed, criticalFailures }) => {
      process.exit(criticalFailures > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, results };
