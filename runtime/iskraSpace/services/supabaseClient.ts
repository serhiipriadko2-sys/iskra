/**
 * Supabase client and closed-beta access boundary for Iskra Space.
 *
 * Browser code uses only the publishable key. Authorization is resolved by the
 * server-side `resolve_beta_access` RPC and must never depend on user metadata.
 */

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { safeStorage } from './storageCompat';
import type { Database } from '../types/supabase';
import { getRuntimeConfig } from '../config/runtimeConfig';

const supabaseUrl = getRuntimeConfig('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = getRuntimeConfig(
  'VITE_SUPABASE_ANON_KEY',
  import.meta.env.VITE_SUPABASE_ANON_KEY,
) || '';
const isNonProductionBuild = import.meta.env.MODE !== 'production';
const allowAnonymousAuth = isNonProductionBuild && import.meta.env.VITE_ENABLE_ANONYMOUS_AUTH === 'true';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isAnonymousAuthAllowed = allowAnonymousAuth;

const effectiveSupabaseUrl = supabaseUrl || 'http://127.0.0.1:54321';
const effectiveSupabaseAnonKey = supabaseAnonKey || 'local-test-anon-key';

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file.');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(effectiveSupabaseUrl, effectiveSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type BetaAccessDenyReason =
  | 'not-configured'
  | 'no-session'
  | 'anonymous-session'
  | 'membership-inactive'
  | 'membership-unavailable';

export interface BetaSession {
  userId: string;
  email: string;
  accessToken: string;
}

export type BetaAccess =
  | { status: 'granted'; session: BetaSession }
  | { status: 'denied'; reason: BetaAccessDenyReason };

export type MagicLinkRequestResult =
  | { ok: true }
  | { ok: false; error: string };

interface BetaAccessResolution {
  active: boolean;
  membership_status: string;
}

const ensuredUserIds = new Set<string>();

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session?.user?.id) {
    ensuredUserIds.clear();
  }
});

function isBetaAccessResolution(value: unknown): value is BetaAccessResolution {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const resolution = value as Record<string, unknown>;
  return typeof resolution.active === 'boolean' && typeof resolution.membership_status === 'string';
}

async function ensureUserProfile(session: Session): Promise<void> {
  const userId = session.user.id;
  if (ensuredUserIds.has(userId)) return;

  const { error } = await supabase
    .from('users')
    .upsert(
      { id: userId },
      { onConflict: 'id' },
    );

  if (error) {
    console.error('Failed to ensure Supabase user profile:', error);
    return;
  }

  ensuredUserIds.add(userId);
}

async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Failed to read Supabase session:', error);
    return null;
  }

  return data.session;
}

/**
 * Resolves the only browser session that may access IskraSpace cloud or AI data.
 * Anonymous sessions are deliberately rejected even though Supabase maps them to
 * the PostgreSQL `authenticated` role.
 */
export async function getBetaSession(): Promise<BetaAccess> {
  if (!isSupabaseConfigured) {
    return { status: 'denied', reason: 'not-configured' };
  }

  const session = await getCurrentSession();
  if (!session) {
    return { status: 'denied', reason: 'no-session' };
  }

  if (session.user.is_anonymous) {
    return { status: 'denied', reason: 'anonymous-session' };
  }

  const email = session.user.email;
  if (!email || !session.access_token) {
    return { status: 'denied', reason: 'membership-unavailable' };
  }

  const { data, error } = await supabase.rpc('resolve_beta_access');
  if (error || !isBetaAccessResolution(data)) {
    console.error('Failed to resolve closed-beta membership:', error);
    return { status: 'denied', reason: 'membership-unavailable' };
  }

  if (!data.active || data.membership_status !== 'active') {
    return { status: 'denied', reason: 'membership-inactive' };
  }

  await ensureUserProfile(session);

  return {
    status: 'granted',
    session: {
      userId: session.user.id,
      email,
      accessToken: session.access_token,
    },
  };
}

/**
 * Requests a passwordless email magic link for an already provisioned member.
 * User creation remains an operator-controlled invite workflow.
 */
export async function requestMagicLink(email: string): Promise<MagicLinkRequestResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: 'Укажите email для получения ссылки.' };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Закрытая beta ещё не настроена.' };
  }

  const redirectOptions = typeof window === 'undefined'
    ? {}
    : { emailRedirectTo: window.location.origin };

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: false,
      ...redirectOptions,
    },
  });

  if (error) {
    console.error('Failed to request magic link:', error);
    return { ok: false, error: 'Не удалось отправить ссылку. Попробуйте позже.' };
  }

  return { ok: true };
}

export async function signOutBetaSession(): Promise<void> {
  ensuredUserIds.clear();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Development-only compatibility path. Production callers must never use it.
 */
export async function signInAnonymouslyForNonProduction(): Promise<Session | null> {
  if (!allowAnonymousAuth || !isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed:', error);
    return null;
  }

  return data.session;
}

/**
 * Ensures the browser has an active permanent beta-member session.
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  const access = await getBetaSession();
  return access.status === 'granted' ? access.session.userId : null;
}

export async function getUserId(): Promise<string> {
  const userId = await ensureSupabaseSession();
  if (!userId) {
    throw new Error('No active closed-beta member session is available');
  }

  return userId;
}

/**
 * Returns a JWT only after the membership boundary has granted beta access.
 */
export async function getAccessToken(): Promise<string> {
  const access = await getBetaSession();
  if (access.status !== 'granted') {
    throw new Error('No active closed-beta membership is available');
  }

  return access.session.accessToken;
}

export async function hasSupabaseSession(): Promise<boolean> {
  return (await getBetaSession()).status === 'granted';
}

export function getLegacyDeviceId(): string | null {
  return safeStorage.getItem('iskra_device_id');
}

export async function isSupabaseAvailable(): Promise<boolean> {
  if (!isSupabaseConfigured || !(await hasSupabaseSession())) {
    return false;
  }

  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;
