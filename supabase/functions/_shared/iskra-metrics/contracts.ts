// =============================================================================
// ISKRA Metrics Compute Plane — Contracts (Atom 1)
// =============================================================================
// Pure, deterministic type/shape contracts for the metrics calculator layer.
// No database, no network, no side effects. This module defines WHAT is
// computed; `calculator.ts` defines HOW.
//
// Boundary (ADR-20260717-01):
//   - Supabase computes DETERMINISTIC derived values from caller-provided
//     numeric/textual features that already carry evidence.
//   - It does NOT infer semantic state (pain/trust/clarity) from raw dialogue.
//   - Missing input → `null` / `unavailable`, never a fabricated default.
// =============================================================================

/** Algorithm version stamped onto every result. Bump on ANY formula change. */
export const ALGORITHM_VERSION = 'iskra-metrics-compute-v1.1.0';

/** Entropy regime labels (parity with @iskra/math interpretEntropy). */
export type EntropyRegime = 'LOOP' | 'FLOW' | 'CHAOS';

/**
 * Raw observation handed to the compute plane. Every field is optional: the
 * caller supplies only what it actually has evidence for. Absent fields yield
 * `unavailable`, never a guessed number.
 */
export interface RawObservation {
  /** Free text whose token distribution feeds Shannon entropy. */
  readonly text?: string;
  /**
   * Ordered numeric signal (e.g. a per-turn metric history) for fractal
   * measures. Order is significant and must be caller-stable.
   */
  readonly signal?: readonly number[];
}

/** A single derived value plus the provenance needed to reproduce it. */
export interface DerivedValue<T> {
  readonly value: T | null;
  /** `true` when input was absent/insufficient; `value` is then `null`. */
  readonly unavailable: boolean;
  /** Human-readable reason when `unavailable` (e.g. "no text", "signal<6"). */
  readonly reason: string | null;
}

/** Deterministic derived metrics. Each carries its own availability flag. */
export interface ComputedMetrics {
  readonly shannon_entropy: DerivedValue<number>;
  readonly entropy_regime: DerivedValue<EntropyRegime>;
  readonly hfd: DerivedValue<number>;
  readonly dfa: DerivedValue<number>;
}

/** Full calculator result: metrics + reproducibility envelope. */
export interface CalculatorResult {
  readonly algorithm_version: string;
  /** sha256 of the canonicalized input; identical input → identical hash. */
  readonly input_hash: string;
  readonly metrics: ComputedMetrics;
  /** Names of metrics returned as unavailable, for quick auditing. */
  readonly unavailable: readonly string[];
}

/**
 * Future persistence shape for the existing `public.metrics_snapshots` table.
 * It distinguishes an observed metric from a prior/default value. Atom 1 does
 * not persist it; a later migration and RLS review are required before use.
 */
export interface MetricObservation<T = number> {
  readonly value: T | null;
  readonly source: string | null;
  readonly observed_at: string | null;
  readonly algorithm_version: string | null;
  readonly input_hash: string | null;
}
