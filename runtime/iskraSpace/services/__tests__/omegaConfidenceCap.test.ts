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
});
