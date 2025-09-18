import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { runQuickAudit } from './lib/productionAudit';
import { errorTracking } from './services/error-tracking.service';
import { checkEnvironmentVariables } from './utils/env-check';
import { appInit } from './services/app-init.service';

// Check environment variables (for debugging deployment issues)
checkEnvironmentVariables();

// Initialize app services (consolidated in app-init.service)
if (typeof window !== 'undefined') {
  // Initialize error tracking with error handling
  try {
    errorTracking.initialize();
  } catch (error) {
    console.warn('Error tracking initialization failed:', error);
    // App should still work without error tracking
  }

  // Basic error tracking (keeping minimal version here for immediate errors)
  window.addEventListener('error', (event) => {
    if (import.meta.env.DEV) {
      console.error('Global error:', event.error);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }
    event.preventDefault();
  });

  // Run production audit in development
  if (import.meta.env.DEV) {
    setTimeout(() => {
      runQuickAudit();
    }, 2000);
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service Worker registration for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      if (import.meta.env.DEV) {
        console.log('SW registered: ', registration);
      }
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (import.meta.env.DEV) {
                console.log('New content available, please refresh.');
              }
            }
          });
        }
      });
      
    } catch (registrationError) {
      if (import.meta.env.DEV) {
        console.log('SW registration failed: ', registrationError);
      }
    }
  });
}

// Handle online/offline UI status (app-init handles logging)
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
});

// Handle visibility change for performance optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause non-critical operations
    if (import.meta.env.DEV) {
      console.log('Page hidden, pausing non-critical operations');
    }
  } else {
    // Page is visible, resume operations
    if (import.meta.env.DEV) {
      console.log('Page visible, resuming operations');
    }
  }
});