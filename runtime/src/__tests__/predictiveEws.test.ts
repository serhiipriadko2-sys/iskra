/**
 * Tests for Predictive EWS Types
 * @module @iskra/runtime/predictiveEws.test
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultCalibration,
  createDefaultSensitivity,
  createEmptyPrediction,
  createPreventiveAction,
  calculatePredictionConfidence,
  calculateActionUrgency,
  shouldIntervene,
  selectBestAction,
  type PredictionResult,
  type PredictionFactor,
  type PreventiveAction,
  type CalibrationData,
  type SensitivityProfile,
} from '../index.js';

describe('Predictive EWS Types', () => {
  describe('createDefaultCalibration', () => {
    it('should create calibration with zero initial rates', () => {
      const calibration = createDefaultCalibration();

      expect(calibration.falsePositiveRate).toBe(0);
      expect(calibration.missRate).toBe(0);
      expect(calibration.accuracy).toBe(0.5);
      expect(calibration.predictionCount).toBe(0);
    });

    it('should include all alert levels', () => {
      const calibration = createDefaultCalibration();

      expect(calibration.byAlertLevel.normal).toBeDefined();
      expect(calibration.byAlertLevel.watch).toBeDefined();
      expect(calibration.byAlertLevel.warning).toBeDefined();
      expect(calibration.byAlertLevel.critical).toBeDefined();
      expect(calibration.byAlertLevel.lockdown).toBeDefined();
    });

    it('should have default thresholds', () => {
      const calibration = createDefaultCalibration();

      expect(calibration.adjustedThresholds.watch.D_chaos).toBe(1.4);
      expect(calibration.adjustedThresholds.warning.drift).toBe(0.3);
      expect(calibration.adjustedThresholds.critical.alive_index).toBe(0.3);
    });
  });

  describe('createDefaultSensitivity', () => {
    it('should create neutral sensitivity profile', () => {
      const sensitivity = createDefaultSensitivity();

      expect(sensitivity.overall).toBe(1.0);
      expect(sensitivity.interventionTiming).toBe('balanced');
      expect(sensitivity.showPredictionsToUser).toBe(false);
      expect(sensitivity.notificationThreshold).toBe(0.7);
    });

    it('should have empty metric-specific adjustments', () => {
      const sensitivity = createDefaultSensitivity();

      expect(Object.keys(sensitivity.byMetric)).toHaveLength(0);
    });
  });

  describe('createEmptyPrediction', () => {
    it('should create prediction for given time horizon', () => {
      const prediction = createEmptyPrediction(5);

      expect(prediction.timeHorizon).toBe(5);
      expect(prediction.targetAlert).toBe('normal');
      expect(prediction.probability).toBe(0.5);
      expect(prediction.confidence).toBe(0);
      expect(prediction.contributingFactors).toHaveLength(0);
      expect(prediction.preventiveActions).toHaveLength(0);
    });

    it('should set timestamp', () => {
      const prediction = createEmptyPrediction(3);

      expect(prediction.timestamp).toBeDefined();
      expect(new Date(prediction.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('createPreventiveAction', () => {
    it('should create action with defaults', () => {
      const action = createPreventiveAction('switch_voice');

      expect(action.type).toBe('switch_voice');
      expect(action.urgency).toBe(0.5);
      expect(action.successProbability).toBe(0.7);
      expect(action.rationale).toContain('switch_voice');
    });

    it('should create action with custom options', () => {
      const action = createPreventiveAction('activate_protocol', {
        urgency: 0.9,
        rationale: 'SIFT verification needed',
        expectedEffect: 'Increase trust through verification',
        successProbability: 0.85,
      });

      expect(action.urgency).toBe(0.9);
      expect(action.rationale).toBe('SIFT verification needed');
      expect(action.successProbability).toBe(0.85);
    });

    it('should not include parameters when not provided', () => {
      const action = createPreventiveAction('suggest_pause');

      expect(action.parameters).toBeUndefined();
    });

    it('should include parameters when provided', () => {
      const action = createPreventiveAction('switch_voice', {
        parameters: { targetVoice: 'ANHANTRA' },
      });

      expect(action.parameters).toEqual({ targetVoice: 'ANHANTRA' });
    });
  });

  describe('calculatePredictionConfidence', () => {
    it('should return 0 for empty factors', () => {
      const confidence = calculatePredictionConfidence([]);

      expect(confidence).toBe(0);
    });

    it('should calculate confidence from factor contributions', () => {
      const factors: PredictionFactor[] = [
        {
          metric: 'trust',
          currentValue: 0.3,
          trend: 'falling',
          changeRate: -0.1,
          contribution: 0.8,
          explanation: 'Trust declining',
        },
        {
          metric: 'pain',
          currentValue: 0.6,
          trend: 'rising',
          changeRate: 0.05,
          contribution: 0.6,
          explanation: 'Pain increasing',
        },
      ];

      const confidence = calculatePredictionConfidence(factors);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should penalize volatile trends', () => {
      const stableFactors: PredictionFactor[] = [
        {
          metric: 'trust',
          currentValue: 0.5,
          trend: 'stable',
          changeRate: 0,
          contribution: 0.7,
          explanation: 'Stable',
        },
      ];

      const volatileFactors: PredictionFactor[] = [
        {
          metric: 'trust',
          currentValue: 0.5,
          trend: 'volatile',
          changeRate: 0,
          contribution: 0.7,
          explanation: 'Volatile',
        },
      ];

      const stableConfidence = calculatePredictionConfidence(stableFactors);
      const volatileConfidence = calculatePredictionConfidence(volatileFactors);

      expect(stableConfidence).toBeGreaterThan(volatileConfidence);
    });
  });

  describe('calculateActionUrgency', () => {
    it('should return low urgency for normal to normal prediction', () => {
      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'normal',
        probability: 0.9,
        confidence: 0.8,
      };

      const urgency = calculateActionUrgency(prediction, 'normal');

      // Low urgency for normal predictions (some baseline from time and confidence)
      expect(urgency).toBeLessThan(0.3);
    });

    it('should increase urgency for severity jump', () => {
      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'critical',
        probability: 0.8,
        confidence: 0.7,
      };

      const urgencyFromNormal = calculateActionUrgency(prediction, 'normal');
      const urgencyFromWarning = calculateActionUrgency(prediction, 'warning');

      expect(urgencyFromNormal).toBeGreaterThan(urgencyFromWarning);
    });

    it('should cap urgency at 1.0', () => {
      const prediction: PredictionResult = {
        ...createEmptyPrediction(1),
        targetAlert: 'lockdown',
        probability: 1.0,
        confidence: 1.0,
      };

      const urgency = calculateActionUrgency(prediction, 'normal');

      expect(urgency).toBeLessThanOrEqual(1);
    });
  });

  describe('shouldIntervene', () => {
    const balancedSensitivity: SensitivityProfile = {
      overall: 1.0,
      byMetric: {},
      interventionTiming: 'balanced',
      showPredictionsToUser: false,
      notificationThreshold: 0.7,
    };

    it('should not intervene for normal predictions', () => {
      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'normal',
        probability: 0.9,
        confidence: 0.9,
      };

      expect(shouldIntervene(prediction, balancedSensitivity)).toBe(false);
    });

    it('should intervene for high probability critical prediction', () => {
      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'critical',
        probability: 0.8,
        confidence: 0.7,
      };

      expect(shouldIntervene(prediction, balancedSensitivity)).toBe(true);
    });

    it('should respect early intervention timing', () => {
      const earlySensitivity: SensitivityProfile = {
        ...balancedSensitivity,
        interventionTiming: 'early',
      };

      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'warning',
        probability: 0.55,
        confidence: 0.45,
      };

      expect(shouldIntervene(prediction, earlySensitivity)).toBe(true);
      expect(shouldIntervene(prediction, balancedSensitivity)).toBe(false);
    });

    it('should respect late intervention timing', () => {
      const lateSensitivity: SensitivityProfile = {
        ...balancedSensitivity,
        interventionTiming: 'late',
      };

      const prediction: PredictionResult = {
        ...createEmptyPrediction(3),
        targetAlert: 'warning',
        probability: 0.75,
        confidence: 0.55,
      };

      expect(shouldIntervene(prediction, balancedSensitivity)).toBe(true);
      expect(shouldIntervene(prediction, lateSensitivity)).toBe(false);
    });
  });

  describe('selectBestAction', () => {
    it('should return null for empty list', () => {
      expect(selectBestAction([], 0.5)).toBeNull();
    });

    it('should select action matching urgency', () => {
      const actions: PreventiveAction[] = [
        createPreventiveAction('suggest_pause', { urgency: 0.3, successProbability: 0.8 }),
        createPreventiveAction('switch_voice', { urgency: 0.5, successProbability: 0.8 }),
        createPreventiveAction('call_council', { urgency: 0.8, successProbability: 0.8 }),
      ];

      const selected = selectBestAction(actions, 0.5);

      expect(selected?.type).toBe('switch_voice');
    });

    it('should prefer higher success probability', () => {
      const actions: PreventiveAction[] = [
        createPreventiveAction('suggest_pause', { urgency: 0.5, successProbability: 0.6 }),
        createPreventiveAction('switch_voice', { urgency: 0.5, successProbability: 0.9 }),
      ];

      const selected = selectBestAction(actions, 0.5);

      expect(selected?.type).toBe('switch_voice');
    });
  });

  describe('Type integrity', () => {
    it('should maintain CalibrationData structure', () => {
      const calibration: CalibrationData = createDefaultCalibration();

      expect(calibration.falsePositiveRate).toBeDefined();
      expect(calibration.missRate).toBeDefined();
      expect(calibration.accuracy).toBeDefined();
      expect(calibration.adjustedThresholds).toBeDefined();
      expect(calibration.predictionCount).toBeDefined();
      expect(calibration.lastUpdated).toBeDefined();
      expect(calibration.byAlertLevel).toBeDefined();
    });

    it('should maintain SensitivityProfile structure', () => {
      const sensitivity: SensitivityProfile = createDefaultSensitivity();

      expect(sensitivity.overall).toBeDefined();
      expect(sensitivity.byMetric).toBeDefined();
      expect(sensitivity.interventionTiming).toBeDefined();
      expect(sensitivity.showPredictionsToUser).toBeDefined();
      expect(sensitivity.notificationThreshold).toBeDefined();
    });

    it('should maintain PredictionResult structure', () => {
      const prediction: PredictionResult = createEmptyPrediction(5);

      expect(prediction.targetAlert).toBeDefined();
      expect(prediction.probability).toBeDefined();
      expect(prediction.confidence).toBeDefined();
      expect(prediction.timeHorizon).toBeDefined();
      expect(prediction.contributingFactors).toBeDefined();
      expect(prediction.preventiveActions).toBeDefined();
      expect(prediction.timestamp).toBeDefined();
    });
  });
});
