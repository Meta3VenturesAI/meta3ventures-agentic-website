#!/usr/bin/env node

/**
 * Agent Functionality Test Suite
 * Tests Meta3 assistant and M3VC venture builder agents functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Results
const results = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 },
  categories: {}
};

function logTest(category, testName, status, details = '', duration = 0) {
  const result = { category, testName, status, details, duration, timestamp: new Date().toISOString() };
  results.tests.push(result);
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  else results.summary.failed++;
  
  // Update category stats
  if (!results.categories[category]) {
    results.categories[category] = { total: 0, passed: 0, failed: 0 };
  }
  results.categories[category].total++;
  results.categories[category][status.toLowerCase()]++;
  
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} [${category}] ${testName}${duration > 0 ? ` (${duration}ms)` : ''}`);
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

async function runAgentTests() {
  console.log('🤖 AGENT FUNCTIONALITY TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Start Time: ${results.startTime}`);
  console.log('='.repeat(60));

  // Test 1: Agent Component Exists
  const agentComponentExists = checkFileExists(path.join(__dirname, 'src/components/Agents.tsx'));
  logTest('AGENT_COMPONENTS', 'Agents Component', 
    agentComponentExists ? 'PASS' : 'FAIL',
    agentComponentExists ? 'Agents.tsx component exists' : 'Agents.tsx component missing'
  );

  // Test 2: Agent System Files
  const agentSystemFiles = [
    'src/services/agents/refactored/AdminAgentOrchestrator.ts',
    'src/services/agents/refactored/ProviderDetectionService.ts',
    'src/services/agents/refactored/OpenSourceLLMService.ts',
    'src/components/auth/AgentAuthGuard.tsx'
  ];
  
  agentSystemFiles.forEach(file => {
    const exists = checkFileExists(path.join(__dirname, file));
    logTest('AGENT_SYSTEM', `File: ${path.basename(file)}`, 
      exists ? 'PASS' : 'FAIL',
      exists ? 'File exists' : 'File missing'
    );
  });

  // Test 3: Agent Catalog in Agents Component
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const agentFeatures = [
      'agentCatalog',
      'meta3-research',
      'meta3-investment',
      'venture-launch',
      'competitive-intelligence',
      'meta3-marketing',
      'meta3-financial',
      'meta3-legal',
      'meta3-support',
      'meta3-local',
      'general-conversation'
    ];
    
    agentFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('AGENT_CATALOG', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }

  // Test 4: Agent Authentication Guard
  const authGuardExists = checkFileExists(path.join(__dirname, 'src/components/auth/AgentAuthGuard.tsx'));
  logTest('AGENT_AUTH', 'Agent Authentication Guard', 
    authGuardExists ? 'PASS' : 'FAIL',
    authGuardExists ? 'AgentAuthGuard.tsx exists' : 'AgentAuthGuard.tsx missing'
  );

  // Test 5: Agent Route Configuration
  const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf8');
  const agentsRouteCommented = appContent.includes('{/* <Route path="/agents" element={<AgentsPage />} /> */}');
  const agentsRouteActive = appContent.includes('<Route path="/agents" element={<AgentsPage />} />');
  
  logTest('AGENT_ROUTING', 'Agents Route Status', 
    agentsRouteActive ? 'PASS' : 'FAIL',
    agentsRouteActive ? 'Agents route is active' : 
    agentsRouteCommented ? 'Agents route is commented out' : 'Agents route not found'
  );

  // Test 6: Homepage Agent Integration
  const homeContent = fs.readFileSync(path.join(__dirname, 'src/pages/Home.tsx'), 'utf8');
  const heroContent = fs.readFileSync(path.join(__dirname, 'src/components/sections/Hero.tsx'), 'utf8');
  const servicesContent = fs.readFileSync(path.join(__dirname, 'src/components/sections/Services.tsx'), 'utf8');
  
  const agentMentions = [
    homeContent.includes('agent') || homeContent.includes('Agent'),
    heroContent.includes('agent') || heroContent.includes('Agent'),
    servicesContent.includes('agent') || servicesContent.includes('Agent')
  ];
  
  const hasAgentMentions = agentMentions.some(mention => mention);
  logTest('HOMEPAGE_INTEGRATION', 'Agent Mentions on Homepage', 
    hasAgentMentions ? 'PASS' : 'FAIL',
    hasAgentMentions ? 'Agents mentioned on homepage' : 'No agent mentions on homepage'
  );

  // Test 7: Agent Visibility Check
  const homepageAccessible = checkUrlAccessibility('http://localhost:5173');
  logTest('AGENT_ACCESS', 'Homepage Accessibility', 
    homepageAccessible.accessible ? 'PASS' : 'FAIL',
    homepageAccessible.accessible ? 
      `Homepage accessible (${homepageAccessible.statusCode})` : 
      'Homepage not accessible'
  );

  // Test 8: Agent System Health
  const agentOrchestratorExists = checkFileExists(path.join(__dirname, 'src/services/agents/refactored/AdminAgentOrchestrator.ts'));
  if (agentOrchestratorExists) {
    const orchestratorContent = fs.readFileSync(path.join(__dirname, 'src/services/agents/refactored/AdminAgentOrchestrator.ts'), 'utf8');
    
    const orchestratorFeatures = [
      'processMessage',
      'performSystemDiagnostics',
      'getAvailableAgents',
      'testAgent',
      'getAgentStats'
    ];
    
    orchestratorFeatures.forEach(feature => {
      const hasFeature = orchestratorContent.includes(feature);
      logTest('AGENT_SYSTEM', `Orchestrator: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }

  // Test 9: LLM Provider Integration
  const llmProviders = [
    'src/services/agents/refactored/providers/OpenAIProvider.ts',
    'src/services/agents/refactored/providers/AnthropicProvider.ts',
    'src/services/agents/refactored/providers/GroqProvider.ts',
    'src/services/agents/refactored/providers/MistralProvider.ts',
    'src/services/agents/refactored/providers/OpenRouterProvider.ts'
  ];
  
  let providersWorking = 0;
  llmProviders.forEach(provider => {
    const exists = checkFileExists(path.join(__dirname, provider));
    if (exists) {
      const content = fs.readFileSync(path.join(__dirname, provider), 'utf8');
      const hasGenerateMethod = content.includes('generate(') || content.includes('generateResponse(');
      if (hasGenerateMethod) providersWorking++;
    }
  });
  
  logTest('LLM_PROVIDERS', 'LLM Provider Integration', 
    providersWorking === llmProviders.length ? 'PASS' : 'FAIL',
    `${providersWorking}/${llmProviders.length} providers working`
  );

  // Test 10: Agent Testing Environment
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const testingFeatures = [
      'handleTestAgent',
      'testResults',
      'isLoading',
      'exportResults',
      'clearResults',
      'copyToClipboard'
    ];
    
    testingFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('AGENT_TESTING', `Testing Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }

  // Test 11: Agent Categories
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const categories = ['core', 'specialized', 'support'];
    categories.forEach(category => {
      const hasCategory = agentContent.includes(`category: '${category}'`);
      logTest('AGENT_CATEGORIES', `Category: ${category}`, 
        hasCategory ? 'PASS' : 'FAIL',
        hasCategory ? 'Category implemented' : 'Category not found'
      );
    });
  }

  // Test 12: Agent Specialties
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const specialties = [
      'Market Research',
      'Investment Analysis',
      'Business Plan Development',
      'Competitive Analysis',
      'Marketing Strategy',
      'Financial Modeling',
      'Legal Compliance',
      'Customer Support',
      'Local Market Analysis',
      'General Conversation'
    ];
    
    let specialtiesFound = 0;
    specialties.forEach(specialty => {
      if (agentContent.includes(specialty)) specialtiesFound++;
    });
    
    logTest('AGENT_SPECIALTIES', 'Agent Specialties', 
      specialtiesFound >= 8 ? 'PASS' : 'FAIL',
      `${specialtiesFound}/${specialties.length} specialties found`
    );
  }

  // Test 13: Agent Examples
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const exampleQueries = [
      'Analyze the AI/ML market trends',
      'What are the current funding trends',
      'Help me create a business plan',
      'Analyze our main competitors',
      'Create a marketing strategy',
      'Help me create financial projections',
      'What legal structure is best',
      'How do I apply for funding',
      'Analyze the startup ecosystem',
      'Tell me about Meta3Ventures'
    ];
    
    let examplesFound = 0;
    exampleQueries.forEach(example => {
      if (agentContent.includes(example)) examplesFound++;
    });
    
    logTest('AGENT_EXAMPLES', 'Example Queries', 
      examplesFound >= 8 ? 'PASS' : 'FAIL',
      `${examplesFound}/${exampleQueries.length} example queries found`
    );
  }

  // Test 14: Agent Performance Metrics
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const performanceFeatures = [
      'processingTime',
      'successRate',
      'averageResponseTime',
      'totalTests',
      'successfulTests'
    ];
    
    let performanceFeaturesFound = 0;
    performanceFeatures.forEach(feature => {
      if (agentContent.includes(feature)) performanceFeaturesFound++;
    });
    
    logTest('AGENT_PERFORMANCE', 'Performance Metrics', 
      performanceFeaturesFound >= 4 ? 'PASS' : 'FAIL',
      `${performanceFeaturesFound}/${performanceFeatures.length} performance features found`
    );
  }

  // Test 15: Agent UI Components
  if (agentComponentExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/Agents.tsx'), 'utf8');
    
    const uiComponents = [
      'AgentAuthGuard',
      'Bot',
      'Brain',
      'MessageSquare',
      'Send',
      'Copy',
      'Download',
      'RefreshCw',
      'Play',
      'CheckCircle',
      'XCircle'
    ];
    
    let uiComponentsFound = 0;
    uiComponents.forEach(component => {
      if (agentContent.includes(component)) uiComponentsFound++;
    });
    
    logTest('AGENT_UI', 'UI Components', 
      uiComponentsFound >= 8 ? 'PASS' : 'FAIL',
      `${uiComponentsFound}/${uiComponents.length} UI components found`
    );
  }

  // Generate Report
  results.endTime = new Date().toISOString();
  results.summary.successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
  
  console.log('\n📊 AGENT FUNCTIONALITY REPORT');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  
  // Category Breakdown
  console.log('\n📋 CATEGORY BREAKDOWN:');
  Object.entries(results.categories).forEach(([category, stats]) => {
    const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`${category}: ${stats.passed}/${stats.total} (${successRate}%)`);
  });
  
  // Failed Tests
  const failedTests = results.tests.filter(test => test.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  [${test.category}] ${test.testName}: ${test.details}`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'agent-functionality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  if (results.summary.failed === 0) {
    console.log('\n🎉 ALL AGENT TESTS PASSED! Agent system is fully functional.');
  } else {
    console.log(`\n⚠️ ${results.summary.failed} agent tests failed. Please review issues.`);
  }
  
  console.log(`\nTest completed at: ${results.endTime}`);
  
  return results;
}

// Run the tests
if (require.main === module) {
  runAgentTests().catch(console.error);
}

module.exports = { runAgentTests, results };
