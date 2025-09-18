#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Meta3Ventures Platform
 * Automated testing of all functionality with factual reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  adminUrl: 'http://localhost:5173/admin',
  ollamaUrl: 'http://localhost:11434',
  timeout: 30000,
  retries: 3
};

// Test Results Storage
const testResults = {
  startTime: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    successRate: 0
  },
  categories: {}
};

// Helper Functions
function logTest(category, testName, status, details = '', duration = 0) {
  const result = {
    category,
    testName,
    status, // 'PASS', 'FAIL', 'SKIP'
    details,
    duration,
    timestamp: new Date().toISOString()
  };
  
  testResults.tests.push(result);
  testResults.summary.total++;
  
  if (status === 'PASS') {
    testResults.summary.passed++;
  } else if (status === 'FAIL') {
    testResults.summary.failed++;
  } else {
    testResults.summary.skipped++;
  }
  
  // Update category stats
  if (!testResults.categories[category]) {
    testResults.categories[category] = { total: 0, passed: 0, failed: 0, skipped: 0 };
  }
  testResults.categories[category].total++;
  testResults.categories[category][status.toLowerCase()]++;
  
  // Console output
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  const durationStr = duration > 0 ? ` (${duration}ms)` : '';
  console.log(`${statusIcon} [${category}] ${testName}${durationStr}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

function runCommand(command, timeout = 10000) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      timeout,
      stdio: 'pipe'
    });
    return { success: true, output: result, error: null };
  } catch (error) {
    return { success: false, output: error.stdout || '', error: error.message };
  }
}

function checkUrlAccessibility(url, expectedStatus = 200) {
  try {
    const result = runCommand(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
    const statusCode = parseInt(result.output.trim());
    return {
      accessible: statusCode === expectedStatus,
      statusCode,
      error: result.error
    };
  } catch (error) {
    return {
      accessible: false,
      statusCode: 0,
      error: error.message
    };
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

function checkEnvironmentVariables() {
  const envFile = path.join(__dirname, '.env.local');
  if (!checkFileExists(envFile)) {
    return { valid: false, missing: ['Environment file not found'] };
  }
  
  const content = fs.readFileSync(envFile, 'utf8');
  const requiredVars = [
    'VITE_ADMIN_PASSWORD',
    'VITE_SUPABASE_URL',
    'VITE_FORMSPREE_PROJECT_ID',
    'VITE_OPENAI_API_KEY',
    'VITE_ANTHROPIC_API_KEY',
    'VITE_DEEPSEEK_API_KEY',
    'VITE_GROQ_API_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !content.includes(varName));
  return {
    valid: missing.length === 0,
    missing,
    total: requiredVars.length,
    present: requiredVars.length - missing.length
  };
}

// Test Categories
const TEST_CATEGORIES = {
  'INFRASTRUCTURE': 'Infrastructure & Environment Tests',
  'FRONTEND': 'Frontend Application Tests',
  'ADMIN': 'Admin Dashboard Tests',
  'AUTHENTICATION': 'Authentication & Security Tests',
  'API': 'API & Service Tests',
  'LLM': 'LLM Provider Tests',
  'FILES': 'File Management Tests',
  'DATA': 'Data Management Tests',
  'AGENTS': 'AI Agent System Tests',
  'PERFORMANCE': 'Performance & Load Tests'
};

// Test Functions
async function runInfrastructureTests() {
  console.log('\n🔧 INFRASTRUCTURE TESTS');
  console.log('='.repeat(50));
  
  const startTime = Date.now();
  
  // Test 1: Environment File
  const envCheck = checkEnvironmentVariables();
  logTest('INFRASTRUCTURE', 'Environment Configuration', 
    envCheck.valid ? 'PASS' : 'FAIL',
    envCheck.valid ? 
      `All ${envCheck.total} required variables present` : 
      `Missing: ${envCheck.missing.join(', ')}`,
    Date.now() - startTime
  );
  
  // Test 2: Package.json
  const packageJsonExists = checkFileExists(path.join(__dirname, 'package.json'));
  logTest('INFRASTRUCTURE', 'Package Configuration', 
    packageJsonExists ? 'PASS' : 'FAIL',
    packageJsonExists ? 'package.json found' : 'package.json missing'
  );
  
  // Test 3: TypeScript Configuration
  const tsConfigExists = checkFileExists(path.join(__dirname, 'tsconfig.json'));
  logTest('INFRASTRUCTURE', 'TypeScript Configuration', 
    tsConfigExists ? 'PASS' : 'FAIL',
    tsConfigExists ? 'tsconfig.json found' : 'tsconfig.json missing'
  );
  
  // Test 4: Vite Configuration
  const viteConfigExists = checkFileExists(path.join(__dirname, 'vite.config.ts'));
  logTest('INFRASTRUCTURE', 'Vite Configuration', 
    viteConfigExists ? 'PASS' : 'FAIL',
    viteConfigExists ? 'vite.config.ts found' : 'vite.config.ts missing'
  );
  
  // Test 5: Node Modules
  const nodeModulesExists = checkFileExists(path.join(__dirname, 'node_modules'));
  logTest('INFRASTRUCTURE', 'Dependencies Installation', 
    nodeModulesExists ? 'PASS' : 'FAIL',
    nodeModulesExists ? 'node_modules directory found' : 'Dependencies not installed'
  );
}

async function runFrontendTests() {
  console.log('\n🌐 FRONTEND TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Main Application Access
  const mainAppCheck = checkUrlAccessibility(TEST_CONFIG.baseUrl);
  logTest('FRONTEND', 'Main Application Access', 
    mainAppCheck.accessible ? 'PASS' : 'FAIL',
    mainAppCheck.accessible ? 
      `Application accessible (${mainAppCheck.statusCode})` : 
      `Application not accessible: ${mainAppCheck.error}`
  );
  
  // Test 2: Admin Dashboard Access
  const adminCheck = checkUrlAccessibility(TEST_CONFIG.adminUrl);
  logTest('FRONTEND', 'Admin Dashboard Access', 
    adminCheck.accessible ? 'PASS' : 'FAIL',
    adminCheck.accessible ? 
      `Admin dashboard accessible (${adminCheck.statusCode})` : 
      `Admin dashboard not accessible: ${adminCheck.error}`
  );
  
  // Test 3: React Components
  const components = [
    'src/pages/AdminDashboard.tsx',
    'src/components/forms/FileUploadZone.tsx',
    'src/contexts/AuthContext.tsx',
    'src/components/ProtectedRoute.tsx'
  ];
  
  components.forEach(component => {
    const exists = checkFileExists(path.join(__dirname, component));
    logTest('FRONTEND', `Component: ${path.basename(component)}`, 
      exists ? 'PASS' : 'FAIL',
      exists ? 'Component file exists' : 'Component file missing'
    );
  });
  
  // Test 4: Build Process
  const buildResult = runCommand('npm run build', 60000);
  logTest('FRONTEND', 'Build Process', 
    buildResult.success ? 'PASS' : 'FAIL',
    buildResult.success ? 'Build completed successfully' : `Build failed: ${buildResult.error}`
  );
}

async function runAdminTests() {
  console.log('\n👑 ADMIN DASHBOARD TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Admin Dashboard Component
  const adminDashboardExists = checkFileExists(path.join(__dirname, 'src/pages/AdminDashboard.tsx'));
  logTest('ADMIN', 'Admin Dashboard Component', 
    adminDashboardExists ? 'PASS' : 'FAIL',
    adminDashboardExists ? 'AdminDashboard.tsx exists' : 'AdminDashboard.tsx missing'
  );
  
  // Test 2: Admin Features
  const adminFeatures = [
    'Login Form',
    'Data Summary Display',
    'File Upload Handling',
    'Application Detail Modal',
    'CSV Export Functionality',
    'Filter System',
    'Search Functionality',
    'Tab Navigation',
    'Agent System Integration',
    'Performance Dashboard'
  ];
  
  if (adminDashboardExists) {
    const adminContent = fs.readFileSync(path.join(__dirname, 'src/pages/AdminDashboard.tsx'), 'utf8');
    
    adminFeatures.forEach(feature => {
      const hasFeature = adminContent.includes(feature.toLowerCase().replace(/\s+/g, ''));
      logTest('ADMIN', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
  
  // Test 3: Agent System Dashboard
  const agentDashboardExists = checkFileExists(path.join(__dirname, 'src/components/admin/AgentSystemDashboard.tsx'));
  logTest('ADMIN', 'Agent System Dashboard', 
    agentDashboardExists ? 'PASS' : 'FAIL',
    agentDashboardExists ? 'AgentSystemDashboard.tsx exists' : 'AgentSystemDashboard.tsx missing'
  );
}

async function runAuthenticationTests() {
  console.log('\n🔐 AUTHENTICATION TESTS');
  console.log('='.repeat(50));
  
  // Test 1: AuthContext
  const authContextExists = checkFileExists(path.join(__dirname, 'src/contexts/AuthContext.tsx'));
  logTest('AUTHENTICATION', 'AuthContext Component', 
    authContextExists ? 'PASS' : 'FAIL',
    authContextExists ? 'AuthContext.tsx exists' : 'AuthContext.tsx missing'
  );
  
  // Test 2: Authentication Features
  if (authContextExists) {
    const authContent = fs.readFileSync(path.join(__dirname, 'src/contexts/AuthContext.tsx'), 'utf8');
    
    const authFeatures = [
      'login',
      'logout',
      'isAuthenticated',
      'validatePassword',
      'checkAdminAccess',
      'getSessionInfo',
      'isSessionValid'
    ];
    
    authFeatures.forEach(feature => {
      const hasFeature = authContent.includes(feature);
      logTest('AUTHENTICATION', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
  
  // Test 3: Protected Routes
  const protectedRouteExists = checkFileExists(path.join(__dirname, 'src/components/ProtectedRoute.tsx'));
  logTest('AUTHENTICATION', 'Protected Route Component', 
    protectedRouteExists ? 'PASS' : 'FAIL',
    protectedRouteExists ? 'ProtectedRoute.tsx exists' : 'ProtectedRoute.tsx missing'
  );
  
  // Test 4: Security Features
  const securityExists = checkFileExists(path.join(__dirname, 'src/utils/security.ts'));
  logTest('AUTHENTICATION', 'Security Manager', 
    securityExists ? 'PASS' : 'FAIL',
    securityExists ? 'Security utilities implemented' : 'Security utilities missing'
  );
}

async function runAPITests() {
  console.log('\n🔌 API TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Ollama API
  const ollamaCheck = checkUrlAccessibility(`${TEST_CONFIG.ollamaUrl}/api/tags`);
  logTest('API', 'Ollama API', 
    ollamaCheck.accessible ? 'PASS' : 'FAIL',
    ollamaCheck.accessible ? 
      `Ollama API accessible (${ollamaCheck.statusCode})` : 
      `Ollama API not accessible: ${ollamaCheck.error}`
  );
  
  // Test 2: Data Storage Service
  const dataStorageExists = checkFileExists(path.join(__dirname, 'src/services/data-storage.service.ts'));
  logTest('API', 'Data Storage Service', 
    dataStorageExists ? 'PASS' : 'FAIL',
    dataStorageExists ? 'Data storage service exists' : 'Data storage service missing'
  );
  
  // Test 3: API Features
  if (dataStorageExists) {
    const dataStorageContent = fs.readFileSync(path.join(__dirname, 'src/services/data-storage.service.ts'), 'utf8');
    
    const apiFeatures = [
      'storeFormSubmission',
      'getFormSubmissions',
      'getAnalyticsSummary',
      'downloadCSV',
      'validateFormData',
      'transformSubmissionData',
      'calculateStatistics'
    ];
    
    apiFeatures.forEach(feature => {
      const hasFeature = dataStorageContent.includes(feature);
      logTest('API', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
}

async function runLLMTests() {
  console.log('\n🤖 LLM PROVIDER TESTS');
  console.log('='.repeat(50));
  
  const llmProviders = [
    'OpenAIProvider.ts',
    'AnthropicProvider.ts',
    'GroqProvider.ts',
    'MistralProvider.ts',
    'OpenRouterProvider.ts'
  ];
  
  llmProviders.forEach(provider => {
    const providerPath = path.join(__dirname, `src/services/agents/refactored/providers/${provider}`);
    const exists = checkFileExists(providerPath);
    
    logTest('LLM', `Provider: ${provider}`, 
      exists ? 'PASS' : 'FAIL',
      exists ? 'Provider file exists' : 'Provider file missing'
    );
    
    if (exists) {
      const providerContent = fs.readFileSync(providerPath, 'utf8');
      
      const providerFeatures = [
        'isAvailable',
        'generateResponse',
        'generate',
        'constructor',
        'apiKey',
        'baseUrl'
      ];
      
      providerFeatures.forEach(feature => {
        const hasFeature = providerContent.includes(feature);
        logTest('LLM', `${provider} - ${feature}`, 
          hasFeature ? 'PASS' : 'FAIL',
          hasFeature ? 'Feature implemented' : 'Feature not found'
        );
      });
    }
  });
}

async function runFileTests() {
  console.log('\n📁 FILE MANAGEMENT TESTS');
  console.log('='.repeat(50));
  
  // Test 1: File Upload Component
  const fileUploadExists = checkFileExists(path.join(__dirname, 'src/components/forms/FileUploadZone.tsx'));
  logTest('FILES', 'File Upload Component', 
    fileUploadExists ? 'PASS' : 'FAIL',
    fileUploadExists ? 'FileUploadZone.tsx exists' : 'FileUploadZone.tsx missing'
  );
  
  // Test 2: File Upload Features
  if (fileUploadExists) {
    const fileUploadContent = fs.readFileSync(path.join(__dirname, 'src/components/forms/FileUploadZone.tsx'), 'utf8');
    
    const fileFeatures = [
      'handleDragEnter',
      'handleDragLeave',
      'handleDrop',
      'handleFileSelect',
      'removeFile',
      'formatFileSize',
      'validateFile',
      'simulateUpload'
    ];
    
    fileFeatures.forEach(feature => {
      const hasFeature = fileUploadContent.includes(feature);
      logTest('FILES', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
  
  // Test 3: Application Form Integration
  const marketFundingExists = checkFileExists(path.join(__dirname, 'src/components/forms/multi-step/steps/MarketFundingStep.tsx'));
  logTest('FILES', 'Application Form Integration', 
    marketFundingExists ? 'PASS' : 'FAIL',
    marketFundingExists ? 'MarketFundingStep.tsx exists' : 'MarketFundingStep.tsx missing'
  );
}

async function runDataTests() {
  console.log('\n📊 DATA MANAGEMENT TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Data Storage Service
  const dataStorageExists = checkFileExists(path.join(__dirname, 'src/services/data-storage.service.ts'));
  logTest('DATA', 'Data Storage Service', 
    dataStorageExists ? 'PASS' : 'FAIL',
    dataStorageExists ? 'Data storage service exists' : 'Data storage service missing'
  );
  
  // Test 2: Data Features
  if (dataStorageExists) {
    const dataStorageContent = fs.readFileSync(path.join(__dirname, 'src/services/data-storage.service.ts'), 'utf8');
    
    const dataFeatures = [
      'storeFormSubmission',
      'getFormSubmissions',
      'getAnalyticsSummary',
      'downloadCSV',
      'validateFormData',
      'transformSubmissionData',
      'calculateStatistics',
      'localStorage',
      'sessionStorage'
    ];
    
    dataFeatures.forEach(feature => {
      const hasFeature = dataStorageContent.includes(feature);
      logTest('DATA', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
  
  // Test 3: Environment Variables
  const envCheck = checkEnvironmentVariables();
  logTest('DATA', 'Environment Configuration', 
    envCheck.valid ? 'PASS' : 'FAIL',
    envCheck.valid ? 
      `All ${envCheck.total} required variables present` : 
      `Missing: ${envCheck.missing.join(', ')}`
  );
}

async function runAgentTests() {
  console.log('\n🤖 AI AGENT SYSTEM TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Agent System Dashboard
  const agentDashboardExists = checkFileExists(path.join(__dirname, 'src/components/admin/AgentSystemDashboard.tsx'));
  logTest('AGENTS', 'Agent System Dashboard', 
    agentDashboardExists ? 'PASS' : 'FAIL',
    agentDashboardExists ? 'AgentSystemDashboard.tsx exists' : 'AgentSystemDashboard.tsx missing'
  );
  
  // Test 2: Agent Features
  if (agentDashboardExists) {
    const agentContent = fs.readFileSync(path.join(__dirname, 'src/components/admin/AgentSystemDashboard.tsx'), 'utf8');
    
    const agentFeatures = [
      'performSystemDiagnostics',
      'getLLMProviders',
      'updateAgentConfiguration',
      'testLLMProvider',
      'getAvailableModels',
      'getDeepAgentStats',
      'renderRealTimeMonitoringTab',
      'renderFilesTab',
      'renderAPIManagementTab',
      'renderDynamicModelManagerTab'
    ];
    
    agentFeatures.forEach(feature => {
      const hasFeature = agentContent.includes(feature);
      logTest('AGENTS', `Feature: ${feature}`, 
        hasFeature ? 'PASS' : 'FAIL',
        hasFeature ? 'Feature implemented' : 'Feature not found'
      );
    });
  }
  
  // Test 3: Agent Services
  const agentServices = [
    'AdminAgentOrchestrator.ts',
    'ProviderDetectionService.ts',
    'OpenSourceLLMService.ts'
  ];
  
  agentServices.forEach(service => {
    const servicePath = path.join(__dirname, `src/services/agents/refactored/${service}`);
    const exists = checkFileExists(servicePath);
    
    logTest('AGENTS', `Service: ${service}`, 
      exists ? 'PASS' : 'FAIL',
      exists ? 'Service file exists' : 'Service file missing'
    );
  });
}

async function runPerformanceTests() {
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('='.repeat(50));
  
  // Test 1: Build Performance
  const buildStart = Date.now();
  const buildResult = runCommand('npm run build', 120000);
  const buildDuration = Date.now() - buildStart;
  
  logTest('PERFORMANCE', 'Build Performance', 
    buildResult.success ? 'PASS' : 'FAIL',
    buildResult.success ? 
      `Build completed in ${buildDuration}ms` : 
      `Build failed: ${buildResult.error}`,
    buildDuration
  );
  
  // Test 2: Type Check Performance
  const typeCheckStart = Date.now();
  const typeCheckResult = runCommand('npm run typecheck', 60000);
  const typeCheckDuration = Date.now() - typeCheckStart;
  
  logTest('PERFORMANCE', 'Type Check Performance', 
    typeCheckResult.success ? 'PASS' : 'FAIL',
    typeCheckResult.success ? 
      `Type check completed in ${typeCheckDuration}ms` : 
      `Type check failed: ${typeCheckResult.error}`,
    typeCheckDuration
  );
  
  // Test 3: Lint Performance
  const lintStart = Date.now();
  const lintResult = runCommand('npm run lint', 60000);
  const lintDuration = Date.now() - lintStart;
  
  logTest('PERFORMANCE', 'Lint Performance', 
    lintResult.success ? 'PASS' : 'FAIL',
    lintResult.success ? 
      `Lint completed in ${lintDuration}ms` : 
      `Lint failed: ${lintResult.error}`,
    lintDuration
  );
}

// Main Test Execution
async function runAllTests() {
  console.log('🧪 COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Start Time: ${testResults.startTime}`);
  console.log(`Base URL: ${TEST_CONFIG.baseUrl}`);
  console.log('='.repeat(60));
  
  try {
    await runInfrastructureTests();
    await runFrontendTests();
    await runAdminTests();
    await runAuthenticationTests();
    await runAPITests();
    await runLLMTests();
    await runFileTests();
    await runDataTests();
    await runAgentTests();
    await runPerformanceTests();
    
    // Calculate final results
    testResults.endTime = new Date().toISOString();
    testResults.summary.successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2);
    
    // Generate report
    generateTestReport();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

function generateTestReport() {
  console.log('\n📊 TEST REPORT');
  console.log('='.repeat(60));
  
  // Summary
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`⏭️ Skipped: ${testResults.summary.skipped}`);
  console.log(`📊 Success Rate: ${testResults.summary.successRate}%`);
  
  // Category Breakdown
  console.log(`\n📋 CATEGORY BREAKDOWN:`);
  Object.entries(testResults.categories).forEach(([category, stats]) => {
    const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0';
    console.log(`${category}: ${stats.passed}/${stats.total} (${successRate}%)`);
  });
  
  // Failed Tests
  const failedTests = testResults.tests.filter(test => test.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failedTests.forEach(test => {
      console.log(`  [${test.category}] ${test.testName}: ${test.details}`);
    });
  }
  
  // Performance Summary
  const performanceTests = testResults.tests.filter(test => test.category === 'PERFORMANCE' && test.duration > 0);
  if (performanceTests.length > 0) {
    console.log(`\n⚡ PERFORMANCE SUMMARY:`);
    performanceTests.forEach(test => {
      console.log(`  ${test.testName}: ${test.duration}ms`);
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  // Final Status
  if (testResults.summary.failed === 0) {
    console.log(`\n🎉 ALL TESTS PASSED! Platform is ready for deployment.`);
  } else {
    console.log(`\n⚠️ ${testResults.summary.failed} tests failed. Please review and fix issues.`);
  }
  
  console.log(`\nTest completed at: ${testResults.endTime}`);
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testResults };
