import { describe, expect, it } from 'vitest';
import {
  calculateDFA as calculateCanonicalDFA,
  calculateHFD as calculateCanonicalHFD,
} from '../fractal';
import {
  calculateShannonEntropy as calculateCanonicalEntropy,
  interpretEntropy as interpretCanonicalEntropy,
} from '../entropy';
import {
  calculateDFA as calculateEdgeDFA,
  calculateHFD as calculateEdgeHFD,
} from '../../../../supabase/functions/_shared/iskra-metrics/fractal';
import {
  calculateShannonEntropy as calculateEdgeEntropy,
  interpretEntropy as interpretEdgeEntropy,
} from '../../../../supabase/functions/_shared/iskra-metrics/entropy';

const signal = (length: number) =>
  Array.from({ length }, (_, index) =>
    Math.sin(index / 3) + Math.cos(index / 11) + (index % 7) * 0.05,
  );

describe('Edge metrics Atom 1 parity with @iskra/math', () => {
  it.each([
    '',
    'one one two',
    'Signal, signal; entropy must keep the canonical tokenizer.',
  ])('keeps entropy and regime identical for %j', (text) => {
    const entropy = calculateCanonicalEntropy(text);

    expect(calculateEdgeEntropy(text)).toBe(entropy);
    expect(interpretEdgeEntropy(entropy)).toBe(interpretCanonicalEntropy(entropy));
  });

  it.each([16, 80])('keeps HFD and DFA identical for N=%i', (length) => {
    const values = signal(length);

    expect(calculateEdgeHFD(values)).toBeCloseTo(calculateCanonicalHFD(values), 14);
    expect(calculateEdgeDFA(values)).toBeCloseTo(calculateCanonicalDFA(values), 14);
  });

  it('keeps the final-segment HFD reference vector identical', () => {
    const linear = Array.from({ length: 20 }, (_, index) => index / 10);
    const expected = 0.9979367669339503;

    expect(calculateCanonicalHFD(linear)).toBeCloseTo(expected, 12);
    expect(calculateEdgeHFD(linear)).toBeCloseTo(expected, 12);
  });

  it('preserves canonical short-series fallbacks only for present signals', () => {
    const values = signal(5);

    expect(calculateEdgeHFD(values)).toBe(1.5);
    expect(calculateEdgeDFA(values)).toBe(0.5);
    expect(calculateEdgeHFD(values)).toBe(calculateCanonicalHFD(values));
    expect(calculateEdgeDFA(values)).toBe(calculateCanonicalDFA(values));
  });

  it.each([
    { name: 'empty', values: [] as number[] },
    { name: 'NaN', values: [1, Number.NaN] },
    { name: 'Infinity', values: [1, Number.POSITIVE_INFINITY] },
  ])('rejects the same invalid %s signal class', ({ values }) => {
    expect(() => calculateCanonicalHFD(values)).toThrow();
    expect(() => calculateEdgeHFD(values)).toThrow();
    expect(() => calculateCanonicalDFA(values)).toThrow();
    expect(() => calculateEdgeDFA(values)).toThrow();
  });
});
