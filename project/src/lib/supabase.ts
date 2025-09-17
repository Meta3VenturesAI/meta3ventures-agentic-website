import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Don't warn in production, just handle gracefully
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn('Missing Supabase environment variables. Some features may not work properly.');
    console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
  }
}

// Create a fallback client if environment variables are missing
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for development when Supabase is not configured
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        eq: function() { return this; },
        gte: function() { return this; },
        lte: function() { return this; },
        order: function() { return this; },
        limit: function() { return this; }
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      }
    } as unknown;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'meta3ventures'
      }
    }
  });
};

export const supabase = createSupabaseClient();

// Enhanced error handling wrapper
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: unknown }>
): Promise<T> {
  try {
    const { data, error } = await promise;
    
    if (error) {
      // Check for specific error types
      if (error.code === '42P01') {
        throw new Error(`Database table does not exist: ${error.message}`);
      }
      
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database operation failed');
    }
    
    if (!data) {
      throw new Error('No data returned from database');
    }
    
    return data;
  } catch (err) {
    console.error('Database operation failed:', err);
    throw err;
  }
}

// Health check function with better error handling
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured');
    return false;
  }

  try {
    // Try a simple query to check connection
    const { error } = await supabase.from('page_views').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.warn('Supabase connected but tables not created yet');
      return true; // Connection works, just tables don't exist
    }
    
    return !error;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
}