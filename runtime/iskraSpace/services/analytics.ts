/**
 * Analytics Service
 *
 * Privacy-first analytics using PostHog (or compatible).
 * Gracefully degrades when not configured.
 *
 * PRIVACY PRINCIPLES:
 * - No autocapture (explicit events only)
 * - No session recording by default
 * - User can opt-out
 * - Minimal PII collection
 */

import { getRuntimeConfig } from '../config/runtimeConfig';

// VoiceName type inline to avoid dependency on @iskra/runtime during typecheck
type VoiceName =
  | 'ISKRA' | 'KAIN' | 'PINO' | 'SAM' | 'ANHANTRA'
  | 'HUYNDUN' | 'ISKRIV' | 'MAKI' | 'SIBYL';

interface AnalyticsConfig {
  enabled: boolean;
  optedOut: boolean;
}

interface PostHogClient {
  init(key: string, options: Record<string, unknown>): void;
  capture(event: string, properties?: Record<string, unknown>): void;
  identify(userId: string): void;
  reset(): void;
  opt_out_capturing(): void;
  opt_in_capturing(): void;
}

let posthog: PostHogClient | null = null;
const config: AnalyticsConfig = {
  enabled: false,
  optedOut: true,
};

const STORAGE_KEY = 'iskra_analytics_opted_in';
const ANALYTICS_ID_KEY = 'iskra_analytics_client_id';
const SENSITIVE_PROPERTY = /(chat|content|journal|message|prompt|query|text)/i;

function isAllowedPostHogHost(host: string): boolean {
  try {
    const url = new URL(host);
    return url.protocol === 'https:' && (
      url.hostname === 'posthog.com' || url.hostname.endsWith('.posthog.com')
    );
  } catch {
    return false;
  }
}

function sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> {
  if (!properties) return {};

  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (SENSITIVE_PROPERTY.test(key)) return false;
      return typeof value === 'number' || typeof value === 'boolean' || (
        typeof value === 'string' && value.length <= 64
      );
    })
  );
}

/**
 * Initialize analytics
 * Call this early in app initialization (main.tsx)
 */
export async function initAnalytics(): Promise<void> {
  const key = getRuntimeConfig('VITE_POSTHOG_KEY', import.meta.env.VITE_POSTHOG_KEY);
  const host = getRuntimeConfig(
    'VITE_POSTHOG_HOST',
    import.meta.env.VITE_POSTHOG_HOST,
  ) || 'https://app.posthog.com';

  // Check user preference
  const consentGranted = localStorage.getItem(STORAGE_KEY) === 'true';
  config.optedOut = !consentGranted;

  if (!key) return;

  if (!consentGranted) return;

  if (!isAllowedPostHogHost(host)) {
    console.warn('[Analytics] PostHog host is outside the closed-beta allow-list');
    return;
  }

  try {
    // Dynamic import to avoid loading if not needed
    const PostHog = await import('posthog-js') as unknown as { default: PostHogClient };

    PostHog.default.init(key, {
      api_host: host,
      // Privacy-first settings
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: true,
      persistence: 'localStorage',
      // Respect Do Not Track
      respect_dnt: true,
    });

    posthog = PostHog.default;
    config.enabled = true;

  } catch (error) {
    console.warn('[Analytics] Failed to initialize PostHog:', error);
  }
}

/**
 * Track a custom event
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!posthog || !config.enabled || config.optedOut) return;

  posthog.capture(event, {
    ...sanitizeProperties(properties),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track voice activation
 */
export function trackVoiceActivation(
  voice: VoiceName,
  _reason: string,
  metrics?: Record<string, number>
): void {
  trackEvent('voice_activated', {
    voice,
    // Only include non-sensitive metrics
    rhythm: metrics?.rhythm,
    trust: metrics?.trust,
  });
}

/**
 * Track playbook switch
 */
export function trackPlaybookSwitch(
  from: string,
  to: string,
  _trigger: string
): void {
  trackEvent('playbook_switched', {
    from_playbook: from,
    to_playbook: to,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(feature: string): void {
  trackEvent('feature_used', { feature });
}

/**
 * Track session start
 */
export function trackSessionStart(): void {
  trackEvent('session_started', {
    platform: navigator.platform,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  });
}

/**
 * Identify user (anonymous ID only by default)
 */
export function identifyUser(userId: string): void {
  if (!posthog || !config.enabled || config.optedOut) return;

  // Never send an auth/user identifier. The analytics identity is random,
  // browser-local, and created only after explicit consent.
  void userId;
  let analyticsId = localStorage.getItem(ANALYTICS_ID_KEY);
  if (!analyticsId) {
    analyticsId = crypto.randomUUID();
    localStorage.setItem(ANALYTICS_ID_KEY, analyticsId);
  }
  posthog.identify(analyticsId);
}

/**
 * Reset user identity
 */
export function resetAnalytics(): void {
  if (!posthog) return;
  posthog.reset();
}

/**
 * Opt out of analytics
 */
export function optOut(): void {
  config.optedOut = true;
  config.enabled = false;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ANALYTICS_ID_KEY);

  if (posthog) {
    posthog.opt_out_capturing();
  }
}

/**
 * Opt back into analytics
 */
export function optIn(): void {
  config.optedOut = false;
  localStorage.setItem(STORAGE_KEY, 'true');

  if (posthog) {
    posthog.opt_in_capturing();
  } else {
    void initAnalytics();
  }
}

/**
 * Check if user has opted out
 */
export function hasOptedOut(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== 'true';
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return config.enabled && !config.optedOut;
}
