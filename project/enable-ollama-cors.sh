#!/bin/bash

# Enable CORS for Ollama to allow browser requests
echo "🔧 Stopping Ollama service..."
pkill -f ollama

echo "🌐 Starting Ollama with CORS enabled..."
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"

# Start Ollama with CORS enabled
ollama serve &

echo "✅ Ollama is now running with CORS enabled at http://localhost:11434"
echo "🧠 Available models:"
sleep 2
ollama list

echo ""
echo "📝 To test LLM integration, try the agents at http://localhost:5173/agents"