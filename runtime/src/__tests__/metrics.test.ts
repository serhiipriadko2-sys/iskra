import { describe, it, expect } from 'vitest';
import {
  DEFAULT_METRICS,
  calculateIntegrityScore,
  calculateAliveIndex,
  type IskraMetrics,
} from '../types/metrics.js';

describe('metrics', () => {
  describe('DEFAULT_METRICS', () => {
    it('should have all 11 metrics defined', () => {
      const requiredKeys: (keyof IskraMetrics)[] = [
        'rhythm',
        'trust',
        'pain',
        'chaos',
        'drift',
        'echo',
        'clarity',
        'silence_mass',
        'mirror_sync',
        'interrupt',
        'ctxSwitch',
      ];

      for (const key of requiredKeys) {
        expect(DEFAULT_METRICS).toHaveProperty(key);
        expect(typeof DEFAULT_METRICS[key]).toBe('number');
      }
    });

    it('should have rhythm in 0-100 range', () => {
      expect(DEFAULT_METRICS.rhythm).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_METRICS.rhythm).toBeLessThanOrEqual(100);
    });

    it('should have all other metrics in 0-1 range', () => {
      const normalizedKeys: (keyof IskraMetrics)[] = [
        'trust',
        'pain',
        'chaos',
        'drift',
        'echo',
        'clarity',
        'silence_mass',
        'mirror_sync',
        'interrupt',
        'ctxSwitch',
      ];

      for (const key of normalizedKeys) {
        expect(DEFAULT_METRICS[key]).toBeGreaterThanOrEqual(0);
        expect(DEFAULT_METRICS[key]).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('calculateIntegrityScore', () => {
    it('should calculate (clarity + trust) / 2 - drift', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 0.8,
        trust: 0.6,
        drift: 0.1,
      };

      const result = calculateIntegrityScore(metrics);
      expect(result).toBeCloseTo((0.8 + 0.6) / 2 - 0.1);
      expect(result).toBeCloseTo(0.6);
    });

    it('should return negative for high drift', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 0.3,
        trust: 0.3,
        drift: 0.5,
      };

      const result = calculateIntegrityScore(metrics);
      expect(result).toBeLessThan(0);
    });

    it('should return high score for high clarity and trust with low drift', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 1.0,
        trust: 1.0,
        drift: 0.0,
      };

      const result = calculateIntegrityScore(metrics);
      expect(result).toBe(1.0);
    });
  });

  describe('calculateAliveIndex', () => {
    it('should calculate integrity_score * (trace / 5)', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 0.8,
        trust: 0.8,
        drift: 0.0,
      };

      const result = calculateAliveIndex(metrics, 5);
      // integrity = (0.8 + 0.8) / 2 - 0 = 0.8
      // alive = 0.8 * (5 / 5) = 0.8
      expect(result).toBeCloseTo(0.8);
    });

    it('should scale with trace count', () => {
      const metrics: IskraMetrics = {
        ...DEFAULT_METRICS,
        clarity: 1.0,
        trust: 1.0,
        drift: 0.0,
      };

      expect(calculateAliveIndex(metrics, 0)).toBe(0);
      expect(calculateAliveIndex(metrics, 2.5)).toBeCloseTo(0.5);
      expect(calculateAliveIndex(metrics, 5)).toBe(1.0);
    });

    it('should return 0 when trace is 0', () => {
      const result = calculateAliveIndex(DEFAULT_METRICS, 0);
      expect(result).toBe(0);
    });
  });
});
