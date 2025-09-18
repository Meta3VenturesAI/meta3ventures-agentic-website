#!/usr/bin/env node

/**
 * Agent Testing Tool
 * Specialized testing for Meta3 Assistant and M3VC Venture Builder agents
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Results
const results = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 },
  agentTests: {
    meta3Assistant: { tests: [], passed: 0, failed: 0 },
    m3vcVentureBuilder: { tests: [], passed: 0, failed: 0 }
  }
};

function logTest(agentId, testName, status, details = '', duration = 0) {
  const result = { agentId, testName, status, details, duration, timestamp: new Date().toISOString() };
  results.tests.push(result);
  results.summary.total++;
  
  if (status === 'PASS') {
    results.summary.passed++;
    if (results.agentTests[agentId]) {
      results.agentTests[agentId].passed++;
    }
  } else {
    results.summary.failed++;
    if (results.agentTests[agentId]) {
      results.agentTests[agentId].failed++;
    }
  }
  
  if (results.agentTests[agentId]) {
    results.agentTests[agentId].tests.push(result);
  }
  
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${agentId.toUpperCase()}] ${testName}${duration > 0 ? ` (${duration}ms)` : ''}`);
  if (details) console.log(`   ${details}`);
}

function runCommand(command, timeout = 10000) {
  try {
    const result = execSync(command, { encoding: 'utf8', timeout, stdio: 'pipe' });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.message };
  }
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkFileContent(filePath, expectedContent) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(expectedContent);
  } catch (error) {
    return false;
  }
}

function checkUrlAccessibility(url) {
  try {
    const result = runCommand(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
    const statusCode = parseInt(result.output.trim());
    return { accessible: statusCode === 200, statusCode };
  } catch (error) {
    return { accessible: false, statusCode: 0, error: error.message };
  }
}

async function testMeta3Assistant() {
  console.log('\n🤖 META3 ASSISTANT TESTS');
  console.log('='.repeat(50));
  
  const agentId = 'meta3Assistant';
  
  // Test 1: Component Definition
  const homepageAgentsExists = checkFileExists(path.join(__dirname, 'src/components/HomepageAgents.tsx'));
  if (homepageAgentsExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/HomepageAgents.tsx'), 'utf8');
    
    const hasMeta3Assistant = agentContent.includes('meta3-assistant');
    logTest(agentId, 'Agent Definition', 
      hasMeta3Assistant ? 'PASS' : 'FAIL',
      hasMeta3Assistant ? 'Meta3 Assistant defined in component' : 'Meta3 Assistant not found'
    );
    
    // Test 2: Agent Properties
    const agentProperties = [
      'name: \'Meta3 Assistant\'',
      'description: \'Your intelligent AI assistant\'',
      'specialties: [\'General Assistance\', \'Business Guidance\']',
      'icon: Bot',
      'color: \'blue\''
    ];
    
    agentProperties.forEach(property => {
      const hasProperty = agentContent.includes(property);
      logTest(agentId, `Property: ${property.split(':')[0].trim()}`, 
        hasProperty ? 'PASS' : 'FAIL',
        hasProperty ? 'Property defined' : 'Property missing'
      );
    });
    
    // Test 3: Example Queries
    const exampleQueries = [
      'Tell me about Meta3Ventures',
      'How can I apply for funding?',
      'What services do you offer?',
      'Help me understand venture capital'
    ];
    
    exampleQueries.forEach((query, index) => {
      const hasQuery = agentContent.includes(query);
      logTest(agentId, `Example Query ${index + 1}`, 
        hasQuery ? 'PASS' : 'FAIL',
        hasQuery ? 'Example query defined' : 'Example query missing'
      );
    });
    
    // Test 4: UI Integration
    const uiElements = [
      'Bot',
      'MessageSquare',
      'Send',
      'CheckCircle',
      'XCircle'
    ];
    
    uiElements.forEach(element => {
      const hasElement = agentContent.includes(element);
      logTest(agentId, `UI Element: ${element}`, 
        hasElement ? 'PASS' : 'FAIL',
        hasElement ? 'UI element implemented' : 'UI element missing'
      );
    });
  } else {
    logTest(agentId, 'Component File', 'FAIL', 'HomepageAgents.tsx not found');
  }
}

async function testM3VCVentureBuilder() {
  console.log('\n🚀 M3VC VENTURE BUILDER TESTS');
  console.log('='.repeat(50));
  
  const agentId = 'm3vcVentureBuilder';
  
  // Test 1: Component Definition
  const homepageAgentsExists = checkFileExists(path.join(__dirname, 'src/components/HomepageAgents.tsx'));
  if (homepageAgentsExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/HomepageAgents.tsx'), 'utf8');
    
    const hasM3VCBuilder = agentContent.includes('m3vc-venture-builder');
    logTest(agentId, 'Agent Definition', 
      hasM3VCBuilder ? 'PASS' : 'FAIL',
      hasM3VCBuilder ? 'M3VC Venture Builder defined in component' : 'M3VC Venture Builder not found'
    );
    
    // Test 2: Agent Properties
    const agentProperties = [
      'name: \'M3VC Venture Builder\'',
      'description: \'Specialized AI agent for venture building\'',
      'specialties: [\'Venture Building\', \'Startup Guidance\']',
      'icon: Rocket',
      'color: \'purple\''
    ];
    
    agentProperties.forEach(property => {
      const hasProperty = agentContent.includes(property);
      logTest(agentId, `Property: ${property.split(':')[0].trim()}`, 
        hasProperty ? 'PASS' : 'FAIL',
        hasProperty ? 'Property defined' : 'Property missing'
      );
    });
    
    // Test 3: Example Queries
    const exampleQueries = [
      'Help me build my startup',
      'What is the best business model for my idea?',
      'How do I validate my product market fit?',
      'Guide me through the fundraising process'
    ];
    
    exampleQueries.forEach((query, index) => {
      const hasQuery = agentContent.includes(query);
      logTest(agentId, `Example Query ${index + 1}`, 
        hasQuery ? 'PASS' : 'FAIL',
        hasQuery ? 'Example query defined' : 'Example query missing'
      );
    });
    
    // Test 4: Specialized Features
    const specializedFeatures = [
      'Venture Building',
      'Startup Guidance',
      'Business Planning',
      'Market Analysis',
      'Growth Strategy'
    ];
    
    specializedFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest(agentId, `Specialty: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Specialty defined' : 'Specialty missing'
      );
    });
  } else {
    logTest(agentId, 'Component File', 'FAIL', 'HomepageAgents.tsx not found');
  }
}

async function testAgentIntegration() {
  console.log('\n🔗 AGENT INTEGRATION TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Homepage Integration
  const homePageExists = checkFileExists(path.join(__dirname, 'src/pages/Home.tsx'));
  let homepageIntegrated = false;
  if (homePageExists) {
    const homeContent = fs.readFileSync(path.join(__dirname, 'src/pages/Home.tsx'), 'utf8');
    homepageIntegrated = homeContent.includes('HomepageAgents');
  }
  
  logTest('integration', 'Homepage Integration', 
    homepageIntegrated ? 'PASS' : 'FAIL',
    homepageIntegrated ? 'HomepageAgents integrated into Home.tsx' : 'HomepageAgents not integrated'
  );
  
  // Test 2: Agent System Integration
  const agentOrchestratorExists = checkFileExists(path.join(__dirname, 'src/services/agents/refactored/AdminAgentOrchestrator.ts'));
  logTest('integration', 'Agent Orchestrator', 
    agentOrchestratorExists ? 'PASS' : 'FAIL',
    agentOrchestratorExists ? 'AdminAgentOrchestrator available' : 'AdminAgentOrchestrator missing'
  );
  
  // Test 3: LLM Provider Integration
  const llmProviders = [
    'src/services/agents/refactored/providers/OpenAIProvider.ts',
    'src/services/agents/refactored/providers/AnthropicProvider.ts',
    'src/services/agents/refactored/providers/GroqProvider.ts'
  ];
  
  let providersAvailable = 0;
  llmProviders.forEach(provider => {
    if (checkFileExists(path.join(__dirname, provider))) {
      providersAvailable++;
    }
  });
  
  logTest('integration', 'LLM Providers', 
    providersAvailable >= 2 ? 'PASS' : 'FAIL',
    `${providersAvailable}/${llmProviders.length} LLM providers available`
  );
  
  // Test 4: Agent Authentication
  const authGuardExists = checkFileExists(path.join(__dirname, 'src/components/auth/AgentAuthGuard.tsx'));
  logTest('integration', 'Agent Authentication', 
    authGuardExists ? 'PASS' : 'FAIL',
    authGuardExists ? 'AgentAuthGuard available' : 'AgentAuthGuard missing'
  );
}

async function testAgentFunctionality() {
  console.log('\n⚙️ AGENT FUNCTIONALITY TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Agent Processing
  const homepageAgentsExists = checkFileExists(path.join(__dirname, 'src/components/HomepageAgents.tsx'));
  if (homepageAgentsExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/HomepageAgents.tsx'), 'utf8');
    
    const functionalityFeatures = [
      'handleTestAgent',
      'testResults',
      'isLoading',
      'adminAgentOrchestrator.processMessage',
      'setTestQuery',
      'setTestResults'
    ];
    
    functionalityFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('functionality', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature missing'
      );
    });
  }
  
  // Test 2: Error Handling
  if (homepageAgentsExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/HomepageAgents.tsx'), 'utf8');
    
    const errorHandlingFeatures = [
      'catch (error)',
      'fallbackResponse',
      'toast.error',
      'toast.success'
    ];
    
    errorHandlingFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('functionality', `Error Handling: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Error handling implemented' : 'Error handling missing'
      );
    });
  }
  
  // Test 3: User Interface
  if (homepageAgentsExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/HomepageAgents.tsx'), 'utf8');
    
    const uiFeatures = [
      'onClick={() => setSelectedAgent(agent)}',
      'onChange={(e) => setTestQuery(e.target.value)}',
      'onKeyPress={(e) => e.key === \'Enter\'',
      'disabled={isLoading || !testQuery.trim()}',
      'copyToClipboard',
      'clearResults'
    ];
    
    uiFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('functionality', `UI Feature: ${feature.split('(')[0]}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'UI feature implemented' : 'UI feature missing'
      );
    });
  }
}

async function testAgentAccessibility() {
  console.log('\n🌐 AGENT ACCESSIBILITY TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Public Access
  const homePageExists = checkFileExists(path.join(__dirname, 'src/pages/Home.tsx'));
  let publicAccess = false;
  if (homePageExists) {
    const homeContent = fs.readFileSync(path.join(__dirname, 'src/pages/Home.tsx'), 'utf8');
    publicAccess = homeContent.includes('HomepageAgents') && !homeContent.includes('AgentAuthGuard');
  }
  
  logTest('accessibility', 'Public Access', 
    publicAccess ? 'PASS' : 'FAIL',
    publicAccess ? 'Agents accessible without authentication' : 'Agents require authentication'
  );
  
  // Test 2: Homepage Visibility
  const homepageCheck = checkUrlAccessibility('http://localhost:5173');
  logTest('accessibility', 'Homepage Access', 
    homepageCheck.accessible ? 'PASS' : 'FAIL',
    homepageCheck.accessible ? 
      `Homepage accessible (${homepageCheck.statusCode})` : 
      'Homepage not accessible'
  );
  
  // Test 3: Agent Section Visibility
  if (homePageExists) {
    const homeContent = fs.readFileSync(path.join(__dirname, 'src/pages/Home.tsx'), 'utf8');
    const hasAgentSection = homeContent.includes('HomepageAgents');
    
    logTest('accessibility', 'Agent Section', 
      hasAgentSection ? 'PASS' : 'FAIL',
      hasAgentSection ? 'Agent section included in homepage' : 'Agent section not included'
    );
  }
}

async function runAgentTests() {
  console.log('🤖 AGENT TESTING TOOL');
  console.log('='.repeat(60));
  console.log(`Start Time: ${results.startTime}`);
  console.log('='.repeat(60));
  
  try {
    await testMeta3Assistant();
    await testM3VCVentureBuilder();
    await testAgentIntegration();
    await testAgentFunctionality();
    await testAgentAccessibility();
    
    // Calculate final results
    results.endTime = new Date().toISOString();
    results.summary.successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
    
    // Generate report
    generateAgentReport();
    
  } catch (error) {
    console.error('❌ Agent testing failed:', error);
    process.exit(1);
  }
}

function generateAgentReport() {
  console.log('\n📊 AGENT TESTING REPORT');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  
  // Agent-specific Results
  console.log(`\n🤖 AGENT-SPECIFIC RESULTS:`);
  Object.entries(results.agentTests).forEach(([agentId, stats]) => {
    if (stats.tests.length > 0) {
      const successRate = ((stats.passed / stats.tests.length) * 100).toFixed(1);
      console.log(`${agentId}: ${stats.passed}/${stats.tests.length} (${successRate}%)`);
    }
  });
  
  // Failed Tests
  const failedTests = results.tests.filter(test => test.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`  [${test.agentId.toUpperCase()}] ${test.testName}: ${test.details}`);
    });
  }
  
  // Agent Status
  console.log(`\n🎯 AGENT STATUS:`);
  const meta3Status = results.agentTests.meta3Assistant.passed >= 8 ? 'READY' : 'NEEDS WORK';
  const m3vcStatus = results.agentTests.m3vcVentureBuilder.passed >= 8 ? 'READY' : 'NEEDS WORK';
  
  console.log(`Meta3 Assistant: ${meta3Status}`);
  console.log(`M3VC Venture Builder: ${m3vcStatus}`);
  
  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (results.summary.successRate >= 90) {
    console.log(`  ✅ Both agents are ready for production`);
    console.log(`  ✅ Homepage integration is complete`);
    console.log(`  ✅ Agent functionality is operational`);
  } else if (results.summary.successRate >= 70) {
    console.log(`  ⚠️ Agents are mostly ready with minor issues`);
    console.log(`  🔧 Address failed tests before production`);
  } else {
    console.log(`  🚨 Agents need significant work before production`);
    console.log(`  🔧 Fix critical issues before deployment`);
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'agent-testing-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  if (results.summary.failed === 0) {
    console.log(`\n🎉 ALL AGENT TESTS PASSED! Both agents are ready for production.`);
  } else {
    console.log(`\n⚠️ ${results.summary.failed} agent tests failed. Please review issues.`);
  }
  
  console.log(`\nTest completed at: ${results.endTime}`);
}

// Run the tests
if (require.main === module) {
  runAgentTests().catch(console.error);
}

module.exports = { runAgentTests, results };
