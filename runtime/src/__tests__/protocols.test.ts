
import { describe, it, expect } from 'vitest';
import { validateDeltaSignature, DeltaSignature } from '../types/protocols';

describe('Protocols', () => {
  it('validateDeltaSignature should pass for valid signature', () => {
    const valid: DeltaSignature = {
      delta: 'Some meaningful change',
      depth: 'S-I-F-T trace complete',
      omega: 90,
      lambda: 'Review tomorrow'
    };
    const result = validateDeltaSignature(valid);
    expect(result.valid).toBe(true);
  });

  it('validateDeltaSignature should fail if delta is too short', () => {
    const invalid: DeltaSignature = {
      delta: 'No',
      depth: 'S-I-F-T trace complete',
      omega: 90,
      lambda: 'Review tomorrow'
    };
    const result = validateDeltaSignature(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Delta (∆) must be at least 5 characters');
  });

  it('validateDeltaSignature should fail if omega > 95', () => {
     const invalid: DeltaSignature = {
      delta: 'Some meaningful change',
      depth: 'S-I-F-T trace complete',
      omega: 99,
      lambda: 'Review tomorrow'
    };
    const result = validateDeltaSignature(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Omega (Ω) should not exceed 95% for epistemic humility');
  });
});
