import type { IskraMetrics } from './types.js';
import { validateSignal, validateKmax } from './utils/validation.js';

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

export function classifyPhase(D: number): SystemPhase {
  if (D < D_THRESHOLDS.stable.max) return 'stable';
  if (D < D_THRESHOLDS.chaotic.min) return 'edge';
  return 'chaotic';
}

export function calculateEdgeDistance(D: number): number {
  const edgeCenter = (D_THRESHOLDS.edgeOfChaos.min + D_THRESHOLDS.edgeOfChaos.max) / 2;
  return Math.abs(D - edgeCenter) / edgeCenter;
}

export function calculateCSI(metrics: IskraMetrics): number {
  const balance = 1 - Math.abs(metrics.chaos - (1 - metrics.clarity));
  const spread = (metrics.pain + metrics.trust + metrics.echo) / 3;
  return balance * 0.6 + spread * 0.4;
}

export function calculateEI(history: IskraMetrics[], windowSize: number = 20): number {
  if (history.length < windowSize) {
    return 0.5;
  }

  const recent = history.slice(-windowSize);
  const keys: (keyof IskraMetrics)[] = ['trust', 'clarity', 'chaos', 'drift'];

  const correlations: number[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];
      if (!keyA || !keyB) continue;
      const seriesA = recent.map(m => m[keyA] as number);
      const seriesB = recent.map(m => m[keyB] as number);
      correlations.push(Math.abs(pearsonCorrelation(seriesA, seriesB)));
    }
  }

  return correlations.reduce((a, b) => a + b, 0) / correlations.length;
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    if (xi === undefined || yi === undefined) continue;
    const dx = xi - meanX;
    const dy = yi - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : numerator / denom;
}

export function calculateNC(history: IskraMetrics[]): number {
  if (history.length < 5) return 0.5;

  const recent = history.slice(-10);
  const forward = calculateTrend(recent.map(m => m.trust));
  const backward = calculateTrend([...recent].reverse().map(m => m.trust));

  return 1 - Math.abs(forward - backward) / 2;
}

function calculateTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const vi = values[i];
    if (vi === undefined) continue;
    numerator += (i - xMean) * (vi - yMean);
    denominator += (i - xMean) ** 2;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateHFD(timeSeries: number[], kMax: number = 10): number {
  validateSignal(timeSeries);
  
  // Short-series fallback BEFORE kMax validation to preserve graceful degradation
  const N = timeSeries.length;
  if (N < 6) return 1.5;
  
  // Only validate kMax if we have enough data points
  if (N >= kMax * 2) {
    validateKmax(kMax, N);
  } else {
    // Use reduced kMax for shorter series
    kMax = Math.max(1, Math.floor(N / 2));
  }

  const L: number[] = [];

  for (let k = 1; k <= kMax; k++) {
    let Lk = 0;
    for (let m = 1; m <= k; m++) {
      let Lmk = 0;
      const limit = Math.floor((N - m) / k);

      for (let i = 1; i < limit; i++) {
        const idx1 = m + i * k - 1;
        const idx2 = m + (i - 1) * k - 1;
        const val1 = timeSeries[idx1];
        const val2 = timeSeries[idx2];
        if (val1 === undefined || val2 === undefined) continue;
        Lmk += Math.abs(val1 - val2);
      }

      Lmk = (Lmk * (N - 1)) / (k * limit * k);
      Lk += Lmk;
    }
    L.push(Lk / k);
  }

  const logX = L.map((_, i) => Math.log(1 / (i + 1)));
  const logY = L.map(l => Math.log(l + 0.001));

  return linearRegressionSlope(logX, logY);
}

export function calculateDFA(
  timeSeries: number[],
  minBox: number = 4,
  maxBox: number = 64
): number {
  validateSignal(timeSeries);
  
  const N = timeSeries.length;
  if (N < maxBox) return 0.5;

  const mean = timeSeries.reduce((a, b) => a + b, 0) / N;
  const integrated: number[] = [];
  let sum = 0;
  for (const x of timeSeries) {
    sum += x - mean;
    integrated.push(sum);
  }

  const boxSizes: number[] = [];
  const fluctuations: number[] = [];

  for (let s = minBox; s <= maxBox; s = Math.floor(s * 1.5)) {
    const numBoxes = Math.floor(N / s);
    if (numBoxes < 2) continue;

    let F2 = 0;
    for (let b = 0; b < numBoxes; b++) {
      const segment = integrated.slice(b * s, (b + 1) * s);
      const trend = linearFit(segment);
      const residuals = segment.map((y, i) => y - (trend[i] ?? 0));
      F2 += residuals.reduce((sum, r) => sum + r * r, 0) / s;
    }

    boxSizes.push(s);
    fluctuations.push(Math.sqrt(F2 / numBoxes));
  }

  if (boxSizes.length < 2) return 0.5;

  return linearRegressionSlope(
    boxSizes.map(s => Math.log(s)),
    fluctuations.map(f => Math.log(f + 0.001))
  );
}

function linearFit(values: number[]): number[] {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let slope = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const vi = values[i];
    if (vi === undefined) continue;
    slope += (i - xMean) * (vi - yMean);
    denominator += (i - xMean) ** 2;
  }

  slope = denominator === 0 ? 0 : slope / denominator;
  const intercept = yMean - slope * xMean;

  return values.map((_, i) => intercept + slope * i);
}

function linearRegressionSlope(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    if (xi === undefined || yi === undefined) continue;
    numerator += (xi - xMean) * (yi - yMean);
    denominator += (xi - xMean) ** 2;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateFractalIndicators(
  history: IskraMetrics[],
  windowSize: number = 50
): FractalIndicators {
  const recent = history.slice(-windowSize);

  const chaosSeries = recent.map(m => m.chaos);
  const claritySeries = recent.map(m => m.clarity);
  const driftSeries = recent.map(m => m.drift);
  const trustSeries = recent.map(m => m.trust);

  const D_chaos = calculateHFD(chaosSeries);
  const D_clarity = calculateHFD(claritySeries);
  const D_drift = calculateHFD(driftSeries);
  const H_trust = calculateDFA(trustSeries);

  const complexityIndex = (D_chaos + D_drift) / 2 - D_clarity * 0.5;
  const edgeDistance = calculateEdgeDistance(D_chaos);

  return {
    D_chaos,
    D_clarity,
    D_drift,
    H_trust,
    complexityIndex: Math.max(0, Math.min(1, complexityIndex)),
    edgeDistance,
  };
}

export function calculateQuantumIndicators(
  metrics: IskraMetrics,
  history: IskraMetrics[]
): QuantumIndicators {
  return {
    CSI: calculateCSI(metrics),
    EI: calculateEI(history),
    NC: calculateNC(history),
  };
}
