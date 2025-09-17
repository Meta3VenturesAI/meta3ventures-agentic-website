// Enhanced security utilities
export const securityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.google.com', 'https://www.gstatic.com', 'https://www.googletagmanager.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://api.supabase.co', 'https://*.supabase.co', 'https://formspree.io', 'https://www.google-analytics.com'],
    'frame-src': ["'self'", 'https://www.google.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'", 'https://formspree.io'],
    'upgrade-insecure-requests': true,
    'block-all-mixed-content': true
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  }
};

// Input sanitization with enhanced security
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/file:/gi, '') // Remove file: protocols
    .replace(/\0/g, '') // Remove null bytes
    .trim()
    .substring(0, 10000); // Limit length to prevent DoS
};

// Enhanced email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

// URL validation with security checks
export const validateURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Rate limiting utility (client-side)
export const rateLimiter = {
  attempts: new Map<string, { count: number; lastAttempt: number; blocked: boolean }>(),
  
  isAllowed: (key: string, maxAttempts: number = 5, windowMs: number = 60000, blockDuration: number = 300000): boolean => {
    const now = Date.now();
    const attempt = rateLimiter.attempts.get(key);
    
    if (!attempt) {
      rateLimiter.attempts.set(key, { count: 1, lastAttempt: now, blocked: false });
      return true;
    }
    
    // Check if still blocked
    if (attempt.blocked && (now - attempt.lastAttempt) < blockDuration) {
      return false;
    }
    
    // Reset if window expired
    if (now - attempt.lastAttempt > windowMs) {
      rateLimiter.attempts.set(key, { count: 1, lastAttempt: now, blocked: false });
      return true;
    }
    
    // Check if exceeded attempts
    if (attempt.count >= maxAttempts) {
      attempt.blocked = true;
      attempt.lastAttempt = now;
      return false;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  },

  reset: (key: string): void => {
    rateLimiter.attempts.delete(key);
  },

  getStatus: (key: string): { count: number; blocked: boolean; timeRemaining?: number } => {
    const attempt = rateLimiter.attempts.get(key);
    if (!attempt) {
      return { count: 0, blocked: false };
    }

    const timeRemaining = attempt.blocked ? 
      Math.max(0, 300000 - (Date.now() - attempt.lastAttempt)) : 0;

    return {
      count: attempt.count,
      blocked: attempt.blocked,
      timeRemaining
    };
  }
};

// Environment validation with security checks
export const validateEnvironment = (): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for required environment variables
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    issues.push(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Supabase URL format
  if (import.meta.env.VITE_SUPABASE_URL && !validateURL(import.meta.env.VITE_SUPABASE_URL)) {
    issues.push('Invalid Supabase URL format');
  }

  // Check for development keys in production
  if (import.meta.env.PROD) {
    if (import.meta.env.VITE_SUPABASE_URL?.includes('localhost')) {
      issues.push('Development Supabase URL detected in production');
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

// Secure local storage wrapper
export const secureStorage = {
  set: (key: string, value: unknown): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const serializedValue = JSON.stringify(value);
      
      // Check storage quota
      if (serializedValue.length > 5000000) { // 5MB limit
        console.warn('Data too large for localStorage');
        return false;
      }
      
      localStorage.setItem(sanitizedKey, serializedValue);
      return true;
    } catch (e) {
      console.error('Failed to store data securely:', e);
      return false;
    }
  },

  get: (key: string): unknown => {
    try {
      const sanitizedKey = sanitizeInput(key);
      const item = localStorage.getItem(sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to retrieve data securely:', e);
      return null;
    }
  },

  remove: (key: string): boolean => {
    try {
      const sanitizedKey = sanitizeInput(key);
      localStorage.removeItem(sanitizedKey);
      return true;
    } catch (e) {
      console.error('Failed to remove data securely:', e);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Failed to clear storage securely:', e);
      return false;
    }
  }
};

// Content Security Policy violation reporter
export const setupCSPReporting = (): void => {
  document.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
      documentURI: e.documentURI,
      lineNumber: e.lineNumber,
      columnNumber: e.columnNumber
    });

    // In production, report to security monitoring service
    if (import.meta.env.PROD) {
      // Send to security monitoring service
    }
  });
};

// Initialize security measures
export const initializeSecurity = (): void => {
  setupCSPReporting();
  
  // Validate environment on startup
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error('Environment validation failed:', envValidation.issues);
  }

  // Disable right-click in production (optional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Disable F12, Ctrl+Shift+I, etc. (optional)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    });
  }
};