#!/usr/bin/env node

/**
 * LLM Providers Verification Script
 * Tests all available LLM providers and suggests configuration improvements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 LLM PROVIDERS VERIFICATION');
console.log('==============================\n');

// Read current environment
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

const getEnvValue = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const isRealKey = (value) => {
  return value && !value.includes('your_') && !value.includes('here') && value.length > 10;
};

// Test results storage
const results = {
  local: { available: [], configured: [], issues: [] },
  cloud: { available: [], configured: [], missing: [] },
  recommendations: []
};

console.log('🏠 LOCAL LLM PROVIDERS TEST');
console.log('=============================');

// Test 1: Ollama Local
async function testOllama() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.models?.length || 0;
      console.log(`✅ Ollama: RUNNING (${modelCount} models available)`);

      if (modelCount > 0) {
        console.log('   Available models:');
        data.models.slice(0, 5).forEach(model => {
          console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB)`);
        });
        if (data.models.length > 5) {
          console.log(`   + ${data.models.length - 5} more models...`);
        }
      }

      results.local.available.push('Ollama');
      results.local.configured.push('Ollama');
      return true;
    }
  } catch (error) {
    console.log('❌ Ollama: NOT RUNNING');
    console.log('   💡 Start Ollama: `ollama serve` or install from https://ollama.com');
    results.local.issues.push('Ollama not running - install or start service');
    return false;
  }
}

// Test 2: vLLM Local
async function testVLLM() {
  try {
    const response = await fetch('http://localhost:8000/v1/models');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ vLLM: RUNNING (${data.data?.length || 0} models)`);
      results.local.available.push('vLLM');
      results.local.configured.push('vLLM');
      return true;
    }
  } catch (error) {
    console.log('⚪ vLLM: NOT RUNNING (optional)');
    console.log('   💡 Optional: Install vLLM for additional local models');
    return false;
  }
}

console.log('\n🌐 CLOUD LLM PROVIDERS TEST');
console.log('============================');

// Test 3: Groq
function testGroqConfig() {
  const apiKey = getEnvValue('VITE_GROQ_API_KEY');
  if (isRealKey(apiKey)) {
    console.log('✅ Groq: API KEY CONFIGURED');
    console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);
    results.cloud.configured.push('Groq');
    return true;
  } else {
    console.log('⚠️  Groq: PLACEHOLDER KEY DETECTED');
    console.log(`   Current: ${apiKey || 'not set'}`);
    console.log('   💡 Get free key: https://console.groq.com/keys');
    results.cloud.missing.push('Groq');
    return false;
  }
}

// Test 4: OpenAI
function testOpenAIConfig() {
  const apiKey = getEnvValue('VITE_OPENAI_API_KEY');
  if (isRealKey(apiKey)) {
    console.log('✅ OpenAI: API KEY CONFIGURED');
    results.cloud.configured.push('OpenAI');
    return true;
  } else {
    console.log('⚪ OpenAI: PLACEHOLDER KEY (optional)');
    results.cloud.missing.push('OpenAI');
    return false;
  }
}

// Test 5: Anthropic
function testAnthropicConfig() {
  const apiKey = getEnvValue('VITE_ANTHROPIC_API_KEY');
  if (isRealKey(apiKey)) {
    console.log('✅ Anthropic: API KEY CONFIGURED');
    results.cloud.configured.push('Anthropic');
    return true;
  } else {
    console.log('⚪ Anthropic: PLACEHOLDER KEY (optional)');
    results.cloud.missing.push('Anthropic');
    return false;
  }
}

// Test 6: HuggingFace
function testHuggingFaceConfig() {
  const apiKey = getEnvValue('VITE_HUGGINGFACE_API_KEY');
  if (isRealKey(apiKey)) {
    console.log('✅ HuggingFace: API KEY CONFIGURED');
    results.cloud.configured.push('HuggingFace');
    return true;
  } else {
    console.log('⚪ HuggingFace: PLACEHOLDER KEY (optional)');
    console.log('   💡 Free tier available with API key');
    results.cloud.missing.push('HuggingFace');
    return false;
  }
}

// Run all tests
async function runProviderTests() {
  // Test local providers
  const ollamaWorking = await testOllama();
  const vllmWorking = await testVLLM();

  console.log(); // spacing

  // Test cloud providers
  const groqConfigured = testGroqConfig();
  const openaiConfigured = testOpenAIConfig();
  const anthropicConfigured = testAnthropicConfig();
  const hfConfigured = testHuggingFaceConfig();

  console.log('\n📊 PROVIDER SUMMARY');
  console.log('===================');

  const localCount = results.local.configured.length;
  const cloudCount = results.cloud.configured.length;
  const totalProviders = localCount + cloudCount;

  console.log(`Local Providers: ${localCount} configured (${results.local.configured.join(', ')})`);
  console.log(`Cloud Providers: ${cloudCount} configured (${results.cloud.configured.join(', ')})`);
  console.log(`Total Active: ${totalProviders} providers`);

  console.log('\n🎯 DEPLOYMENT READINESS');
  console.log('=======================');

  let readinessLevel = 'NOT READY';
  let recommendation = '';

  if (localCount > 0) {
    readinessLevel = '🟢 FULLY READY';
    recommendation = 'Local LLM available - deploy immediately!';
  } else if (cloudCount > 0) {
    readinessLevel = '🟢 READY';
    recommendation = 'Cloud LLM configured - good to deploy!';
  } else {
    readinessLevel = '🟡 LIMITED';
    recommendation = 'Will use intelligent fallbacks - functional but limited AI';
  }

  console.log(`Status: ${readinessLevel}`);
  console.log(`Recommendation: ${recommendation}`);

  // Specific recommendations
  console.log('\n💡 SPECIFIC RECOMMENDATIONS');
  console.log('============================');

  if (!ollamaWorking && cloudCount === 0) {
    console.log('🔴 HIGH PRIORITY: No AI providers available!');
    console.log('   1. Start Ollama: `ollama serve` (FREE, best quality)');
    console.log('   2. OR add Groq key: Get free key from https://console.groq.com/keys');
  } else if (ollamaWorking && cloudCount === 0) {
    console.log('🟡 GOOD: Local AI working, consider cloud backup');
    console.log('   1. Add Groq key for cloud redundancy (6,000 free requests/day)');
    console.log('   2. Current setup handles unlimited local requests');
  } else if (!ollamaWorking && cloudCount > 0) {
    console.log('🟡 GOOD: Cloud AI working, consider local option');
    console.log('   1. Install Ollama for unlimited local AI (often better quality)');
    console.log('   2. Current setup handles cloud requests with API costs');
  } else {
    console.log('🟢 EXCELLENT: Both local and cloud providers available!');
    console.log('   1. Perfect redundancy setup');
    console.log('   2. Local for best quality, cloud for backup/scaling');
    console.log('   3. Deploy with confidence!');
  }

  // Configuration improvements
  if (results.cloud.missing.length > 0) {
    console.log('\n🔧 OPTIONAL ENHANCEMENTS');
    console.log('=========================');
    results.cloud.missing.forEach(provider => {
      switch(provider) {
        case 'Groq':
          console.log('• Groq (FREE): https://console.groq.com/keys - Fast inference, 6K requests/day');
          break;
        case 'OpenAI':
          console.log('• OpenAI (PAID): https://platform.openai.com/api-keys - Industry standard');
          break;
        case 'Anthropic':
          console.log('• Anthropic (PAID): https://console.anthropic.com/ - Claude models');
          break;
        case 'HuggingFace':
          console.log('• HuggingFace (FREE tier): https://huggingface.co/settings/tokens');
          break;
      }
    });
  }

  // Environment variable suggestions
  console.log('\n🔗 ENVIRONMENT VARIABLES STATUS');
  console.log('================================');
  console.log('Current .env configuration:');

  const envVars = [
    'VITE_GROQ_API_KEY',
    'VITE_OPENAI_API_KEY',
    'VITE_ANTHROPIC_API_KEY',
    'VITE_HUGGINGFACE_API_KEY',
    'VITE_OLLAMA_URL',
    'VITE_VLLM_URL'
  ];

  envVars.forEach(varName => {
    const value = getEnvValue(varName);
    const isConfigured = isRealKey(value) || (varName.includes('URL') && value && !value.includes('your_'));
    const status = isConfigured ? '✅' : '⚪';
    const display = value ? (isConfigured ? `${value.substring(0, 20)}...` : 'placeholder') : 'not set';
    console.log(`${status} ${varName}: ${display}`);
  });

  return { localCount, cloudCount, totalProviders, readinessLevel };
}

// Execute tests
runProviderTests()
  .then(({ totalProviders, readinessLevel }) => {
    console.log('\n🎯 FINAL STATUS');
    console.log('===============');
    console.log(`Providers Available: ${totalProviders}`);
    console.log(`System Status: ${readinessLevel}`);

    process.exit(totalProviders > 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });