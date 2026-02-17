import { describe, it, expect } from 'vitest';
import { calculateShannonEntropy, interpretEntropy } from '../../entropy.js';

describe('Entropy Math', () => {
  it('should calculate zero entropy for identical tokens', () => {
    const text = 'hello hello hello';
    const h = calculateShannonEntropy(text);
    expect(h).toBe(0); // No surprise
  });

  it('should calculate max entropy for unique tokens', () => {
    const text = 'one two three four';
    const h = calculateShannonEntropy(text);
    // 4 unique tokens, p=0.25 each. -4 * (0.25 * log2(0.25)) = -4 * (0.25 * -2) = 2
    expect(h).toBeCloseTo(2.0, 1);
  });

  it('should detect LOOP state', () => {
    const loopText = 'echo echo echo';
    const state = interpretEntropy(calculateShannonEntropy(loopText));
    expect(state).toBe('LOOP');
  });
});
