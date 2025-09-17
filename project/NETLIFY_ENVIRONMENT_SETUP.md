# 🌐 Netlify Environment Variables Setup Guide

## 📋 Overview

This guide provides step-by-step instructions for configuring environment variables in Netlify to ensure the Virtual Agents System functions correctly in production.

## 🚨 Critical Variables (REQUIRED)

### 1. Database Configuration
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 2. Form Services
```bash
VITE_FORMSPREE_CONTACT_KEY=mldbpggn
VITE_FORMSPREE_APPLY_KEY=myzwnkkp
VITE_FORMSPREE_NEWSLETTER_KEY=xdkgwaaa
```

### 3. Admin Security
```bash
VITE_ADMIN_PASSWORD=your_secure_production_password
# OR (preferred)
VITE_ADMIN_PASSWORD_HASH=$2a$10$YourBcryptHashedPasswordHere
```

## 🤖 AI Agents Configuration (HIGH PRIORITY)

### Primary LLM Providers
```bash
# Recommended: Fast and reliable
VITE_GROQ_API_KEY=gsk_your_groq_api_key_here

# Premium models
VITE_OPENAI_API_KEY=sk-your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
```

### Additional Providers (Optional)
```bash
VITE_DEEPSEEK_API_KEY=your_deepseek_key
VITE_HUGGINGFACE_API_KEY=hf_your_huggingface_key
VITE_COHERE_API_KEY=your_cohere_key
VITE_REPLICATE_API_TOKEN=r8_your_replicate_token
```

## 🎯 Agent System Configuration

### Core Settings
```bash
VITE_AGENTS_DISABLED=false
VITE_AGENT_PROXY_PATH=/.netlify/functions/agent-proxy
VITE_APP_ENV=production
```

### Model Defaults
```bash
VITE_DEFAULT_OLLAMA_MODEL=llama3.2:3b
VITE_DEFAULT_VLLM_MODEL=meta-llama/Llama-2-7b-chat-hf
```

## 📊 Monitoring & Analytics (Optional)

### Error Tracking
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_ERROR_TRACKING=true
```

### Analytics
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true
```

## 🔧 Netlify Dashboard Setup Instructions

### Step 1: Access Environment Variables
1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site settings**
4. Click **Environment variables** in the left sidebar

### Step 2: Add Variables
For each variable above:
1. Click **Add a variable**
2. Set **Key** (e.g., `VITE_SUPABASE_URL`)
3. Set **Value** (your actual value)
4. For sensitive keys, check **Encrypt value**
5. Click **Create variable**

### Step 3: Configure Branch-Specific Variables
For different environments:
1. Click **Add a variable**
2. Set the key and value
3. Under **Scopes**, select specific branches:
   - `main` for production
   - `develop` or `staging` for preview environments
4. Use different API keys for staging vs production

## 🚀 Deployment Process

### Pre-deployment Checklist
- [ ] All CRITICAL variables configured
- [ ] At least one LLM provider API key set
- [ ] Test deployment on preview branch first
- [ ] Verify agent functionality in staging
- [ ] Monitor Netlify Function logs

### Deployment Commands
```bash
# Local build test
npm run build:production

# Deploy to preview (test first)
git push origin feature-branch

# Deploy to production
git push origin main
```

## 📋 Variable Reference Table

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Database connection | `https://abc.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Database authentication | `eyJ0eXAi...` |
| `VITE_GROQ_API_KEY` | 🔶 Recommended | AI agent responses | `gsk_abc123...` |
| `VITE_FORMSPREE_CONTACT_KEY` | ✅ Yes | Contact forms | `mldbpggn` |
| `VITE_ADMIN_PASSWORD` | ✅ Yes | Admin access | `SecurePassword123!` |
| `VITE_AGENTS_DISABLED` | ⚪ Optional | Agent system toggle | `false` |

## 🔍 Testing & Validation

### After Deployment
1. **Visit your site**: Check that it loads without errors
2. **Test agents**: Go to `/agents` page and test AI responses
3. **Check forms**: Test contact/apply forms functionality
4. **Admin access**: Verify admin dashboard login works
5. **Monitor logs**: Check Netlify Functions tab for errors

### Common Issues & Solutions

**Issue**: Agents not responding
- **Solution**: Check LLM API keys are correctly set and encrypted

**Issue**: Forms not submitting
- **Solution**: Verify VITE_FORMSPREE_* keys are configured

**Issue**: Admin login failed
- **Solution**: Check VITE_ADMIN_PASSWORD or hash is set correctly

**Issue**: Build errors
- **Solution**: Ensure NODE_VERSION matches between local and Netlify

## 🔒 Security Best Practices

### API Key Management
- ✅ Use Netlify's encryption for all API keys
- ✅ Set different keys for staging vs production
- ✅ Rotate keys regularly (quarterly)
- ✅ Monitor usage via provider dashboards
- ❌ Never commit keys to git repositories

### Environment Separation
```bash
# Production (main branch)
VITE_APP_ENV=production
VITE_GROQ_API_KEY=gsk_prod_key...

# Staging (develop branch)
VITE_APP_ENV=staging
VITE_GROQ_API_KEY=gsk_staging_key...
```

## 📞 Support & Troubleshooting

### Netlify Function Logs
1. Go to Netlify dashboard
2. Click **Functions** tab
3. View **agent-proxy** function logs
4. Look for missing environment variable errors

### Debug Mode
Temporarily set for troubleshooting:
```bash
VITE_AGENT_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Contact Information
- **Technical Issues**: Check Netlify Function logs first
- **API Key Issues**: Verify with respective providers
- **Build Issues**: Compare local vs Netlify Node.js versions

---

✅ **Ready for Production**: Once all critical variables are configured, your Virtual Agents System will be fully operational on Netlify!