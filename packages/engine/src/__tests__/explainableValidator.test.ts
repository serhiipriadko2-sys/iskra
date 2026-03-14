import { describe, it, expect } from 'vitest';
import { MetricsEngine } from '../services/metricsService';
import { validateExplainable } from '../services/explainableValidator';
import { DEFAULT_METRICS } from '@iskra/core';

describe('validateExplainable', () => {
  it('accepts updateExplainable payload from MetricsEngine', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS);
    const result = engine.updateExplainable({ trust: 0.05 }, 'entropy signal');

    const validation = validateExplainable(result);
    expect(validation.ok).toBe(true);
    expect(validation.issues).toEqual([]);
  });

  it('rejects payload without formula/canon/how', () => {
    const invalid = {
      value: 1,
      how: [{ label: 'step' }],
      contracts_checked: [],
      evidence: []
    };

    const validation = validateExplainable(invalid, { requireAnyFormula: true, requireAnyRefs: true });
    expect(validation.ok).toBe(false);
    
    const codes = validation.issues.map(i => i.code);
    expect(codes).toContain('formula_missing');
    expect(codes).toContain('refs_missing');
  });
});
