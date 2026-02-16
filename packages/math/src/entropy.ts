/**
 * Shannon Entropy Module
 * SPEC-003: Entropy Monitoring
 */

/**
 * Calculates Shannon Entropy (H) of a token stream
 * H(X) = -sum(P(x) * log2(P(x)))
 */
export function calculateShannonEntropy(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // Tokenize (simple whitespace split for now, can be upgraded to BPE later)
  const tokens = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 0);

  if (tokens.length === 0) return 0;

  const frequency: Record<string, number> = {};
  tokens.forEach(token => {
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

/**
 * Interprets entropy value based on Iskra thresholds
 */
export function interpretEntropy(h: number): 'LOOP' | 'FLOW' | 'CHAOS' {
  if (h < 2.0) return 'LOOP';
  if (h > 5.0) return 'CHAOS';
  return 'FLOW';
}
