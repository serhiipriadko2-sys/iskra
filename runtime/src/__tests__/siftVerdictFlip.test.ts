import { describe, it, expect } from 'vitest';
import {
  calculateSiftVerdictFlip,
  calculateSiftVerdictFlipX,
  type SiftVerdict,
  type SiftResult,
  type SourceAnalysis,
  type InferenceAnalysis,
  type EvidenceResult,
  type TraceResult,
} from '../types/sift.js';

function createNext(overrides: Partial<{
  reliability: number;
  logicalValidity: number;
  evidenceQuality: number;
  traceability: number;
  flags: string[];
  fallacies: string[];
  contradicting: number;
  supporting: number;
  distortions: number[];
}> = {}): Omit<SiftResult, 'delta'> {
  const cfg = {
    reliability: 0.9,
    logicalValidity: 0.9,
    evidenceQuality: 0.9,
    traceability: 0.9,
    flags: [],
    fallacies: [],
    contradicting: 0,
    supporting: 3,
    distortions: [],
    ...overrides,
  };

  return {
    source: {
      identified: [],
      reliability: cfg.reliability,
      flags: cfg.flags,
    } as SourceAnalysis,
    inference: {
      claims: [],
      assumptions: [],
      logicalValidity: cfg.logicalValidity,
      fallacies: cfg.fallacies,
    } as InferenceAnalysis,
    evidence: {
      supporting: Array(cfg.supporting).fill({ source: {}, content: '', relevance: 0.8, strength: 0.8 }),
      contradicting: Array(cfg.contradicting).fill({ source: {}, content: '', relevance: 0.5, strength: 0.5 }),
      neutral: [],
      quality: cfg.evidenceQuality,
    } as EvidenceResult,
    trace: {
      chain: [],
      distortions: cfg.distortions.map((severity) => ({ type: 'amplification' as const, description: '', severity })),
      traceability: cfg.traceability,
    } as TraceResult,
    verdict: {
      status: 'unknown',
      confidence: 50,
      summary: 'n/a',
      caveats: [],
    },
  };
}

describe('SIFT verdict flip (pilot)', () => {
  it('should flip from unverified to verified when Ω is high and contradictions are low', () => {
    const previous: SiftVerdict = { status: 'unverified', confidence: 40, summary: 'prev', caveats: [] };
    const next = createNext({ reliability: 0.95, logicalValidity: 0.95, evidenceQuality: 0.95, traceability: 0.95 });

    const legacy = calculateSiftVerdictFlip(previous, next);
    const x = calculateSiftVerdictFlipX(previous, next);

    expect(legacy.flipped).toBe(true);
    expect(legacy.to).toBe('verified');

    expect(x.value.flipped).toBe(true);
    expect(x.value.to).toBe('verified');
    expect(x.how.length).toBeGreaterThan(0);
  });

  it('should force false on contradiction override', () => {
    const previous: SiftVerdict = { status: 'verified', confidence: 80, summary: 'prev', caveats: [] };
    const next = createNext({ contradicting: 6, supporting: 0, reliability: 0.5, logicalValidity: 0.5, evidenceQuality: 0.4, traceability: 0.5 });

    const legacy = calculateSiftVerdictFlip(previous, next);
    expect(legacy.to).toBe('false');
    expect(legacy.reason).toBe('contradiction_override');
  });
});
