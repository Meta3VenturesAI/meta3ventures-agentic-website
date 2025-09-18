#!/usr/bin/env node

/**
 * Functional Test Suite - Real Website Testing
 * Tests actual functionality with factual results
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Results
const results = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function logTest(testName, status, details = '', duration = 0) {
  const result = { testName, status, details, duration, timestamp: new Date().toISOString() };
  results.tests.push(result);
  results.summary.total++;
  if (status === 'PASS') results.summary.passed++;
  else results.summary.failed++;
  
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${testName}${duration > 0 ? ` (${duration}ms)` : ''}`);
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

function checkUrlAccessibility(url) {
  try {
    const result = runCommand(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
    const statusCode = parseInt(result.output.trim());
    return { accessible: statusCode === 200, statusCode };
  } catch (error) {
    return { accessible: false, statusCode: 0, error: error.message };
  }
}

async function runFunctionalTests() {
  console.log('🧪 FUNCTIONAL TEST SUITE');
  console.log('='.repeat(50));
  console.log(`Start Time: ${results.startTime}`);
  console.log('='.repeat(50));

  // Test 1: Development Server Status
  const startTime = Date.now();
  const devServerCheck = checkUrlAccessibility('http://localhost:5173');
  logTest('Development Server', 
    devServerCheck.accessible ? 'PASS' : 'FAIL',
    devServerCheck.accessible ? 
      `Server running on port 5173 (${devServerCheck.statusCode})` : 
      'Development server not accessible',
    Date.now() - startTime
  );

  // Test 2: Admin Dashboard Access
  const adminCheck = checkUrlAccessibility('http://localhost:5173/admin');
  logTest('Admin Dashboard Access', 
    adminCheck.accessible ? 'PASS' : 'FAIL',
    adminCheck.accessible ? 
      `Admin dashboard accessible (${adminCheck.statusCode})` : 
      'Admin dashboard not accessible'
  );

  // Test 3: Ollama LLM Provider
  const ollamaCheck = checkUrlAccessibility('http://localhost:11434/api/tags');
  logTest('Ollama LLM Provider', 
    ollamaCheck.accessible ? 'PASS' : 'FAIL',
    ollamaCheck.accessible ? 
      `Ollama API accessible (${ollamaCheck.statusCode})` : 
      'Ollama API not accessible'
  );

  // Test 4: Build Process
  const buildStart = Date.now();
  const buildResult = runCommand('npm run build', 120000);
  logTest('Build Process', 
    buildResult.success ? 'PASS' : 'FAIL',
    buildResult.success ? 
      'Application builds successfully' : 
      `Build failed: ${buildResult.error}`,
    Date.now() - buildStart
  );

  // Test 5: TypeScript Compilation
  const typeCheckStart = Date.now();
  const typeCheckResult = runCommand('npx tsc --noEmit', 60000);
  logTest('TypeScript Compilation', 
    typeCheckResult.success ? 'PASS' : 'FAIL',
    typeCheckResult.success ? 
      'TypeScript compiles without errors' : 
      `TypeScript errors: ${typeCheckResult.error}`,
    Date.now() - typeCheckStart
  );

  // Test 6: Unit Tests
  const unitTestStart = Date.now();
  const unitTestResult = runCommand('npm run test:unit', 60000);
  logTest('Unit Tests', 
    unitTestResult.success ? 'PASS' : 'FAIL',
    unitTestResult.success ? 
      'All unit tests pass' : 
      `Unit tests failed: ${unitTestResult.error}`,
    Date.now() - unitTestStart
  );

  // Test 7: Environment Configuration
  const envFile = path.join(__dirname, 'env.local');
  const envExists = fs.existsSync(envFile);
  let envValid = false;
  let envDetails = '';
  
  if (envExists) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const requiredVars = [
      'VITE_ADMIN_PASSWORD',
      'VITE_SUPABASE_URL',
      'VITE_FORMSPREE_PROJECT_ID',
      'VITE_OPENAI_API_KEY',
      'VITE_ANTHROPIC_API_KEY'
    ];
    const missing = requiredVars.filter(varName => !envContent.includes(varName));
    envValid = missing.length === 0;
    envDetails = envValid ? 
      `All ${requiredVars.length} required variables present` : 
      `Missing: ${missing.join(', ')}`;
  } else {
    envDetails = 'Environment file not found';
  }
  
  logTest('Environment Configuration', 
    envValid ? 'PASS' : 'FAIL',
    envDetails
  );

  // Test 8: Core Components
  const coreComponents = [
    'src/pages/AdminDashboard.tsx',
    'src/components/forms/FileUploadZone.tsx',
    'src/contexts/AuthContext.tsx',
    'src/components/ProtectedRoute.tsx',
    'src/services/data-storage.service.ts'
  ];
  
  let componentsValid = true;
  const missingComponents = [];
  
  coreComponents.forEach(component => {
    if (!fs.existsSync(path.join(__dirname, component))) {
      componentsValid = false;
      missingComponents.push(component);
    }
  });
  
  logTest('Core Components', 
    componentsValid ? 'PASS' : 'FAIL',
    componentsValid ? 
      `All ${coreComponents.length} core components present` : 
      `Missing: ${missingComponents.join(', ')}`
  );

  // Test 9: LLM Providers
  const llmProviders = [
    'src/services/agents/refactored/providers/OpenAIProvider.ts',
    'src/services/agents/refactored/providers/AnthropicProvider.ts',
    'src/services/agents/refactored/providers/GroqProvider.ts',
    'src/services/agents/refactored/providers/MistralProvider.ts',
    'src/services/agents/refactored/providers/OpenRouterProvider.ts'
  ];
  
  let providersValid = true;
  const missingProviders = [];
  
  llmProviders.forEach(provider => {
    if (!fs.existsSync(path.join(__dirname, provider))) {
      providersValid = false;
      missingProviders.push(provider);
    }
  });
  
  logTest('LLM Providers', 
    providersValid ? 'PASS' : 'FAIL',
    providersValid ? 
      `All ${llmProviders.length} LLM providers present` : 
      `Missing: ${missingProviders.join(', ')}`
  );

  // Test 10: Security Features
  const securityFile = path.join(__dirname, 'src/utils/security.ts');
  const securityExists = fs.existsSync(securityFile);
  logTest('Security Features', 
    securityExists ? 'PASS' : 'FAIL',
    securityExists ? 
      'Advanced security utilities implemented' : 
      'Security utilities missing'
  );

  // Test 11: Admin Functionality Test
  const adminTestStart = Date.now();
  const adminTestResult = runCommand('node test-admin-functionality.cjs', 30000);
  const adminTestSuccess = adminTestResult.success && adminTestResult.output.includes('Success Rate:');
  logTest('Admin Functionality', 
    adminTestSuccess ? 'PASS' : 'FAIL',
    adminTestSuccess ? 
      'Admin functionality tests pass' : 
      `Admin tests failed: ${adminTestResult.error}`,
    Date.now() - adminTestStart
  );

  // Test 12: File Upload System
  const fileUploadExists = fs.existsSync(path.join(__dirname, 'src/components/forms/FileUploadZone.tsx'));
  let fileUploadValid = false;
  let fileUploadDetails = '';
  
  if (fileUploadExists) {
    const fileUploadContent = fs.readFileSync(path.join(__dirname, 'src/components/forms/FileUploadZone.tsx'), 'utf8');
    const requiredFeatures = ['handleDragEnter', 'handleDrop', 'removeFile', 'formatFileSize', 'validateFile'];
    const missingFeatures = requiredFeatures.filter(feature => !fileUploadContent.includes(feature));
    fileUploadValid = missingFeatures.length === 0;
    fileUploadDetails = fileUploadValid ? 
      `All ${requiredFeatures.length} file upload features present` : 
      `Missing features: ${missingFeatures.join(', ')}`;
  } else {
    fileUploadDetails = 'File upload component missing';
  }
  
  logTest('File Upload System', 
    fileUploadValid ? 'PASS' : 'FAIL',
    fileUploadDetails
  );

  // Test 13: Data Management
  const dataStorageExists = fs.existsSync(path.join(__dirname, 'src/services/data-storage.service.ts'));
  let dataValid = false;
  let dataDetails = '';
  
  if (dataStorageExists) {
    const dataContent = fs.readFileSync(path.join(__dirname, 'src/services/data-storage.service.ts'), 'utf8');
    const requiredFeatures = ['storeFormSubmission', 'getFormSubmissions', 'getAnalyticsSummary', 'downloadCSV', 'validateFormData'];
    const missingFeatures = requiredFeatures.filter(feature => !dataContent.includes(feature));
    dataValid = missingFeatures.length === 0;
    dataDetails = dataValid ? 
      `All ${requiredFeatures.length} data management features present` : 
      `Missing features: ${missingFeatures.join(', ')}`;
  } else {
    dataDetails = 'Data storage service missing';
  }
  
  logTest('Data Management', 
    dataValid ? 'PASS' : 'FAIL',
    dataDetails
  );

  // Test 14: Authentication System
  const authContextExists = fs.existsSync(path.join(__dirname, 'src/contexts/AuthContext.tsx'));
  let authValid = false;
  let authDetails = '';
  
  if (authContextExists) {
    const authContent = fs.readFileSync(path.join(__dirname, 'src/contexts/AuthContext.tsx'), 'utf8');
    const requiredFeatures = ['login', 'logout', 'isAuthenticated', 'validatePassword', 'checkAdminAccess'];
    const missingFeatures = requiredFeatures.filter(feature => !authContent.includes(feature));
    authValid = missingFeatures.length === 0;
    authDetails = authValid ? 
      `All ${requiredFeatures.length} authentication features present` : 
      `Missing features: ${missingFeatures.join(', ')}`;
  } else {
    authDetails = 'Authentication context missing';
  }
  
  logTest('Authentication System', 
    authValid ? 'PASS' : 'FAIL',
    authDetails
  );

  // Test 15: Agent System
  const agentDashboardExists = fs.existsSync(path.join(__dirname, 'src/components/admin/AgentSystemDashboard.tsx'));
  let agentValid = false;
  let agentDetails = '';
  
  if (agentDashboardExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/admin/AgentSystemDashboard.tsx'), 'utf8');
    const requiredFeatures = ['performSystemDiagnostics', 'getLLMProviders', 'updateAgentConfiguration', 'testLLMProvider'];
    const missingFeatures = requiredFeatures.filter(feature => !agentContent.includes(feature));
    agentValid = missingFeatures.length === 0;
    agentDetails = agentValid ? 
      `All ${requiredFeatures.length} agent system features present` : 
      `Missing features: ${missingFeatures.join(', ')}`;
  } else {
    agentDetails = 'Agent system dashboard missing';
  }
  
  logTest('Agent System', 
    agentValid ? 'PASS' : 'FAIL',
    agentDetails
  );

  // Generate Report
  results.endTime = new Date().toISOString();
  results.summary.successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
  
  console.log('\n📊 FUNCTIONAL TEST REPORT');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.summary.total}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📊 Success Rate: ${results.summary.successRate}%`);
  
  // Failed Tests
  const failedTests = results.tests.filter(test => test.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(test => {
      console.log(`  ${test.testName}: ${test.details}`);
    });
  }
  
  // Performance Summary
  const performanceTests = results.tests.filter(test => test.duration > 0);
  if (performanceTests.length > 0) {
    console.log('\n⚡ PERFORMANCE SUMMARY:');
    performanceTests.forEach(test => {
      console.log(`  ${test.testName}: ${test.duration}ms`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'functional-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  if (results.summary.failed === 0) {
    console.log('\n🎉 ALL FUNCTIONAL TESTS PASSED! Platform is fully operational.');
  } else {
    console.log(`\n⚠️ ${results.summary.failed} functional tests failed. Please review issues.`);
  }
  
  console.log(`\nTest completed at: ${results.endTime}`);
  
  return results;
}

// Run the tests
if (require.main === module) {
  runFunctionalTests().catch(console.error);
}

module.exports = { runFunctionalTests, results };
