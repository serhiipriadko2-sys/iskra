import { describe, it, expect } from 'vitest';
import {
  ALERT_COLORS,
  ALERT_SYMBOLS,
  ALERT_NOTIFICATIONS,
  DEFAULT_EWS_CONFIG,
  determineAlertLevel,
  decidePlaybookSwitch,
  adjustVoiceWeightsForAlert,
  adjustTemperatureForAlert,
  type AlertLevel,
  type FractalIndicators,
  type IskraMetrics,
  type VoiceId,
} from '../types/ews.js';
import { DEFAULT_METRICS } from '../types/metrics.js';

describe('ews', () => {
  const ALL_ALERT_LEVELS: AlertLevel[] = ['normal', 'watch', 'warning', 'critical', 'lockdown'];

  const createFractalIndicators = (overrides: Partial<FractalIndicators> = {}): FractalIndicators => ({
    D_chaos: 1.2,
    D_clarity: 1.3,
    D_drift: 1.1,
    H_trust: 0.6,
    complexityIndex: 0.4,
    edgeDistance: 0.3,
    ...overrides,
  });

  describe('ALERT_COLORS', () => {
    it('should have colors for all alert levels', () => {
      for (const level of ALL_ALERT_LEVELS) {
        expect(ALERT_COLORS).toHaveProperty(level);
        expect(typeof ALERT_COLORS[level]).toBe('string');
      }
    });

    it('should have correct color mapping', () => {
      expect(ALERT_COLORS.normal).toBe('green');
      expect(ALERT_COLORS.critical).toBe('red');
      expect(ALERT_COLORS.lockdown).toBe('black');
    });
  });

  describe('ALERT_SYMBOLS', () => {
    it('should have symbols for all alert levels', () => {
      for (const level of ALL_ALERT_LEVELS) {
        expect(ALERT_SYMBOLS).toHaveProperty(level);
      }
    });

    it('should have correct symbol mapping', () => {
      expect(ALERT_SYMBOLS.normal).toBe('🟢');
      expect(ALERT_SYMBOLS.critical).toBe('🔴');
      expect(ALERT_SYMBOLS.lockdown).toBe('🔒');
    });
  });

  describe('ALERT_NOTIFICATIONS', () => {
    it('should have notifications for all levels except normal', () => {
      expect(ALERT_NOTIFICATIONS.normal).toHaveLength(0);
      expect(ALERT_NOTIFICATIONS.watch.length).toBeGreaterThan(0);
      expect(ALERT_NOTIFICATIONS.warning.length).toBeGreaterThan(0);
      expect(ALERT_NOTIFICATIONS.critical.length).toBeGreaterThan(0);
      expect(ALERT_NOTIFICATIONS.lockdown.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_EWS_CONFIG', () => {
    it('should have required properties', () => {
      expect(DEFAULT_EWS_CONFIG.checkInterval).toBeDefined();
      expect(DEFAULT_EWS_CONFIG.historyWindow).toBeDefined();
      expect(DEFAULT_EWS_CONFIG.sensitivity).toBeDefined();
      expect(DEFAULT_EWS_CONFIG.thresholds).toBeDefined();
    });

    it('should have thresholds for all levels', () => {
      expect(DEFAULT_EWS_CONFIG.thresholds.watch).toBeDefined();
      expect(DEFAULT_EWS_CONFIG.thresholds.warning).toBeDefined();
      expect(DEFAULT_EWS_CONFIG.thresholds.critical).toBeDefined();
    });
  });

  describe('determineAlertLevel', () => {
    it('should return normal for baseline metrics', () => {
      const fractal = createFractalIndicators();
      const level = determineAlertLevel(DEFAULT_METRICS, fractal);
      expect(level).toBe('normal');
    });

    it('should return critical for high D_chaos', () => {
      const metrics = { ...DEFAULT_METRICS };
      const fractal = createFractalIndicators({ D_chaos: 1.9 });

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('critical');
    });

    it('should return critical for high drift', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, drift: 0.5 };
      const fractal = createFractalIndicators();

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('critical');
    });

    it('should return critical for high interrupt', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, interrupt: 0.8 };
      const fractal = createFractalIndicators();

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('critical');
    });

    it('should return critical for low edgeDistance', () => {
      const metrics = { ...DEFAULT_METRICS };
      const fractal = createFractalIndicators({ edgeDistance: 0.05 });

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('critical');
    });

    it('should return warning for elevated D_chaos', () => {
      const metrics = { ...DEFAULT_METRICS };
      const fractal = createFractalIndicators({ D_chaos: 1.65 });

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('warning');
    });

    it('should return warning for low trust', () => {
      const metrics: IskraMetrics = { ...DEFAULT_METRICS, trust: 0.2 };
      const fractal = createFractalIndicators();

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('warning');
    });

    it('should return watch for moderate D_chaos', () => {
      const metrics = { ...DEFAULT_METRICS };
      const fractal = createFractalIndicators({ D_chaos: 1.45 });

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('watch');
    });

    it('should return watch for high complexityIndex', () => {
      const metrics = { ...DEFAULT_METRICS };
      const fractal = createFractalIndicators({ complexityIndex: 0.8 });

      const level = determineAlertLevel(metrics, fractal);
      expect(level).toBe('watch');
    });
  });

  describe('decidePlaybookSwitch', () => {
    it('should recommend crisis for critical alert', () => {
      const decision = decidePlaybookSwitch('routine', 'critical', null);

      expect(decision.recommendedPlaybook).toBe('crisis');
      expect(decision.shouldSwitch).toBe(true);
      expect(decision.urgency).toBe('immediate');
    });

    it('should not switch if already in crisis', () => {
      const decision = decidePlaybookSwitch('crisis', 'critical', null);

      expect(decision.shouldSwitch).toBe(false);
    });

    it('should recommend shadow for warning', () => {
      const decision = decidePlaybookSwitch('routine', 'warning', null);

      expect(decision.recommendedPlaybook).toBe('shadow');
      expect(decision.shouldSwitch).toBe(true);
      expect(decision.urgency).toBe('high');
    });

    it('should preemptively switch on phase transition', () => {
      const transition = {
        fromPhase: 'edge' as const,
        toPhase: 'chaotic' as const,
        probability: 0.8,
        timeToTransition: 3,
        indicators: ['rising chaos'],
      };

      const decision = decidePlaybookSwitch('routine', 'normal', transition);

      expect(decision.shouldSwitch).toBe(true);
      expect(decision.urgency).toBe('medium');
    });

    it('should not switch for normal alert without transition', () => {
      const decision = decidePlaybookSwitch('routine', 'normal', null);

      expect(decision.shouldSwitch).toBe(false);
      expect(decision.urgency).toBe('low');
    });
  });

  describe('adjustVoiceWeightsForAlert', () => {
    const baseWeights: Record<VoiceId, number> = {
      iskra: 1.0,
      kain: 0.5,
      pino: 0.5,
      sam: 0.5,
      anhantra: 0.5,
      huyndun: 0.3,
      iskriv: 0.5,
      maki: 0.3,
      sibyl: 0.2,
    };

    it('should not modify weights for normal alert', () => {
      const adjusted = adjustVoiceWeightsForAlert(baseWeights, 'normal');

      // Weights should be normalized but proportions preserved
      expect(adjusted.iskra).toBeGreaterThan(0);
    });

    it('should boost iskriv and sam for watch level', () => {
      const adjusted = adjustVoiceWeightsForAlert(baseWeights, 'watch');

      // After normalization, iskriv and sam should have higher relative weights
      const normalAdjusted = adjustVoiceWeightsForAlert(baseWeights, 'normal');

      // The ratios should reflect the boost
      expect(adjusted.iskriv / adjusted.iskra).toBeGreaterThan(
        normalAdjusted.iskriv / normalAdjusted.iskra
      );
    });

    it('should boost kain and anhantra for warning', () => {
      const adjusted = adjustVoiceWeightsForAlert(baseWeights, 'warning');

      expect(adjusted.kain).toBeGreaterThan(0);
      expect(adjusted.anhantra).toBeGreaterThan(0);
    });

    it('should set kain high for critical', () => {
      const adjusted = adjustVoiceWeightsForAlert(baseWeights, 'critical');

      // Kain should be dominant in critical
      expect(adjusted.kain).toBeGreaterThan(adjusted.pino);
    });

    it('should only allow sam and maki for lockdown', () => {
      const adjusted = adjustVoiceWeightsForAlert(baseWeights, 'lockdown');

      expect(adjusted.sam).toBeGreaterThan(0);
      expect(adjusted.maki).toBeGreaterThan(0);
      expect(adjusted.iskra).toBe(0);
      expect(adjusted.huyndun).toBe(0);
    });

    it('should return normalized weights (sum ~= 1)', () => {
      for (const level of ALL_ALERT_LEVELS) {
        const adjusted = adjustVoiceWeightsForAlert(baseWeights, level);
        const sum = Object.values(adjusted).reduce((a, b) => a + b, 0);

        // Allow for floating point errors
        expect(sum).toBeCloseTo(1, 5);
      }
    });
  });

  describe('adjustTemperatureForAlert', () => {
    it('should not adjust for normal', () => {
      expect(adjustTemperatureForAlert(0.7, 'normal')).toBe(0.7);
    });

    it('should decrease for watch', () => {
      expect(adjustTemperatureForAlert(0.7, 'watch')).toBe(0.6);
    });

    it('should decrease more for warning', () => {
      expect(adjustTemperatureForAlert(0.7, 'warning')).toBeCloseTo(0.5);
    });

    it('should decrease even more for critical', () => {
      expect(adjustTemperatureForAlert(0.7, 'critical')).toBeCloseTo(0.4);
    });

    it('should have minimum of 0.1', () => {
      expect(adjustTemperatureForAlert(0.2, 'lockdown')).toBe(0.1);
      expect(adjustTemperatureForAlert(0.1, 'critical')).toBe(0.1);
    });

    it('should progressively decrease with severity', () => {
      const base = 0.7;
      const normal = adjustTemperatureForAlert(base, 'normal');
      const watch = adjustTemperatureForAlert(base, 'watch');
      const warning = adjustTemperatureForAlert(base, 'warning');
      const critical = adjustTemperatureForAlert(base, 'critical');
      const lockdown = adjustTemperatureForAlert(base, 'lockdown');

      expect(normal).toBeGreaterThan(watch);
      expect(watch).toBeGreaterThan(warning);
      expect(warning).toBeGreaterThan(critical);
      expect(critical).toBeGreaterThan(lockdown);
    });
  });
});
