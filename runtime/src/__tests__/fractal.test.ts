import { describe, it, expect } from 'vitest';
import {
  D_THRESHOLDS,
  H_THRESHOLDS,
  QUANTUM_THRESHOLDS,
  classifyPhase,
  calculateEdgeDistance,
  calculateCSI,
  calculateEI,
  calculateNC,
  calculateHFD,
  calculateDFA,
  calculateFractalIndicators,
  calculateQuantumIndicators,
  type IskraMetrics,
} from '../types/fractal.js';
import { DEFAULT_METRICS } from '../types/metrics.js';

describe('fractal', () => {
  // Helper to create metrics history
  const createMetricsHistory = (length: number, variation: number = 0.1): IskraMetrics[] => {
    return Array.from({ length }, (_, i) => ({
      ...DEFAULT_METRICS,
      trust: 0.5 + Math.sin(i * 0.3) * variation,
      clarity: 0.6 + Math.cos(i * 0.2) * variation,
      chaos: 0.3 + Math.sin(i * 0.4) * variation,
      drift: 0.2 + Math.cos(i * 0.5) * variation,
    }));
  };

  describe('D_THRESHOLDS', () => {
    it('should define stable range', () => {
      expect(D_THRESHOLDS.stable.min).toBe(1.0);
      expect(D_THRESHOLDS.stable.max).toBe(1.4);
    });

    it('should define edge of chaos range', () => {
      expect(D_THRESHOLDS.edgeOfChaos.min).toBe(1.4);
      expect(D_THRESHOLDS.edgeOfChaos.max).toBe(1.6);
    });

    it('should define chaotic range', () => {
      expect(D_THRESHOLDS.chaotic.min).toBe(1.6);
      expect(D_THRESHOLDS.chaotic.max).toBe(2.0);
    });

    it('should have critical threshold', () => {
      expect(D_THRESHOLDS.critical).toBe(1.8);
    });
  });

  describe('H_THRESHOLDS', () => {
    it('should define anti-persistent range', () => {
      expect(H_THRESHOLDS.antiPersistent.max).toBe(0.4);
    });

    it('should define random range', () => {
      expect(H_THRESHOLDS.random.min).toBe(0.4);
      expect(H_THRESHOLDS.random.max).toBe(0.6);
    });

    it('should define persistent range', () => {
      expect(H_THRESHOLDS.persistent.min).toBe(0.6);
    });
  });

  describe('QUANTUM_THRESHOLDS', () => {
    it('should have CSI thresholds', () => {
      expect(QUANTUM_THRESHOLDS.CSI.collapsed).toBeDefined();
      expect(QUANTUM_THRESHOLDS.CSI.balanced).toBeDefined();
      expect(QUANTUM_THRESHOLDS.CSI.superposed).toBeDefined();
    });

    it('should have EI thresholds', () => {
      expect(QUANTUM_THRESHOLDS.EI.decoupled).toBeDefined();
      expect(QUANTUM_THRESHOLDS.EI.normal).toBeDefined();
      expect(QUANTUM_THRESHOLDS.EI.entangled).toBeDefined();
    });
  });

  describe('classifyPhase', () => {
    it('should return stable for D < 1.4', () => {
      expect(classifyPhase(1.0)).toBe('stable');
      expect(classifyPhase(1.3)).toBe('stable');
      expect(classifyPhase(1.39)).toBe('stable');
    });

    it('should return edge for 1.4 <= D < 1.6', () => {
      expect(classifyPhase(1.4)).toBe('edge');
      expect(classifyPhase(1.5)).toBe('edge');
      expect(classifyPhase(1.59)).toBe('edge');
    });

    it('should return chaotic for D >= 1.6', () => {
      expect(classifyPhase(1.6)).toBe('chaotic');
      expect(classifyPhase(1.8)).toBe('chaotic');
      expect(classifyPhase(2.0)).toBe('chaotic');
    });
  });

  describe('calculateEdgeDistance', () => {
    it('should return 0 at edge center (1.5)', () => {
      const distance = calculateEdgeDistance(1.5);
      expect(distance).toBeCloseTo(0, 1);
    });

    it('should increase as D moves away from edge', () => {
      const atEdge = calculateEdgeDistance(1.5);
      const belowEdge = calculateEdgeDistance(1.2);
      const aboveEdge = calculateEdgeDistance(1.8);

      expect(belowEdge).toBeGreaterThan(atEdge);
      expect(aboveEdge).toBeGreaterThan(atEdge);
    });

    it('should be symmetric around edge center', () => {
      const below = calculateEdgeDistance(1.3);
      const above = calculateEdgeDistance(1.7);

      expect(below).toBeCloseTo(above, 1);
    });
  });

  describe('calculateCSI', () => {
    it('should return value between 0 and 1', () => {
      const csi = calculateCSI(DEFAULT_METRICS);
      expect(csi).toBeGreaterThanOrEqual(0);
      expect(csi).toBeLessThanOrEqual(1);
    });

    it('should be higher for balanced metrics', () => {
      const balanced: IskraMetrics = {
        ...DEFAULT_METRICS,
        chaos: 0.3,
        clarity: 0.7,
        pain: 0.3,
        trust: 0.5,
        echo: 0.4,
      };

      const extreme: IskraMetrics = {
        ...DEFAULT_METRICS,
        chaos: 0.9,
        clarity: 0.1,
        pain: 0.1,
        trust: 0.1,
        echo: 0.1,
      };

      const csiBalanced = calculateCSI(balanced);
      const csiExtreme = calculateCSI(extreme);

      expect(csiBalanced).toBeGreaterThan(csiExtreme);
    });
  });

  describe('calculateEI', () => {
    it('should return 0.5 for insufficient history', () => {
      const shortHistory = createMetricsHistory(5);
      const ei = calculateEI(shortHistory, 20);
      expect(ei).toBe(0.5);
    });

    it('should calculate for sufficient history', () => {
      const history = createMetricsHistory(30);
      const ei = calculateEI(history, 20);

      expect(ei).toBeGreaterThanOrEqual(0);
      expect(ei).toBeLessThanOrEqual(1);
    });

    it('should detect correlation in related metrics', () => {
      // Create highly correlated history
      const correlatedHistory: IskraMetrics[] = Array.from({ length: 30 }, (_, i) => ({
        ...DEFAULT_METRICS,
        trust: 0.5 + i * 0.01,
        clarity: 0.5 + i * 0.01,
        chaos: 0.5 - i * 0.01,
        drift: 0.5 - i * 0.01,
      }));

      const ei = calculateEI(correlatedHistory, 20);
      expect(ei).toBeGreaterThan(0.3); // Should show some correlation
    });
  });

  describe('calculateNC', () => {
    it('should return 0.5 for insufficient history', () => {
      const shortHistory = createMetricsHistory(3);
      const nc = calculateNC(shortHistory);
      expect(nc).toBe(0.5);
    });

    it('should return value between 0 and 1 for sufficient history', () => {
      const history = createMetricsHistory(15);
      const nc = calculateNC(history);

      expect(nc).toBeGreaterThanOrEqual(0);
      expect(nc).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateHFD', () => {
    it('should return 1.5 for insufficient data', () => {
      const shortSeries = [1, 2, 3];
      const hfd = calculateHFD(shortSeries);
      expect(hfd).toBe(1.5);
    });

    it('should return value for sufficient data', () => {
      const series = Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.5) + Math.random() * 0.1);
      const hfd = calculateHFD(series);

      expect(typeof hfd).toBe('number');
      expect(isNaN(hfd)).toBe(false);
    });

    it('should detect higher complexity in noisy data', () => {
      // Smooth series
      const smooth = Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.1));

      // Noisy series
      const noisy = Array.from({ length: 50 }, (_, i) => Math.sin(i * 0.1) + Math.random() * 2);

      const hfdSmooth = calculateHFD(smooth);
      const hfdNoisy = calculateHFD(noisy);

      // Noisy data should have higher fractal dimension
      expect(hfdNoisy).toBeGreaterThan(hfdSmooth);
    });
  });

  describe('calculateDFA', () => {
    it('should return 0.5 for insufficient data', () => {
      const shortSeries = Array.from({ length: 10 }, () => Math.random());
      const dfa = calculateDFA(shortSeries);
      expect(dfa).toBe(0.5);
    });

    it('should return value for sufficient data', () => {
      const series = Array.from({ length: 100 }, (_, i) => Math.sin(i * 0.3) + Math.random() * 0.1);
      const dfa = calculateDFA(series);

      expect(typeof dfa).toBe('number');
      expect(isNaN(dfa)).toBe(false);
    });
  });

  describe('calculateFractalIndicators', () => {
    it('should return all required indicators', () => {
      const history = createMetricsHistory(60);
      const indicators = calculateFractalIndicators(history);

      expect(indicators).toHaveProperty('D_chaos');
      expect(indicators).toHaveProperty('D_clarity');
      expect(indicators).toHaveProperty('D_drift');
      expect(indicators).toHaveProperty('H_trust');
      expect(indicators).toHaveProperty('complexityIndex');
      expect(indicators).toHaveProperty('edgeDistance');
    });

    it('should have complexityIndex between 0 and 1', () => {
      const history = createMetricsHistory(60);
      const indicators = calculateFractalIndicators(history);

      expect(indicators.complexityIndex).toBeGreaterThanOrEqual(0);
      expect(indicators.complexityIndex).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateQuantumIndicators', () => {
    it('should return CSI, EI, and NC', () => {
      const history = createMetricsHistory(30);
      const quantum = calculateQuantumIndicators(DEFAULT_METRICS, history);

      expect(quantum).toHaveProperty('CSI');
      expect(quantum).toHaveProperty('EI');
      expect(quantum).toHaveProperty('NC');
    });

    it('should have all values as numbers', () => {
      const history = createMetricsHistory(30);
      const quantum = calculateQuantumIndicators(DEFAULT_METRICS, history);

      expect(typeof quantum.CSI).toBe('number');
      expect(typeof quantum.EI).toBe('number');
      expect(typeof quantum.NC).toBe('number');
    });
  });
});
