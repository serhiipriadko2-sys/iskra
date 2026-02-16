import { IskraMetrics, DEFAULT_METRICS } from '@iskra/core';
import {
  calculateHFD,
  calculateDFA,
  calculateShannonEntropy,
  complex,
  interference,
  QuantumStateVector
} from '@iskra/math';

/**
 * MetricsEngine Service
 * Calculates the 11D Metric Tensor and integrates Scientific Modules (Phase I & II)
 */
export class MetricsEngine {
  private history: IskraMetrics[] = [];
  private quantumStates: Map<string, QuantumStateVector> = new Map();

  constructor(initialMetrics: IskraMetrics = DEFAULT_METRICS) {
    this.history.push(initialMetrics);
  }

  /**
   * Updates metrics based on new input
   */
  public update(newMetrics: Partial<IskraMetrics>, text?: string): IskraMetrics {
    const current = this.getCurrentMetrics();
    const next: IskraMetrics = { ...current, ...newMetrics };

    // Calculate Entropy if text is provided
    if (text) {
      const h = calculateShannonEntropy(text);
      // Feedback loop: Low entropy (loop) increases drift; High entropy (chaos) increases chaos
      if (h < 2.0) next.drift = Math.min(1.0, next.drift + 0.1);
      if (h > 5.0) next.chaos = Math.min(1.0, next.chaos + 0.1);
    }

    // Calculate Fractal Dimensions
    const chaosSeries = this.history.map(m => m.chaos);
    const driftSeries = this.history.map(m => m.drift);

    const D_chaos = calculateHFD(chaosSeries);
    const D_drift = calculateHFD(driftSeries);
    const FractalDimension = (D_chaos + D_drift) / 2;

    // Feedback: High fractal dimension stabilizes the system (Self-Organized Criticality)
    if (FractalDimension > 1.6 && FractalDimension < 1.8) {
      next.clarity = Math.min(1.0, next.clarity + 0.05); // Insight
    }

    this.history.push(next);
    if (this.history.length > 100) this.history.shift(); // Keep window manageable

    return next;
  }

  public getCurrentMetrics(): IskraMetrics {
    return this.history[this.history.length - 1] || DEFAULT_METRICS;
  }

  public getHistory(): IskraMetrics[] {
    return [...this.history];
  }

  /**
   * Calculates Quantum Interference between two voices
   * SPEC-002: Voice Interference
   */
  public calculateVoiceInterference(voice1: string, voice2: string): number {
    const v1State = this.quantumStates.get(voice1) || { amplitude: complex(1, 0), phase: 0, probability: 1 };
    const v2State = this.quantumStates.get(voice2) || { amplitude: complex(1, 0), phase: Math.PI, probability: 1 }; // Default opposition

    return interference(v1State, v2State);
  }
}

export const metricsEngine = new MetricsEngine();
