import { describe, it, expect } from 'vitest';
import { selectVoice, detectFalseHarmony } from '../types/voices.js';
import { DEFAULT_METRICS } from '../types/metrics.js';
import type { IskraMetrics } from '../types/metrics.js';

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

  it('returns SIBYL for explicit foresight activation', () => {
    const metrics = {
      ...DEFAULT_METRICS,
      rhythm: 50,
      trust: 0.7,
      pain: 0.1,
      chaos: 0.1,
      drift: 0.1,
      clarity: 0.7,
      foresight: 0.8,
    };

    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('SIBYL');
  });

  it('returns SIBYL for repeated-pattern echo activation', () => {
    const metrics = {
      ...DEFAULT_METRICS,
      rhythm: 50,
      trust: 0.6,
      pain: 0.1,
      chaos: 0.1,
      drift: 0.1,
      echo: 0.8,
      clarity: 0.6,
      mirror_sync: 0.6,
    };

    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('SIBYL');
  });

  it('boosts SIBYL for mirror-sync pattern activation', () => {
    const metrics = {
      ...DEFAULT_METRICS,
      rhythm: 50,
      trust: 0.6,
      pain: 0.1,
      chaos: 0.1,
      drift: 0.1,
      echo: 0.7,
      clarity: 0.5,
      mirror_sync: 0.9,
    };

    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('SIBYL');
    expect(activation.scores.SIBYL).toBeGreaterThan(1.5);
  });

  it('treats DEFAULT_METRICS as neutral baseline, not proof of life', () => {
    const activation = selectVoice(DEFAULT_METRICS);

    expect(DEFAULT_METRICS.foresight).toBe(0);
    expect(activation.primary).toBe('PINO');
    expect(activation.scores.SIBYL).toBe(0);
  });
});

describe('MAKI-KAIN collision resolution (ADR-20260201-07)', () => {
  it('EVAL-MK-01: returns MAKI primary with KAIN secondary when trust=0.9 pain=0.4', () => {
    const metrics: IskraMetrics = {
      rhythm: 50,
      trust: 0.9,
      pain: 0.4,
      chaos: 0.2,
      drift: 0.1,
      echo: 0.1,
      clarity: 0.7,
      silence_mass: 0.2,
      mirror_sync: 0.5,
      interrupt: 0.1,
      ctxSwitch: 0.1,
      foresight: 0.3,
    };
    const result = selectVoice(metrics);
    expect(result.primary).toBe('MAKI');
    expect(result.secondary).toBe('KAIN');
  });
});

describe('False Harmony detection (ADR-20260201-07)', () => {
  it('EVAL-FH-01: detectFalseHarmony returns true when clarity=0.9 pain=0.05 drift=0.05', () => {
    const metrics: IskraMetrics = {
      rhythm: 60,
      trust: 0.7,
      pain: 0.05,
      chaos: 0.1,
      drift: 0.05,
      echo: 0.1,
      clarity: 0.9,
      silence_mass: 0.1,
      mirror_sync: 0.6,
      interrupt: 0.1,
      ctxSwitch: 0.1,
      foresight: 0.2,
    };
    expect(detectFalseHarmony(metrics)).toBe(true);
  });

  it('detectFalseHarmony returns false when pain is moderate', () => {
    const metrics: IskraMetrics = {
      rhythm: 60,
      trust: 0.7,
      pain: 0.3,
      chaos: 0.1,
      drift: 0.05,
      echo: 0.1,
      clarity: 0.9,
      silence_mass: 0.1,
      mirror_sync: 0.6,
      interrupt: 0.1,
      ctxSwitch: 0.1,
      foresight: 0.2,
    };
    expect(detectFalseHarmony(metrics)).toBe(false);
  });
});
