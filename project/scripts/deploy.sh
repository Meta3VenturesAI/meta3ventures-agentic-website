#!/bin/bash

# Meta3Ventures Deployment Script
# Supports both Netlify and Vercel deployments

echo "🚀 Meta3Ventures Deployment Script"
echo "=================================="

# Check if deployment platform is specified
if [ "$1" = "netlify" ] || [ -z "$1" ]; then
    echo "📦 Building for Netlify..."
    npm run build:production
    
    if command -v netlify &> /dev/null; then
        echo "🌐 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
    else
        echo "❌ Netlify CLI not found. Install with: npm install -g netlify-cli"
        exit 1
    fi
    
elif [ "$1" = "vercel" ]; then
    echo "📦 Building for Vercel..."
    npm run build:production
    
    if command -v vercel &> /dev/null; then
        echo "🌐 Deploying to Vercel..."
        vercel --prod
    else
        echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
else
    echo "Usage: npm run deploy [netlify|vercel]"
    echo "Default: netlify"
    exit 1
fi

echo "✅ Deployment complete!"
