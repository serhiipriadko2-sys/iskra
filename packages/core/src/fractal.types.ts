/**
 * Mathematical Indicators (Source of Truth types)
 */

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
