
import { describe, it, expect } from 'vitest';
import { calculateIntegrityScore, calculateAliveIndex, DEFAULT_METRICS } from '../types/metrics';

describe('Metrics', () => {
  it('calculateIntegrityScore should return correct value', () => {
    // (clarity + trust) / 2 - drift
    const metrics = { ...DEFAULT_METRICS, clarity: 0.8, trust: 0.7, drift: 0.1 };
    // (0.8 + 0.7) / 2 - 0.1 = 0.75 - 0.1 = 0.65
    const score = calculateIntegrityScore(metrics);
    expect(score).toBeCloseTo(0.65);
  });

  it('calculateAliveIndex should return correct value', () => {
    const metrics = { ...DEFAULT_METRICS, clarity: 0.8, trust: 0.7, drift: 0.1 };
    // Integrity 0.65. Trace 3.
    // 0.65 * (3 / 5) = 0.65 * 0.6 = 0.39
    const score = calculateAliveIndex(metrics, 3);
    expect(score).toBeCloseTo(0.39);
  });

  it('calculateAliveIndex should handle 0 trace', () => {
    const metrics = { ...DEFAULT_METRICS };
    const score = calculateAliveIndex(metrics, 0);
    expect(score).toBe(0);
  });
});
