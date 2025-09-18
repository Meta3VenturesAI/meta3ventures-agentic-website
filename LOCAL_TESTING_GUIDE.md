# 🚀 Meta3Ventures Local Testing Environment

This guide helps you set up a complete local testing environment that replicates the Netlify production environment with full LLM provider support.

## 📋 Overview

The local testing environment includes:
- **Ollama** - Local LLM server with multiple models
- **vLLM** - High-performance LLM serving
- **LocalAI** - Self-hosted OpenAI-compatible API
- **DeepSeek** - Advanced AI capabilities (via proxy)
- **Grok** - xAI's AI model (via proxy)
- **Local Development Server** - Replicates Netlify functions
- **Full Test Suite** - Comprehensive platform testing

## 🛠️ Prerequisites

- **Docker & Docker Compose** - For LLM providers
- **Node.js 18+** - For the application
- **8GB+ RAM** - For running multiple LLM providers
- **20GB+ Disk Space** - For model downloads

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

```bash
# Make the setup script executable
chmod +x setup-local-testing.sh

# Run the complete setup
./setup-local-testing.sh
```

This will:
- Install all dependencies
- Set up environment variables
- Start all LLM providers
- Install Ollama models
- Start development servers
- Run comprehensive tests

### 2. Manual Setup

#### Step 1: Install Dependencies
```bash
cd project
npm install
npm install express cors http-proxy-middleware
```

#### Step 2: Set Up Environment
```bash
# Copy environment template
cp env.local .env.local

# Edit the environment file with your API keys
nano .env.local
```

#### Step 3: Start LLM Providers
```bash
# Start all LLM providers
docker-compose -f docker-compose.local.yml up -d

# Install Ollama models
docker exec meta3-ollama ollama pull llama3.2:3b
docker exec meta3-ollama ollama pull llama3.1:8b
docker exec meta3-ollama ollama pull mistral:7b
```

#### Step 4: Start Development Servers
```bash
# Terminal 1: Local development server
npm run dev:local

# Terminal 2: Vite development server
npm run dev
```

## 🧪 Testing

### Run Full Platform Test
```bash
npm run test:full-platform
```

### Run Individual Tests
```bash
# Test suite
npm test

# Type checking
npm run typecheck

# Build test
npm run build
```

### Check Provider Status
```bash
curl http://localhost:3001/api/providers/status
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Main App** | http://localhost:5173 | Vite development server |
| **Admin Dashboard** | http://localhost:5173/admin | Admin interface |
| **Local Dev Server** | http://localhost:3001 | Netlify functions replica |
| **Ollama** | http://localhost:11434 | Local LLM server |
| **vLLM** | http://localhost:8000 | High-performance LLM |
| **LocalAI** | http://localhost:8080 | OpenAI-compatible API |
| **DeepSeek Proxy** | http://localhost:8082 | DeepSeek API proxy |
| **Grok Proxy** | http://localhost:8081 | Grok API proxy |

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env.local`:

```bash
# LLM Providers
VITE_OLLAMA_URL=http://localhost:11434
VITE_VLLM_URL=http://localhost:8000/v1
VITE_LOCALAI_URL=http://localhost:8080
VITE_DEEPSEEK_URL=http://localhost:8082/v1
VITE_GROK_URL=http://localhost:8081/v1

# Agent System
VITE_AGENTS_DISABLED=false
VITE_ENABLE_FALLBACK=true
VITE_AGENT_PROXY_PATH=http://localhost:3001/api/agent-proxy

# Authentication
VITE_ADMIN_PASSWORD=Meta3Ventures2024!
VITE_AUTH_SECRET=local-dev-secret-key-change-in-production
```

### API Keys Required

For full functionality, set these API keys in `.env.local`:

- `VITE_HUGGINGFACE_API_KEY` - HuggingFace Inference API
- `VITE_DEEPSEEK_API_KEY` - DeepSeek API
- `VITE_GROK_API_KEY` - Grok API
- `VITE_FORMSPREE_*_KEY` - Formspree form handling
- `VITE_SUPABASE_*` - Supabase database
- `VITE_SENTRY_DSN` - Error tracking

## 🐳 Docker Services

### Available Services

| Service | Container | Port | Models |
|---------|-----------|------|--------|
| **Ollama** | meta3-ollama | 11434 | llama3.2:3b, llama3.1:8b, mistral:7b |
| **vLLM** | meta3-vllm | 8000 | llama-2-7b-chat |
| **LocalAI** | meta3-localai | 8080 | ggml-gpt4all-j |
| **DeepSeek Proxy** | meta3-deepseek-proxy | 8082 | deepseek-chat |
| **Grok Proxy** | meta3-grok-proxy | 8081 | grok-beta |

### Docker Commands

```bash
# View logs
docker-compose -f docker-compose.local.yml logs -f

# Restart services
docker-compose -f docker-compose.local.yml restart

# Stop services
docker-compose -f docker-compose.local.yml down

# Update services
docker-compose -f docker-compose.local.yml pull
docker-compose -f docker-compose.local.yml up -d
```

## 🧪 Testing Scenarios

### 1. Basic Functionality Test
- ✅ Application loads
- ✅ Navigation works
- ✅ Forms submit
- ✅ Admin dashboard accessible

### 2. Agent System Test
- ✅ Agents load and initialize
- ✅ Message routing works
- ✅ LLM providers respond
- ✅ Fallback mechanisms work

### 3. LLM Provider Test
- ✅ Ollama responds to requests
- ✅ vLLM generates responses
- ✅ LocalAI processes messages
- ✅ Proxy services work

### 4. Integration Test
- ✅ End-to-end application flow
- ✅ Agent interactions
- ✅ Data persistence
- ✅ Error handling

## 🔍 Debugging

### Check Service Status
```bash
# All services
docker ps

# Specific service logs
docker logs meta3-ollama
docker logs meta3-vllm
docker logs meta3-localai
```

### Test Individual Components
```bash
# Test Ollama
curl http://localhost:11434/api/tags

# Test vLLM
curl http://localhost:8000/v1/models

# Test LocalAI
curl http://localhost:8080/v1/models

# Test agent proxy
curl -X POST http://localhost:3001/api/agent-proxy \
  -H "Content-Type: application/json" \
  -d '{"provider":"ollama","action":"health"}'
```

### Common Issues

1. **Port Conflicts**
   - Check if ports 11434, 8000, 8080, 8081, 8082, 3001, 5173 are available
   - Stop conflicting services

2. **Docker Issues**
   - Ensure Docker is running
   - Check available disk space
   - Restart Docker if needed

3. **Model Download Issues**
   - Check internet connection
   - Ensure sufficient disk space
   - Manually pull models: `docker exec meta3-ollama ollama pull llama3.2:3b`

4. **Environment Variables**
   - Verify `.env.local` exists
   - Check variable names and values
   - Restart development servers after changes

## 🧹 Cleanup

### Stop All Services
```bash
./cleanup-local-testing.sh
```

### Manual Cleanup
```bash
# Stop development servers
pkill -f "node local-dev-server.js"
pkill -f "vite"

# Stop Docker containers
docker-compose -f docker-compose.local.yml down

# Remove Docker volumes (optional)
docker-compose -f docker-compose.local.yml down -v
```

## 📊 Performance Monitoring

### Resource Usage
```bash
# Docker resource usage
docker stats

# System resource usage
htop
```

### Log Monitoring
```bash
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker logs -f meta3-ollama
```

## 🚀 Production Deployment

Once local testing is complete:

1. **Update Environment Variables** for production
2. **Test Build Process**: `npm run build`
3. **Deploy to Netlify**: `npm run deploy:netlify`
4. **Deploy to Vercel**: `npm run deploy:vercel`

## 📚 Additional Resources

- [Ollama Documentation](https://ollama.ai/docs)
- [vLLM Documentation](https://docs.vllm.ai/)
- [LocalAI Documentation](https://localai.io/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose -f docker-compose.local.yml logs`
2. Verify environment variables
3. Ensure all services are running
4. Check system resources (RAM, disk space)
5. Review the test output for specific errors

---

**Happy Testing! 🎉**

The Meta3Ventures platform is now ready for comprehensive local testing with full LLM provider support.
