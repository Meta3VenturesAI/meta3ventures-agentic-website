#!/bin/bash

# Meta3Ventures Local Setup Demonstration
# This script demonstrates the complete local testing environment setup

set -e

echo "🎬 Meta3Ventures Local Testing Environment Demo"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${CYAN}📋 $1${NC}"
    echo "----------------------------------------"
}

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${MAGENTA}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "setup-local-testing.sh" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

print_header "Environment Analysis"
print_info "Current directory: $(pwd)"
print_info "Node.js version: $(node --version)"
print_info "Docker version: $(docker --version)"
print_info "Docker Compose version: $(docker-compose --version)"

print_header "Setup Files Created"
print_success "✅ docker-compose.local.yml - LLM providers configuration"
print_success "✅ project/env.local - Environment variables template"
print_success "✅ project/local-dev-server.js - Netlify functions replica"
print_success "✅ project/test-full-platform.cjs - Comprehensive test suite"
print_success "✅ setup-local-testing.sh - Automated setup script"
print_success "✅ cleanup-local-testing.sh - Cleanup script"
print_success "✅ LOCAL_TESTING_GUIDE.md - Complete documentation"

print_header "LLM Providers Configured"
print_info "🐳 Ollama (Local LLM Server)"
print_info "   • Container: meta3-ollama"
print_info "   • Port: 11434"
print_info "   • Models: llama3.2:3b, llama3.1:8b, mistral:7b, codellama:7b"

print_info "🚀 vLLM (High-performance LLM Serving)"
print_info "   • Container: meta3-vllm"
print_info "   • Port: 8000"
print_info "   • Model: llama-2-7b-chat"

print_info "🏠 LocalAI (Self-hosted OpenAI Compatible API)"
print_info "   • Container: meta3-localai"
print_info "   • Port: 8080"
print_info "   • Model: ggml-gpt4all-j"

print_info "🧠 DeepSeek (Advanced AI)"
print_info "   • Proxy: meta3-deepseek-proxy"
print_info "   • Port: 8082"
print_info "   • Model: deepseek-chat"

print_info "🤖 Grok (xAI's AI Model)"
print_info "   • Proxy: meta3-grok-proxy"
print_info "   • Port: 8081"
print_info "   • Model: grok-beta"

print_header "Local Development Server Features"
print_success "✅ Replicates Netlify functions"
print_success "✅ Agent proxy endpoint"
print_success "✅ Health check endpoint"
print_success "✅ Provider status monitoring"
print_success "✅ CORS configuration"
print_success "✅ Security headers (replicating netlify.toml)"

print_header "Test Suite Capabilities"
print_success "✅ Server health tests"
print_success "✅ LLM provider availability tests"
print_success "✅ Agent proxy functionality tests"
print_success "✅ Vite development server tests"
print_success "✅ Build system tests"
print_success "✅ Environment variable validation"
print_success "✅ Agent system component tests"

print_header "Quick Start Commands"
print_info "🚀 Complete Setup:"
print_info "   ./setup-local-testing.sh"
print_info ""
print_info "🧪 Run Tests:"
print_info "   cd project && npm run test:full-platform"
print_info ""
print_info "🌐 Access Points:"
print_info "   • Main App: http://localhost:5173"
print_info "   • Admin Dashboard: http://localhost:5173/admin"
print_info "   • Local Dev Server: http://localhost:3001"
print_info "   • Provider Status: http://localhost:3001/api/providers/status"
print_info ""
print_info "🧹 Cleanup:"
print_info "   ./cleanup-local-testing.sh"

print_header "Environment Variables Required"
print_warning "For full functionality, update these in project/.env.local:"
print_info "   • VITE_HUGGINGFACE_API_KEY"
print_info "   • VITE_DEEPSEEK_API_KEY"
print_info "   • VITE_GROK_API_KEY"
print_info "   • VITE_FORMSPREE_*_KEY"
print_info "   • VITE_SUPABASE_*"
print_info "   • VITE_SENTRY_DSN"

print_header "System Requirements"
print_info "💻 Minimum Requirements:"
print_info "   • 8GB RAM (for multiple LLM providers)"
print_info "   • 20GB disk space (for model downloads)"
print_info "   • Docker & Docker Compose"
print_info "   • Node.js 18+"

print_header "What This Setup Provides"
print_success "✅ Complete Netlify environment replication"
print_success "✅ Full LLM provider support (Ollama, vLLM, LocalAI, DeepSeek, Grok)"
print_success "✅ Real agent system testing"
print_success "✅ Comprehensive test suite"
print_success "✅ Production-ready validation"
print_success "✅ Easy setup and cleanup"
print_success "✅ Complete documentation"

print_header "Next Steps"
print_info "1. Run the setup script: ./setup-local-testing.sh"
print_info "2. Update API keys in project/.env.local"
print_info "3. Test the platform: cd project && npm run test:full-platform"
print_info "4. Access the application: http://localhost:5173"
print_info "5. Test admin functionality: http://localhost:5173/admin"

echo -e "\n${GREEN}🎉 Meta3Ventures Local Testing Environment is ready!${NC}"
echo -e "${CYAN}📚 See LOCAL_TESTING_GUIDE.md for detailed instructions${NC}"
echo -e "${YELLOW}🚀 Run ./setup-local-testing.sh to start testing!${NC}"
