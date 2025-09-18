#!/usr/bin/env node

/**
 * Local Development Server
 * Replicates Netlify environment for local testing with LLM providers
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers (replicating netlify.toml)
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CSP for local development
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' http://localhost:* ws://localhost:*; " +
    "frame-src 'self'; " +
    "object-src 'none'"
  );
  
  next();
});

// LLM Provider Proxies
const llmProviders = {
  ollama: 'http://localhost:11434',
  vllm: 'http://localhost:8000',
  localai: 'http://localhost:8080',
  deepseek: 'http://localhost:8082',
  grok: 'http://localhost:8081'
};

// Agent Proxy Endpoint (replicating Netlify function)
app.post('/api/agent-proxy', async (req, res) => {
  try {
    const { provider, action, ...params } = req.body;
    
    console.log(`🤖 Agent Proxy Request: ${provider} - ${action}`);
    
    if (!provider || !action) {
      return res.status(400).json({ error: 'Provider and action are required' });
    }

    const providerUrl = llmProviders[provider];
    if (!providerUrl) {
      return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    let targetUrl;
    let method = 'POST';
    let body = params;

    switch (action) {
      case 'health':
        targetUrl = `${providerUrl}/api/tags`;
        method = 'GET';
        body = null;
        break;
      case 'models':
        targetUrl = `${providerUrl}/v1/models`;
        method = 'GET';
        body = null;
        break;
      case 'chat':
        targetUrl = `${providerUrl}/v1/chat/completions`;
        break;
      case 'completions':
        targetUrl = `${providerUrl}/v1/completions`;
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': params.apiKey ? `Bearer ${params.apiKey}` : ''
      }
    };

    if (body && method === 'POST') {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Provider error: ${response.status} ${response.statusText}`);
    }

    res.json({
      success: true,
      provider,
      action,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agent Proxy Error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      provider: req.body.provider,
      action: req.body.action
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    providers: Object.keys(llmProviders),
    environment: 'local-development'
  });
});

// Provider status endpoint
app.get('/api/providers/status', async (req, res) => {
  const status = {};
  
  for (const [name, url] of Object.entries(llmProviders)) {
    try {
      const response = await fetch(`${url}/api/tags`, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      status[name] = {
        available: response.ok,
        url,
        status: response.status
      };
    } catch (error) {
      status[name] = {
        available: false,
        url,
        error: error.message
      };
    }
  }
  
  res.json({
    providers: status,
    timestamp: new Date().toISOString()
  });
});

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.json({
    message: 'Meta3Ventures Local Development Server',
    endpoints: [
      'POST /api/agent-proxy - LLM provider proxy',
      'GET /api/health - Server health check',
      'GET /api/providers/status - Provider status'
    ],
    providers: Object.keys(llmProviders)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Meta3Ventures Local Development Server running on port ${PORT}`);
  console.log(`📡 Agent Proxy: http://localhost:${PORT}/api/agent-proxy`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Provider Status: http://localhost:${PORT}/api/providers/status`);
  console.log(`\n🔧 Configured LLM Providers:`);
  Object.entries(llmProviders).forEach(([name, url]) => {
    console.log(`   ${name}: ${url}`);
  });
});

module.exports = app;
