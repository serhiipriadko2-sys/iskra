import { describe, it, expect } from 'vitest';
import {
  DEFAULT_METRICS,
  calculateIntegrityScore,
  calculateAliveIndex,
  calculateIntegrityScoreX,
  calculateAliveIndexX,
} from '../types/metrics.js';
import {
  calculateSiftOmega,
  calculateSiftOmegaX,
  type SiftResult,
  type SourceAnalysis,
  type InferenceAnalysis,
  type EvidenceResult,
  type TraceResult,
} from '../types/sift.js';
import { selectVoice, selectVoiceX } from '../types/voices.js';
import { decideSloGuard, decideSloGuardExplainable } from '../types/guard.js';

describe('xcode gate', () => {
  it('metrics: calculateIntegrityScoreX has how[] and stable value', () => {
    const metrics = { ...DEFAULT_METRICS, clarity: 0.8, trust: 0.6, drift: 0.1 };
    const res = calculateIntegrityScoreX(metrics);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toBeCloseTo(calculateIntegrityScore(metrics));
  });

  it('metrics: calculateAliveIndexX has how[] and stable value', () => {
    const metrics = { ...DEFAULT_METRICS, clarity: 0.9, trust: 0.9, drift: 0.0 };
    const res = calculateAliveIndexX(metrics, 5);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toBeCloseTo(calculateAliveIndex(metrics, 5));
  });

  it('sift: calculateSiftOmegaX has how[] and stable value', () => {
    const mock: Omit<SiftResult, 'delta'> = {
      source: {
        identified: [],
        reliability: 0.8,
        flags: [],
      } as SourceAnalysis,
      inference: {
        claims: [],
        assumptions: [],
        logicalValidity: 0.7,
        fallacies: [],
      } as InferenceAnalysis,
      evidence: {
        supporting: Array(3).fill({ source: {}, content: '', relevance: 0.8, strength: 0.8 }),
        contradicting: [],
        neutral: [],
        quality: 0.9,
      } as EvidenceResult,
      trace: {
        chain: [],
        distortions: [],
        traceability: 0.8,
      } as TraceResult,
      verdict: {
        status: 'verified',
        confidence: 80,
        summary: 'Test',
        caveats: [],
      },
    };

    const res = calculateSiftOmegaX(mock);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toBe(calculateSiftOmega(mock));
  });

  it('voices: selectVoiceX has how[] and stable value', () => {
    const metrics = { ...DEFAULT_METRICS, pain: 0.35, trust: 0.65, chaos: 0.2, drift: 0.1 };
    const res = selectVoiceX(metrics);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(selectVoice(metrics));
  });

  it('guard: EWS critical → FORCE_CRISIS (how[] + stable value)', () => {
    const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 };
    const input = {
      metrics,
      integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
      alertLevel: 'critical' as const,
    };
    const res = decideSloGuardExplainable(input);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(decideSloGuard(input));
    expect(res.value.decision).toBe('FORCE_CRISIS');
  });

  it('guard: anti_dryness_hits≥2 → FORCE_SHADOW (how[] + stable value)', () => {
    const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 };
    const input = {
      metrics,
      integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
      anti_dryness_hits: 2,
      alertLevel: 'normal' as const,
    };
    const res = decideSloGuardExplainable(input);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(decideSloGuard(input));
    expect(res.value.decision).toBe('FORCE_SHADOW');
  });

  it('guard: leader_flaps>1 → PROCEED + TTL↑ (how[] + stable value)', () => {
    const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 };
    const input = {
      metrics,
      integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
      leader_flaps: 2,
      alertLevel: 'normal' as const,
    };
    const res = decideSloGuardExplainable(input);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(decideSloGuard(input));
    expect(res.value.decision).toBe('PROCEED');
    expect(res.value.ttl_adjustment).toBe(1);
  });

  it('guard: chaos_overheat derived → FORCE_SHADOW (strict threshold; how[] + stable value)', () => {
    // baseline_chaos is loaded from ledger/baselines.json (default 0.6),
    // so threshold = max(0.70, 0.6 + 0.20) = 0.80.
    const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.81 };
    const input = {
      metrics,
      integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
      alertLevel: 'normal' as const,
    };
    const res = decideSloGuardExplainable(input);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(decideSloGuard(input));
    expect(res.value.decision).toBe('FORCE_SHADOW');
    expect(res.assumptions ?? []).not.toContain('baseline_chaos missing → using default 0.6');
  });

  it('guard: alive_delta is derived when alive_index is present (how[] + stable value)', () => {
    // baseline_alive_index is loaded from ledger/baselines.json (default 0.6)
    const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2, alive_index: 0.5 } as any;
    const input = {
      metrics,
      integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
      alertLevel: 'normal' as const,
    };
    const res = decideSloGuardExplainable(input);
    expect(res.how.length).toBeGreaterThan(0);
    expect(res.value).toEqual(decideSloGuard(input));

    const step = res.how.find((s) => s.label === 'alive_delta_derived');
    expect(step).toBeTruthy();
    expect((step as any).inputs.baseline_alive_index).toBe(0.6);
    expect((step as any).inputs.alive_index).toBe(0.5);
    expect((step as any).output).toBeCloseTo(-0.1);
  });
});
