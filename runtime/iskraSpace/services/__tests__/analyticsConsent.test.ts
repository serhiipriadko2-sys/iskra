import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('analytics consent boundary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('keeps analytics disabled until the user explicitly opts in', async () => {
    const analytics = await import('../analytics');

    await analytics.initAnalytics();

    expect(analytics.hasOptedOut()).toBe(true);
    expect(analytics.isAnalyticsEnabled()).toBe(false);
    expect(localStorage.getItem('iskra_analytics_opted_in')).toBeNull();
  });

  it('persists consent and removes both consent and identity on opt-out', async () => {
    const analytics = await import('../analytics');

    analytics.optIn();
    expect(localStorage.getItem('iskra_analytics_opted_in')).toBe('true');
    expect(analytics.hasOptedOut()).toBe(false);

    localStorage.setItem('iskra_analytics_client_id', 'test-client-id');
    analytics.optOut();

    expect(localStorage.getItem('iskra_analytics_opted_in')).toBeNull();
    expect(localStorage.getItem('iskra_analytics_client_id')).toBeNull();
    expect(analytics.hasOptedOut()).toBe(true);
  });
});
