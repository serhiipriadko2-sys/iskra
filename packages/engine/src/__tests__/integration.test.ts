import { describe, it, expect } from 'vitest';
import { MetricsEngine } from '../services/metricsService.js';
import { DEFAULT_METRICS } from '@iskra/core';

describe('MetricsEngine Integration', () => {
  const engine = new MetricsEngine(DEFAULT_METRICS);

  it('should calculate metrics based on text input', () => {
    const text = 'hello hello hello';
    const updated = engine.update({ rhythm: 70 }, text);

    // Low entropy (loop) increases drift
    expect(updated.drift).toBeGreaterThan(0.1);
  });

  it('should calculate fractal dimension', () => {
    // Fill history to test HFD calculation
    for (let i = 0; i < 50; i++) {
      engine.update({ chaos: Math.random() });
    }

    const current = engine.getCurrentMetrics();
    expect(current.chaos).toBeDefined();
  });
});
