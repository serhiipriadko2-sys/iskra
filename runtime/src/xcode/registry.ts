import type { Explainable, EvidenceRef } from '@iskra/core';

export type XCodeRegistryEntry = {
  /** Stable ID, used by CI/QA gates. */
  id: string;
  /** Canon anchor(s) that justify this as XCODE_REQUIRED. */
  canon: EvidenceRef[];
};

/**
 * XCODE_REQUIRED registry: the canonical list of "must be Explainable" computations.
 *
 * This is the enforcement surface for ADR-20260220.
 *
 * Notice: The active executing logic and QA test factories have been moved
 * into `@iskra/engine` and test helpers respectively to fulfill the
 * Scientific Turn architecture mandate.
 */
export const XCODE_REQUIRED: XCodeRegistryEntry[] = [
  {
    id: 'metrics.calculateIntegrityScoreX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'metrics/indices.md#§0.1' },
    ],
  },
  {
    id: 'metrics.calculateAliveIndexX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'metrics/indices.md#§0.1' },
    ],
  },
  {
    id: 'sift.calculateSiftOmegaX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/sift_protocol.md#§2' },
    ],
  },
  {
    id: 'sift.calculateSiftVerdictFlipX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/sift_protocol.md#§2' },
    ],
  },
  {
    id: 'voices.selectVoiceX',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'core/voices.md#§0' },
    ],
  },
  {
    id: 'guard.decideSloGuardExplainable',
    canon: [
      { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md#§2' },
      { kind: 'canon', ref: 'system/slo_guard.md#§0' },
    ],
  },
];
