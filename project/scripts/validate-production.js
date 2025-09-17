#!/usr/bin/env node

/**
 * Production Validation Script
 * Runs comprehensive checks before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

let errors = 0;
let warnings = 0;

function log(message, type = 'info') {
  const prefix = {
    error: `${colors.red}❌ ERROR:${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARNING:${colors.reset}`,
    success: `${colors.green}✅ SUCCESS:${colors.reset}`,
    info: `${colors.blue}ℹ️  INFO:${colors.reset}`,
    header: `${colors.magenta}📋${colors.reset}`
  };
  
  console.log(`${prefix[type] || prefix.info} ${message}`);
  
  if (type === 'error') errors++;
  if (type === 'warning') warnings++;
}

function checkFile(filePath, message) {
  if (fs.existsSync(filePath)) {
    log(`${message} found`, 'success');
    return true;
  } else {
    log(`${message} missing`, 'error');
    return false;
  }
}

function runCommand(command, description) {
  try {
    execSync(command, { stdio: 'pipe' });
    log(`${description} passed`, 'success');
    return true;
  } catch (error) {
    log(`${description} failed`, 'error');
    return false;
  }
}

function validateEnvironmentVariables() {
  log('ENVIRONMENT VARIABLES', 'header');
  
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FORMSPREE_CONTACT_KEY',
    'VITE_FORMSPREE_APPLY_KEY',
    'VITE_FORMSPREE_NEWSLETTER_KEY'
  ];
  
  const envFile = '.env.production';
  if (!fs.existsSync(envFile)) {
    log(`.env.production file not found`, 'warning');
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf-8');
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      log(`${varName} configured`, 'success');
    } else {
      log(`${varName} not configured`, 'warning');
    }
  });
}

function validateSecurityHeaders() {
  log('SECURITY CONFIGURATION', 'header');
  
  // Check Netlify configuration
  if (checkFile('netlify.toml', 'Netlify security headers')) {
    const netlifyCon

fig = fs.readFileSync('netlify.toml', 'utf-8');
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];
    
    securityHeaders.forEach(header => {
      if (netlifyConfig.includes(header)) {
        log(`${header} configured`, 'success');
      } else {
        log(`${header} not configured`, 'warning');
      }
    });
  }
  
  // Check Vercel configuration
  checkFile('vercel.json', 'Vercel security headers');
}

function validateBuildOutput() {
  log('BUILD OUTPUT', 'header');
  
  if (!fs.existsSync('dist')) {
    log('Build directory not found. Run npm run build first', 'error');
    return;
  }
  
  const requiredFiles = [
    'dist/index.html',
    'dist/sw.js'
  ];
  
  requiredFiles.forEach(file => {
    checkFile(file, path.basename(file));
  });
  
  // Check build size
  const getDirSize = (dirPath) => {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    });
    
    return size;
  };
  
  const buildSize = getDirSize('dist');
  const sizeMB = (buildSize / (1024 * 1024)).toFixed(2);
  
  if (sizeMB > 10) {
    log(`Build size is ${sizeMB}MB - consider optimization`, 'warning');
  } else {
    log(`Build size is ${sizeMB}MB`, 'success');
  }
}

function validateDependencies() {
  log('DEPENDENCIES', 'header');
  
  // Check for security vulnerabilities
  try {
    const auditResult = execSync('npm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
      log(`Found ${audit.metadata.vulnerabilities.high} high and ${audit.metadata.vulnerabilities.critical} critical vulnerabilities`, 'error');
    } else if (audit.metadata.vulnerabilities.moderate > 0) {
      log(`Found ${audit.metadata.vulnerabilities.moderate} moderate vulnerabilities`, 'warning');
    } else {
      log('No security vulnerabilities found', 'success');
    }
  } catch (error) {
    log('npm audit check failed', 'warning');
  }
  
  // Check for outdated packages
  try {
    execSync('npm outdated', { stdio: 'pipe' });
    log('All packages up to date', 'success');
  } catch {
    log('Some packages are outdated', 'warning');
  }
}

function validateTests() {
  log('TESTS', 'header');
  
  runCommand('npm run type-check', 'TypeScript type checking');
  runCommand('npm run lint', 'ESLint checking');
  runCommand('npm test', 'Test suite');
}

function validateSEO() {
  log('SEO & METADATA', 'header');
  
  checkFile('dist/sitemap.xml', 'Sitemap');
  checkFile('dist/robots.txt', 'Robots.txt');
  checkFile('public/favicon.ico', 'Favicon');
  
  // Check meta tags in index.html
  if (fs.existsSync('dist/index.html')) {
    const html = fs.readFileSync('dist/index.html', 'utf-8');
    const metaTags = [
      '<meta name="description"',
      '<meta property="og:title"',
      '<meta property="og:description"',
      '<meta name="twitter:card"'
    ];
    
    metaTags.forEach(tag => {
      if (html.includes(tag)) {
        log(`${tag.match(/name="(\w+)"|property="([^"]+)"/)[0]} found`, 'success');
      } else {
        log(`${tag} missing`, 'warning');
      }
    });
  }
}

function validatePerformance() {
  log('PERFORMANCE', 'header');
  
  // Check for console.logs in production
  if (fs.existsSync('dist')) {
    const jsFiles = fs.readdirSync('dist').filter(f => f.endsWith('.js'));
    let consoleLogsFound = false;
    
    jsFiles.forEach(file => {
      const content = fs.readFileSync(path.join('dist', file), 'utf-8');
      if (content.includes('console.log')) {
        consoleLogsFound = true;
      }
    });
    
    if (consoleLogsFound) {
      log('console.log statements found in production build', 'warning');
    } else {
      log('No console.log statements in production build', 'success');
    }
  }
  
  // Check for source maps
  const sourceMaps = fs.existsSync('dist') && 
    fs.readdirSync('dist').some(f => f.endsWith('.map'));
  
  if (sourceMaps) {
    log('Source maps found in production build', 'warning');
  } else {
    log('No source maps in production build', 'success');
  }
}

// Main validation
console.log(colors.blue + '\n========================================');
console.log('   PRODUCTION VALIDATION REPORT');
console.log('========================================\n' + colors.reset);

validateEnvironmentVariables();
console.log();

validateSecurityHeaders();
console.log();

validateBuildOutput();
console.log();

validateDependencies();
console.log();

validateTests();
console.log();

validateSEO();
console.log();

validatePerformance();
console.log();

// Summary
console.log(colors.blue + '========================================');
console.log('   SUMMARY');
console.log('========================================' + colors.reset);

if (errors > 0) {
  log(`Found ${errors} errors that must be fixed before deployment`, 'error');
  process.exit(1);
} else if (warnings > 0) {
  log(`Found ${warnings} warnings to review`, 'warning');
  log('Deployment can proceed, but review warnings', 'success');
} else {
  log('All validation checks passed! Ready for production deployment', 'success');
}

console.log();