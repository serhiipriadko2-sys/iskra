
import { describe, it, expect } from 'vitest';
import { shouldActivateSift, calculateSiftOmega } from '../types/sift';

describe('SIFT Protocol', () => {
  it('shouldActivateSift returns true for trigger keywords', () => {
    expect(shouldActivateSift('правда ли это', 1.0)).toBe(true);
  });

  it('shouldActivateSift returns true for low clarity', () => {
    expect(shouldActivateSift('обычный текст', 0.5)).toBe(true);
  });

  it('shouldActivateSift returns false for normal query and high clarity', () => {
    expect(shouldActivateSift('обычный текст', 0.9)).toBe(false);
  });
});
