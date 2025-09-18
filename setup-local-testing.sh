#!/bin/bash

# Meta3Ventures Local Testing Environment Setup
# This script sets up a complete local testing environment that replicates Netlify

set -e

echo "🚀 Setting up Meta3Ventures Local Testing Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are available"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is available"
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    cd project
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed"
    
    cd ..
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f "project/env.local" ]; then
        print_error "env.local file not found. Please create it first."
        exit 1
    fi
    
    # Copy environment file
    cp project/env.local project/.env.local
    print_success "Environment variables configured"
    
    print_warning "Please update the API keys in project/.env.local:"
    print_status "- VITE_HUGGINGFACE_API_KEY"
    print_status "- VITE_DEEPSEEK_API_KEY"
    print_status "- VITE_GROK_API_KEY"
    print_status "- VITE_FORMSPREE_*_KEY"
    print_status "- VITE_SUPABASE_*"
}

# Start LLM providers with Docker
start_llm_providers() {
    print_status "Starting LLM providers with Docker..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Start LLM providers
    docker-compose -f docker-compose.local.yml up -d
    
    print_success "LLM providers started"
    print_status "Waiting for providers to be ready..."
    
    # Wait for providers to be ready
    sleep 30
    
    # Check provider status
    print_status "Checking provider status..."
    for provider in ollama vllm localai; do
        if docker ps | grep -q "meta3-$provider"; then
            print_success "$provider is running"
        else
            print_warning "$provider may not be ready yet"
        fi
    done
}

# Install Ollama models
install_ollama_models() {
    print_status "Installing Ollama models..."
    
    # Wait for Ollama to be ready
    sleep 10
    
    # Install models
    docker exec meta3-ollama ollama pull llama3.2:3b
    docker exec meta3-ollama ollama pull llama3.1:8b
    docker exec meta3-ollama ollama pull mistral:7b
    docker exec meta3-ollama ollama pull codellama:7b
    
    print_success "Ollama models installed"
}

# Start local development server
start_dev_server() {
    print_status "Starting local development server..."
    
    cd project
    
    # Install additional dependencies for local server
    npm install express cors http-proxy-middleware
    
    # Start the local development server in background
    node local-dev-server.js &
    DEV_SERVER_PID=$!
    
    # Save PID for cleanup
    echo $DEV_SERVER_PID > ../.dev-server.pid
    
    print_success "Local development server started (PID: $DEV_SERVER_PID)"
    
    cd ..
}

# Start Vite development server
start_vite_server() {
    print_status "Starting Vite development server..."
    
    cd project
    
    # Start Vite in background
    npm run dev &
    VITE_PID=$!
    
    # Save PID for cleanup
    echo $VITE_PID > ../.vite-server.pid
    
    print_success "Vite development server started (PID: $VITE_PID)"
    
    cd ..
}

# Run tests
run_tests() {
    print_status "Running tests with full LLM provider support..."
    
    cd project
    
    # Set environment for testing
    export NODE_ENV=development
    export VITE_AGENTS_DISABLED=false
    export VITE_ENABLE_FALLBACK=true
    
    # Run tests
    npm test
    
    print_success "Tests completed"
    
    cd ..
}

# Create cleanup script
create_cleanup_script() {
    print_status "Creating cleanup script..."
    
    cat > cleanup-local-testing.sh << 'EOF'
#!/bin/bash

echo "🧹 Cleaning up Meta3Ventures Local Testing Environment"

# Stop development servers
if [ -f ".dev-server.pid" ]; then
    DEV_PID=$(cat .dev-server.pid)
    if ps -p $DEV_PID > /dev/null; then
        kill $DEV_PID
        echo "✅ Stopped development server (PID: $DEV_PID)"
    fi
    rm .dev-server.pid
fi

if [ -f ".vite-server.pid" ]; then
    VITE_PID=$(cat .vite-server.pid)
    if ps -p $VITE_PID > /dev/null; then
        kill $VITE_PID
        echo "✅ Stopped Vite server (PID: $VITE_PID)"
    fi
    rm .vite-server.pid
fi

# Stop Docker containers
echo "🐳 Stopping Docker containers..."
docker-compose -f docker-compose.local.yml down

echo "✅ Cleanup completed"
EOF

    chmod +x cleanup-local-testing.sh
    print_success "Cleanup script created: cleanup-local-testing.sh"
}

# Main execution
main() {
    echo "Starting Meta3Ventures Local Testing Environment Setup..."
    echo ""
    
    # Pre-flight checks
    check_docker
    check_node
    
    # Setup
    install_dependencies
    setup_environment
    
    # Start services
    start_llm_providers
    install_ollama_models
    start_dev_server
    start_vite_server
    
    # Create cleanup script
    create_cleanup_script
    
    # Wait a moment for services to start
    sleep 5
    
    # Run tests
    run_tests
    
    echo ""
    echo "🎉 Meta3Ventures Local Testing Environment is ready!"
    echo ""
    echo "📊 Services running:"
    echo "   • Vite Dev Server: http://localhost:5173"
    echo "   • Local Dev Server: http://localhost:3001"
    echo "   • Ollama: http://localhost:11434"
    echo "   • vLLM: http://localhost:8000"
    echo "   • LocalAI: http://localhost:8080"
    echo ""
    echo "🔧 Management commands:"
    echo "   • View logs: docker-compose -f docker-compose.local.yml logs -f"
    echo "   • Stop services: ./cleanup-local-testing.sh"
    echo "   • Restart: docker-compose -f docker-compose.local.yml restart"
    echo ""
    echo "🧪 Testing:"
    echo "   • Run tests: cd project && npm test"
    echo "   • Check providers: curl http://localhost:3001/api/providers/status"
    echo "   • Health check: curl http://localhost:3001/api/health"
    echo ""
    print_warning "Remember to update API keys in project/.env.local for full functionality!"
}

# Run main function
main "$@"
