import type { IskraMetrics } from './metrics.js';

export interface MetricTimeSeries {
  metric: keyof IskraMetrics;
  values: number[];
  timestamps: string[];
  windowSize: number;
}

export interface FractalIndicators {
  D_chaos: number;
  D_clarity: number;
  D_drift: number;
  H_trust: number;
  complexityIndex: number;
  edgeDistance: number;
}

export interface QuantumIndicators {
  CSI: number;
  EI: number;
  NC: number;
}

export type SystemPhase = 'stable' | 'edge' | 'chaotic';

export const D_THRESHOLDS = {
  stable: { min: 1.0, max: 1.4 },
  edgeOfChaos: { min: 1.4, max: 1.6 },
  chaotic: { min: 1.6, max: 2.0 },
  critical: 1.8,
} as const;

export const H_THRESHOLDS = {
  antiPersistent: { min: 0.0, max: 0.4 },
  random: { min: 0.4, max: 0.6 },
  persistent: { min: 0.6, max: 1.0 },
} as const;

export const QUANTUM_THRESHOLDS = {
  CSI: {
    collapsed: { min: 0.0, max: 0.3 },
    balanced: { min: 0.3, max: 0.7 },
    superposed: { min: 0.7, max: 1.0 },
  },
  EI: {
    decoupled: { min: 0.0, max: 0.3 },
    normal: { min: 0.3, max: 0.6 },
    entangled: { min: 0.6, max: 1.0 },
  },
} as const;
