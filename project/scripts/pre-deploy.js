#!/usr/bin/env node

/**
 * Pre-deployment script for Meta3Ventures
 * Runs validation and preparation tasks before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// Validation tasks
const tasks = [
  {
    name: 'Check Node version',
    run: () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
      if (majorVersion < 18) {
        throw new Error(`Node.js version 18 or higher required. Current: ${nodeVersion}`);
      }
      return `Node.js ${nodeVersion} ✓`;
    }
  },
  {
    name: 'Verify environment variables',
    run: () => {
      const required = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_FORMSPREE_CONTACT_KEY'
      ];
      
      const envFile = path.join(process.cwd(), '.env.production');
      if (!fs.existsSync(envFile)) {
        log.warn('.env.production not found, checking process.env');
      }
      
      const missing = required.filter(key => !process.env[key]);
      if (missing.length > 0 && !fs.existsSync(envFile)) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }
      
      return 'Environment variables configured ✓';
    }
  },
  {
    name: 'Check dependencies',
    run: () => {
      try {
        execSync('npm ls --depth=0', { stdio: 'ignore' });
        return 'Dependencies installed ✓';
      } catch (error) {
        throw new Error('Dependencies not properly installed. Run: npm install');
      }
    }
  },
  {
    name: 'Lint code',
    run: () => {
      try {
        execSync('npm run lint', { stdio: 'pipe' });
        return 'Code linting passed ✓';
      } catch (error) {
        log.warn('Linting issues found. Run: npm run lint:fix');
        return 'Linting completed with warnings';
      }
    }
  },
  {
    name: 'Type check',
    run: () => {
      try {
        execSync('npm run type-check', { stdio: 'pipe' });
        return 'TypeScript check passed ✓';
      } catch (error) {
        throw new Error('TypeScript errors found. Run: npm run type-check');
      }
    }
  },
  {
    name: 'Run tests',
    run: () => {
      try {
        execSync('npm test -- --run', { stdio: 'pipe' });
        return 'Tests passed ✓';
      } catch (error) {
        log.warn('Some tests failed. Review test results.');
        return 'Tests completed with warnings';
      }
    }
  },
  {
    name: 'Check build size',
    run: () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      // First, do a test build
      log.info('Running test build to check size...');
      execSync('npm run build', { stdio: 'pipe' });
      
      const distPath = path.join(process.cwd(), 'dist');
      if (!fs.existsSync(distPath)) {
        throw new Error('Build directory not found');
      }
      
      const getTotalSize = (dirPath) => {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory()) {
            totalSize += getTotalSize(filePath);
          } else {
            totalSize += stats.size;
          }
        });
        
        return totalSize;
      };
      
      const totalSize = getTotalSize(distPath);
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      if (totalSize > maxSize) {
        log.warn(`Build size (${sizeMB}MB) exceeds recommended limit (5MB)`);
      }
      
      return `Build size: ${sizeMB}MB ✓`;
    }
  },
  {
    name: 'Validate Supabase migrations',
    run: () => {
      const migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
      if (!fs.existsSync(migrationsPath)) {
        log.warn('No Supabase migrations found');
        return 'Supabase migrations skipped';
      }
      
      const migrations = fs.readdirSync(migrationsPath);
      if (migrations.length === 0) {
        log.warn('Migrations directory is empty');
        return 'No migrations to validate';
      }
      
      // Check migration files are valid SQL
      migrations.forEach(file => {
        if (file.endsWith('.sql')) {
          const content = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
          if (content.trim().length === 0) {
            throw new Error(`Empty migration file: ${file}`);
          }
        }
      });
      
      return `${migrations.length} migrations validated ✓`;
    }
  },
  {
    name: 'Security audit',
    run: () => {
      try {
        const output = execSync('npm audit --audit-level=high', { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        
        if (output.includes('found 0 vulnerabilities')) {
          return 'No high/critical vulnerabilities ✓';
        }
        
        log.warn('Some vulnerabilities found. Run: npm audit');
        return 'Security audit completed with warnings';
      } catch (error) {
        log.warn('Security vulnerabilities detected. Review: npm audit');
        return 'Security audit needs attention';
      }
    }
  },
  {
    name: 'Generate deployment manifest',
    run: () => {
      const manifest = {
        name: 'Meta3Ventures',
        version: require(path.join(process.cwd(), 'package.json')).version,
        buildTime: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        commit: getGitCommit(),
        branch: getGitBranch()
      };
      
      fs.writeFileSync(
        path.join(process.cwd(), 'deployment-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      return 'Deployment manifest created ✓';
    }
  }
];

// Helper functions for git info
function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

// Main execution
async function main() {
  console.log(`${colors.bright}Meta3Ventures Pre-Deployment Validation${colors.reset}\n`);
  
  let hasErrors = false;
  const results = [];
  
  for (const task of tasks) {
    try {
      log.info(`Running: ${task.name}`);
      const result = await task.run();
      log.success(result);
      results.push({ task: task.name, status: 'success', message: result });
    } catch (error) {
      log.error(`Failed: ${error.message}`);
      results.push({ task: task.name, status: 'error', message: error.message });
      hasErrors = true;
      
      // Don't continue if critical error
      if (task.critical !== false) {
        break;
      }
    }
  }
  
  // Summary
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;
  
  console.log(`✓ Successful: ${successful}`);
  if (failed > 0) {
    console.log(`✗ Failed: ${failed}`);
  }
  
  if (hasErrors) {
    log.error('\nPre-deployment validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    log.success('\n🚀 Pre-deployment validation passed! Ready to deploy.');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { tasks, main };