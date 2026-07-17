// =============================================================================
// Metrics Calculator — orchestrator (Atom 1)
// =============================================================================
// Turns a RawObservation into deterministic ComputedMetrics plus a
// reproducibility envelope (algorithm_version + input_hash). Pure and async
// only because of Web Crypto hashing; given the same input it always returns
// the same hash and the same numbers.
//
// Discipline (ADR-20260717-01 / file 09 "no inputs or method → no number"):
//   - Absent/insufficient input yields `unavailable: true` + `value: null`.
//   - It NEVER substitutes a placeholder like 0.5 or 1.5 for missing data.
//     (The 1.5/0.5 fallbacks inside HFD/DFA apply only to a PRESENT-but-short
//      signal, matching canon; a MISSING signal is reported unavailable here.)
// =============================================================================

import {
  ALGORITHM_VERSION,
  type CalculatorResult,
  type ComputedMetrics,
  type DerivedValue,
  type EntropyRegime,
  type RawObservation,
} from './contracts.ts';
import { canonicalJson } from './canonicalJson.ts';
import { sha256Hex } from './hash.ts';
import { calculateShannonEntropy, interpretEntropy } from './entropy.ts';
import { calculateHFD, calculateDFA } from './fractal.ts';

/** Minimum signal length below which fractal measures are not meaningful. */
const MIN_FRACTAL_SIGNAL = 6;

function available<T>(value: T): DerivedValue<T> {
  return { value, unavailable: false, reason: null };
}

function unavailable<T>(reason: string): DerivedValue<T> {
  return { value: null, unavailable: true, reason };
}

/** Compute deterministic derived metrics from a raw observation. */
export async function computeMetrics(
  raw: RawObservation,
): Promise<CalculatorResult> {
  const input_hash = await sha256Hex(canonicalJson(raw));

  // --- Entropy -------------------------------------------------------------
  let shannon_entropy: DerivedValue<number>;
  let entropy_regime: DerivedValue<EntropyRegime>;
  if (typeof raw.text === 'string' && raw.text.trim().length > 0) {
    const h = calculateShannonEntropy(raw.text);
    shannon_entropy = available(h);
    entropy_regime = available(interpretEntropy(h));
  } else {
    shannon_entropy = unavailable('no text provided');
    entropy_regime = unavailable('no text provided');
  }

  // --- Fractal -------------------------------------------------------------
  let hfd: DerivedValue<number>;
  let dfa: DerivedValue<number>;
  const signal = raw.signal;
  if (!signal || signal.length === 0) {
    hfd = unavailable('no signal provided');
    dfa = unavailable('no signal provided');
  } else if (signal.some((x) => !Number.isFinite(x))) {
    hfd = unavailable('signal contains non-finite values');
    dfa = unavailable('signal contains non-finite values');
  } else if (signal.length < MIN_FRACTAL_SIGNAL) {
    hfd = unavailable(`signal too short (<${MIN_FRACTAL_SIGNAL})`);
    dfa = unavailable(`signal too short (<${MIN_FRACTAL_SIGNAL})`);
  } else {
    hfd = available(calculateHFD(signal));
    dfa = available(calculateDFA(signal));
  }

  const metrics: ComputedMetrics = {
    shannon_entropy,
    entropy_regime,
    hfd,
    dfa,
  };

  const unavailableNames = Object.entries(metrics)
    .filter(([, v]) => v.unavailable)
    .map(([k]) => k);

  return {
    algorithm_version: ALGORITHM_VERSION,
    input_hash,
    metrics,
    unavailable: unavailableNames,
  };
}
