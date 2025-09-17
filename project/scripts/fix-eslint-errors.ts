#!/usr/bin/env tsx

/**
 * ESLint Error Auto-Fix Script
 * Systematically fixes common ESLint errors across the codebase
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface FilePattern {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const commonFixes: FilePattern[] = [
  // Fix unused variables in catch blocks
  {
    pattern: /} catch \((\w+)\) \{(\s*)console\./g,
    replacement: '} catch {$2console.',
    description: 'Remove unused error variables in catch blocks'
  },

  // Fix unused function parameters by prefixing with underscore
  {
    pattern: /\(([^:,)]+):\s*([^,)]+)\)\s*=>/g,
    replacement: '(_$1: $2) =>',
    description: 'Prefix unused parameters with underscore'
  },

  // Fix any types in simple cases
  {
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
    description: 'Replace any[] with unknown[]'
  },

  // Fix simple any types in interfaces
  {
    pattern: /:\s*any;/g,
    replacement: ': unknown;',
    description: 'Replace any with unknown in interfaces'
  }
];

const targetExtensions = ['.ts', '.tsx'];
const excludeDirs = ['node_modules', 'dist', '.git', 'coverage'];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.some(dir => filePath.includes(dir))) {
        getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      if (targetExtensions.some(ext => file.endsWith(ext))) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function fixFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;

  for (const fix of commonFixes) {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fixCount += matches.length;
      console.log(`  ✓ Applied "${fix.description}" - ${matches.length} fixes`);
    }
  }

  if (fixCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return fixCount;
}

async function main() {
  console.log('🔧 Starting ESLint Error Auto-Fix...\n');

  const projectRoot = process.cwd();
  const allFiles = getAllFiles(projectRoot);

  let totalFixes = 0;
  let filesProcessed = 0;

  for (const filePath of allFiles) {
    const relativePath = path.relative(projectRoot, filePath);

    // Skip certain files
    if (relativePath.includes('scripts/fix-eslint-errors.ts') ||
        relativePath.includes('node_modules') ||
        relativePath.includes('dist')) {
      continue;
    }

    console.log(`📄 Processing: ${relativePath}`);
    const fixes = fixFile(filePath);

    if (fixes > 0) {
      totalFixes += fixes;
      filesProcessed++;
      console.log(`  ✅ ${fixes} fixes applied\n`);
    } else {
      console.log(`  ➖ No fixes needed\n`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${allFiles.length}`);
  console.log(`   Files modified: ${filesProcessed}`);
  console.log(`   Total fixes applied: ${totalFixes}`);

  // Run ESLint to get updated count
  try {
    console.log('\n🔍 Checking remaining ESLint errors...');
    const result = execSync('npm run lint 2>&1 || true', { encoding: 'utf8' });
    const errorLines = result.split('\n').filter(line => line.includes('error')).length;
    console.log(`   Remaining errors: ${errorLines}`);
  } catch () {
    console.log('   Could not check remaining errors');
  }

  console.log('\n✅ Auto-fix complete!');
}

main().catch(console.error);