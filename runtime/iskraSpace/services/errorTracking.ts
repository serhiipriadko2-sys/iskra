/**
 * Error Tracking Service
 *
 * Optional Sentry integration for production error monitoring.
 * Gracefully degrades when Sentry is not configured.
 */

interface ErrorContext {
  userId?: string;
  voice?: string;
  playbook?: string;
  metrics?: Record<string, number>;
  extra?: Record<string, unknown>;
}

interface ErrorTrackingConfig {
  dsn?: string;
  environment: string;
  release?: string;
  enabled: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sentry: any = null;
let config: ErrorTrackingConfig = {
  environment: import.meta.env.MODE || 'development',
  enabled: false,
};

/**
 * Initialize error tracking
 * Call this early in app initialization (main.tsx)
 */
export async function initErrorTracking(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.info('[ErrorTracking] Sentry DSN not configured, running without error tracking');
    return;
  }

  try {
    // Dynamic import to avoid loading Sentry if not needed
    // @ts-expect-error - Optional dependency, may not be installed
    const Sentry = await import('@sentry/react');

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      beforeSend(event: any) {
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        return event;
      },
    });

    sentry = Sentry;
    config = {
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION,
      enabled: true,
    };

    console.info('[ErrorTracking] Sentry initialized');
  } catch (error) {
    console.warn('[ErrorTracking] Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an exception with ISKRA context
 */
export function captureError(error: Error, context?: ErrorContext): void {
  console.error('[ErrorTracking]', error.message, context);

  if (!sentry || !config.enabled) return;

  sentry.captureException(error, {
    tags: {
      voice: context?.voice,
      playbook: context?.playbook,
    },
    extra: {
      ...context?.extra,
      metrics: context?.metrics,
    },
    user: context?.userId ? { id: context.userId } : undefined,
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    console.log(`[ErrorTracking:${level}]`, message);
  }

  if (!sentry || !config.enabled) return;

  sentry.captureMessage(message, level);
}

/**
 * Set current user for error context
 */
export function setUser(userId: string | null): void {
  if (!sentry || !config.enabled) return;

  sentry.setUser(userId ? { id: userId } : null);
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!sentry || !config.enabled) return;

  sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}

/**
 * Set a tag for filtering
 */
export function setTag(key: string, value: string): void {
  if (!sentry || !config.enabled) return;

  sentry.setTag(key, value);
}

/**
 * Check if error tracking is enabled
 */
export function isErrorTrackingEnabled(): boolean {
  return config.enabled;
}

/**
 * Get current config (for debugging)
 */
export function getErrorTrackingConfig(): ErrorTrackingConfig {
  return { ...config };
}
