export type RuntimeConfigKey =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'VITE_AI_PROVIDER'
  | 'VITE_AI_EDGE_FUNCTION_SLUG'
  | 'VITE_GEMINI_EDGE_FUNCTION_SLUG'
  | 'VITE_GEMINI_FUNCTION_SLUG'
  | 'VITE_ENABLE_REMOTE_SEMANTIC_SEARCH'
  | 'VITE_ALLOW_SENSITIVE_REMOTE_EMBEDDING'
  | 'VITE_SENTRY_DSN'
  | 'VITE_POSTHOG_KEY'
  | 'VITE_POSTHOG_HOST'
  | 'VITE_APP_VERSION';

type RuntimeConfig = Partial<Record<RuntimeConfigKey, string>>;

declare global {
  interface Window {
    __ISKRA_RUNTIME_CONFIG__?: Readonly<RuntimeConfig>;
  }
}

/**
 * Read public runtime configuration injected by the Docker entrypoint.
 * The compile-time fallback keeps Vite previews and local development working.
 */
export function getRuntimeConfig(
  key: RuntimeConfigKey,
  compileTimeFallback?: string,
): string | undefined {
  const runtimeValue = typeof window !== 'undefined'
    ? window.__ISKRA_RUNTIME_CONFIG__?.[key]
    : undefined;

  if (typeof runtimeValue === 'string' && runtimeValue.length > 0) {
    return runtimeValue;
  }

  return compileTimeFallback || undefined;
}
