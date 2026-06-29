import { describe, it, expect } from 'vitest';
import { MetricsEngine } from '../services/metricsService';
import { DEFAULT_METRICS } from '@iskra/core';

describe('MetricsEngine.updateExplainable', () => {
  it('returns explainable payload with non-empty trace and canon evidence', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS);
    const result = engine.updateExplainable({ drift: 0.1 }, 'loop');

    expect(result.how.length).toBeGreaterThan(0);
    expect(result.evidence.some(ref => ref.kind === 'canon')).toBe(true);
    expect(result.contracts_checked).toContain('how.length > 0');
  });

  it('keeps value equivalent to update() for same inputs', () => {
    const a = new MetricsEngine(DEFAULT_METRICS);
    const b = new MetricsEngine(DEFAULT_METRICS);

    const explainable = a.updateExplainable({ trust: 0.03, pain: 0.02 }, 'chaos entropy signal');
    const plain = b.update({ trust: 0.03, pain: 0.02 }, 'chaos entropy signal');

    expect(explainable.value).toEqual(plain);
  });

  it('preserves the rhythm 0-100 domain while clamping ordinary metrics to 0-1', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS);

    const next = engine.update({ rhythm: 0.1, trust: 0.5, pain: 2 });
    expect(next.rhythm).toBeCloseTo(60.1);
    expect(next.trust).toBe(1);
    expect(next.pain).toBe(1);

    const capped = engine.update({ rhythm: 100 });
    expect(capped.rhythm).toBe(100);
  });
});
