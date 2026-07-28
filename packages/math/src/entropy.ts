/**
 * Shannon Entropy Module
 * SPEC-003: Entropy Monitoring
 */

export type EntropyMetricResult =
  | {
      status: 'computed';
      value: number;
      normalized_token_count: number;
      algorithm_version: 'shannon-unicode-v1';
    }
  | {
      status: 'unavailable';
      reason: 'insufficient_normalized_tokens';
      normalized_token_count: number;
      required_token_count: number;
      algorithm_version: 'shannon-unicode-v1';
    };

/** Unicode-aware tokenization shared by all entropy consumers. */
export function normalizeEntropyTokens(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  return text
    .normalize('NFKC')
    .toLocaleLowerCase('und')
    .match(/[\p{L}\p{N}_]+(?:['’\-][\p{L}\p{N}_]+)*/gu) ?? [];
}
export function calculateShannonEntropy(text: string): number {
  const tokens = normalizeEntropyTokens(text);
  if (tokens.length === 0) return 0;

  const frequency = new Map<string, number>();
  for (const token of tokens) {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  }

  let entropy = 0;
  for (const count of frequency.values()) {
    const probability = count / tokens.length;
    entropy -= probability * Math.log2(probability);
  }
  return entropy;
}

export function calculateEntropyMetric(
  text: string,
  options: { minTokens?: number } = {}
): EntropyMetricResult {
  const minTokens = options.minTokens ?? 20;
  const normalized_token_count = normalizeEntropyTokens(text).length;
  if (normalized_token_count < minTokens) {
    return {
      status: 'unavailable',
      reason: 'insufficient_normalized_tokens',
      normalized_token_count,
      required_token_count: minTokens,
      algorithm_version: 'shannon-unicode-v1',
    };
  }
  return {
    status: 'computed',
    value: calculateShannonEntropy(text),
    normalized_token_count,
    algorithm_version: 'shannon-unicode-v1',
  };
}
/** Calibration labels only; not eligible for Guard authority. */
export function interpretEntropy(h: number): 'LOOP' | 'FLOW' | 'CHAOS' {
  if (h < 2.0) return 'LOOP';
  if (h > 5.0) return 'CHAOS';
  return 'FLOW';
}
