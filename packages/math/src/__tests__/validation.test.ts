/**
 * Tests for validation utilities in @iskra/math.
 * Covers edge cases: empty signals, NaN, Infinity, kmax boundaries.
 */
import { describe, it, expect } from 'vitest';
import { validateSignal, validateKmax, IskraValidationError } from '../utils/validation.js';

describe('validation', () => {
  describe('validateSignal', () => {
    it('should pass for valid non-empty signal', () => {
      expect(() => validateSignal([1, 2, 3])).not.toThrow();
    });

    it('should throw for null signal', () => {
      expect(() => validateSignal(null as any)).toThrow(IskraValidationError);
      expect(() => validateSignal(null as any)).toThrow('Signal cannot be empty');
    });

    it('should throw for empty array', () => {
      expect(() => validateSignal([])).toThrow(IskraValidationError);
      expect(() => validateSignal([])).toThrow('Signal cannot be empty');
    });

    it('should throw for signal with NaN', () => {
      expect(() => validateSignal([1, NaN, 3])).toThrow(IskraValidationError);
      expect(() => validateSignal([1, NaN, 3])).toThrow('Signal contains NaN values');
    });

    it('should throw for signal with Infinity', () => {
      expect(() => validateSignal([1, Infinity, 3])).toThrow(IskraValidationError);
      expect(() => validateSignal([1, Infinity, 3])).toThrow('Signal contains Infinity values');
    });

    it('should throw for signal with -Infinity', () => {
      expect(() => validateSignal([1, -Infinity, 3])).toThrow(IskraValidationError);
      expect(() => validateSignal([1, -Infinity, 3])).toThrow('Signal contains Infinity values');
    });

    it('should pass for single element', () => {
      expect(() => validateSignal([42])).not.toThrow();
    });
  });

  describe('validateKmax', () => {
    it('should pass for valid kmax', () => {
      expect(() => validateKmax(5, 10)).not.toThrow();
    });

    it('should throw for kmax <= 0', () => {
      expect(() => validateKmax(0, 10)).toThrow(IskraValidationError);
      expect(() => validateKmax(0, 10)).toThrow('kmax must be positive');
    });

    it('should throw for negative kmax', () => {
      expect(() => validateKmax(-1, 10)).toThrow(IskraValidationError);
      expect(() => validateKmax(-1, 10)).toThrow('kmax must be positive');
    });

    it('should throw for kmax > signalLength', () => {
      expect(() => validateKmax(11, 10)).toThrow(IskraValidationError);
      expect(() => validateKmax(11, 10)).toThrow('kmax cannot exceed signal length');
    });

    it('should pass when kmax equals signalLength', () => {
      expect(() => validateKmax(10, 10)).not.toThrow();
    });

    it('should pass for kmax = 1', () => {
      expect(() => validateKmax(1, 5)).not.toThrow();
    });
  });

  describe('IskraValidationError', () => {
    it('should have correct name', () => {
      const error = new IskraValidationError('test message');
      expect(error.name).toBe('IskraValidationError');
    });

    it('should have correct code', () => {
      const error = new IskraValidationError('test message');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should include message prefix', () => {
      const error = new IskraValidationError('custom reason');
      expect(error.message).toBe('Validation error: custom reason');
    });

    it('should extend IskraError', () => {
      const error = new IskraValidationError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('code');
      expect(error).toHaveProperty('context');
    });
  });
});
