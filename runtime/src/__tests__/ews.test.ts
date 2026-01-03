
import { describe, it, expect } from 'vitest';
import { determineAlertLevel, DEFAULT_EWS_CONFIG, AlertLevel } from '../types/ews';
import { DEFAULT_METRICS } from '../types/metrics';
import { FractalIndicators } from '../types/fractal';

const mockFractal: FractalIndicators = {
  D_chaos: 1.2,
  D_clarity: 1.2,
  D_drift: 1.2,
  H_trust: 0.7,
  complexityIndex: 0.5,
  edgeDistance: 0.2
};

describe('EWS', () => {
  it('determineAlertLevel should return normal for default metrics', () => {
    const level = determineAlertLevel(DEFAULT_METRICS, mockFractal, DEFAULT_EWS_CONFIG);
    expect(level).toBe('normal');
  });

  it('determineAlertLevel should return critical when drift is high', () => {
    const criticalMetrics = { ...DEFAULT_METRICS, drift: 0.5 }; // > 0.4
    const level = determineAlertLevel(criticalMetrics, mockFractal, DEFAULT_EWS_CONFIG);
    expect(level).toBe('critical');
  });

  it('determineAlertLevel should return warning when pain is high', () => {
    const warningMetrics = { ...DEFAULT_METRICS, pain: 0.6 }; // > 0.5
    const level = determineAlertLevel(warningMetrics, mockFractal, DEFAULT_EWS_CONFIG);
    // Warning condition: pain > 0.5
    // Note: Critical check comes first, but pain doesn't trigger critical in default config.
    expect(level).toBe('warning');
  });
});
