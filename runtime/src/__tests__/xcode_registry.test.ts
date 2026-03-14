import { describe, it, expect } from 'vitest';
import { XCODE_PROBES_REQUIRED } from './helpers/xcode-helpers.js';
import { validateExplainable } from '../xcode/validateExplainable.js';

describe('XCODE_REQUIRED registry', () => {
  it('has unique stable ids', () => {
    const ids = XCODE_PROBES_REQUIRED.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe.each(XCODE_PROBES_REQUIRED)('Registry Entry: $id', (entry) => {
    it('generates a valid XCode explainable result', () => {
      const { explainable } = entry.probe();

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
    });

    it('remains stable vs the legacy non-explainable function', () => {
      const { explainable, expected, compare } = entry.probe();

      if (compare.type === 'deepEqual') {
        expect(explainable.value).toEqual(expected);
      } else {
        const actual = explainable.value as number;
        const exp = expected as number;
        expect(
          Math.abs(actual - exp) <= compare.tolerance,
          `|actual-expected| must be <= ${compare.tolerance} (actual=${actual}, expected=${exp})`
        ).toBe(true);
      }
    });
  });
});
