import { describe, it, expect, vi } from 'vitest';
import { metricsEngine } from '@iskra/engine';

describe('useEngine Integration', () => {
  it('metricsEngine should be globally available', () => {
    expect(metricsEngine).toBeDefined();
  });

  it('metricsEngine should update metrics', () => {
    const initial = metricsEngine.getCurrentMetrics();
    metricsEngine.update({ rhythm: 100 });
    const updated = metricsEngine.getCurrentMetrics();
    expect(updated.rhythm).toBe(100);
  });
});
