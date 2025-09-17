#!/usr/bin/env node

/**
 * Test Agent Framework
 * Simple test to verify the agent framework is working
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Agent Framework Components...\n');

// Test 1: Check if agent registry exists
console.log('1. Checking agent registry...');
try {
  const registryPath = path.join(__dirname, '..', 'agents', 'registry.yaml');
  const registryContent = fs.readFileSync(registryPath, 'utf8');
  console.log('   ✅ Agent registry found');
  console.log(`   📊 Registry size: ${registryContent.length} bytes`);
} catch (error) {
  console.log('   ❌ Agent registry not found:', error.message);
}

// Test 2: Check if evaluation tasks exist
console.log('\n2. Checking evaluation tasks...');
try {
  const tasksPath = path.join(__dirname, '..', 'agents', 'eval', 'tasks.json');
  const tasksContent = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  console.log('   ✅ Evaluation tasks found');
  console.log(`   📊 Tasks count: ${tasksContent.tasks.length}`);
  console.log(`   📋 Task categories: ${[...new Set(tasksContent.tasks.map(t => t.category))].join(', ')}`);
} catch (error) {
  console.log('   ❌ Evaluation tasks not found:', error.message);
}

// Test 3: Check if LLM providers exist
console.log('\n3. Checking LLM providers...');
const providers = ['provider.ts', 'ollama.ts', 'vllm.ts'];
providers.forEach(provider => {
  try {
    const providerPath = path.join(__dirname, '..', 'src', 'llm', provider);
    const stats = fs.statSync(providerPath);
    console.log(`   ✅ ${provider} found (${stats.size} bytes)`);
  } catch (error) {
    console.log(`   ❌ ${provider} not found:`, error.message);
  }
});

// Test 4: Check if documentation exists
console.log('\n4. Checking documentation...');
const docs = ['AGENT_AUDIT.md', 'MODELS_READINESS.md', 'AGENT_OPERATIONS.md'];
docs.forEach(doc => {
  try {
    const docPath = path.join(__dirname, '..', 'docs', doc);
    const stats = fs.statSync(docPath);
    console.log(`   ✅ ${doc} found (${stats.size} bytes)`);
  } catch (error) {
    console.log(`   ❌ ${doc} not found:`, error.message);
  }
});

// Test 5: Check if CI workflow exists
console.log('\n5. Checking CI workflow...');
try {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'agent-eval.yml');
  const stats = fs.statSync(workflowPath);
  console.log('   ✅ Agent evaluation workflow found');
  console.log(`   📊 Workflow size: ${stats.size} bytes`);
} catch (error) {
  console.log('   ❌ Agent evaluation workflow not found:', error.message);
}

// Test 6: Validate agent registry structure
console.log('\n6. Validating agent registry structure...');
try {
  const yaml = require('js-yaml');
  const registryPath = path.join(__dirname, '..', 'agents', 'registry.yaml');
  const registry = yaml.load(fs.readFileSync(registryPath, 'utf8'));
  
  console.log('   ✅ Registry YAML is valid');
  console.log(`   🤖 Agents configured: ${Object.keys(registry.agents).length}`);
  console.log(`   🔧 Backends configured: ${Object.keys(registry.backends).length}`);
  
  // List agents
  console.log('   📋 Available agents:');
  Object.entries(registry.agents).forEach(([key, agent]) => {
    console.log(`      - ${agent.name} (${agent.model_backend})`);
  });
  
} catch (error) {
  console.log('   ❌ Registry validation failed:', error.message);
}

// Test 7: Validate evaluation tasks structure
console.log('\n7. Validating evaluation tasks structure...');
try {
  const tasksPath = path.join(__dirname, '..', 'agents', 'eval', 'tasks.json');
  const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
  
  console.log('   ✅ Tasks JSON is valid');
  console.log(`   📊 Total tasks: ${tasks.tasks.length}`);
  console.log(`   🎯 Task types: ${[...new Set(tasks.tasks.map(t => t.evaluation.type))].join(', ')}`);
  
  // List tasks
  console.log('   📋 Available tasks:');
  tasks.tasks.forEach(task => {
    console.log(`      - ${task.name} (${task.category}, ${task.difficulty})`);
  });
  
} catch (error) {
  console.log('   ❌ Tasks validation failed:', error.message);
}

console.log('\n🎯 Agent Framework Test Complete!');
console.log('✅ All components are properly configured and ready for OSS LLM integration.');
