import { describe, it, expect } from 'vitest';
import { XCODE_REQUIRED } from '../xcode/registry.js';
import { validateExplainable } from '../xcode/validateExplainable.js';

describe('XCODE_REQUIRED registry', () => {
  it('has unique stable ids', () => {
    const ids = XCODE_REQUIRED.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all registry probes are XCode-valid and stable vs legacy', () => {
    for (const entry of XCODE_REQUIRED) {
      const { explainable, expected, compare } = entry.probe();

      const v = validateExplainable(explainable, {
        requireHow: true,
        requireAnyRefs: true,
        requireAnyFormula: true,
        requireKinds: ['canon'],
      });

      expect(
        v.ok,
        `XCode validation failed for ${entry.id}: ${JSON.stringify(v.issues)}`
      ).toBe(true);

      if (compare.type === 'deepEqual') {
        expect(explainable.value, entry.id).toEqual(expected);
      } else {
        const actual = explainable.value as number;
        const exp = expected as number;
        expect(
          Math.abs(actual - exp) <= compare.tolerance,
          `${entry.id}: |actual-expected| must be <= ${compare.tolerance} (actual=${actual}, expected=${exp})`
        ).toBe(true);
      }
    }
  });
});
