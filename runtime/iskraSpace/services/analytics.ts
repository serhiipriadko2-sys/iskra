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

// VoiceName type inline to avoid dependency on @iskra/runtime during typecheck
type VoiceName =
  | 'ISKRA' | 'KAIN' | 'PINO' | 'SAM' | 'ANHANTRA'
  | 'HUNDUN' | 'ISKRIV' | 'MAKI' | 'SIBYL';

interface AnalyticsConfig {
  enabled: boolean;
  optedOut: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let posthog: any = null;
let config: AnalyticsConfig = {
  enabled: false,
  optedOut: false,
};

const STORAGE_KEY = 'iskra_analytics_opted_out';

/**
 * Initialize analytics
 * Call this early in app initialization (main.tsx)
 */
export async function initAnalytics(): Promise<void> {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  // Check user preference
  const optedOut = localStorage.getItem(STORAGE_KEY) === 'true';
  config.optedOut = optedOut;

  if (!key) {
    console.info('[Analytics] PostHog key not configured, running without analytics');
    return;
  }

  if (optedOut) {
    console.info('[Analytics] User opted out of analytics');
    return;
  }

  try {
    // Dynamic import to avoid loading if not needed
    // @ts-expect-error - Optional dependency, may not be installed
    const PostHog = await import('posthog-js');

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

    console.info('[Analytics] PostHog initialized');
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
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track voice activation
 */
export function trackVoiceActivation(
  voice: VoiceName,
  reason: string,
  metrics?: Record<string, number>
): void {
  trackEvent('voice_activated', {
    voice,
    reason,
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
  trigger: string
): void {
  trackEvent('playbook_switched', {
    from_playbook: from,
    to_playbook: to,
    trigger,
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

  // Hash the userId for privacy
  const hashedId = btoa(userId).substring(0, 16);
  posthog.identify(hashedId);
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
  localStorage.setItem(STORAGE_KEY, 'true');

  if (posthog) {
    posthog.opt_out_capturing();
  }

  console.info('[Analytics] User opted out');
}

/**
 * Opt back into analytics
 */
export function optIn(): void {
  config.optedOut = false;
  localStorage.removeItem(STORAGE_KEY);

  if (posthog) {
    posthog.opt_in_capturing();
  }

  console.info('[Analytics] User opted in');
}

/**
 * Check if user has opted out
 */
export function hasOptedOut(): boolean {
  return config.optedOut;
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return config.enabled && !config.optedOut;
}
