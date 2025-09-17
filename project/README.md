# Meta3Ventures Website

## Project Overview
A modern, responsive website for Meta3Ventures, a venture capital firm focusing on AI, blockchain, and emerging technologies.

### Key Features
- Modern React with TypeScript
- Tailwind CSS for styling
- Dark mode support
- Responsive design
- SEO optimization
- Form handling with Formspree

## Portfolio Companies

### Current Portfolio
1. GenovateAI
   - Website: genovateai.com
   - Description: AI consultancy and development firm specializing in generative AI tools

2. QuickCast
   - Website: quickcast.tv
   - Description: FAST channels and TV apps platform

[... other current portfolio companies]

### Exits
1. AdVerif.ai
   - Acquirer: Zefr
   - Description: AI-powered brand safety and misinformation detection

2. BrainVu
   - Acquirer: Mantis Vision
   - Description: Real-time emotion analysis in VR/AR

[... other exits]

## Project Structure
```
src/
├── components/
│   ├── sections/       # Page sections
│   └── SEO.tsx        # SEO component
├── pages/             # Route pages
└── main.tsx          # Entry point
```

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Image Handling
Images are served from:
- Public directory for static assets
- External URLs for dynamic content
- Pexels for stock photos

Note: Profile images should be hosted externally due to WebContainer limitations.

## Environment Variables
Required environment variables:
- VITE_FORMSPREE_KEY
- [Other environment variables]

## Dependencies
Core dependencies:
- React 18.3.1
- Vite
- TypeScript
- Tailwind CSS
- Lucide React for icons
- React Router for navigation
- React Helmet Async for SEO
- Formspree for form handling