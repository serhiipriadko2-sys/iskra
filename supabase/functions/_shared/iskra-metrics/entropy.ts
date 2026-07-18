// =============================================================================
// Shannon Entropy — ported 1:1 from @iskra/math (packages/math/src/entropy.ts)
// =============================================================================
// The Edge/DB compute plane MUST produce identical numbers to the canonical
// @iskra/math source of truth. This is a faithful port, not a reimplementation:
// any divergence would create exactly the metric drift the project audits.
// Parity is guarded by a committed Vitest contract against @iskra/math.
//
// Tokenization is fixed and part of the contract (SPEC-003 / file 09 rule
// "no inputs or method → no number"): lowercase, strip non-word/space, split on
// whitespace. Changing tokenization is an algorithm-version bump.
// =============================================================================

import type { EntropyRegime } from './contracts.ts';

/**
 * Shannon Entropy H(X) = -sum(P(x) * log2(P(x))) over whitespace tokens.
 * Returns 0 for empty/blank input (matches canon).
 */
export function calculateShannonEntropy(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return 0;

  const frequency: Record<string, number> = {};
  tokens.forEach((token) => {
    frequency[token] = (frequency[token] || 0) + 1;
  });

  const totalTokens = tokens.length;
  let entropy = 0;

  for (const token in frequency) {
    const p = frequency[token]! / totalTokens;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/** Interprets entropy value using canonical Iskra thresholds (LOOP/FLOW/CHAOS). */
export function interpretEntropy(h: number): EntropyRegime {
  if (h < 2.0) return 'LOOP';
  if (h > 5.0) return 'CHAOS';
  return 'FLOW';
}
