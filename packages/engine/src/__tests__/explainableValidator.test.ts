import { describe, it, expect } from 'vitest';
import { MetricsEngine } from '../services/metricsService';
import { validateExplainable } from '../services/explainableValidator';
import { DEFAULT_METRICS } from '@iskra/core';

describe('validateExplainable', () => {
  it('accepts updateExplainable payload from MetricsEngine', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS);
    const result = engine.updateExplainable({ trust: 0.05 }, 'entropy signal');

    const validation = validateExplainable(result);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it('rejects payload without formula/canon/how', () => {
    const invalid = {
      value: 1,
      how: [{ label: 'step' }],
      contracts_checked: [],
      evidence: []
    };

    const validation = validateExplainable(invalid);
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('at least one step must include formula');
    expect(validation.errors).toContain('evidence must include at least one canon reference');
  });
});
