# Meta3Ventures Agentic Website

A modern, secure AI-powered business platform for venture capital operations, lead generation, and client management with advanced agent-based AI capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
cd project && npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy to production
npm run deploy
```

Visit [http://localhost:5173](http://localhost:5173) to see the application.

## 📋 Project Overview

### Architecture
- **Frontend**: React 18 + TypeScript + Vite 6.3.6
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Enterprise-grade security with JWT + bcryptjs
- **AI System**: Multi-agent architecture with specialized business functions
- **Deployment**: Netlify/Vercel ready with PWA support

### Key Features
- 🔒 **Enterprise Security** - Professional authentication and audit logging
- 🤖 **AI Agents** - 11 specialized agents for investment, legal, and support queries
- 📊 **Admin Dashboard** - Comprehensive system management interface
- 📝 **Form Management** - Advanced multi-step application and contact forms
- 📈 **Analytics** - Real-time performance monitoring and reporting
- 🌍 **PWA Support** - Progressive web app with offline capabilities

## 🏗️ Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── forms/          # Form components
│   │   └── sections/       # Page section components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route pages
│   ├── services/          # Business logic and API services
│   │   └── agents/        # AI agent system
│   ├── utils/             # Utility functions and helpers
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
├── docs/                  # Documentation
└── scripts/              # Build and deployment scripts
```

## 🔧 Development

### Prerequisites
- Node.js >= 18.0.0
- NPM >= 8.0.0

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Authentication
VITE_AUTH_SECRET=your-jwt-secret-256-bits
VITE_SESSION_TIMEOUT=1800000

# Services
VITE_FORMSPREE_KEY=your-formspree-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Monitoring
VITE_SENTRY_DSN=your-sentry-dsn

# Agent Configuration
VITE_AGENTS_DISABLED=false
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run test suite
- `npm run preflight` - Run all quality checks

## 🔒 Security Features

- **Professional Authentication** - bcryptjs password hashing + JWT tokens
- **Rate Limiting** - Brute force protection
- **Audit Logging** - Comprehensive security event tracking
- **Session Management** - Secure session handling with timeout controls
- **Environment Security** - Secure configuration management
- **Security Headers** - Comprehensive CSP and security headers

## 🤖 AI Agent System

The platform includes 11 specialized AI agents for different business functions:

- **Meta3 Primary Agent** - General inquiries and routing
- **Meta3 Research Agent** - Market research and analysis
- **Meta3 Investment Agent** - Investment analysis and deal evaluation
- **Meta3 Legal Agent** - Legal compliance and documentation
- **Meta3 Marketing Agent** - Marketing strategy and content creation
- **Meta3 Support Agent** - Technical support and troubleshooting
- **Meta3 Financial Agent** - Financial analysis and planning
- **Meta3 Local Agent** - Local market intelligence
- **Competitive Intelligence System** - Competitive analysis
- **Venture Launch Builder** - Startup launch assistance
- **General Conversation Assistant** - General chat support

### Agent Configuration
Agents are configured via `agents/registry.yaml` with:
- Model backends (Ollama, vLLM)
- Safety controls and rate limiting
- Tool assignments and capabilities
- Fallback mechanisms

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` with proper authentication:

- **System Monitoring** - Real-time performance metrics
- **Agent Management** - AI agent configuration and monitoring
- **API Management** - Service configuration and key management
- **User Analytics** - User engagement and conversion metrics

## 🚀 Deployment

### Netlify (Recommended)
```bash
npm run deploy:netlify
```

### Vercel
```bash
npm run deploy:vercel
```

### Manual Deployment
```bash
npm run build:production
# Upload dist/ directory to your hosting provider
```

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Component and utility testing
- **Integration Tests** - Service integration testing
- **Security Tests** - Authentication and security validation
- **LLM Tests** - AI agent functionality testing

Run tests with:
```bash
npm test
```

## 📚 Documentation

- **[Architecture Documentation](./ARCHITECTURE_DOCUMENTATION.md)** - System architecture overview
- **[Agent Implementation Guide](./VIRTUAL_AGENTS_IMPLEMENTATION_GUIDE.md)** - AI agent setup
- **[Security Audit Report](./FINAL_AGENT_AUDIT_RESULTS.md)** - Security analysis

## 🔧 CI/CD

The project includes GitHub Actions CI/CD pipeline:

- **Automated Testing** - Runs on every push and PR
- **Security Scanning** - NPM audit and vulnerability scanning
- **Build Verification** - Ensures production builds work
- **Deployment** - Automated deployment to preview and production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For technical support and questions:
- Email: support@meta3ventures.com
- Documentation: [Internal Wiki](https://wiki.meta3ventures.com)
- Issue Tracking: [GitHub Issues](https://github.com/Meta3VenturesAI/meta3ventures-agentic-website/issues)

---

**Meta3Ventures Platform** - Empowering the future of venture capital with AI-driven insights and automation.