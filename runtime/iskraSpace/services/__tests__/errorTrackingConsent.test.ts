import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('error tracking consent boundary', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('is disabled by default', async () => {
    const tracking = await import('../errorTracking');

    await tracking.initErrorTracking();

    expect(tracking.isErrorTrackingEnabled()).toBe(false);
    expect(localStorage.getItem('iskra_error_tracking_opted_in')).toBeNull();
  });

  it('persists explicit consent and removes it on opt-out', async () => {
    const tracking = await import('../errorTracking');

    tracking.optInErrorTracking();
    expect(localStorage.getItem('iskra_error_tracking_opted_in')).toBe('true');

    tracking.optOutErrorTracking();
    expect(localStorage.getItem('iskra_error_tracking_opted_in')).toBeNull();
    expect(tracking.isErrorTrackingEnabled()).toBe(false);
  });
});
