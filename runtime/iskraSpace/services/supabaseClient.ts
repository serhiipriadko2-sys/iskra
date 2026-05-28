/**
 * Supabase Client Configuration
 *
 * Provides Supabase client for Iskra Space App
 */

import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './storageCompat';
import type { Database } from '../types/supabase';

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

const ensuredUserIds = new Set<string>();
let sessionPromise: Promise<Session | null> | null = null;

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session?.user?.id) {
    ensuredUserIds.clear();
  }
});

async function ensureUserProfile(session: Session): Promise<void> {
  const userId = session.user?.id;
  if (!userId || ensuredUserIds.has(userId)) return;

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
      }
    );

  if (error) {
    console.error('Failed to ensure Supabase user profile:', error);
    return;
  }

  ensuredUserIds.add(userId);
}

async function ensureSession(): Promise<Session | null> {
  if (sessionPromise) {
    return sessionPromise;
  }

  sessionPromise = (async () => {
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
  })();

  try {
    return await sessionPromise;
  } finally {
    sessionPromise = null;
  }
}

/**
 * Ensures the browser has a real Supabase Auth session.
 *
 * SECURITY: device-local UUIDs are not accepted by auth.uid()-based RLS.
 * Anonymous Supabase Auth users still receive the authenticated Postgres role
 * and a JWT, so user-owned rows can be protected by RLS.
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  const session = await ensureSession();
  return session?.user?.id ?? null;
}

// Helper to get current user ID backed by a real Supabase session.
export async function getUserId(): Promise<string> {
  const userId = await ensureSupabaseSession();
  if (!userId) {
    throw new Error('No authenticated or anonymous Supabase session is available');
  }

  return userId;
}

/**
 * Returns the current access token for Edge Functions.
 * The anon publishable key is not a user JWT and must not be used as Bearer auth.
 */
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
