#!/usr/bin/env node

/**
 * Environment Variables Verification Script
 * Checks current configuration and suggests missing variables for optimal deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ENVIRONMENT VARIABLES VERIFICATION');
console.log('=====================================\n');

// Read current environment files
const envFiles = ['.env', '.env.local', '.env.production'];
const currentEnv = {};

for (const file of envFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line =>
      line.trim() && !line.startsWith('#') && line.includes('=')
    );

    console.log(`📄 Found ${file}:`);
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      currentEnv[key.trim()] = value.trim();

      // Mask sensitive values for display
      const displayValue = value.includes('your_') || value.length < 10 ?
        value : value.substring(0, 10) + '...[REDACTED]';
      console.log(`  ${key.trim()}: ${displayValue}`);
    });
    console.log();
  }
}

// Define required and recommended variables
const requiredVariables = {
  // Database (Critical)
  'VITE_SUPABASE_URL': {
    current: currentEnv['VITE_SUPABASE_URL'],
    required: true,
    description: 'Supabase database URL',
    example: 'https://your-project-id.supabase.co'
  },
  'VITE_SUPABASE_ANON_KEY': {
    current: currentEnv['VITE_SUPABASE_ANON_KEY'],
    required: true,
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },

  // Forms (Critical)
  'VITE_FORMSPREE_CONTACT_KEY': {
    current: currentEnv['VITE_FORMSPREE_CONTACT_KEY'],
    required: true,
    description: 'Contact form endpoint',
    example: 'mldbpggn'
  },
  'VITE_FORMSPREE_APPLY_KEY': {
    current: currentEnv['VITE_FORMSPREE_APPLY_KEY'],
    required: true,
    description: 'Application form endpoint',
    example: 'myzwnkkp'
  },
  'VITE_FORMSPREE_NEWSLETTER_KEY': {
    current: currentEnv['VITE_FORMSPREE_NEWSLETTER_KEY'],
    required: true,
    description: 'Newsletter form endpoint',
    example: 'xdkgwaaa'
  },

  // Admin Access (Critical)
  'VITE_ADMIN_PASSWORD': {
    current: currentEnv['VITE_ADMIN_PASSWORD'],
    required: true,
    description: 'Admin dashboard password',
    example: 'SecurePassword123!'
  },

  // Cloud LLM Providers (At least one recommended)
  'VITE_GROQ_API_KEY': {
    current: currentEnv['VITE_GROQ_API_KEY'],
    required: false,
    recommended: true,
    description: 'Groq API key (fast inference)',
    example: 'gsk_your_groq_api_key_here'
  },
  'VITE_OPENAI_API_KEY': {
    current: currentEnv['VITE_OPENAI_API_KEY'],
    required: false,
    recommended: true,
    description: 'OpenAI API key',
    example: 'sk-your_openai_api_key_here'
  },
  'VITE_ANTHROPIC_API_KEY': {
    current: currentEnv['VITE_ANTHROPIC_API_KEY'],
    required: false,
    recommended: true,
    description: 'Anthropic Claude API key',
    example: 'sk-ant-your_anthropic_key_here'
  },
  'VITE_DEEPSEEK_API_KEY': {
    current: currentEnv['VITE_DEEPSEEK_API_KEY'],
    required: false,
    recommended: true,
    description: 'DeepSeek API key (cost-effective)',
    example: 'your_deepseek_api_key'
  },

  // Local LLM Configuration
  'VITE_OLLAMA_URL': {
    current: currentEnv['VITE_OLLAMA_URL'],
    required: false,
    description: 'Ollama server URL',
    example: 'http://localhost:11434',
    defaultValue: 'http://localhost:11434'
  },
  'VITE_OLLAMA_MODEL': {
    current: currentEnv['VITE_OLLAMA_MODEL'],
    required: false,
    description: 'Default Ollama model',
    example: 'llama3.2:3b',
    defaultValue: 'llama3.2:3b'
  },
  'VITE_VLLM_URL': {
    current: currentEnv['VITE_VLLM_URL'],
    required: false,
    description: 'vLLM server URL',
    example: 'http://localhost:8000/v1',
    defaultValue: 'http://localhost:8000/v1'
  },
  'VITE_VLLM_MODEL': {
    current: currentEnv['VITE_VLLM_MODEL'],
    required: false,
    description: 'Default vLLM model',
    example: 'meta-llama/Llama-3.1-8B-Instruct',
    defaultValue: 'meta-llama/Llama-3.1-8B-Instruct'
  },

  // Agent Configuration
  'VITE_AGENTS_DISABLED': {
    current: currentEnv['VITE_AGENTS_DISABLED'],
    required: false,
    description: 'Disable virtual agents system',
    example: 'false',
    defaultValue: 'false'
  },
  'VITE_AGENT_PROXY_PATH': {
    current: currentEnv['VITE_AGENT_PROXY_PATH'],
    required: false,
    description: 'Agent proxy function path',
    example: '/.netlify/functions/agent-proxy',
    defaultValue: '/.netlify/functions/agent-proxy'
  },
  'VITE_APP_ENV': {
    current: currentEnv['VITE_APP_ENV'],
    required: false,
    description: 'Application environment',
    example: 'production',
    defaultValue: 'production'
  },

  // Optional Analytics & Monitoring
  'VITE_SENTRY_DSN': {
    current: currentEnv['VITE_SENTRY_DSN'],
    required: false,
    description: 'Sentry error tracking DSN',
    example: 'https://your-dsn@sentry.io/project-id'
  },
  'VITE_GA_MEASUREMENT_ID': {
    current: currentEnv['VITE_GA_MEASUREMENT_ID'],
    required: false,
    description: 'Google Analytics measurement ID',
    example: 'G-XXXXXXXXXX'
  }
};

// Analyze current configuration
console.log('🎯 CONFIGURATION ANALYSIS');
console.log('==========================\n');

let criticalMissing = 0;
let recommendedMissing = 0;
let configuredProviders = 0;

const results = {
  critical: { set: [], missing: [] },
  recommended: { set: [], missing: [] },
  optional: { set: [], missing: [] },
  providers: { configured: [], missing: [] }
};

// Check LLM providers
const llmProviders = [
  'VITE_GROQ_API_KEY',
  'VITE_OPENAI_API_KEY',
  'VITE_ANTHROPIC_API_KEY',
  'VITE_DEEPSEEK_API_KEY',
  'VITE_HUGGINGFACE_API_KEY',
  'VITE_COHERE_API_KEY',
  'VITE_REPLICATE_API_TOKEN'
];

for (const provider of llmProviders) {
  const value = currentEnv[provider];
  if (value && !value.includes('your_') && value.length > 10) {
    configuredProviders++;
    results.providers.configured.push(provider.replace('VITE_', '').replace('_API_KEY', '').replace('_API_TOKEN', ''));
  } else {
    results.providers.missing.push(provider.replace('VITE_', '').replace('_API_KEY', '').replace('_API_TOKEN', ''));
  }
}

// Check all variables
for (const [key, config] of Object.entries(requiredVariables)) {
  const value = config.current;
  const isSet = value && !value.includes('your_') && value.length > 3;

  if (config.required) {
    if (isSet) {
      results.critical.set.push(key);
    } else {
      results.critical.missing.push(key);
      criticalMissing++;
    }
  } else if (config.recommended) {
    if (isSet) {
      results.recommended.set.push(key);
    } else {
      results.recommended.missing.push(key);
      recommendedMissing++;
    }
  } else {
    if (isSet) {
      results.optional.set.push(key);
    } else {
      results.optional.missing.push(key);
    }
  }
}

// Display results
console.log('✅ CONFIGURED VARIABLES:');
console.log(`   Critical: ${results.critical.set.length}/6 (${results.critical.set.join(', ')})`);
console.log(`   LLM Providers: ${configuredProviders}/7 (${results.providers.configured.join(', ')})`);
console.log(`   Optional: ${results.optional.set.length} (${results.optional.set.slice(0, 3).join(', ')}${results.optional.set.length > 3 ? '...' : ''})`);

if (criticalMissing > 0) {
  console.log('\n❌ MISSING CRITICAL VARIABLES:');
  for (const key of results.critical.missing) {
    const config = requiredVariables[key];
    console.log(`   ${key}: ${config.description}`);
    console.log(`      Example: ${config.example}`);
  }
}

if (recommendedMissing > 0) {
  console.log('\n⚠️  MISSING RECOMMENDED VARIABLES:');
  for (const key of results.recommended.missing) {
    const config = requiredVariables[key];
    console.log(`   ${key}: ${config.description}`);
    console.log(`      Example: ${config.example}`);
  }
}

// LLM Provider Status
console.log('\n🤖 LLM PROVIDER STATUS:');
console.log('=======================');

if (configuredProviders === 0) {
  console.log('❌ NO LLM PROVIDERS configured');
  console.log('   ⚠️  Virtual agents will use fallback responses only');
  console.log('   💡 Add at least VITE_GROQ_API_KEY for basic AI functionality');
} else if (configuredProviders < 2) {
  console.log(`⚠️  Only ${configuredProviders} LLM provider configured`);
  console.log('   ✅ Virtual agents will work but no redundancy');
  console.log('   💡 Add backup providers for better reliability');
} else {
  console.log(`✅ ${configuredProviders} LLM providers configured - Excellent redundancy!`);
}

// Local LLM Status
const hasOllama = currentEnv['VITE_OLLAMA_URL'] && !currentEnv['VITE_OLLAMA_URL'].includes('your_');
const hasVLLM = currentEnv['VITE_VLLM_URL'] && !currentEnv['VITE_VLLM_URL'].includes('your_');

console.log('\n🏠 LOCAL LLM STATUS:');
console.log('====================');
if (hasOllama || hasVLLM) {
  console.log('✅ Local LLM configured as fallback');
  if (hasOllama) console.log('   - Ollama: Ready');
  if (hasVLLM) console.log('   - vLLM: Ready');
} else {
  console.log('⚠️  No local LLM configured');
  console.log('   💡 Add VITE_OLLAMA_URL for local fallback');
}

// Final Assessment
console.log('\n🎯 DEPLOYMENT READINESS:');
console.log('========================');

const readinessScore = ((6 - criticalMissing) / 6) * 100;
let status = 'NOT READY';
let recommendation = '';

if (readinessScore === 100 && configuredProviders > 0) {
  status = '🟢 FULLY READY';
  recommendation = 'Deploy to production immediately!';
} else if (readinessScore === 100) {
  status = '🟡 READY (LIMITED)';
  recommendation = 'Deploy ready but add LLM providers for full AI functionality';
} else if (readinessScore >= 80) {
  status = '🟡 MOSTLY READY';
  recommendation = 'Address missing critical variables before deployment';
} else {
  status = '🔴 NOT READY';
  recommendation = 'Critical configuration missing - do not deploy';
}

console.log(`Status: ${status}`);
console.log(`Score: ${readinessScore.toFixed(1)}%`);
console.log(`Recommendation: ${recommendation}`);

// Missing Variables Summary
if (criticalMissing > 0 || (configuredProviders === 0 && recommendedMissing > 0)) {
  console.log('\n📋 IMMEDIATE ACTION REQUIRED:');

  if (criticalMissing > 0) {
    console.log('1. Set these CRITICAL variables:');
    results.critical.missing.forEach(key => {
      console.log(`   export ${key}="${requiredVariables[key].example}"`);
    });
  }

  if (configuredProviders === 0) {
    console.log('2. Add at least one LLM provider:');
    console.log('   export VITE_GROQ_API_KEY="gsk_your_groq_key_here"');
    console.log('   (Get free key at: https://console.groq.com/keys)');
  }
}

console.log('\n🔗 HELPFUL RESOURCES:');
console.log('- Groq (Free): https://console.groq.com/keys');
console.log('- OpenAI: https://platform.openai.com/api-keys');
console.log('- Anthropic: https://console.anthropic.com/');
console.log('- DeepSeek: https://platform.deepseek.com/');

process.exit(readinessScore === 100 && configuredProviders > 0 ? 0 : 1);