import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
  resolve: { 
    alias: { 
      "@": fileURLToPath(new URL("./src", import.meta.url)) 
    } 
  },
  plugins: [
    react({
      jsxImportSource: 'react',
      babel: {
        plugins: []
      }
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Meta3Ventures',
        short_name: 'Meta3',
        description: 'AI Innovation & Digital Transformation',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pexels-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'cloudinary-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    }),
    // Bundle analyzer - disabled for production builds to avoid dependency issues
    ...(mode === 'development' && process.env.ANALYZE ? (() => {
      try {
        const { visualizer } = require('rollup-plugin-visualizer');
        return [visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })];
      } catch (error) {
        console.warn('rollup-plugin-visualizer not available, skipping bundle analysis');
        return [];
      }
    })() : [])
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['lucide-react']
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React and core libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          
          // Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'router';
          }
          
          // Charts and visualization
          if (id.includes('node_modules/recharts/') || id.includes('node_modules/d3-')) {
            return 'charts';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase';
          }
          
          // UI libraries
          if (id.includes('node_modules/@formspree/') || id.includes('node_modules/react-hot-toast/')) {
            return 'ui-vendor';
          }
          
          // Icons
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
          
          // Utils
          if (id.includes('node_modules/date-fns/') || id.includes('node_modules/lodash/')) {
            return 'utils';
          }
          
          // Agent system - split into smaller chunks
          if (id.includes('src/services/agents/')) {
            if (id.includes('AdminAgentOrchestrator') || id.includes('AgentAuthGuard')) {
              return 'agent-core';
            }
            if (id.includes('LLMService') || id.includes('RAGService')) {
              return 'agent-llm';
            }
            if (id.includes('AgentTools') || id.includes('Tool')) {
              return 'agent-tools';
            }
            return 'agent-utils';
          }
          
          // Admin dashboard
          if (id.includes('src/pages/AdminDashboard') || id.includes('src/components/AdminDashboard')) {
            return 'admin-dashboard';
          }
          
          // Blog system
          if (id.includes('src/pages/Blog') || id.includes('src/components/Blog')) {
            return 'blog-system';
          }
          
          // Forms
          if (id.includes('src/components/forms/') || id.includes('src/pages/Apply')) {
            return 'forms';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    sourcemap: !isProduction,
    minify: isProduction ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: isProduction,
        drop_debugger: true,
        pure_funcs: isProduction ? ['console.debug', 'console.log'] : []
      },
      mangle: {
        safari10: true
      }
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: JSON.stringify(isProduction)
  }
  };
});