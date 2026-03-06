/**
 * Supabase client configuration for ISKRA Web.
 * 
 * SECURITY NOTES:
 * - Uses ANON key only (never expose service_role key in client)
 * - Environment variables MUST be set in .env file
 * - RLS (Row Level Security) must be enabled on all tables
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables at module load time
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file.'
  );
}

// Validate URL format (basic check)
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid VITE_SUPABASE_URL format. Must be a valid HTTPS URL.');
}

// Validate key format (Supabase keys start with 'eyJ')
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn(
    'WARNING: Supabase anon key does not appear to be a valid JWT. ' +
    'Keys should start with "eyJ". Check your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'iskra-web',
    },
  },
});

/**
 * Helper to check if Supabase client is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
}

/**
 * Helper to get current user session (with error handling)
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
