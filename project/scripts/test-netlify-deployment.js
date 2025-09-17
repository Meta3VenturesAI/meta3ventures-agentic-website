#!/usr/bin/env node

/**
 * Netlify Deployment Validation Script
 * Tests production deployment readiness for virtual agents system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 NETLIFY DEPLOYMENT VALIDATION TEST');
console.log('====================================\n');

const results = {
  tests: [],
  passed: 0,
  total: 0,
  startTime: Date.now(),
  deploymentReadiness: 'unknown'
};

function addTest(name, success, details, suggestions = []) {
  results.tests.push({ name, success, details, suggestions });
  results.total++;
  if (success) results.passed++;

  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
  if (!success && suggestions.length > 0) {
    console.log(`   💡 Suggestions: ${suggestions.join(', ')}`);
  }
  console.log();
}

// Test 1: Netlify configuration validation
function testNetlifyConfiguration() {
  try {
    const netlifyConfigPath = path.join(__dirname, '..', 'netlify.toml');

    if (!fs.existsSync(netlifyConfigPath)) {
      addTest('Netlify Configuration', false, 'netlify.toml not found',
        ['Create netlify.toml configuration file']);
      return false;
    }

    const netlifyConfig = fs.readFileSync(netlifyConfigPath, 'utf8');

    // Check for essential configurations
    const hasPublishDir = netlifyConfig.includes('publish = "dist"');
    const hasBuildCommand = netlifyConfig.includes('command = "npm run build"');
    const hasFunctionsDir = netlifyConfig.includes('functions = "netlify/functions"');
    const hasNodeVersion = netlifyConfig.includes('NODE_VERSION');
    const hasProductionContext = netlifyConfig.includes('[context.production]');
    const hasAgentProxy = netlifyConfig.includes('agent-proxy');

    const configurations = [
      hasPublishDir && 'Publish Directory',
      hasBuildCommand && 'Build Command',
      hasFunctionsDir && 'Functions Directory',
      hasNodeVersion && 'Node Version',
      hasProductionContext && 'Production Context',
      hasAgentProxy && 'Agent Proxy Config'
    ].filter(Boolean);

    const success = configurations.length >= 5;
    addTest('Netlify Configuration', success,
      `Found ${configurations.length}/6 essential configurations: ${configurations.join(', ')}`,
      success ? [] : ['Add missing configurations to netlify.toml']);

    return success;
  } catch (error) {
    addTest('Netlify Configuration', false, `Error reading config: ${error.message}`);
    return false;
  }
}

// Test 2: Agent proxy function validation
function testAgentProxyFunction() {
  try {
    const agentProxyPath = path.join(__dirname, '..', 'netlify/functions/agent-proxy.js');

    if (!fs.existsSync(agentProxyPath)) {
      addTest('Agent Proxy Function', false, 'agent-proxy.js not found',
        ['Create netlify/functions/agent-proxy.js']);
      return false;
    }

    const agentProxyContent = fs.readFileSync(agentProxyPath, 'utf8');

    // Check for cloud provider handlers
    const hasGroqHandler = agentProxyContent.includes('handleGroqRequest');
    const hasOpenAIHandler = agentProxyContent.includes('handleOpenAIRequest');
    const hasAnthropicHandler = agentProxyContent.includes('handleAnthropicRequest');
    const hasAutoProvider = agentProxyContent.includes('handleAutoProvider');
    const hasRateLimiting = agentProxyContent.includes('checkRateLimit');
    const hasCorsHeaders = agentProxyContent.includes('Access-Control-Allow-Origin');
    const hasErrorHandling = agentProxyContent.includes('try') && agentProxyContent.includes('catch');
    const hasEnvironmentVars = agentProxyContent.includes('process.env.VITE_');

    const features = [
      hasGroqHandler && 'Groq Handler',
      hasOpenAIHandler && 'OpenAI Handler',
      hasAnthropicHandler && 'Anthropic Handler',
      hasAutoProvider && 'Auto Provider Selection',
      hasRateLimiting && 'Rate Limiting',
      hasCorsHeaders && 'CORS Headers',
      hasErrorHandling && 'Error Handling',
      hasEnvironmentVars && 'Environment Variables'
    ].filter(Boolean);

    const success = features.length >= 6;
    addTest('Agent Proxy Function', success,
      `Found ${features.length}/8 features: ${features.join(', ')}`,
      success ? [] : ['Enhance agent-proxy.js with missing features']);

    return success;
  } catch (error) {
    addTest('Agent Proxy Function', false, `Error reading function: ${error.message}`);
    return false;
  }
}

// Test 3: Environment variables template validation
function testEnvironmentVariables() {
  try {
    const envProductionPath = path.join(__dirname, '..', '.env.production');

    if (!fs.existsSync(envProductionPath)) {
      addTest('Environment Variables', false, '.env.production template not found',
        ['Create .env.production template with required variables']);
      return false;
    }

    const envContent = fs.readFileSync(envProductionPath, 'utf8');

    // Critical variables for virtual agents
    const criticalVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_GROQ_API_KEY',
      'VITE_FORMSPREE_CONTACT_KEY',
      'VITE_ADMIN_PASSWORD',
      'VITE_AGENTS_DISABLED',
      'VITE_AGENT_PROXY_PATH'
    ];

    const foundVars = criticalVars.filter(varName => envContent.includes(varName));
    const missingVars = criticalVars.filter(varName => !envContent.includes(varName));

    const success = foundVars.length >= 6; // At least 6 of 7 critical variables
    addTest('Environment Variables', success,
      `Found ${foundVars.length}/${criticalVars.length} critical variables`,
      missingVars.length > 0 ? [`Add missing variables: ${missingVars.join(', ')}`] : []);

    return success;
  } catch (error) {
    addTest('Environment Variables', false, `Error reading env template: ${error.message}`);
    return false;
  }
}

// Test 4: Build script validation
function testBuildScripts() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const scripts = packageJson.scripts || {};

    const hasBuild = scripts.build;
    const hasBuildProduction = scripts['build:production'];
    const hasDeployNetlify = scripts['deploy:netlify'];
    const hasTypeCheck = scripts.typecheck || scripts['type-check'];
    const hasLint = scripts.lint;

    const availableScripts = [
      hasBuild && 'build',
      hasBuildProduction && 'build:production',
      hasDeployNetlify && 'deploy:netlify',
      hasTypeCheck && 'typecheck',
      hasLint && 'lint'
    ].filter(Boolean);

    const success = availableScripts.length >= 3;
    addTest('Build Scripts', success,
      `Found ${availableScripts.length}/5 build scripts: ${availableScripts.join(', ')}`,
      success ? [] : ['Add missing build scripts to package.json']);

    return success;
  } catch (error) {
    addTest('Build Scripts', false, `Error reading package.json: ${error.message}`);
    return false;
  }
}

// Test 5: Agent system files validation
function testAgentSystemFiles() {
  const requiredFiles = [
    'src/services/agents/refactored/AdminAgentOrchestrator.ts',
    'src/services/agents/refactored/BaseAgent.ts',
    'src/services/agents/refactored/LLMService.ts',
    'src/services/agents/refactored/AgentBuilder.ts',
    'src/components/VirtualAssistant.tsx'
  ];

  let existingFiles = 0;
  const missingFiles = [];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      existingFiles++;
    } else {
      missingFiles.push(file);
    }
  }

  const success = existingFiles === requiredFiles.length;
  addTest('Agent System Files', success,
    `Found ${existingFiles}/${requiredFiles.length} required agent files`,
    missingFiles.length > 0 ? [`Missing files: ${missingFiles.join(', ')}`] : []);

  return success;
}

// Test 6: Production build test
async function testProductionBuild() {
  try {
    // Check if dist directory exists (from previous build)
    const distPath = path.join(__dirname, '..', 'dist');
    const hasDistDirectory = fs.existsSync(distPath);

    if (hasDistDirectory) {
      // Check for essential build artifacts
      const indexHtmlPath = path.join(distPath, 'index.html');
      const assetsPath = path.join(distPath, 'assets');

      const hasIndexHtml = fs.existsSync(indexHtmlPath);
      const hasAssets = fs.existsSync(assetsPath);

      let hasAgentAssets = false;
      if (hasAssets) {
        const assetsFiles = fs.readdirSync(assetsPath);
        hasAgentAssets = assetsFiles.some(file =>
          file.includes('Agents') || file.includes('AdminDashboard')
        );
      }

      const buildArtifacts = [
        hasIndexHtml && 'index.html',
        hasAssets && 'assets directory',
        hasAgentAssets && 'agent components'
      ].filter(Boolean);

      const success = buildArtifacts.length >= 2;
      addTest('Production Build', success,
        `Found ${buildArtifacts.length}/3 build artifacts: ${buildArtifacts.join(', ')}`,
        success ? [] : ['Run npm run build to generate production build']);

      return success;
    } else {
      addTest('Production Build', false, 'No dist directory found',
        ['Run npm run build to test production build']);
      return false;
    }
  } catch (error) {
    addTest('Production Build', false, `Build validation error: ${error.message}`);
    return false;
  }
}

// Test 7: Deployment readiness checklist
function testDeploymentReadiness() {
  const checklist = {
    netlifyConfig: results.tests.find(t => t.name === 'Netlify Configuration')?.success || false,
    agentProxy: results.tests.find(t => t.name === 'Agent Proxy Function')?.success || false,
    environmentVars: results.tests.find(t => t.name === 'Environment Variables')?.success || false,
    buildScripts: results.tests.find(t => t.name === 'Build Scripts')?.success || false,
    agentFiles: results.tests.find(t => t.name === 'Agent System Files')?.success || false,
    productionBuild: results.tests.find(t => t.name === 'Production Build')?.success || false
  };

  const passedChecks = Object.values(checklist).filter(Boolean).length;
  const totalChecks = Object.keys(checklist).length;

  const readinessScore = (passedChecks / totalChecks) * 100;
  let readinessLevel = 'NOT READY';

  if (readinessScore >= 90) {
    readinessLevel = 'FULLY READY';
  } else if (readinessScore >= 75) {
    readinessLevel = 'MOSTLY READY';
  } else if (readinessScore >= 50) {
    readinessLevel = 'PARTIALLY READY';
  }

  results.deploymentReadiness = readinessLevel;

  const success = readinessScore >= 75;
  addTest('Deployment Readiness', success,
    `${readinessScore.toFixed(1)}% ready (${passedChecks}/${totalChecks} checks passed)`,
    success ? [] : ['Address failing tests before deployment']);

  return success;
}

// Run all validation tests
async function runNetlifyValidation() {
  console.log('Starting Netlify deployment validation...\n');

  // Run tests in sequence
  testNetlifyConfiguration();
  testAgentProxyFunction();
  testEnvironmentVariables();
  testBuildScripts();
  testAgentSystemFiles();
  await testProductionBuild();
  testDeploymentReadiness();

  const executionTime = Date.now() - results.startTime;
  const successRate = ((results.passed / results.total) * 100).toFixed(1);

  console.log('\n====================================');
  console.log('🚀 NETLIFY DEPLOYMENT SUMMARY');
  console.log('====================================');
  console.log(`Tests Passed: ${results.passed}/${results.total} (${successRate}%)`);
  console.log(`Deployment Readiness: ${results.deploymentReadiness}`);
  console.log(`Validation Time: ${executionTime}ms`);

  // Deployment recommendations
  console.log('\n📋 DEPLOYMENT RECOMMENDATIONS:');

  if (results.deploymentReadiness === 'FULLY READY') {
    console.log('✅ Your virtual agents system is ready for Netlify deployment!');
    console.log('   Next steps:');
    console.log('   1. Configure environment variables in Netlify dashboard');
    console.log('   2. Connect your Git repository to Netlify');
    console.log('   3. Deploy to a preview branch first for testing');
    console.log('   4. Monitor Netlify Functions logs after deployment');
  } else if (results.deploymentReadiness === 'MOSTLY READY') {
    console.log('⚠️  Nearly ready for deployment with minor issues:');
    const failedTests = results.tests.filter(test => !test.success);
    failedTests.forEach(test => {
      console.log(`   - Fix: ${test.name} - ${test.suggestions.join(', ')}`);
    });
  } else {
    console.log('❌ Deployment not recommended. Address these issues first:');
    const failedTests = results.tests.filter(test => !test.success);
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.suggestions.join(', ')}`);
    });
  }

  console.log('\n📄 Detailed Test Results:');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${test.name}`);
  });

  return results;
}

// Execute validation
runNetlifyValidation()
  .then(results => {
    process.exit(results.deploymentReadiness === 'FULLY READY' ? 0 : 1);
  })
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });