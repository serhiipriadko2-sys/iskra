import { describe, it, expect } from 'vitest';
import { DEFAULT_METRICS, VOICES } from '../index';

describe('@iskra/core SoT exports', () => {
  it('should expose 9 voices in manifest', () => {
    expect(VOICES).toHaveLength(9);
    expect(VOICES.some((voice) => voice.id === 'MAKI')).toBe(true);
  });

  it('should provide valid default metrics bounds', () => {
    expect(DEFAULT_METRICS.trust).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_METRICS.trust).toBeLessThanOrEqual(1);
    expect(DEFAULT_METRICS.rhythm).toBeGreaterThan(0);
  });
});
