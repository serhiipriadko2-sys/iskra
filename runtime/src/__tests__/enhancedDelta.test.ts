/**
 * Enhanced Delta Types Tests
 * Tests for EnhancedDeltaSignature and related types
 */

import { describe, it, expect } from 'vitest';
import {
  createEnhancedDelta,
  validateEnhancedDelta,
  calculateActionabilityScore,
  inferEpistemicLevel,
  inferTemporalType,
  formatEnhancedDelta,
  type EnhancedDeltaSignature,
  type ActionabilityAssessment,
} from '../types/enhancedDelta.js';
import type { DeltaSignature } from '../types/protocols.js';

describe('Enhanced Delta Types', () => {
  describe('createEnhancedDelta', () => {
    const baseDelta: DeltaSignature = {
      delta: 'Test delta',
      depth: 'Test depth',
      omega: 75,
      lambda: 'Test lambda',
    };

    it('should create enhanced delta from base', () => {
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');

      expect(enhanced.delta).toBe('Test delta');
      expect(enhanced.depth).toBe('Test depth');
      expect(enhanced.omega).toBe(75);
      expect(enhanced.lambda).toBe('Test lambda');
      expect(enhanced.generatingVoice).toBe('ISKRA');
      expect(enhanced.signatureVersion).toBe('2.0');
    });

    it('should set default epistemic level to 2 (Pattern)', () => {
      const enhanced = createEnhancedDelta(baseDelta, 'SAM');

      expect(enhanced.epistemicLevel).toBe(2);
      expect(enhanced.epistemicGrounding.level).toBe(2);
    });

    it('should set default temporal validity to medium-term', () => {
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');

      expect(enhanced.temporalValidity.type).toBe('medium-term');
      expect(enhanced.temporalValidity.validUntil).toBeNull();
    });

    it('should initialize meta-cognitive reflection', () => {
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRIV');

      expect(enhanced.metaCognitive.uncertainty.acknowledged).toBe(false);
      expect(enhanced.metaCognitive.alternatives).toEqual([]);
      expect(enhanced.metaCognitive.selfAssessment.clarity).toBe(0.5);
    });

    it('should initialize actionability assessment', () => {
      const enhanced = createEnhancedDelta(baseDelta, 'KAIN');

      expect(enhanced.actionability.isActionable).toBe(true);
      expect(enhanced.actionability.actionType).toBe('reflection');
      expect(enhanced.actionability.timeToAction).toBe('24h');
    });
  });

  describe('validateEnhancedDelta', () => {
    it('should validate a complete delta', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Valid delta content',
        depth: 'Valid depth content',
        omega: 75,
        lambda: 'Valid lambda content',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');
      enhanced.epistemicGrounding.justification = 'Valid justification';

      const result = validateEnhancedDelta(enhanced);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty delta', () => {
      const baseDelta: DeltaSignature = {
        delta: '',
        depth: 'Valid',
        omega: 75,
        lambda: 'Valid',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');

      const result = validateEnhancedDelta(enhanced);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Delta (∆) content is required');
    });

    it('should fail for invalid omega', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Valid',
        depth: 'Valid',
        omega: 150, // Invalid: > 100
        lambda: 'Valid',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');

      const result = validateEnhancedDelta(enhanced);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Omega (Ω) must be between 0 and 100');
    });

    it('should warn for high epistemic level with high omega', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Valid',
        depth: 'Valid',
        omega: 90,
        lambda: 'Valid',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');
      enhanced.epistemicLevel = 4; // High level

      const result = validateEnhancedDelta(enhanced);

      expect(result.warnings).toContain(
        'High epistemic level with high omega - consider reducing confidence'
      );
    });

    it('should warn for actionable delta without first step', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Valid',
        depth: 'Valid',
        omega: 75,
        lambda: 'Valid',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');
      enhanced.actionability.isActionable = true;
      enhanced.actionability.firstStep = ''; // Empty

      const result = validateEnhancedDelta(enhanced);

      expect(result.warnings).toContain(
        'Actionable delta should have a first step defined'
      );
    });

    it('should calculate quality score', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Valid',
        depth: 'Valid',
        omega: 75,
        lambda: 'Valid',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');
      enhanced.epistemicGrounding.justification = 'Clear justification';

      const result = validateEnhancedDelta(enhanced);

      expect(result.qualityScore).toBeGreaterThan(0);
      expect(result.qualityScore).toBeLessThanOrEqual(1);
      expect(result.scores.overallCoherence).toBeGreaterThan(0);
    });
  });

  describe('calculateActionabilityScore', () => {
    it('should return 0 for non-actionable', () => {
      const assessment: ActionabilityAssessment = {
        isActionable: false,
        actionType: 'reflection',
        timeToAction: '24h',
        difficulty: 'moderate',
        firstStep: '',
        doneCondition: '',
        prerequisites: [],
        blockers: [],
        score: 0,
      };

      expect(calculateActionabilityScore(assessment)).toBe(0);
    });

    it('should give higher score for immediate action', () => {
      const immediate: ActionabilityAssessment = {
        isActionable: true,
        actionType: 'reflection',
        timeToAction: 'immediate',
        difficulty: 'easy',
        firstStep: '',
        doneCondition: '',
        prerequisites: [],
        blockers: [],
        score: 0,
      };

      const weekly: ActionabilityAssessment = {
        ...immediate,
        timeToAction: '1w',
      };

      expect(calculateActionabilityScore(immediate)).toBeGreaterThan(
        calculateActionabilityScore(weekly)
      );
    });

    it('should give bonus for first step', () => {
      const withStep: ActionabilityAssessment = {
        isActionable: true,
        actionType: 'behavior',
        timeToAction: '24h',
        difficulty: 'moderate',
        firstStep: 'Open your journal and write three sentences',
        doneCondition: '',
        prerequisites: [],
        blockers: [],
        score: 0,
      };

      const withoutStep: ActionabilityAssessment = {
        ...withStep,
        firstStep: '',
      };

      expect(calculateActionabilityScore(withStep)).toBeGreaterThan(
        calculateActionabilityScore(withoutStep)
      );
    });

    it('should penalize for blockers', () => {
      const noBlockers: ActionabilityAssessment = {
        isActionable: true,
        actionType: 'communication',
        timeToAction: '1h',
        difficulty: 'easy',
        firstStep: 'Call your friend',
        doneCondition: 'Had a 5 minute conversation',
        prerequisites: [],
        blockers: [],
        score: 0,
      };

      const withBlockers: ActionabilityAssessment = {
        ...noBlockers,
        blockers: ['Time zone difference', 'Phone anxiety', 'Busy schedule'],
      };

      expect(calculateActionabilityScore(noBlockers)).toBeGreaterThan(
        calculateActionabilityScore(withBlockers)
      );
    });
  });

  describe('inferEpistemicLevel', () => {
    it('should return 5 for paradigm-level content', () => {
      expect(inferEpistemicLevel('Это парадигма мышления')).toBe(5);
      expect(inferEpistemicLevel('фундаментальный закон природы')).toBe(5);
    });

    it('should return 3 for model-level content', () => {
      expect(inferEpistemicLevel('Теория утверждает что')).toBe(3);
      expect(inferEpistemicLevel('Согласно модель')).toBe(3);
      expect(inferEpistemicLevel('Это модель поведения')).toBe(3);
    });

    it('should return 2 for pattern-level content', () => {
      expect(inferEpistemicLevel('Наблюдается паттерн')).toBe(2);
      expect(inferEpistemicLevel('Закономерность такова')).toBe(2);
    });

    it('should return 1 for observation-level content', () => {
      expect(inferEpistemicLevel('Я наблюдаю следующее')).toBe(1);
      expect(inferEpistemicLevel('Замечаю изменения')).toBe(1);
    });

    it('should return 0 for raw data', () => {
      expect(inferEpistemicLevel('Данные показывают 42')).toBe(0);
      expect(inferEpistemicLevel('Simple statement')).toBe(0);
    });
  });

  describe('inferTemporalType', () => {
    it('should return eternal for mathematical/logical', () => {
      expect(inferTemporalType('Это всегда верно')).toBe('eternal');
      expect(inferTemporalType('Математически доказано')).toBe('eternal');
    });

    it('should return ephemeral for current events', () => {
      expect(inferTemporalType('Сейчас происходит')).toBe('ephemeral');
      expect(inferTemporalType('Сегодня мы видим')).toBe('ephemeral');
    });

    it('should return short-term for recent developments', () => {
      expect(inferTemporalType('Недавно произошло')).toBe('short-term');
      expect(inferTemporalType('На этой неделе')).toBe('short-term');
    });

    it('should return long-term for historical facts', () => {
      expect(inferTemporalType('Исторически сложилось')).toBe('long-term');
      expect(inferTemporalType('Научно установлено')).toBe('long-term');
    });

    it('should default to medium-term', () => {
      expect(inferTemporalType('Some general statement')).toBe('medium-term');
    });
  });

  describe('formatEnhancedDelta', () => {
    it('should format delta in ∆DΩΛ format', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Main insight',
        depth: 'Supporting evidence',
        omega: 80,
        lambda: 'Next step',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRA');

      const formatted = formatEnhancedDelta(enhanced);

      expect(formatted).toContain('∆DΩΛ');
      expect(formatted).toContain('∆: Main insight');
      expect(formatted).toContain('D: Supporting evidence');
      expect(formatted).toContain('Ω: 80%');
      expect(formatted).toContain('Λ: Next step');
    });

    it('should include epistemic level', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Test',
        depth: 'Test',
        omega: 75,
        lambda: 'Test',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'SAM');
      enhanced.epistemicLevel = 3;

      const formatted = formatEnhancedDelta(enhanced);

      expect(formatted).toContain('[L3: Model]');
    });

    it('should include action time horizon for actionable deltas', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Test',
        depth: 'Test',
        omega: 75,
        lambda: 'Take action',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'KAIN');
      enhanced.actionability.isActionable = true;
      enhanced.actionability.timeToAction = '1h';

      const formatted = formatEnhancedDelta(enhanced);

      expect(formatted).toContain('[1h]');
    });

    it('should include uncertainty note when acknowledged', () => {
      const baseDelta: DeltaSignature = {
        delta: 'Test',
        depth: 'Test',
        omega: 60,
        lambda: 'Test',
      };
      const enhanced = createEnhancedDelta(baseDelta, 'ISKRIV');
      enhanced.metaCognitive.uncertainty.acknowledged = true;
      enhanced.metaCognitive.uncertainty.uncertaintyTypes = ['epistemic', 'model'];

      const formatted = formatEnhancedDelta(enhanced);

      expect(formatted).toContain('📝:');
      expect(formatted).toContain('epistemic');
    });
  });
});
