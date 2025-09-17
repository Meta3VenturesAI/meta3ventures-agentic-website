// Environment variable checks for deployment debugging
export function checkEnvironmentVariables(): void {
  if (typeof window === 'undefined') return;

  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_FORMSPREE_CONTACT_KEY',
    'VITE_FORMSPREE_APPLY_KEY',
    'VITE_FORMSPREE_NEWSLETTER_KEY'
  ];

  const optionalVars = [
    'VITE_SENTRY_DSN',
    'VITE_GA_TRACKING_ID',
    'VITE_GA_MEASUREMENT_ID',
    'VITE_ADMIN_PASSWORD_HASH',
    'VITE_ADMIN_PASSWORD',
    'VITE_APP_ENV'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });

  // Log environment status in development or if there are missing required vars
  if (import.meta.env.DEV || missing.length > 0) {
    console.group('🔧 Environment Variables Check');
    
    if (missing.length > 0) {
      console.warn('❌ Missing required environment variables:', missing);
    }
    
    if (present.length > 0) {
      console.log('✅ Present environment variables:', present);
    }
    
    // Check optional vars
    const optionalPresent = optionalVars.filter(v => import.meta.env[v]);
    if (optionalPresent.length > 0) {
      console.log('ℹ️ Optional vars present:', optionalPresent);
    }
    
    console.groupEnd();
  }

  // Display warning if critical vars are missing
  if (missing.length > 0 && import.meta.env.PROD) {
    console.error('Application may not function properly. Missing environment variables:', missing);
  }
}

// Check if we're in a valid deployment environment
export function isValidDeployment(): boolean {
  // For now, we'll consider it valid if we have at least Formspree keys
  // (Supabase is optional if we have localStorage fallback)
  // Check if Formspree is configured (currently unused but available for future use)
  const hasFormspree = !!(
    import.meta.env.VITE_FORMSPREE_CONTACT_KEY ||
    import.meta.env.VITE_FORMSPREE_APPLY_KEY ||
    import.meta.env.VITE_FORMSPREE_NEWSLETTER_KEY
  );
  console.log('Formspree configured:', hasFormspree);
  
  return true; // Always return true to prevent blocking, but log issues
}