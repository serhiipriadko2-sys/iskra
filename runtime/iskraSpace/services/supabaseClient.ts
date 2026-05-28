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
    .upsert({
      id: userId,
      name: profileName,
    }, {
      onConflict: 'id',
    });

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

// Helper to get current user ID backed by a real Supabase session.
export async function getUserId(): Promise<string> {
  const session = await ensureSession();
/**
 * Ensures the browser has a real Supabase Auth session.
 *
 * SECURITY: device-local UUIDs are not accepted by auth.uid()-based RLS.
 * Anonymous Supabase Auth users still receive the authenticated Postgres role
 * and a JWT, so user-owned rows can be protected by RLS.
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return session.user.id;
  }

  throw new Error('No authenticated or anonymous Supabase session is available');
}

export async function getAccessToken(): Promise<string> {
  const session = await ensureSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('No Supabase access token is available');
  }

  return accessToken;
}

export async function hasSupabaseSession(): Promise<boolean> {
  return Boolean(await ensureSession());
}

export function getLegacyDeviceId(): string | null {
  return safeStorage.getItem('iskra_device_id');
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.warn('Anonymous Supabase sign-in failed. Falling back to local-only mode.', error.message);
    return null;
  }

  return data.session?.user?.id ?? data.user?.id ?? null;
}

/**
 * Returns the current access token for Edge Functions.
 * The anon publishable key is not a user JWT and must not be used as Bearer auth.
 */
export async function getAccessToken(): Promise<string | null> {
  let { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    await ensureSupabaseSession();
    ({ data: { session } } = await supabase.auth.getSession());
  }

  return session?.access_token ?? null;
}

// Helper to get current user ID.
// Prefer a real Supabase Auth user. Fall back to a local-only ID only when
// Supabase Auth is unavailable; DB writes will be blocked by secure RLS in that mode.
export async function getUserId(): Promise<string> {
  const authUserId = await ensureSupabaseSession();
  if (authUserId) return authUserId;

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
