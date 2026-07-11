/**
 * Error Tracking Service
 *
 * Optional Sentry integration for production error monitoring.
 * Gracefully degrades when Sentry is not configured.
 */

import { getRuntimeConfig } from '../config/runtimeConfig';

interface ErrorContext {
  voice?: string;
  playbook?: string;
  metrics?: Record<string, number>;
}

interface ErrorTrackingConfig {
  dsn?: string;
  environment: string;
  release?: string;
  enabled: boolean;
}

interface SentryEvent {
  message?: string;
  request?: {
    headers?: Record<string, unknown>;
    data?: unknown;
  };
  breadcrumbs?: Array<{ message?: string; data?: unknown }>;
  exception?: { values?: Array<{ value?: string }> };
}

interface SentryClient {
  captureException(error: Error, context?: Record<string, unknown>): void;
  captureMessage(message: string, level: 'info' | 'warning' | 'error'): void;
  setUser(user: { id: string } | null): void;
  addBreadcrumb(breadcrumb: Record<string, unknown>): void;
  setTag(key: string, value: string): void;
}

let sentry: SentryClient | null = null;
let config: ErrorTrackingConfig = {
  environment: import.meta.env.MODE || 'development',
  enabled: false,
};
const ERROR_TRACKING_CONSENT_KEY = 'iskra_error_tracking_opted_in';

function isAllowedSentryDsn(dsn: string): boolean {
  try {
    const url = new URL(dsn);
    return url.protocol === 'https:' && (
      url.hostname === 'sentry.io' || url.hostname.endsWith('.sentry.io')
    );
  } catch {
    return false;
  }
}

/**
 * Initialize error tracking
 * Call this early in app initialization (main.tsx)
 */
export async function initErrorTracking(): Promise<void> {
  const dsn = getRuntimeConfig('VITE_SENTRY_DSN', import.meta.env.VITE_SENTRY_DSN);
  const release = getRuntimeConfig('VITE_APP_VERSION', import.meta.env.VITE_APP_VERSION);

  if (!dsn) return;
  if (localStorage.getItem(ERROR_TRACKING_CONSENT_KEY) !== 'true') return;
  if (!isAllowedSentryDsn(dsn)) {
    console.warn('[ErrorTracking] Sentry DSN is outside the closed-beta allow-list');
    return;
  }

  try {
    // Dynamic import to avoid loading Sentry if not needed
    const Sentry = await import('@sentry/react') as unknown as SentryClient & {
      init(options: Record<string, unknown>): void;
    };

    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: release || 'unknown',
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      sendDefaultPii: false,
      beforeSend(event: SentryEvent) {
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
        if (event.request) delete event.request.data;
        delete event.message;
        event.breadcrumbs?.forEach(breadcrumb => {
          delete breadcrumb.message;
          delete breadcrumb.data;
        });
        event.exception?.values?.forEach(value => delete value.value);
        return event;
      },
    });

    sentry = Sentry;
    config = {
      dsn,
      environment: import.meta.env.MODE,
      release,
      enabled: true,
    };

  } catch (error) {
    console.warn('[ErrorTracking] Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an exception with ISKRA context
 */
export function captureError(error: Error, context?: ErrorContext): void {
  console.error('[ErrorTracking]', error.name);

  if (!sentry || !config.enabled) return;

  sentry.captureException(error, {
    tags: {
      voice: context?.voice,
      playbook: context?.playbook,
    },
    extra: {
      metrics: context?.metrics,
    },
  });
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  if (!sentry || !config.enabled) return;

  sentry.captureMessage(message, level);
}

/**
 * Set current user for error context
 */
export function setUser(userId: string | null): void {
  if (!sentry || !config.enabled) return;

  void userId;
  sentry.setUser(null);
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
    message: 'redacted-event',
    level: 'info',
  });
  void message;
  void data;
}

/**
 * Set a tag for filtering
 */
export function setTag(key: string, value: string): void {
  if (!sentry || !config.enabled) return;

  sentry.setTag(key, value);
}

export function optInErrorTracking(): void {
  localStorage.setItem(ERROR_TRACKING_CONSENT_KEY, 'true');
  void initErrorTracking();
}

export function optOutErrorTracking(): void {
  localStorage.removeItem(ERROR_TRACKING_CONSENT_KEY);
  config.enabled = false;
  sentry?.setUser(null);
}

export function isErrorTrackingEnabled(): boolean {
  return config.enabled && localStorage.getItem(ERROR_TRACKING_CONSENT_KEY) === 'true';
}

export function hasErrorTrackingConsent(): boolean {
  return localStorage.getItem(ERROR_TRACKING_CONSENT_KEY) === 'true';
}

/**
 * Get current config (for debugging)
 */
export function getErrorTrackingConfig(): ErrorTrackingConfig {
  return { ...config };
}
