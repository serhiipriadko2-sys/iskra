import { describe, it, expect } from 'vitest';
import {
  SIFT_TRIGGER_KEYWORDS,
  shouldActivateSift,
  calculateSiftOmega,
  type SiftResult,
  type SourceAnalysis,
  type InferenceAnalysis,
  type EvidenceResult,
  type TraceResult,
} from '../types/sift.js';

describe('sift', () => {
  describe('SIFT_TRIGGER_KEYWORDS', () => {
    it('should contain verification keywords', () => {
      expect(SIFT_TRIGGER_KEYWORDS).toContain('правда ли');
      expect(SIFT_TRIGGER_KEYWORDS).toContain('источник');
      expect(SIFT_TRIGGER_KEYWORDS).toContain('проверь факт');
    });

    it('should be a non-empty array', () => {
      expect(Array.isArray(SIFT_TRIGGER_KEYWORDS)).toBe(true);
      expect(SIFT_TRIGGER_KEYWORDS.length).toBeGreaterThan(0);
    });
  });

  describe('shouldActivateSift', () => {
    it('should activate for keyword "правда ли"', () => {
      expect(shouldActivateSift('Это правда ли что Земля круглая?', 0.8)).toBe(true);
    });

    it('should activate for keyword "источник"', () => {
      expect(shouldActivateSift('Какой источник этой информации?', 0.8)).toBe(true);
    });

    it('should activate for keyword "статистика"', () => {
      // The keyword is "статистика" which should match in "статистика показывает"
      expect(shouldActivateSift('статистика показывает что...', 0.8)).toBe(true);
    });

    it('should activate for low clarity (< 0.6)', () => {
      expect(shouldActivateSift('Обычный вопрос', 0.4)).toBe(true);
    });

    it('should not activate for normal query with high clarity', () => {
      expect(shouldActivateSift('Как дела?', 0.8)).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(shouldActivateSift('ПРАВДА ЛИ это так?', 0.8)).toBe(true);
      expect(shouldActivateSift('Правда Ли это так?', 0.8)).toBe(true);
    });
  });

  describe('calculateSiftOmega', () => {
    const createMockResult = (overrides: Partial<{
      sourceReliability: number;
      logicalValidity: number;
      evidenceQuality: number;
      traceability: number;
      sourceFlags: string[];
      fallacies: string[];
      distortions: { severity: number }[];
      contradicting: number;
      supporting: number;
    }> = {}): Omit<SiftResult, 'delta'> => {
      const defaults = {
        sourceReliability: 0.8,
        logicalValidity: 0.7,
        evidenceQuality: 0.9,
        traceability: 0.8,
        sourceFlags: [],
        fallacies: [],
        distortions: [],
        contradicting: 0,
        supporting: 3,
      };

      const config = { ...defaults, ...overrides };

      return {
        source: {
          identified: [],
          reliability: config.sourceReliability,
          flags: config.sourceFlags,
        } as SourceAnalysis,
        inference: {
          claims: [],
          assumptions: [],
          logicalValidity: config.logicalValidity,
          fallacies: config.fallacies,
        } as InferenceAnalysis,
        evidence: {
          supporting: Array(config.supporting).fill({ source: {}, content: '', relevance: 0.8, strength: 0.8 }),
          contradicting: Array(config.contradicting).fill({ source: {}, content: '', relevance: 0.5, strength: 0.5 }),
          neutral: [],
          quality: config.evidenceQuality,
        } as EvidenceResult,
        trace: {
          chain: [],
          distortions: config.distortions.map(d => ({ type: 'amplification' as const, description: '', severity: d.severity })),
          traceability: config.traceability,
        } as TraceResult,
        verdict: {
          status: 'verified',
          confidence: 80,
          summary: 'Test',
          caveats: [],
        },
      };
    };

    it('should return score between 0 and 95', () => {
      const result = createMockResult();
      const omega = calculateSiftOmega(result);

      expect(omega).toBeGreaterThanOrEqual(0);
      expect(omega).toBeLessThanOrEqual(95);
    });

    it('should never exceed 95 even with perfect scores', () => {
      const result = createMockResult({
        sourceReliability: 1.0,
        logicalValidity: 1.0,
        evidenceQuality: 1.0,
        traceability: 1.0,
      });

      const omega = calculateSiftOmega(result);
      expect(omega).toBeLessThanOrEqual(95);
    });

    it('should apply penalty for source flags', () => {
      const withoutFlags = createMockResult();
      const withFlags = createMockResult({ sourceFlags: ['bias', 'outdated', 'unverified'] });

      const omegaWithout = calculateSiftOmega(withoutFlags);
      const omegaWith = calculateSiftOmega(withFlags);

      expect(omegaWith).toBeLessThan(omegaWithout);
    });

    it('should apply penalty for fallacies', () => {
      const withoutFallacies = createMockResult();
      const withFallacies = createMockResult({ fallacies: ['strawman', 'ad hominem'] });

      const omegaWithout = calculateSiftOmega(withoutFallacies);
      const omegaWith = calculateSiftOmega(withFallacies);

      expect(omegaWith).toBeLessThan(omegaWithout);
    });

    it('should apply penalty for distortions', () => {
      const withoutDistortions = createMockResult();
      const withDistortions = createMockResult({
        distortions: [{ severity: 0.5 }, { severity: 0.7 }],
      });

      const omegaWithout = calculateSiftOmega(withoutDistortions);
      const omegaWith = calculateSiftOmega(withDistortions);

      expect(omegaWith).toBeLessThan(omegaWithout);
    });

    it('should apply penalty for contradicting evidence', () => {
      const lowContra = createMockResult({ contradicting: 0, supporting: 5 });
      const highContra = createMockResult({ contradicting: 3, supporting: 2 });

      const omegaLow = calculateSiftOmega(lowContra);
      const omegaHigh = calculateSiftOmega(highContra);

      expect(omegaHigh).toBeLessThan(omegaLow);
    });

    it('should return rounded integer', () => {
      const result = createMockResult();
      const omega = calculateSiftOmega(result);

      expect(Number.isInteger(omega)).toBe(true);
    });
  });
});
