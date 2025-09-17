# Repository Map - Meta3Ventures Agentic Website

## Repository Structure
```
meta3ventures-agentic-website/
├── project/                    # Main application directory
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── services/          # Business logic & API services
│   │   ├── llm/              # LLM integration layer
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript definitions
│   ├── public/               # Static assets
│   ├── scripts/              # Build & deployment scripts
│   └── package.json          # Main package configuration
├── agents/                   # AI agent system
│   ├── registry.yaml         # Agent configuration
│   └── eval/                 # Agent evaluation tools
├── src/llm/                  # LLM integration (root level)
├── tests/                    # Test files
├── docs/                     # Documentation
├── artifacts/                # Audit artifacts
└── netlify.toml             # Netlify deployment config
```

## Tech Stack & Frameworks

### Frontend Stack
- **Framework**: React 18.3.1 with TypeScript 5.8.4
- **Build Tool**: Vite 5.4.2 with PWA support
- **Styling**: Tailwind CSS 3.4.1 with custom design system
- **Routing**: React Router DOM 6.22.3
- **State Management**: React Context + Custom Hooks
- **UI Components**: Lucide React icons, React Hot Toast
- **Charts**: Recharts 2.12.2

### Backend & Services
- **Authentication**: JWT + bcryptjs for password hashing
- **Database**: Supabase 2.39.7 (PostgreSQL)
- **Forms**: Formspree React 2.5.1
- **Monitoring**: Sentry React 10.8.0
- **File Handling**: UUID 13.0.0 for unique identifiers

### AI & LLM Integration
- **Local Models**: Ollama (llama3.1:8b-instruct, mistral-7b-instruct)
- **Fallback**: vLLM OpenAI API
- **Agent System**: Multi-agent architecture with specialized roles
- **Tools**: Business plan generation, market analysis, funding calculators

### Development & Testing
- **Testing**: Vitest 3.2.4 with Testing Library
- **Linting**: ESLint 9.9.1 with TypeScript rules
- **Type Checking**: TypeScript with strict mode
- **Coverage**: V8 coverage provider
- **Bundle Analysis**: Vite Bundle Analyzer

## Packages & Services

### Main Application (`project/`)
- **Entry Point**: `src/main.tsx`
- **Build Output**: `dist/` directory
- **Environment**: Node.js >=18.0.0, NPM >=8.0.0
- **Deployment**: Netlify (primary), Vercel (secondary)

### AI Agent System
- **Registry**: `agents/registry.yaml` - 6 specialized agents
- **Backends**: Ollama (local), vLLM (GPU-optimized)
- **Capabilities**: Business consulting, research, investment, legal, marketing, support
- **Safety**: Content filtering, audit logging, rate limiting

### External Dependencies
- **APIs**: Supabase, Formspree, Sentry
- **CDN**: Google Fonts, Pexels images, Cloudinary
- **Analytics**: Google Analytics integration

## Key Modules & Features

### Authentication System
- **Location**: `src/services/auth.service.ts`
- **Features**: JWT tokens, bcryptjs hashing, session management
- **Security**: Rate limiting, audit logging, timeout controls

### AI Agent Orchestration
- **Location**: `src/services/agents/refactored/`
- **Components**: AdminAgentOrchestrator, individual agent implementations
- **Tools**: 10+ specialized business tools (funding, market analysis, etc.)

### Admin Dashboard
- **Location**: `src/components/admin/`
- **Features**: System monitoring, agent management, API management
- **Access**: Protected by authentication guards

### Form Management
- **Location**: `src/components/forms/`
- **Features**: Multi-step applications, contact forms, file uploads
- **Integration**: Formspree for form submission handling

## Entry Points & Scripts

### Development
- `npm run dev` - Start development server (port 5173)
- `npm run preview` - Preview production build (port 4173)

### Build & Deploy
- `npm run build` - Production build with sitemap generation
- `npm run build:analyze` - Build with bundle analysis
- `npm run deploy:netlify` - Deploy to Netlify
- `npm run deploy:vercel` - Deploy to Vercel

### Quality Assurance
- `npm run lint` - ESLint with 600 max warnings
- `npm run typecheck` - TypeScript type checking
- `npm run test` - Vitest test suite
- `npm run preflight` - All quality checks

### Agent System
- `npm run agent:eval` - Agent evaluation
- `npm run test:agents` - Agent system testing
- `npm run smoke:agents` - Agent smoke tests

## Data Stores & Schemas

### Local Storage
- **Authentication**: JWT tokens, user sessions
- **Form Data**: Multi-step form state persistence
- **Agent State**: Chat history, agent configurations

### External Services
- **Supabase**: User data, form submissions, analytics
- **Formspree**: Form processing and notifications
- **Sentry**: Error tracking and performance monitoring

## Build System & CI/CD

### Build Configuration
- **Vite Config**: `project/vite.config.ts` - PWA, bundle optimization
- **TypeScript**: `tsconfig.json` - Strict mode, path aliases
- **Tailwind**: `tailwind.config.js` - Custom design system

### Deployment
- **Netlify**: Primary deployment with security headers
- **Environment**: Node 20, production optimizations
- **Security**: CSP headers, frame protection, content type validation

### CI/CD Status
- **No GitHub Actions**: No `.github/workflows/` directory found
- **Manual Scripts**: `ci/touched-lint.sh` for linting
- **Deployment**: Manual via npm scripts

## Testing Layout

### Test Framework
- **Primary**: Vitest 3.2.4 with V8 coverage
- **UI Testing**: React Testing Library 16.3.0
- **Environment**: jsdom 26.1.0 for browser simulation

### Test Structure
- **Unit Tests**: `src/**/*.{test,spec}.ts`
- **Setup**: `tests/setup.ts` (currently has merge conflicts)
- **Coverage**: Limited to `src/llm/**/*.{ts,tsx}`

### Test Status
- **Current State**: FAILING - 9 test suites failed due to merge conflicts
- **Coverage**: Not measurable due to test failures

## Security Posture

### Authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Session Management**: JWT with timeout controls
- **Rate Limiting**: Built-in protection against brute force

### Security Headers (Netlify)
- **CSP**: Restrictive content security policy
- **Frame Protection**: X-Frame-Options: DENY
- **Content Type**: X-Content-Type-Options: nosniff
- **XSS Protection**: X-XSS-Protection enabled

### Vulnerabilities
- **NPM Audit**: 3 moderate severity vulnerabilities
  - esbuild (via vite): CVE-2024-346 (CVSS 5.3)
  - vite: Development server request vulnerability
  - vite-plugin-pwa: Dependency vulnerability

## Accessibility & i18n

### Accessibility
- **Testing**: `src/utils/__tests__/a11y.test.ts`
- **Components**: ARIA labels, keyboard navigation
- **Status**: Tests failing due to merge conflicts

### Internationalization
- **Status**: No i18n implementation detected
- **Language**: English only
- **Localization**: No locale-specific configurations

## Observability

### Logging
- **Production Logger**: `src/services/agents/refactored/logging/ProductionLogger.ts`
- **Error Tracking**: Sentry integration
- **Audit Logging**: Security event tracking

### Monitoring
- **Performance**: `src/services/performance/PerformanceMonitor.ts`
- **Real-time**: `src/services/agents/refactored/monitoring/RealTimeMonitor.ts`
- **Analytics**: Custom analytics service

## Environment & Secrets

### Environment Variables
- **Authentication**: `VITE_AUTH_SECRET`, `VITE_SESSION_TIMEOUT`
- **Services**: `VITE_FORMSPREE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **Monitoring**: `VITE_SENTRY_DSN`
- **Agent Control**: `VITE_AGENTS_DISABLED` (for deploy previews)

### Configuration Files
- **Environment**: No `.env` files found in repository
- **Secrets**: Referenced in README but not committed
- **Security**: Environment variables properly prefixed with `VITE_`
