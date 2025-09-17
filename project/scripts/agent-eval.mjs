#!/usr/bin/env node

/**
 * Agent Evaluation Script
 * Runs evaluation tasks against configured LLM providers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import providers (using dynamic imports for ES modules)
let OllamaProvider, VLLMProvider;

try {
  const ollamaModule = await import('../src/llm/ollama.js');
  OllamaProvider = ollamaModule.OllamaProvider;
} catch (error) {
  console.warn('Ollama provider not available:', error.message);
}

try {
  const vllmModule = await import('../src/llm/vllm.js');
  VLLMProvider = vllmModule.VLLMProvider;
} catch (error) {
  console.warn('vLLM provider not available:', error.message);
}

// Configuration
const config = {
  backend: process.env.AGENT_BACKEND || 'ollama',
  seed: parseInt(process.env.AGENT_SEED || '42'),
  timeout: parseInt(process.env.AGENT_TIMEOUT || '30000'),
  verbose: process.env.AGENT_VERBOSE === 'true'
};

// Provider configurations
const providerConfigs = {
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
    model: process.env.OLLAMA_MODEL || 'llama3.1:8b-instruct',
    apiKey: process.env.OLLAMA_API_KEY
  },
  vllm: {
    baseUrl: process.env.VLLM_URL || 'http://127.0.0.1:8000/v1',
    model: process.env.VLLM_MODEL || 'mistral-7b-instruct',
    apiKey: process.env.VLLM_API_KEY
  }
};

class AgentEvaluator {
  constructor() {
    this.provider = null;
    this.tasks = [];
    this.results = [];
  }

  async initialize() {
    console.log(`🚀 Initializing Agent Evaluator with ${config.backend} backend`);
    
    // Load tasks
    await this.loadTasks();
    
    // Initialize provider
    await this.initializeProvider();
    
    console.log(`✅ Evaluator ready with ${this.tasks.length} tasks`);
  }

  async loadTasks() {
    const tasksPath = path.join(__dirname, '..', 'agents', 'eval', 'tasks.json');
    const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    this.tasks = tasksData.tasks;
    
    if (config.verbose) {
      console.log(`📋 Loaded ${this.tasks.length} evaluation tasks`);
    }
  }

  async initializeProvider() {
    const providerConfig = providerConfigs[config.backend];
    if (!providerConfig) {
      throw new Error(`Unknown backend: ${config.backend}`);
    }

    try {
      if (config.backend === 'ollama' && OllamaProvider) {
        this.provider = new OllamaProvider(providerConfig);
      } else if (config.backend === 'vllm' && VLLMProvider) {
        this.provider = new VLLMProvider(providerConfig);
      } else {
        throw new Error(`Provider not available for backend: ${config.backend}`);
      }

      // Test provider health
      const isHealthy = await this.provider.healthCheck();
      if (!isHealthy) {
        throw new Error(`Provider health check failed for ${config.backend}`);
      }

      console.log(`✅ Provider ${config.backend} initialized and healthy`);
    } catch (error) {
      console.error(`❌ Failed to initialize provider ${config.backend}:`, error.message);
      throw error;
    }
  }

  async runEvaluation() {
    console.log(`\n🎯 Starting evaluation with seed ${config.seed}`);
    console.log('=' .repeat(50));

    for (const task of this.tasks) {
      try {
        console.log(`\n📝 Task: ${task.name}`);
        console.log(`   Category: ${task.category} | Difficulty: ${task.difficulty}`);
        
        const result = await this.evaluateTask(task);
        this.results.push(result);
        
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        const score = result.score ? ` (${(result.score * 100).toFixed(1)}%)` : '';
        console.log(`   Result: ${status}${score}`);
        
        if (config.verbose && result.output) {
          console.log(`   Output: ${result.output.substring(0, 200)}...`);
        }
        
      } catch (error) {
        console.error(`   Error: ${error.message}`);
        this.results.push({
          task_id: task.id,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    this.printSummary();
  }

  async evaluateTask(task) {
    const startTime = Date.now();
    
    try {
      // Prepare input based on task type
      const input = await this.prepareTaskInput(task);
      
      // Create evaluation prompt
      const prompt = this.createEvaluationPrompt(task, input);
      
      // Send to provider
      const response = await this.provider.chat({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        system: this.getSystemPrompt(task),
        seed: config.seed,
        temperature: 0.3,
        max_tokens: 2048
      });

      // Evaluate response
      const evaluation = this.evaluateResponse(task, response.text);
      
      return {
        task_id: task.id,
        task_name: task.name,
        passed: evaluation.passed,
        score: evaluation.score,
        output: response.text,
        expected: task.expected_output,
        criteria_met: evaluation.criteria_met,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        task_id: task.id,
        task_name: task.name,
        passed: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  async prepareTaskInput(task) {
    switch (task.input.type) {
      case 'file':
        const filePath = path.join(__dirname, '..', task.input.path);
        return fs.readFileSync(filePath, 'utf8');
      
      case 'text':
        return task.input.content;
      
      case 'routes':
        return JSON.stringify(task.input.routes, null, 2);
      
      case 'eslint_output':
        return task.input.sample;
      
      case 'api_endpoint':
        return JSON.stringify(task.input.endpoint, null, 2);
      
      case 'bundle_analysis':
        return JSON.stringify(task.input.data, null, 2);
      
      default:
        return JSON.stringify(task.input, null, 2);
    }
  }

  createEvaluationPrompt(task, input) {
    return `Please complete the following task:

TASK: ${task.name}
DESCRIPTION: ${task.description}
EXPECTED OUTPUT: ${task.expected_output}

INPUT DATA:
${input}

Please provide your response in the exact format specified in the expected output.`;
  }

  getSystemPrompt(task) {
    return `You are an AI assistant specialized in ${task.category} tasks. 
Your responses should be accurate, concise, and follow the exact format requested.
For code generation tasks, ensure the output is syntactically correct and follows best practices.
For analysis tasks, provide structured, actionable insights.`;
  }

  evaluateResponse(task, response) {
    const evaluation = task.evaluation;
    let passed = false;
    let score = 0;
    const criteria_met = [];

    switch (evaluation.type) {
      case 'criteria_check':
        const criteriaResults = evaluation.criteria.map(criterion => {
          const met = this.checkCriterion(criterion, response);
          criteria_met.push({ criterion, met });
          return met;
        });
        passed = criteriaResults.every(result => result);
        score = criteriaResults.filter(result => result).length / criteriaResults.length;
        break;

      case 'semantic_similarity':
        // Simplified semantic similarity check
        const keywords = evaluation.criteria;
        const keywordMatches = keywords.filter(keyword => 
          response.toLowerCase().includes(keyword.toLowerCase())
        );
        score = keywordMatches.length / keywords.length;
        passed = score >= evaluation.threshold;
        break;

      case 'syntax_validation':
        // Basic syntax validation
        passed = this.validateSyntax(response, evaluation.format);
        score = passed ? 1.0 : 0.0;
        break;

      case 'structured_output':
        // Check if response matches expected schema
        try {
          const parsed = JSON.parse(response);
          passed = this.validateSchema(parsed, evaluation.schema);
          score = passed ? 1.0 : 0.0;
        } catch {
          passed = false;
          score = 0.0;
        }
        break;

      default:
        // Default evaluation - check if response is not empty
        passed = response.trim().length > 0;
        score = passed ? 1.0 : 0.0;
    }

    return { passed, score, criteria_met };
  }

  checkCriterion(criterion, response) {
    if (criterion.includes('length <=')) {
      const maxLength = parseInt(criterion.match(/\d+/)[0]);
      return response.length <= maxLength;
    }
    if (criterion.includes('contains')) {
      const keyword = criterion.match(/'([^']+)'/)?.[1];
      return keyword ? response.toLowerCase().includes(keyword.toLowerCase()) : false;
    }
    if (criterion.includes('grammatically correct')) {
      // Simplified grammar check - just check for basic sentence structure
      return response.includes('.') || response.includes('!') || response.includes('?');
    }
    return false;
  }

  validateSyntax(response, format) {
    switch (format) {
      case 'toml':
        // Basic TOML validation - check for key=value pairs
        return response.includes('=') && !response.includes('{{') && !response.includes('}}');
      case 'json':
        try {
          JSON.parse(response);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  validateSchema(obj, schema) {
    // Simplified schema validation
    if (schema.error_types && typeof obj.error_types !== 'object') return false;
    if (schema.total_errors && typeof obj.total_errors !== 'number') return false;
    if (schema.most_common && !Array.isArray(obj.most_common)) return false;
    if (schema.recommendations && !Array.isArray(obj.recommendations)) return false;
    return true;
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 EVALUATION SUMMARY');
    console.log('=' .repeat(50));
    
    const totalTasks = this.results.length;
    const passedTasks = this.results.filter(r => r.passed).length;
    const failedTasks = totalTasks - passedTasks;
    const successRate = (passedTasks / totalTasks * 100).toFixed(1);
    
    console.log(`Total Tasks: ${totalTasks}`);
    console.log(`Passed: ${passedTasks} ✅`);
    console.log(`Failed: ${failedTasks} ❌`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (failedTasks > 0) {
      console.log('\n❌ Failed Tasks:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.task_name}: ${r.error || 'Evaluation failed'}`);
        });
    }
    
    console.log('\n🎯 Evaluation Complete!');
  }
}

// Main execution
async function main() {
  try {
    const evaluator = new AgentEvaluator();
    await evaluator.initialize();
    await evaluator.runEvaluation();
    
    // Exit with appropriate code
    const failedTasks = evaluator.results.filter(r => !r.passed).length;
    process.exit(failedTasks > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Evaluation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
