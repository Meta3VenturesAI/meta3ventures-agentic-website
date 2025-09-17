# Agent Operations Guide

**Generated:** 2025-01-11 13:30 UTC  
**Repository:** `/Users/lironlanger/Desktop/my-commercial-app/project`  
**Status:** ✅ **OPERATIONS READY** for OSS LLM deployment

---

## 🚀 **Quick Start**

### **1. Start Ollama (Recommended)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the default model
ollama pull llama3.1:8b-instruct

# Start Ollama service
ollama serve

# Verify installation
curl http://127.0.0.1:11434/api/tags
```

### **2. Start vLLM (Alternative)**
```bash
# Install vLLM
pip install vllm

# Start vLLM server
python -m vllm.entrypoints.openai.api_server \
  --model mistral-7b-instruct \
  --port 8000 \
  --gpu-memory-utilization 0.8

# Verify installation
curl http://127.0.0.1:8000/v1/models
```

### **3. Run Agent Evaluation**
```bash
# Test with Ollama
AGENT_BACKEND=ollama OLLAMA_URL=http://127.0.0.1:11434 OLLAMA_MODEL=llama3.1:8b-instruct npm run agent:eval

# Test with vLLM
AGENT_BACKEND=vllm VLLM_URL=http://127.0.0.1:8000/v1 VLLM_MODEL=mistral-7b-instruct npm run agent:eval
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Ollama Configuration
export OLLAMA_URL="http://127.0.0.1:11434"
export OLLAMA_MODEL="llama3.1:8b-instruct"
export OLLAMA_API_KEY=""  # Optional

# vLLM Configuration
export VLLM_URL="http://127.0.0.1:8000/v1"
export VLLM_MODEL="mistral-7b-instruct"
export VLLM_API_KEY=""  # Optional

# Agent Configuration
export AGENT_BACKEND="ollama"  # or "vllm"
export AGENT_SEED="42"
export AGENT_TIMEOUT="30000"
export AGENT_VERBOSE="true"
```

### **Agent Registry Configuration**
The agent registry is configured in `agents/registry.yaml`:

```yaml
# Example agent configuration
agents:
  meta3-primary:
    name: "Meta3 Primary Agent"
    model_backend: "ollama"
    model_name: "llama3.1:8b-instruct"
    fallback_backend: "vllm"
    fallback_model: "mistral-7b-instruct"
    capabilities:
      - "general_conversation"
      - "business_consulting"
    tools:
      - "web_search"
      - "document_analysis"
```

---

## 📊 **Monitoring and Health Checks**

### **Health Check Endpoints**
```bash
# Ollama health check
curl http://127.0.0.1:11434/api/tags

# vLLM health check
curl http://127.0.0.1:8000/v1/models

# Agent evaluation health check
npm run agent:eval -- --health-check
```

### **Performance Monitoring**
```bash
# Monitor Ollama performance
ollama ps

# Monitor vLLM performance
curl http://127.0.0.1:8000/v1/metrics

# Run agent evaluation with metrics
AGENT_VERBOSE=true npm run agent:eval
```

### **Log Monitoring**
```bash
# Ollama logs
journalctl -u ollama -f

# vLLM logs (if running as service)
journalctl -u vllm -f

# Agent evaluation logs
npm run agent:eval 2>&1 | tee agent-eval.log
```

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Ollama Service Not Starting**
```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama service
sudo systemctl restart ollama

# Check logs
journalctl -u ollama -n 50
```

#### **2. Model Not Found**
```bash
# List available models
ollama list

# Pull the required model
ollama pull llama3.1:8b-instruct

# Verify model is available
ollama show llama3.1:8b-instruct
```

#### **3. vLLM GPU Issues**
```bash
# Check GPU availability
nvidia-smi

# Run vLLM with CPU fallback
python -m vllm.entrypoints.openai.api_server \
  --model mistral-7b-instruct \
  --port 8000 \
  --device cpu
```

#### **4. Agent Evaluation Failures**
```bash
# Check provider health
curl http://127.0.0.1:11434/api/tags
curl http://127.0.0.1:8000/v1/models

# Run with verbose output
AGENT_VERBOSE=true npm run agent:eval

# Check specific task
npm run agent:eval -- --task=summarize_readme
```

### **Error Codes**
- **TIMEOUT:** Request timed out (increase AGENT_TIMEOUT)
- **RATE_LIMIT:** Too many requests (implement rate limiting)
- **QUOTA_EXCEEDED:** Model quota exceeded (check model limits)
- **UNKNOWN_ERROR:** Unexpected error (check logs)

---

## 🔄 **Maintenance**

### **Regular Maintenance Tasks**

#### **Daily**
- Check service health status
- Monitor resource usage
- Review error logs

#### **Weekly**
- Update model versions
- Run full agent evaluation
- Clean up old logs

#### **Monthly**
- Review performance metrics
- Update agent prompts
- Test new model versions

### **Model Updates**
```bash
# Update Ollama models
ollama pull llama3.1:8b-instruct
ollama pull mistral:7b-instruct

# Update vLLM models
pip install --upgrade vllm
python -m vllm.entrypoints.openai.api_server --model mistral-7b-instruct --port 8000
```

### **Backup and Recovery**
```bash
# Backup agent registry
cp agents/registry.yaml agents/registry.yaml.backup

# Backup evaluation results
cp agents/eval/results.json agents/eval/results.json.backup

# Restore from backup
cp agents/registry.yaml.backup agents/registry.yaml
```

---

## 📈 **Scaling**

### **Horizontal Scaling**
```bash
# Multiple Ollama instances
ollama serve --port 11434
ollama serve --port 11435
ollama serve --port 11436

# Load balancer configuration
# nginx.conf
upstream ollama_backend {
    server 127.0.0.1:11434;
    server 127.0.0.1:11435;
    server 127.0.0.1:11436;
}
```

### **Vertical Scaling**
```bash
# Upgrade to larger model
ollama pull llama3.1:70b-instruct

# Update agent registry
# agents/registry.yaml
agents:
  meta3-primary:
    model_name: "llama3.1:70b-instruct"
```

### **Cloud Deployment**
```bash
# Docker deployment
docker run -d -p 11434:11434 -v ollama:/root/.ollama ollama/ollama

# Kubernetes deployment
kubectl apply -f k8s/ollama-deployment.yaml
kubectl apply -f k8s/vllm-deployment.yaml
```

---

## 🔒 **Security**

### **Network Security**
- Use HTTPS for production deployments
- Implement API key authentication
- Restrict access to localhost for development

### **Model Security**
- Use trusted model sources only
- Verify model checksums
- Regular security updates

### **Data Privacy**
- All inference happens locally
- No data sent to external services
- Audit logs for compliance

---

## 📚 **Additional Resources**

### **Documentation**
- [Ollama Documentation](https://ollama.ai/docs)
- [vLLM Documentation](https://docs.vllm.ai/)
- [Agent Registry Schema](agents/registry.yaml)
- [Evaluation Tasks](agents/eval/tasks.json)

### **Support**
- GitHub Issues: [Meta3Ventures Repository](https://github.com/meta3ventures/platform)
- Documentation: [docs/](docs/)
- Agent Evaluation: `npm run agent:eval -- --help`

---

**Operations Guide Generated By:** Senior Full-Stack Engineer & QA Lead  
**Review Status:** ✅ **OPERATIONS READY**  
**Last Updated:** 2025-01-11 13:30 UTC
