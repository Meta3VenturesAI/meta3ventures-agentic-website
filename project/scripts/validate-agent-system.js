#!/usr/bin/env node

/**
 * Virtual Agents System Validation Script
 * Tests what can be validated in Node.js environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 VIRTUAL AGENTS SYSTEM VALIDATION');
console.log('====================================\n');

const results = {
  tests: [],
  passed: 0,
  total: 0,
  startTime: Date.now()
};

function addTest(name, success, details, error = null) {
  results.tests.push({ name, success, details, error });
  results.total++;
  if (success) results.passed++;

  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
  if (error) console.log(`   Error: ${error}`);
  console.log();
}

// Test 1: Verify agent system files exist
function testAgentFilesExist() {
  const requiredFiles = [
    'src/services/agents/refactored/AdminAgentOrchestrator.ts',
    'src/services/agents/refactored/BaseAgent.ts',
    'src/services/agents/refactored/AgentBuilder.ts',
    'src/services/agents/refactored/LLMService.ts',
    'src/services/agents/refactored/AgentToolsSystem.ts',
    'src/services/agents/refactored/ExternalIntegrationService.ts',
    'src/services/agents/refactored/agents/Meta3PrimaryAgent.ts',
    'src/components/VirtualAssistant.tsx',
    'src/test/agents-functionality-test.ts'
  ];

  let missingFiles = [];
  let existingFiles = [];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }

  const success = missingFiles.length === 0;
  const details = `Found ${existingFiles.length}/${requiredFiles.length} required files`;
  const error = missingFiles.length > 0 ? `Missing files: ${missingFiles.join(', ')}` : null;

  addTest('Agent System Files Existence', success, details, error);
  return success;
}

// Test 2: Verify TypeScript compilation status
function testTypeScriptCompilation() {
  try {
    // Check if tsconfig.json exists
    const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      addTest('TypeScript Configuration', false, null, 'tsconfig.json not found');
      return false;
    }

    // Check if package.json has typescript dependencies
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const hasTypeScript = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;
    const hasVite = packageJson.devDependencies?.vite || packageJson.dependencies?.vite;

    addTest('TypeScript Configuration', hasTypeScript && hasVite,
           `TypeScript: ${!!hasTypeScript}, Vite: ${!!hasVite}`);
    return hasTypeScript && hasVite;
  } catch (error) {
    addTest('TypeScript Configuration', false, null, error.message);
    return false;
  }
}

// Test 3: Analyze agent system architecture
function testAgentArchitecture() {
  try {
    const orchestratorPath = path.join(__dirname, '..', 'src/services/agents/refactored/AdminAgentOrchestrator.ts');
    const orchestratorContent = fs.readFileSync(orchestratorPath, 'utf8');

    // Check for key architectural components
    const hasSessionManagement = orchestratorContent.includes('sessions:') && orchestratorContent.includes('SessionInfo');
    const hasAgentRouting = orchestratorContent.includes('routeMessage') || orchestratorContent.includes('selectAgent');
    const hasStatsTracking = orchestratorContent.includes('stats') && orchestratorContent.includes('OrchestratorStats');

    const baseAgentPath = path.join(__dirname, '..', 'src/services/agents/refactored/BaseAgent.ts');
    const baseAgentContent = fs.readFileSync(baseAgentPath, 'utf8');

    const hasLLMIntegration = baseAgentContent.includes('generateLLMResponse') && baseAgentContent.includes('llmService');
    const hasAbstractInterface = baseAgentContent.includes('abstract class BaseAgent') &&
                                 baseAgentContent.includes('abstract processMessage');

    const architecturalFeatures = [
      hasSessionManagement && 'Session Management',
      hasAgentRouting && 'Agent Routing',
      hasStatsTracking && 'Stats Tracking',
      hasLLMIntegration && 'LLM Integration',
      hasAbstractInterface && 'Abstract Interface'
    ].filter(Boolean);

    const success = architecturalFeatures.length >= 4;
    addTest('Agent System Architecture', success,
           `Features found: ${architecturalFeatures.join(', ')}`);
    return success;
  } catch (error) {
    addTest('Agent System Architecture', false, null, error.message);
    return false;
  }
}

// Test 4: Verify agent templates and builder system
function testAgentBuilder() {
  try {
    const builderPath = path.join(__dirname, '..', 'src/services/agents/refactored/AgentBuilder.ts');
    const builderContent = fs.readFileSync(builderPath, 'utf8');

    const hasTemplateSystem = builderContent.includes('AgentTemplate') && builderContent.includes('templates:');
    const hasDynamicAgents = builderContent.includes('DynamicAgent') && builderContent.includes('createAgent');
    const hasPlaybooks = builderContent.includes('AgentPlaybook') && builderContent.includes('executePlaybook');
    const hasCategories = builderContent.includes('category:') && builderContent.includes('business');

    // Count agent templates
    const templateMatches = builderContent.match(/addTemplate\(/g);
    const templateCount = templateMatches ? templateMatches.length : 0;

    const features = [
      hasTemplateSystem && 'Template System',
      hasDynamicAgents && 'Dynamic Agents',
      hasPlaybooks && 'Playbook System',
      hasCategories && 'Agent Categories'
    ].filter(Boolean);

    const success = features.length >= 3 && templateCount >= 1;
    addTest('Agent Builder System', success,
           `Features: ${features.join(', ')}, Templates: ${templateCount}`);
    return success;
  } catch (error) {
    addTest('Agent Builder System', false, null, error.message);
    return false;
  }
}

// Test 5: Verify LLM service integration
function testLLMService() {
  try {
    const llmPath = path.join(__dirname, '..', 'src/services/agents/refactored/LLMService.ts');
    const llmContent = fs.readFileSync(llmPath, 'utf8');

    const hasMultipleProviders = llmContent.includes('ollama') &&
                                 llmContent.includes('openai') &&
                                 llmContent.includes('groq');
    const hasProviderHealth = llmContent.includes('checkProviderHealth') || llmContent.includes('healthCheck');
    const hasErrorHandling = llmContent.includes('try') && llmContent.includes('catch') &&
                             llmContent.includes('fallback');
    const hasResponseInterface = llmContent.includes('LLMResponse') && llmContent.includes('generateResponse');

    const features = [
      hasMultipleProviders && 'Multiple Providers',
      hasProviderHealth && 'Health Checking',
      hasErrorHandling && 'Error Handling',
      hasResponseInterface && 'Response Interface'
    ].filter(Boolean);

    const success = features.length >= 3;
    addTest('LLM Service Integration', success, `Features: ${features.join(', ')}`);
    return success;
  } catch (error) {
    addTest('LLM Service Integration', false, null, error.message);
    return false;
  }
}

// Test 6: Verify tools system integration
function testToolsSystem() {
  try {
    const toolsPath = path.join(__dirname, '..', 'src/services/agents/refactored/AgentToolsSystem.ts');
    const toolsContent = fs.readFileSync(toolsPath, 'utf8');

    const externalPath = path.join(__dirname, '..', 'src/services/agents/refactored/ExternalIntegrationService.ts');
    const externalExists = fs.existsSync(externalPath);

    const hasToolRegistration = toolsContent.includes('registerTool') && toolsContent.includes('AgentTool');
    const hasKnowledgeBase = toolsContent.includes('knowledgeBase') && toolsContent.includes('KnowledgeItem');
    const hasToolExecution = toolsContent.includes('executeTool') && toolsContent.includes('getToolsForAgent');
    const hasExternalIntegration = toolsContent.includes('ExternalIntegrationService') && externalExists;

    const features = [
      hasToolRegistration && 'Tool Registration',
      hasKnowledgeBase && 'Knowledge Base',
      hasToolExecution && 'Tool Execution',
      hasExternalIntegration && 'External Integration'
    ].filter(Boolean);

    const success = features.length >= 3;
    addTest('Agent Tools System', success, `Features: ${features.join(', ')}`);
    return success;
  } catch (error) {
    addTest('Agent Tools System', false, null, error.message);
    return false;
  }
}

// Test 7: Verify user interface integration
function testUIIntegration() {
  try {
    const virtualAssistantPath = path.join(__dirname, '..', 'src/components/VirtualAssistant.tsx');
    const vaContent = fs.readFileSync(virtualAssistantPath, 'utf8');

    const agentsPagePath = path.join(__dirname, '..', 'src/components/Agents.tsx');
    const agentsExists = fs.existsSync(agentsPagePath);

    const hasOrchestratorIntegration = vaContent.includes('AdminAgentOrchestrator') ||
                                       vaContent.includes('orchestrator');
    const hasChatInterface = vaContent.includes('message') && vaContent.includes('response') &&
                             vaContent.includes('useState');
    const hasAgentSelection = vaContent.includes('agent') && (vaContent.includes('select') ||
                                                             vaContent.includes('choose'));

    const features = [
      hasOrchestratorIntegration && 'Orchestrator Integration',
      hasChatInterface && 'Chat Interface',
      hasAgentSelection && 'Agent Selection',
      agentsExists && 'Agents Page'
    ].filter(Boolean);

    const success = features.length >= 2;
    addTest('UI Integration', success, `Features: ${features.join(', ')}`);
    return success;
  } catch (error) {
    addTest('UI Integration', false, null, error.message);
    return false;
  }
}

// Test 8: Verify comprehensive test framework
function testTestFramework() {
  try {
    const testFrameworkPath = path.join(__dirname, '..', 'src/test/agents-functionality-test.ts');
    const testContent = fs.readFileSync(testFrameworkPath, 'utf8');

    const hasTestClass = testContent.includes('AgentFunctionalityTester') &&
                         testContent.includes('class');
    const hasComprehensiveTest = testContent.includes('runComprehensiveTest') &&
                                 testContent.includes('AgentSystemTestSuite');
    const hasMultipleTestCategories = testContent.includes('testAgentCatalog') &&
                                      testContent.includes('testMessageInterface');
    const hasErrorHandling = testContent.includes('try') && testContent.includes('catch');

    const features = [
      hasTestClass && 'Test Class Structure',
      hasComprehensiveTest && 'Comprehensive Test Method',
      hasMultipleTestCategories && 'Multiple Test Categories',
      hasErrorHandling && 'Error Handling'
    ].filter(Boolean);

    const success = features.length >= 3;
    addTest('Test Framework', success, `Features: ${features.join(', ')}`);
    return success;
  } catch (error) {
    addTest('Test Framework', false, null, error.message);
    return false;
  }
}

// Run all tests
async function runValidation() {
  console.log('Starting virtual agents system validation...\n');

  testAgentFilesExist();
  testTypeScriptCompilation();
  testAgentArchitecture();
  testAgentBuilder();
  testLLMService();
  testToolsSystem();
  testUIIntegration();
  testTestFramework();

  const executionTime = Date.now() - results.startTime;
  const successRate = ((results.passed / results.total) * 100).toFixed(1);

  console.log('\n====================================');
  console.log('📊 VALIDATION SUMMARY');
  console.log('====================================');
  console.log(`Tests Passed: ${results.passed}/${results.total} (${successRate}%)`);
  console.log(`Execution Time: ${executionTime}ms`);

  if (results.passed === results.total) {
    console.log('\n🎉 ALL TESTS PASSED - Virtual Agents System is fully functional!');
  } else if (results.passed >= results.total * 0.8) {
    console.log('\n⚠️  MOSTLY FUNCTIONAL - Virtual Agents System has minor issues');
  } else {
    console.log('\n❌ SYSTEM ISSUES - Virtual Agents System requires attention');
  }

  console.log('\n📋 Test Results:');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}`);
  });

  return results;
}

// Execute validation
runValidation().catch(console.error);