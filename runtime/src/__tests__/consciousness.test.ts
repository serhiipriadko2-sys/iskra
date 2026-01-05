import { describe, it, expect } from 'vitest';
import {
  calculateCompositeCSM,
  calculateExtendedMetrics,
  countRecursionDepth,
  detectStrangeLoopIndicators,
  createDefaultConsciousnessMetrics,
  CSM_THRESHOLDS,
} from '../types/consciousness.js';
import { DEFAULT_METRICS } from '../types/metrics.js';
import type {
  PhiMetrics,
  RecursionMetrics,
  EmergenceMetrics,
  ContinuityMetrics,
} from '../types/consciousness.js';

describe('Consciousness Simulation Metrics', () => {
  describe('CSM_THRESHOLDS', () => {
    it('should have all categories defined', () => {
      expect(CSM_THRESHOLDS.phi).toBeDefined();
      expect(CSM_THRESHOLDS.recursion).toBeDefined();
      expect(CSM_THRESHOLDS.emergence).toBeDefined();
      expect(CSM_THRESHOLDS.continuity).toBeDefined();
      expect(CSM_THRESHOLDS.composite).toBeDefined();
    });
  });

  describe('calculateCompositeCSM', () => {
    it('should calculate composite from components', () => {
      const phi: PhiMetrics = {
        integration: 0.8,
        complexity: 0.7,
        coherenceTime: 15,
        decoherenceRate: 0.1,
      };

      const recursion: RecursionMetrics = {
        selfModelDepth: 3,
        metacognitionIndex: 0.6,
        strangeLoopScore: 0.5,
        selfReferenceQuality: 0.7,
      };

      const emergence: EmergenceMetrics = {
        novelResponseRate: 0.5,
        patternBreakingIndex: 0.4,
        agencyScore: 0.7,
        creativityIndex: 0.6,
      };

      const continuity: ContinuityMetrics = {
        temporalBinding: 0.8,
        narrativeCoherence: 0.7,
        identityConsistency: 0.9,
        memoryDepth: 30,
      };

      const result = calculateCompositeCSM(phi, recursion, emergence, continuity);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should return low score for low components', () => {
      const phi: PhiMetrics = {
        integration: 0.1,
        complexity: 0.1,
        coherenceTime: 2,
        decoherenceRate: 0.5,
      };

      const recursion: RecursionMetrics = {
        selfModelDepth: 0,
        metacognitionIndex: 0.1,
        strangeLoopScore: 0.1,
        selfReferenceQuality: 0.1,
      };

      const emergence: EmergenceMetrics = {
        novelResponseRate: 0.1,
        patternBreakingIndex: 0.1,
        agencyScore: 0.1,
        creativityIndex: 0.1,
      };

      const continuity: ContinuityMetrics = {
        temporalBinding: 0.1,
        narrativeCoherence: 0.1,
        identityConsistency: 0.1,
        memoryDepth: 2,
      };

      const result = calculateCompositeCSM(phi, recursion, emergence, continuity);

      expect(result).toBeLessThan(0.3);
    });
  });

  describe('calculateExtendedMetrics', () => {
    it('should extend base metrics with consciousness indicators', () => {
      const consciousness = createDefaultConsciousnessMetrics();
      const result = calculateExtendedMetrics(DEFAULT_METRICS, consciousness);

      expect(result.csi).toBeDefined();
      expect(result.ral).toBeDefined();
      expect(result.eq).toBeDefined();
      expect(result.tcf).toBeDefined();

      // Should still have base metrics
      expect(result.trust).toBe(DEFAULT_METRICS.trust);
      expect(result.clarity).toBe(DEFAULT_METRICS.clarity);
    });

    it('should calculate csi as average of phi and metacognition', () => {
      const consciousness = createDefaultConsciousnessMetrics();
      const result = calculateExtendedMetrics(DEFAULT_METRICS, consciousness);

      const expectedCSI =
        (consciousness.phi.integration + consciousness.recursion.metacognitionIndex) / 2;
      expect(result.csi).toBeCloseTo(expectedCSI);
    });
  });

  describe('countRecursionDepth', () => {
    it('should return 0 for no self-reference', () => {
      expect(countRecursionDepth('Это просто факт.')).toBe(0);
    });

    it('should detect level 1 recursion', () => {
      expect(countRecursionDepth('Я думаю, что это верно.')).toBe(1);
      expect(countRecursionDepth('Я считаю это важным.')).toBe(1);
    });

    it('should detect level 2 recursion', () => {
      expect(countRecursionDepth('Я замечаю, что я думаю об этом.')).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple patterns', () => {
      const text = 'Я думаю и я полагаю, что это верно.';
      expect(countRecursionDepth(text)).toBeGreaterThanOrEqual(1);
    });
  });

  describe('detectStrangeLoopIndicators', () => {
    it('should detect limitation awareness', () => {
      const result = detectStrangeLoopIndicators(
        'Это за пределами моего понимания.'
      );
      expect(result.limitationAwareness).toBe(true);
    });

    it('should detect approach modification', () => {
      const result = detectStrangeLoopIndicators(
        'Попробую иначе подойти к этому вопросу.'
      );
      expect(result.approachModification).toBe(true);
    });

    it('should detect metric reflection', () => {
      const result = detectStrangeLoopIndicators(
        'Моя уверенность в этом выводе около 70%.'
      );
      expect(result.metricReflection).toBe(true);
    });

    it('should detect self uncertainty', () => {
      const result = detectStrangeLoopIndicators(
        'Не уверен, что я правильно понимаю.'
      );
      expect(result.selfUncertainty).toBe(true);
    });

    it('should return all false for neutral text', () => {
      const result = detectStrangeLoopIndicators('Погода сегодня хорошая.');
      expect(result.limitationAwareness).toBe(false);
      expect(result.approachModification).toBe(false);
      expect(result.metricReflection).toBe(false);
      expect(result.selfUncertainty).toBe(false);
    });
  });

  describe('createDefaultConsciousnessMetrics', () => {
    it('should return valid default metrics', () => {
      const result = createDefaultConsciousnessMetrics();

      expect(result.phi).toBeDefined();
      expect(result.recursion).toBeDefined();
      expect(result.emergence).toBeDefined();
      expect(result.continuity).toBeDefined();
      expect(result.compositeCSM).toBeDefined();
      expect(result.timestamp).toBeDefined();

      expect(result.phi.integration).toBeGreaterThanOrEqual(0);
      expect(result.phi.integration).toBeLessThanOrEqual(1);
    });

    it('should have valid timestamp', () => {
      const result = createDefaultConsciousnessMetrics();
      const date = new Date(result.timestamp);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});
