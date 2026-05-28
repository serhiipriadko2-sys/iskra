/**
 * Supabase Client Configuration
 *
 * Provides Supabase client for Iskra Space App
 */

import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './storageCompat';
import type { Database } from '../types/supabase';

// API credentials should be in environment variables
// Create .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const allowAnonymousAuth = import.meta.env.VITE_ENABLE_ANONYMOUS_AUTH !== 'false';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to generate UUID with secure entropy for local-only fallback mode
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

async function ensureUserProfile(session: Session): Promise<void> {
  const userId = session.user?.id;
  if (!userId) return;

  const profileName = typeof session.user.user_metadata?.name === 'string'
    ? session.user.user_metadata.name
    : session.user.is_anonymous
      ? 'Guest'
      : null;

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        name: profileName,
      },
      {
        onConflict: 'id',
      },
    );

  if (error) {
    console.error('Failed to ensure Supabase user profile:', error);
  }
}

async function ensureSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    await ensureUserProfile(session);
    return session;
  }

  if (!allowAnonymousAuth) {
    return null;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed:', error);
    return null;
  }

  if (data.session) {
    await ensureUserProfile(data.session);
  }

  return data.session ?? null;
}

/**
 * Ensures the browser has a real Supabase Auth session.
 * Anonymous Supabase Auth users still receive a JWT and authenticated DB role.
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  const session = await ensureSession();
  return session?.user?.id ?? null;
}

/**
 * Returns the current access token for protected Edge Functions.
 * The anon publishable key is not a user JWT and must not be used as Bearer auth.
 */
export async function getAccessToken(): Promise<string> {
  const session = await ensureSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('No authenticated or anonymous Supabase session is available for Edge Functions.');
  }

  return accessToken;
}

export async function hasSupabaseSession(): Promise<boolean> {
  return Boolean(await ensureSession());
}

export function getLegacyDeviceId(): string | null {
  return safeStorage.getItem('iskra_device_id');
}

// Helper to get current user ID.
// Prefer a real Supabase Auth user. Fall back to a local-only ID only when
// Supabase Auth is unavailable; secure RLS-backed writes will not work in that mode.
export async function getUserId(): Promise<string> {
  const authUserId = await ensureSupabaseSession();
  if (authUserId) {
    return authUserId;
  }

  let deviceId = safeStorage.getItem('iskra_device_id');
  if (!deviceId) {
    deviceId = generateUUID();
    safeStorage.setItem('iskra_device_id', deviceId);
  }

  return deviceId;
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
