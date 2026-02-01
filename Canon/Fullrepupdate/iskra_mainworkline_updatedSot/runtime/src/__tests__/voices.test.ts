import { describe, it, expect } from 'vitest';
import { selectVoice } from '../types/voices.js';
import { DEFAULT_METRICS } from '../types/metrics.js';

// Smoke tests for voice selection logic. These tests ensure that the core
// trigger conditions from the canon are enforced. They are not exhaustive
// but act as early warnings if the activation rules drift.

describe('selectVoice', () => {
  it('returns KAIN when pain >= 0.3', () => {
    const metrics = { ...DEFAULT_METRICS, pain: 0.4 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('KAIN');
  });

  it('returns HUYNDUN for high chaos', () => {
    const metrics = { ...DEFAULT_METRICS, chaos: 0.5 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('HUYNDUN');
  });

  it('returns ISKRIV when drift is high and chaos below threshold', () => {
    const metrics = { ...DEFAULT_METRICS, drift: 0.3, chaos: 0.2 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('ISKRIV');
  });

  it('returns MAKI when pain >= 0.3 and trust > 0.8', () => {
    // High trust should override KAIN and select MAKI according to ADR-20260106-05
    const metrics = { ...DEFAULT_METRICS, pain: 0.4, trust: 0.9 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('MAKI');
  });
});