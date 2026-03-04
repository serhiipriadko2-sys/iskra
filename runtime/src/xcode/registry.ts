import type { Explainable, EvidenceRef } from '../types/explainable.js';
import {
  DEFAULT_METRICS,
  calculateAliveIndex,
  calculateAliveIndexX,
  calculateIntegrityScore,
  calculateIntegrityScoreX,
} from '../types/metrics.js';
import { decideSloGuard, decideSloGuardExplainable } from '../types/guard.js';
import { selectVoice, selectVoiceX } from '../types/voices.js';
import {
  calculateSiftOmega,
  calculateSiftOmegaX,
  calculateSiftVerdictFlip,
  calculateSiftVerdictFlipX,
  type SiftResult,
  type SiftVerdict,
  type SourceAnalysis,
  type InferenceAnalysis,
  type EvidenceResult,
  type TraceResult,
} from '../types/sift.js';

export type XCodeCompare =
  | { type: 'deepEqual' }
  | { type: 'closeTo'; tolerance: number };

export type XCodeRegistryEntry = {
  /** Stable ID, used by CI/QA gates. */
  id: string;
  /** Canon anchor(s) that justify this as XCODE_REQUIRED. */
  canon: EvidenceRef[];
  /** Run-time probe that returns the explainable value and the legacy expected value. */
  probe: () => {
    explainable: Explainable<unknown>;
    expected: unknown;
    compare: XCodeCompare;
  };
};

function mockSiftResult(): Omit<SiftResult, 'delta'> {
  return {
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
}

/**
 * XCODE_REQUIRED registry: the canonical list of "must be Explainable" computations.
 *
 * This is the enforcement surface for ADR-20260220.
 */
export const XCODE_REQUIRED: XCodeRegistryEntry[] = [
  {
    id: 'metrics.calculateIntegrityScoreX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'metrics/indices.md#§0.1' },
    ],
    probe: () => {
      const metrics = { ...DEFAULT_METRICS, clarity: 0.8, trust: 0.6, drift: 0.1 };
      return {
        explainable: calculateIntegrityScoreX(metrics) as unknown as Explainable<unknown>,
        expected: calculateIntegrityScore(metrics),
        compare: { type: 'closeTo', tolerance: 1e-9 },
      };
    },
  },
  {
    id: 'metrics.calculateAliveIndexX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'metrics/indices.md#§0.1' },
    ],
    probe: () => {
      const metrics = { ...DEFAULT_METRICS, clarity: 0.9, trust: 0.9, drift: 0.0 };
      return {
        explainable: calculateAliveIndexX(metrics, 5) as unknown as Explainable<unknown>,
        expected: calculateAliveIndex(metrics, 5),
        compare: { type: 'closeTo', tolerance: 1e-9 },
      };
    },
  },
  {
    id: 'sift.calculateSiftOmegaX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/sift_protocol.md#§2' },
    ],
    probe: () => {
      const mock = mockSiftResult();
      return {
        explainable: calculateSiftOmegaX(mock) as unknown as Explainable<unknown>,
        expected: calculateSiftOmega(mock),
        compare: { type: 'deepEqual' },
      };
    },
  },
  {
    id: 'sift.calculateSiftVerdictFlipX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/sift_protocol.md#§2' },
    ],
    probe: () => {
      const next = mockSiftResult();
      // Force a high-confidence, low-contradiction state to trigger 'verified'.
      next.source.reliability = 0.95;
      next.source.flags = [];
      next.inference.logicalValidity = 0.95;
      next.inference.fallacies = [];
      next.evidence.quality = 0.95;
      next.evidence.contradicting = [];
      next.trace.traceability = 0.95;
      next.trace.distortions = [];

      const previous: SiftVerdict = {
        status: 'unverified',
        confidence: 40,
        summary: 'Prev',
        caveats: [],
      };

      return {
        explainable: calculateSiftVerdictFlipX(previous, next) as unknown as Explainable<unknown>,
        expected: calculateSiftVerdictFlip(previous, next),
        compare: { type: 'deepEqual' },
      };
    },
  },
  {
    id: 'voices.selectVoiceX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'core/voices.md#§0' },
    ],
    probe: () => {
      const metrics = { ...DEFAULT_METRICS, pain: 0.35, trust: 0.65, chaos: 0.2, drift: 0.1 };
      return {
        explainable: selectVoiceX(metrics) as unknown as Explainable<unknown>,
        expected: selectVoice(metrics),
        compare: { type: 'deepEqual' },
      };
    },
  },
  {
    id: 'guard.decideSloGuardExplainable',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/slo_guard.md#§0' },
    ],
    probe: () => {
      const metrics = { ...DEFAULT_METRICS, drift: 0.05, chaos: 0.2 };
      const input = {
        metrics,
        integrity: { ok: true, warnings: [], missing: [], evidenceCount: 1 },
        alertLevel: 'normal' as const,
      };
      return {
        explainable: decideSloGuardExplainable(input) as unknown as Explainable<unknown>,
        expected: decideSloGuard(input),
        compare: { type: 'deepEqual' },
      };
    },
  },
];
