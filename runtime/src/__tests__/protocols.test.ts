import { describe, it, expect } from 'vitest';
import {
  PLAYBOOKS,
  validateDeltaSignature,
  formatDeltaSignature,
  type DeltaSignature,
  type PlaybookId,
} from '../types/protocols.js';

describe('protocols', () => {
  const ALL_PLAYBOOKS: PlaybookId[] = ['routine', 'sift', 'shadow', 'council', 'crisis'];

  describe('PLAYBOOKS', () => {
    it('should have all 5 playbooks defined', () => {
      for (const playbook of ALL_PLAYBOOKS) {
        expect(PLAYBOOKS).toHaveProperty(playbook);
        expect(PLAYBOOKS[playbook].id).toBe(playbook);
      }
    });

    it('should have correct temperature ranges', () => {
      expect(PLAYBOOKS.routine.temperature).toBe(0.7);
      expect(PLAYBOOKS.sift.temperature).toBe(0.3);
      expect(PLAYBOOKS.shadow.temperature).toBe(0.8);
      expect(PLAYBOOKS.council.temperature).toBe(0.6);
      expect(PLAYBOOKS.crisis.temperature).toBe(0.5);
    });

    it('should have voices array for each playbook', () => {
      for (const playbook of ALL_PLAYBOOKS) {
        expect(Array.isArray(PLAYBOOKS[playbook].voices)).toBe(true);
        expect(PLAYBOOKS[playbook].voices.length).toBeGreaterThan(0);
      }
    });

    it('council should include all 9 voices', () => {
      expect(PLAYBOOKS.council.voices).toHaveLength(9);
      expect(PLAYBOOKS.council.voices).toContain('iskra');
      expect(PLAYBOOKS.council.voices).toContain('kain');
      expect(PLAYBOOKS.council.voices).toContain('sibyl');
    });

    it('sift should have lower temperature for precision', () => {
      expect(PLAYBOOKS.sift.temperature).toBeLessThan(PLAYBOOKS.routine.temperature);
    });
  });

  describe('validateDeltaSignature', () => {
    it('should validate a correct signature', () => {
      const signature: DeltaSignature = {
        delta: 'This is a valid delta statement',
        depth: 'Source: verified data, Inference: logical',
        omega: 85,
        lambda: 'Next step: review in 24 hours',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty delta', () => {
      const signature: DeltaSignature = {
        delta: '',
        depth: 'Valid depth',
        omega: 80,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Delta'))).toBe(true);
    });

    it('should reject short delta (< 5 chars)', () => {
      const signature: DeltaSignature = {
        delta: 'Hi',
        depth: 'Valid depth',
        omega: 80,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Delta'))).toBe(true);
    });

    it('should reject omega > 100', () => {
      const signature: DeltaSignature = {
        delta: 'Valid delta statement',
        depth: 'Valid depth',
        omega: 150,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Omega'))).toBe(true);
    });

    it('should reject omega < 0', () => {
      const signature: DeltaSignature = {
        delta: 'Valid delta statement',
        depth: 'Valid depth',
        omega: -10,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
    });

    it('should warn about omega > 95 for epistemic humility', () => {
      const signature: DeltaSignature = {
        delta: 'Valid delta statement',
        depth: 'Valid depth',
        omega: 99,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('95'))).toBe(true);
    });

    it('should accept omega = 95', () => {
      const signature: DeltaSignature = {
        delta: 'Valid delta statement',
        depth: 'Valid depth',
        omega: 95,
        lambda: 'Valid lambda',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const signature: DeltaSignature = {
        delta: '',
        depth: '',
        omega: 150,
        lambda: '',
      };

      const result = validateDeltaSignature(signature);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('formatDeltaSignature', () => {
    it('should format signature correctly', () => {
      const signature: DeltaSignature = {
        delta: 'Core insight here',
        depth: 'SIFT trace here',
        omega: 85,
        lambda: 'Next step here',
      };

      const formatted = formatDeltaSignature(signature);

      expect(formatted).toContain('∆DΩΛ');
      expect(formatted).toContain('∆: Core insight here');
      expect(formatted).toContain('D: SIFT trace here');
      expect(formatted).toContain('Ω: 85%');
      expect(formatted).toContain('Λ: Next step here');
    });

    it('should include percentage symbol for omega', () => {
      const signature: DeltaSignature = {
        delta: 'Delta',
        depth: 'Depth',
        omega: 50,
        lambda: 'Lambda',
      };

      const formatted = formatDeltaSignature(signature);
      expect(formatted).toContain('50%');
    });
  });
});
