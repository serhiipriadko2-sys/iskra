import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * SECURITY:
 * - Use anon key in browser.
 * - NEVER embed service_role key in client code (bypasses RLS).
 */
export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
  /** Optional JWT access token (Bearer). Useful for server-side calls. */
  accessToken?: string;
  /** Additional headers merged into global headers. */
  headers?: Record<string, string>;
  /** Optional createClient options (typed via the actual signature). */
  options?: Parameters<typeof createClient>[2];
}

export function createSupabaseClient(cfg: SupabaseClientConfig): SupabaseClient {
  if (!cfg.url || !cfg.anonKey) {
    throw new Error('SupabaseClientConfig requires url and anonKey');
  }

  const authHeader = (cfg.accessToken ? { Authorization: `Bearer ${cfg.accessToken}` } : {}) as Record<string, string>;
  const globalHeaders = cfg.options?.global?.headers ? (cfg.options.global.headers as Record<string, string>) : {};
  const inHeaders = cfg.headers ?? {};
  
  const mergedHeaders: Record<string, string> = {
    ...authHeader,
    ...globalHeaders,
    ...inHeaders
  };

  // Default safe auth options for a library layer.
  const defaultAuth = {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  };

  return createClient(cfg.url, cfg.anonKey, {
    ...cfg.options,
    auth: {
      ...defaultAuth,
      ...(cfg.options?.auth ?? {})
    },
    global: {
      ...(cfg.options?.global ?? {}),
      headers: mergedHeaders
    }
  }) as any;
}
