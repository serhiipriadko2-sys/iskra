import { describe, expect, it } from 'vitest';
import {
  enforceDeltaProtocol,
  generateDeltaBlock,
  validateDeltaSignature,
} from '../deltaProtocol';

describe('Omega confidence ceiling', () => {
  it('clamps generated confidence above 0.95 to 95%', () => {
    const block = generateDeltaBlock({
      delta: 'Confidence cap enforced',
      confidence: 0.99,
      nextStep: 'Keep the canonical ceiling',
    });

    expect(block).toContain('Ω: 95%');
    expect(block).not.toContain('Ω: 99%');
    expect(validateDeltaSignature(block).isValid).toBe(true);
  });

  it('clamps fallback confidence above 0.95 to 95%', () => {
    const text = enforceDeltaProtocol('Response without a signature.', {
      topic: 'Fallback confidence cap',
      confidence: 1,
    });

    expect(text).toContain('Ω: 95%');
    expect(text).not.toContain('Ω: 100%');
  });

  it('clamps negative confidence to 0%', () => {
    const block = generateDeltaBlock({
      delta: 'Lower confidence bound enforced',
      confidence: -0.5,
      nextStep: 'Keep confidence non-negative',
    });

    expect(block).toContain('Ω: 0%');
    expect(validateDeltaSignature(block).isValid).toBe(true);
  });

  it('preserves a genuine fallback confidence of 0 instead of the default (nullish coalescing, not ||)', () => {
    // Regression: `fallbackContext?.confidence || DEFAULT_OMEGA_CONFIDENCE` treated
    // a real 0 confidence as falsy and silently replaced it with the default.
    const text = enforceDeltaProtocol('Response without a signature.', {
      topic: 'Zero confidence must survive',
      confidence: 0,
    });

    expect(text).toContain('Ω: 0%');
  });

  it('still falls back to the default confidence when none is provided', () => {
    const text = enforceDeltaProtocol('Response without a signature.', {
      topic: 'No confidence provided',
    });

    expect(text).not.toContain('Ω: 0%');
  });
});
