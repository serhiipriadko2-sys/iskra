/**
 * Explainable Code Types (XCode)
 *
 * Canon intent: critical computations must be explainable and testable.
 * A function should return not only the computed `value`, but also a
 * machine-checkable trace (`how`) + optional contracts, assumptions and
 * evidence anchors.
 *
 * See: system/xcode_explainable_code.md
 */

export type EvidenceKind = 'canon' | 'project' | 'web' | 'data';

/**
 * Reference to an evidence anchor. The `ref` string is treated as an
 * opaque pointer (e.g. "system/sift_protocol.md §4").
 */
export type EvidenceRef = {
  kind: EvidenceKind;
  ref: string;
};

/**
 * Single step in an explainable computation.
 */
export interface ExplainStep {
  /** Human‑readable label for the step (unique inside one trace). */
  label: string;
  /** Optional mathematical representation of the step. */
  formula?: string;
  /** Named inputs to the step (serializable). */
  inputs?: Record<string, number | string | boolean | null>;
  /** Step output (serializable). */
  output?: unknown;
  /** Evidence anchors underpinning this step. */
  refs?: EvidenceRef[];
}

/**
 * Generic container for explainable computations.
 */
export interface Explainable<T> {
  value: T;
  /** MUST be non-empty for XCode-required modules (enforced by tests). */
  how: ExplainStep[];
  contracts_checked?: string[];
  assumptions?: string[];
  evidence?: EvidenceRef[];
}
