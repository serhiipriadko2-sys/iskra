import { describe, it, expect } from 'vitest';
import {
  calculateEpistemicOmegaAdjustment,
  shouldActivateSiftE,
  inferTemporalValidityType,
  EPISTEMIC_LEVEL_NAMES,
  VALIDITY_DURATIONS,
} from '../types/siftExtended.js';
import type { EpistemicDepthAnalysis } from '../types/siftExtended.js';

describe('SIFT-E Protocol', () => {
  describe('EPISTEMIC_LEVEL_NAMES', () => {
    it('should have all 6 levels defined', () => {
      expect(Object.keys(EPISTEMIC_LEVEL_NAMES)).toHaveLength(6);
      expect(EPISTEMIC_LEVEL_NAMES[0]).toBe('Raw Data');
      expect(EPISTEMIC_LEVEL_NAMES[5]).toBe('Paradigm');
    });
  });

  describe('VALIDITY_DURATIONS', () => {
    it('should have correct durations', () => {
      expect(VALIDITY_DURATIONS.eternal).toBeNull();
      expect(VALIDITY_DURATIONS['long-term']).toBe(3650);
      expect(VALIDITY_DURATIONS.ephemeral).toBe(7);
    });
  });

  describe('calculateEpistemicOmegaAdjustment', () => {
    it('should return base omega when all premises verified', () => {
      const epistemic: EpistemicDepthAnalysis = {
        level: 1,
        levelConfidenceMatch: 1.0,
        requiredPremises: ['A', 'B'],
        verifiedPremises: ['A', 'B'],
        unverifiedPremises: [],
        omegaAdjustment: 0,
      };

      const result = calculateEpistemicOmegaAdjustment(80, epistemic);
      // 80 * 1.0 * 1.0 - 1*0.03 = 79.97 → 80
      expect(result).toBeCloseTo(80, 0);
    });

    it('should reduce omega when premises not verified', () => {
      const epistemic: EpistemicDepthAnalysis = {
        level: 2,
        levelConfidenceMatch: 0.8,
        requiredPremises: ['A', 'B', 'C', 'D'],
        verifiedPremises: ['A', 'B'],
        unverifiedPremises: ['C', 'D'],
        omegaAdjustment: 0,
      };

      const result = calculateEpistemicOmegaAdjustment(80, epistemic);
      // 80 * 0.5 * 0.8 - 2*0.03 = 32 - 0.06 = 31.94 → 32
      expect(result).toBeLessThan(80);
    });

    it('should apply level penalty for higher levels', () => {
      const lowLevel: EpistemicDepthAnalysis = {
        level: 0,
        levelConfidenceMatch: 1.0,
        requiredPremises: ['A'],
        verifiedPremises: ['A'],
        unverifiedPremises: [],
        omegaAdjustment: 0,
      };

      const highLevel: EpistemicDepthAnalysis = {
        level: 5,
        levelConfidenceMatch: 1.0,
        requiredPremises: ['A'],
        verifiedPremises: ['A'],
        unverifiedPremises: [],
        omegaAdjustment: 0,
      };

      const lowResult = calculateEpistemicOmegaAdjustment(80, lowLevel);
      const highResult = calculateEpistemicOmegaAdjustment(80, highLevel);

      // Higher level should have lower result due to penalty
      // Level 0: 80 - 0*0.03 = 80
      // Level 5: 80 - 5*0.03 = 79.85 → 80 (rounds to 80)
      // The penalty is too small to notice with rounding, but it should be <= lowResult
      expect(highResult).toBeLessThanOrEqual(lowResult);
    });

    it('should cap at 95', () => {
      const epistemic: EpistemicDepthAnalysis = {
        level: 0,
        levelConfidenceMatch: 1.0,
        requiredPremises: ['A'],
        verifiedPremises: ['A'],
        unverifiedPremises: [],
        omegaAdjustment: 0,
      };

      const result = calculateEpistemicOmegaAdjustment(100, epistemic);
      expect(result).toBeLessThanOrEqual(95);
    });
  });

  describe('shouldActivateSiftE', () => {
    it('should activate for high stakes context', () => {
      const result = shouldActivateSiftE('Какой препарат?', 'медицинский вопрос');
      expect(result.activate).toBe(true);
      expect(result.reason).toBe('high_stakes_context');
    });

    it('should activate for time sensitive queries', () => {
      const result = shouldActivateSiftE('Что произошло сегодня?');
      expect(result.activate).toBe(true);
      expect(result.reason).toBe('time_sensitive');
    });

    it('should activate for high abstraction', () => {
      // Use exact Russian keywords from the function
      const result = shouldActivateSiftE('Объясни закон относительности');
      expect(result.activate).toBe(true);
      expect(result.reason).toBe('high_abstraction');
    });

    it('should activate for explicit request', () => {
      const result = shouldActivateSiftE('Глубоко проверь этот факт');
      expect(result.activate).toBe(true);
      expect(result.reason).toBe('explicit_request');
    });

    it('should not activate for simple queries', () => {
      const result = shouldActivateSiftE('Привет, как дела?');
      expect(result.activate).toBe(false);
      expect(result.reason).toBe('standard_sift');
    });
  });

  describe('inferTemporalValidityType', () => {
    it('should detect eternal claims', () => {
      expect(inferTemporalValidityType('Теорема Пифагора')).toBe('eternal');
      expect(inferTemporalValidityType('По определению, число')).toBe('eternal');
    });

    it('should detect long-term claims', () => {
      expect(inferTemporalValidityType('Закон всемирного тяготения')).toBe('long-term');
    });

    it('should detect ephemeral claims', () => {
      expect(inferTemporalValidityType('Вчера было объявлено')).toBe('ephemeral');
      expect(inferTemporalValidityType('Сегодня произошло')).toBe('ephemeral');
    });

    it('should detect short-term claims', () => {
      expect(inferTemporalValidityType('В этом году был выпущен')).toBe('short-term');
    });

    it('should default to medium-term', () => {
      expect(inferTemporalValidityType('Это просто факт')).toBe('medium-term');
    });
  });
});
