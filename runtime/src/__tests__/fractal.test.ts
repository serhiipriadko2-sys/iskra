
import { describe, it, expect } from 'vitest';
import { calculateHFD, calculateDFA, calculateCSI } from '../types/fractal';
import { DEFAULT_METRICS } from '../types/metrics';

describe('Fractal Monitoring', () => {
  it('calculateHFD should return ~1.0 for a straight line', () => {
    const line = Array.from({ length: 50 }, (_, i) => i);
    const hfd = calculateHFD(line);
    // Linear series usually has low fractal dimension, close to 1.
    expect(hfd).toBeLessThan(1.2);
  });

  it('calculateHFD should return higher value for random noise', () => {
    const noise = Array.from({ length: 50 }, () => Math.random());
    const hfd = calculateHFD(noise);
    // Random noise usually has high fractal dimension.
    expect(hfd).toBeGreaterThan(1.2);
  });

  it('calculateDFA should handle small input gracefully', () => {
    const small = [1, 2, 3];
    expect(calculateDFA(small)).toBe(0.5);
  });

  it('calculateCSI should return valid range', () => {
    const csi = calculateCSI(DEFAULT_METRICS);
    expect(csi).toBeGreaterThanOrEqual(0);
    expect(csi).toBeLessThanOrEqual(1);
  });
});
