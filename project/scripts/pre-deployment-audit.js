#!/usr/bin/env node

/**
 * Comprehensive Pre-Deployment Audit Script
 * Verifies all systems before committing and deploying to Netlify
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 COMPREHENSIVE PRE-DEPLOYMENT AUDIT');
console.log('=====================================\n');

const auditResults = {
  tests: [],
  passed: 0,
  failed: 0,
  warnings: 0,
  startTime: Date.now()
};

function addAuditResult(category, name, status, details, suggestions = []) {
  const result = { category, name, status, details, suggestions };
  auditResults.tests.push(result);

  if (status === 'PASS') auditResults.passed++;
  else if (status === 'FAIL') auditResults.failed++;
  else if (status === 'WARN') auditResults.warnings++;

  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${category}: ${name}`);
  if (details) console.log(`   ${details}`);
  if (suggestions.length > 0) {
    console.log(`   💡 ${suggestions.join(', ')}`);
  }
  console.log();
}

// 1. PROJECT STRUCTURE AUDIT
function auditProjectStructure() {
  console.log('📁 PROJECT STRUCTURE AUDIT');
  console.log('===========================');

  const criticalFiles = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'netlify.toml', desc: 'Netlify configuration' },
    { path: 'src/main.tsx', desc: 'Application entry point' },
    { path: 'src/components/VirtualAssistant.tsx', desc: 'Virtual assistant component' },
    { path: 'src/services/agents/refactored/AdminAgentOrchestrator.ts', desc: 'Agent orchestrator' },
    { path: 'netlify/functions/agent-proxy.js', desc: 'Agent proxy function' },
    { path: 'public/index.html', desc: 'HTML template' },
    { path: 'vite.config.ts', desc: 'Vite configuration' },
    { path: '.env.production', desc: 'Production environment template' },
    { path: '.env.example', desc: 'Environment example file' }
  ];

  let missingFiles = [];
  let presentFiles = [];

  criticalFiles.forEach(({ path: filePath, desc }) => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      presentFiles.push(desc);
    } else {
      missingFiles.push(`${filePath} (${desc})`);
    }
  });

  if (missingFiles.length === 0) {
    addAuditResult('STRUCTURE', 'Critical Files', 'PASS',
      `All ${criticalFiles.length} critical files present`);
  } else {
    addAuditResult('STRUCTURE', 'Critical Files', 'FAIL',
      `Missing ${missingFiles.length} files`, [`Add missing: ${missingFiles.join(', ')}`]);
  }
}

// 2. PACKAGE.JSON AND DEPENDENCIES AUDIT
function auditPackageJson() {
  console.log('📦 PACKAGE.JSON & DEPENDENCIES AUDIT');
  console.log('=====================================');

  try {
    const packagePath = path.join(projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check essential scripts
    const requiredScripts = ['build', 'dev', 'preview', 'lint', 'typecheck'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

    if (missingScripts.length === 0) {
      addAuditResult('DEPENDENCIES', 'Build Scripts', 'PASS',
        `All ${requiredScripts.length} required scripts present`);
    } else {
      addAuditResult('DEPENDENCIES', 'Build Scripts', 'WARN',
        `Missing scripts: ${missingScripts.join(', ')}`,
        ['Add missing scripts to package.json']);
    }

    // Check critical dependencies
    const criticalDeps = ['react', 'react-dom', 'typescript', 'vite'];
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const missingDeps = criticalDeps.filter(dep => !allDeps[dep]);

    if (missingDeps.length === 0) {
      addAuditResult('DEPENDENCIES', 'Critical Dependencies', 'PASS',
        'All critical dependencies present');
    } else {
      addAuditResult('DEPENDENCIES', 'Critical Dependencies', 'FAIL',
        `Missing: ${missingDeps.join(', ')}`,
        ['Install missing dependencies']);
    }

    // Check Node.js version compatibility
    const nodeVersion = packageJson.engines?.node;
    if (nodeVersion) {
      addAuditResult('DEPENDENCIES', 'Node.js Version', 'PASS',
        `Specified: ${nodeVersion}`);
    } else {
      addAuditResult('DEPENDENCIES', 'Node.js Version', 'WARN',
        'No Node.js version specified',
        ['Add engines.node to package.json']);
    }

  } catch (error) {
    addAuditResult('DEPENDENCIES', 'Package.json', 'FAIL',
      `Error reading package.json: ${error.message}`,
      ['Fix package.json syntax']);
  }
}

// 3. ENVIRONMENT CONFIGURATION AUDIT
function auditEnvironmentConfig() {
  console.log('🔧 ENVIRONMENT CONFIGURATION AUDIT');
  console.log('===================================');

  const envFiles = ['.env', '.env.production', '.env.example'];
  let criticalVarsFound = 0;
  const criticalVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FORMSPREE_CONTACT_KEY',
    'VITE_ADMIN_PASSWORD'
  ];

  // Check main .env file
  const mainEnvPath = path.join(projectRoot, '.env');
  if (fs.existsSync(mainEnvPath)) {
    const envContent = fs.readFileSync(mainEnvPath, 'utf8');

    criticalVars.forEach(varName => {
      if (envContent.includes(`${varName}=`) &&
          !envContent.includes(`${varName}=your_`) &&
          !envContent.includes(`${varName}=`)) {
        criticalVarsFound++;
      }
    });

    addAuditResult('ENVIRONMENT', 'Environment Variables', 'PASS',
      `${criticalVarsFound}/4 critical variables configured`);
  } else {
    addAuditResult('ENVIRONMENT', 'Environment Variables', 'FAIL',
      '.env file not found',
      ['Create .env file with required variables']);
  }

  // Check production template
  const prodEnvPath = path.join(projectRoot, '.env.production');
  if (fs.existsSync(prodEnvPath)) {
    addAuditResult('ENVIRONMENT', 'Production Template', 'PASS',
      'Production environment template exists');
  } else {
    addAuditResult('ENVIRONMENT', 'Production Template', 'WARN',
      'No production environment template',
      ['Create .env.production template']);
  }
}

// 4. NETLIFY CONFIGURATION AUDIT
function auditNetlifyConfig() {
  console.log('🌐 NETLIFY CONFIGURATION AUDIT');
  console.log('===============================');

  const netlifyConfigPath = path.join(projectRoot, 'netlify.toml');

  if (!fs.existsSync(netlifyConfigPath)) {
    addAuditResult('NETLIFY', 'Configuration File', 'FAIL',
      'netlify.toml not found',
      ['Create netlify.toml configuration']);
    return;
  }

  const netlifyConfig = fs.readFileSync(netlifyConfigPath, 'utf8');

  // Check essential configurations
  const requiredConfigs = [
    { key: 'publish = "dist"', desc: 'Publish directory' },
    { key: 'command = "npm run build"', desc: 'Build command' },
    { key: 'functions = "netlify/functions"', desc: 'Functions directory' },
    { key: 'NODE_VERSION', desc: 'Node.js version' },
    { key: '[context.production]', desc: 'Production context' }
  ];

  let foundConfigs = 0;
  const missingConfigs = [];

  requiredConfigs.forEach(({ key, desc }) => {
    if (netlifyConfig.includes(key)) {
      foundConfigs++;
    } else {
      missingConfigs.push(desc);
    }
  });

  if (foundConfigs === requiredConfigs.length) {
    addAuditResult('NETLIFY', 'Configuration', 'PASS',
      `All ${requiredConfigs.length} essential configurations present`);
  } else {
    addAuditResult('NETLIFY', 'Configuration', 'WARN',
      `${foundConfigs}/${requiredConfigs.length} configurations found`,
      [`Add missing: ${missingConfigs.join(', ')}`]);
  }

  // Check for agent proxy function
  if (netlifyConfig.includes('agent-proxy')) {
    addAuditResult('NETLIFY', 'Agent Proxy Config', 'PASS',
      'Agent proxy function configured');
  } else {
    addAuditResult('NETLIFY', 'Agent Proxy Config', 'WARN',
      'No agent proxy configuration found',
      ['Add agent proxy function configuration']);
  }
}

// 5. VIRTUAL AGENTS SYSTEM AUDIT
function auditVirtualAgents() {
  console.log('🤖 VIRTUAL AGENTS SYSTEM AUDIT');
  console.log('===============================');

  const agentFiles = [
    { path: 'src/services/agents/refactored/AdminAgentOrchestrator.ts', desc: 'Agent orchestrator' },
    { path: 'src/services/agents/refactored/BaseAgent.ts', desc: 'Base agent class' },
    { path: 'src/services/agents/refactored/AgentBuilder.ts', desc: 'Agent builder' },
    { path: 'src/services/agents/refactored/LLMService.ts', desc: 'LLM service' },
    { path: 'src/services/agents/refactored/AgentToolsSystem.ts', desc: 'Tools system' },
    { path: 'src/components/VirtualAssistant.tsx', desc: 'UI component' },
    { path: 'src/components/Agents.tsx', desc: 'Agents page' },
    { path: 'netlify/functions/agent-proxy.js', desc: 'Netlify function' }
  ];

  let presentFiles = 0;
  const missingFiles = [];

  agentFiles.forEach(({ path: filePath, desc }) => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      presentFiles++;
    } else {
      missingFiles.push(`${desc} (${filePath})`);
    }
  });

  if (presentFiles === agentFiles.length) {
    addAuditResult('AGENTS', 'System Files', 'PASS',
      `All ${agentFiles.length} agent system files present`);
  } else {
    addAuditResult('AGENTS', 'System Files', 'FAIL',
      `Missing ${agentFiles.length - presentFiles} files`,
      [`Add missing: ${missingFiles.join(', ')}`]);
  }

  // Check agent proxy function content
  const agentProxyPath = path.join(projectRoot, 'netlify/functions/agent-proxy.js');
  if (fs.existsSync(agentProxyPath)) {
    const agentProxyContent = fs.readFileSync(agentProxyPath, 'utf8');

    const features = [
      { key: 'handleGroqRequest', desc: 'Groq integration' },
      { key: 'handleOpenAIRequest', desc: 'OpenAI integration' },
      { key: 'handleOllamaRequest', desc: 'Ollama integration' },
      { key: 'checkRateLimit', desc: 'Rate limiting' },
      { key: 'Access-Control-Allow-Origin', desc: 'CORS headers' }
    ];

    let foundFeatures = 0;
    features.forEach(({ key }) => {
      if (agentProxyContent.includes(key)) foundFeatures++;
    });

    if (foundFeatures >= 4) {
      addAuditResult('AGENTS', 'Proxy Function', 'PASS',
        `${foundFeatures}/${features.length} features implemented`);
    } else {
      addAuditResult('AGENTS', 'Proxy Function', 'WARN',
        `Only ${foundFeatures}/${features.length} features found`,
        ['Enhance agent proxy function']);
    }
  }
}

// 6. BUILD SYSTEM AUDIT
async function auditBuildSystem() {
  console.log('🔨 BUILD SYSTEM AUDIT');
  console.log('======================');

  try {
    // Test TypeScript compilation
    console.log('   Testing TypeScript compilation...');
    execSync('npm run typecheck', {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 30000
    });
    addAuditResult('BUILD', 'TypeScript Compilation', 'PASS',
      'No TypeScript errors found');
  } catch (error) {
    addAuditResult('BUILD', 'TypeScript Compilation', 'FAIL',
      'TypeScript compilation failed',
      ['Fix TypeScript errors before deployment']);
  }

  try {
    // Test linting
    console.log('   Testing ESLint...');
    execSync('npm run lint', {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 30000
    });
    addAuditResult('BUILD', 'Code Linting', 'PASS',
      'No linting errors found');
  } catch (error) {
    addAuditResult('BUILD', 'Code Linting', 'WARN',
      'Linting issues found',
      ['Fix linting warnings for cleaner code']);
  }

  try {
    // Test production build
    console.log('   Testing production build...');
    const buildStart = Date.now();
    execSync('npm run build', {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 120000
    });
    const buildTime = Date.now() - buildStart;

    addAuditResult('BUILD', 'Production Build', 'PASS',
      `Build completed in ${(buildTime / 1000).toFixed(1)}s`);

    // Check build output
    const distPath = path.join(projectRoot, 'dist');
    if (fs.existsSync(distPath)) {
      const distFiles = fs.readdirSync(distPath);
      const hasIndex = distFiles.includes('index.html');
      const hasAssets = distFiles.includes('assets');

      if (hasIndex && hasAssets) {
        addAuditResult('BUILD', 'Build Output', 'PASS',
          'All essential build artifacts present');
      } else {
        addAuditResult('BUILD', 'Build Output', 'WARN',
          'Some build artifacts missing',
          ['Verify build configuration']);
      }
    }
  } catch (error) {
    addAuditResult('BUILD', 'Production Build', 'FAIL',
      'Production build failed',
      ['Fix build errors before deployment']);
  }
}

// 7. GIT REPOSITORY AUDIT
function auditGitRepository() {
  console.log('🔄 GIT REPOSITORY AUDIT');
  console.log('=======================');

  try {
    // Check if git repository exists
    const gitPath = path.join(projectRoot, '.git');
    if (!fs.existsSync(gitPath)) {
      addAuditResult('GIT', 'Repository', 'FAIL',
        'Not a git repository',
        ['Initialize git repository: git init']);
      return;
    }

    // Check git status
    const gitStatus = execSync('git status --porcelain', {
      cwd: projectRoot,
      encoding: 'utf8'
    });

    if (gitStatus.trim() === '') {
      addAuditResult('GIT', 'Working Directory', 'PASS',
        'Working directory clean');
    } else {
      const changedFiles = gitStatus.split('\n').filter(line => line.trim()).length;
      addAuditResult('GIT', 'Working Directory', 'WARN',
        `${changedFiles} uncommitted changes`,
        ['Commit changes before deployment']);
    }

    // Check for remote repository
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();

      if (remoteUrl) {
        addAuditResult('GIT', 'Remote Repository', 'PASS',
          `Remote configured: ${remoteUrl.substring(0, 50)}...`);
      }
    } catch (error) {
      addAuditResult('GIT', 'Remote Repository', 'WARN',
        'No remote repository configured',
        ['Add remote: git remote add origin <url>']);
    }

    // Check current branch
    const currentBranch = execSync('git branch --show-current', {
      cwd: projectRoot,
      encoding: 'utf8'
    }).trim();

    addAuditResult('GIT', 'Current Branch', 'PASS',
      `On branch: ${currentBranch}`);

  } catch (error) {
    addAuditResult('GIT', 'Repository Status', 'FAIL',
      `Git error: ${error.message}`,
      ['Fix git configuration']);
  }
}

// 8. SECURITY AUDIT
function auditSecurity() {
  console.log('🔒 SECURITY AUDIT');
  console.log('==================');

  // Check for sensitive files
  const sensitiveFiles = ['.env', '.env.local', '.env.development.local'];
  const gitignorePath = path.join(projectRoot, '.gitignore');

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

    const protectedFiles = sensitiveFiles.filter(file =>
      gitignoreContent.includes(file) || gitignoreContent.includes('.env*')
    );

    if (protectedFiles.length > 0 || gitignoreContent.includes('.env')) {
      addAuditResult('SECURITY', 'Sensitive Files', 'PASS',
        'Environment files protected in .gitignore');
    } else {
      addAuditResult('SECURITY', 'Sensitive Files', 'WARN',
        'Environment files may not be protected',
        ['Add .env* to .gitignore']);
    }
  } else {
    addAuditResult('SECURITY', 'Gitignore', 'WARN',
      'No .gitignore file found',
      ['Create .gitignore to protect sensitive files']);
  }

  // Check for API keys in tracked files
  try {
    const trackedFiles = execSync('git ls-files', {
      cwd: projectRoot,
      encoding: 'utf8'
    }).split('\n');

    let apiKeysFound = 0;
    const suspiciousPatterns = [
      /sk-[a-zA-Z0-9]{32,}/,  // OpenAI keys
      /gsk_[a-zA-Z0-9]{32,}/, // Groq keys
      /[a-zA-Z0-9]{32,}==$/   // Base64 encoded keys
    ];

    trackedFiles.forEach(file => {
      if (file.trim() && fs.existsSync(path.join(projectRoot, file))) {
        const content = fs.readFileSync(path.join(projectRoot, file), 'utf8');
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(content)) apiKeysFound++;
        });
      }
    });

    if (apiKeysFound === 0) {
      addAuditResult('SECURITY', 'API Keys', 'PASS',
        'No API keys found in tracked files');
    } else {
      addAuditResult('SECURITY', 'API Keys', 'FAIL',
        `${apiKeysFound} potential API keys found in tracked files`,
        ['Remove API keys from tracked files, use environment variables']);
    }
  } catch (error) {
    addAuditResult('SECURITY', 'API Keys Check', 'WARN',
      'Could not scan for API keys',
      ['Manually verify no API keys are in tracked files']);
  }
}

// Run all audits
async function runComprehensiveAudit() {
  console.log('Starting comprehensive pre-deployment audit...\n');

  auditProjectStructure();
  auditPackageJson();
  auditEnvironmentConfig();
  auditNetlifyConfig();
  auditVirtualAgents();
  await auditBuildSystem();
  auditGitRepository();
  auditSecurity();

  const executionTime = Date.now() - auditResults.startTime;
  const totalTests = auditResults.passed + auditResults.failed + auditResults.warnings;

  console.log('\n=====================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('=====================================');
  console.log(`Tests Run: ${totalTests}`);
  console.log(`✅ Passed: ${auditResults.passed}`);
  console.log(`❌ Failed: ${auditResults.failed}`);
  console.log(`⚠️  Warnings: ${auditResults.warnings}`);
  console.log(`⏱️  Execution Time: ${executionTime}ms`);

  // Deployment readiness assessment
  let deploymentStatus = 'NOT READY';
  let recommendation = '';

  if (auditResults.failed === 0) {
    if (auditResults.warnings === 0) {
      deploymentStatus = '🟢 FULLY READY';
      recommendation = 'DEPLOY IMMEDIATELY - All systems optimal!';
    } else if (auditResults.warnings <= 3) {
      deploymentStatus = '🟡 READY WITH WARNINGS';
      recommendation = 'DEPLOY READY - Address warnings for optimal experience';
    } else {
      deploymentStatus = '🟠 MOSTLY READY';
      recommendation = 'Consider addressing warnings before deployment';
    }
  } else if (auditResults.failed <= 2) {
    deploymentStatus = '🔴 NOT READY';
    recommendation = 'Fix critical issues before deployment';
  } else {
    deploymentStatus = '🚫 DEPLOYMENT BLOCKED';
    recommendation = 'Multiple critical issues must be resolved';
  }

  console.log(`\n🎯 DEPLOYMENT STATUS: ${deploymentStatus}`);
  console.log(`📋 RECOMMENDATION: ${recommendation}`);

  // Show critical issues that need fixing
  const criticalIssues = auditResults.tests.filter(test => test.status === 'FAIL');
  if (criticalIssues.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES TO FIX:');
    criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.category}: ${issue.name}`);
      console.log(`   ${issue.details}`);
      if (issue.suggestions.length > 0) {
        console.log(`   💡 ${issue.suggestions.join(', ')}`);
      }
    });
  }

  // Show warnings for optimization
  const warnings = auditResults.tests.filter(test => test.status === 'WARN');
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS FOR OPTIMIZATION:');
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning.category}: ${warning.name}`);
      console.log(`   ${warning.details}`);
      if (warning.suggestions.length > 0) {
        console.log(`   💡 ${warning.suggestions.join(', ')}`);
      }
    });
  }

  console.log('\n🎯 NEXT STEPS:');
  if (auditResults.failed === 0) {
    console.log('1. ✅ Commit your changes: git add . && git commit -m "Deploy ready"');
    console.log('2. ✅ Push to repository: git push origin main');
    console.log('3. ✅ Connect repository to Netlify for auto-deployment');
    console.log('4. ✅ Configure environment variables in Netlify dashboard');
    console.log('5. ✅ Monitor deployment and test functionality');
  } else {
    console.log('1. 🔧 Fix critical issues listed above');
    console.log('2. 🔄 Re-run audit: npm run audit:pre-deployment');
    console.log('3. ✅ Proceed with deployment when all issues resolved');
  }

  return auditResults.failed === 0;
}

// Execute the audit
runComprehensiveAudit()
  .then(canDeploy => {
    process.exit(canDeploy ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });