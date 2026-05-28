/**
 * Supabase Client Configuration
 *
 * Provides Supabase client for Iskra Space App
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './storageCompat';
import type { Database } from '../types/supabase';

// API credentials should be in environment variables
// Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to generate UUID with secure entropy
function generateUUID(): string {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);

    // RFC4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  throw new Error('Secure UUID generation is unavailable in this environment');
}

// Helper to get current user ID (anonymous or authenticated)
export async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return session.user.id;
  }

  // For anonymous users, use a device-based ID stored in localStorage
  let deviceId = safeStorage.getItem('iskra_device_id');
  if (!deviceId) {
    deviceId = generateUUID();
    safeStorage.setItem('iskra_device_id', deviceId);
  }
  return deviceId;
}

// Helper to get current authenticated access token for protected Edge Functions
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

// Check if Supabase is available
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;
