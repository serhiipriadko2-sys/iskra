import { IskraMetrics, DEFAULT_METRICS, MantraNode } from '@iskra/core';
import {
  calculateHFD,
  calculateShannonEntropy,
  complex,
  interference,
  QuantumStateVector
} from '@iskra/math';
import { Explainable, ExplainStep } from '../types/explainable';

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

  private computeNextMetrics(
    modifiers: Partial<IskraMetrics>,
    text?: string
  ): {
    next: IskraMetrics;
    entropy: number | null;
    fractalDimension: number;
    appliedModifiers: Record<string, number>;
  } {
    const current = this.getCurrentMetrics();
    const next: IskraMetrics = { ...current };
    const appliedModifiers: Record<string, number> = {};

    // Apply modifiers additively
    for (const key in modifiers) {
      if (Object.prototype.hasOwnProperty.call(modifiers, key)) {
        const metricKey = key as keyof IskraMetrics;
        const val = modifiers[metricKey];
        if (typeof val === 'number') {
          const currentVal = next[metricKey] || 0;
          next[metricKey] = Math.max(0, Math.min(1, currentVal + val));
          appliedModifiers[metricKey] = val;
        }
      }
    }

    let entropy: number | null = null;
    if (text) {
      entropy = calculateShannonEntropy(text);
      if (entropy < 2.0) next.drift = Math.min(1.0, next.drift + 0.1);
      if (entropy > 5.0) next.chaos = Math.min(1.0, next.chaos + 0.1);
    }

    const chaosSeries = this.history.map(m => m.chaos);
    const driftSeries = this.history.map(m => m.drift);

    const dChaos = chaosSeries.length > 5 ? calculateHFD(chaosSeries) : 1.5;
    const dDrift = driftSeries.length > 5 ? calculateHFD(driftSeries) : 1.5;
    const fractalDimension = (dChaos + dDrift) / 2;

    if (fractalDimension > 1.6 && fractalDimension < 1.8) {
      next.clarity = Math.min(1.0, next.clarity + 0.05);
    }

    return { next, entropy, fractalDimension, appliedModifiers };
  }

  /**
   * Updates metrics based on new input.
   * Modifiers are ADDITIVE to current state, not replacements.
   */
  public update(modifiers: Partial<IskraMetrics>, text?: string): IskraMetrics {
    const computed = this.computeNextMetrics(modifiers, text);

    this.history.push(computed.next);
    if (this.history.length > 100) this.history.shift();

    return computed.next;
  }

  /**
   * XCode-style explainable update for Scientific Turn metrics pipeline.
   */
  public updateExplainable(
    modifiers: Partial<IskraMetrics>,
    text?: string
  ): Explainable<IskraMetrics> {
    const computed = this.computeNextMetrics(modifiers, text);

    this.history.push(computed.next);
    if (this.history.length > 100) this.history.shift();

    const how: ExplainStep[] = [
      {
        label: 'apply_modifiers',
        formula: 'next[k] = clamp01(current[k] + delta[k])',
        inputs: { modifier_count: Object.keys(computed.appliedModifiers).length },
        output: Object.keys(computed.appliedModifiers).length,
        refs: [{ kind: 'project', ref: 'packages/engine/src/services/metricsService.ts' }]
      },
      {
        label: 'entropy_feedback',
        formula: 'if entropy<2 => drift+0.1; if entropy>5 => chaos+0.1',
        inputs: {
          entropy: computed.entropy,
          has_text: Boolean(text)
        },
        output: computed.entropy,
        refs: [{ kind: 'canon', ref: 'AGENTS.md#3-scientific-turn-vω50' }]
      },
      {
        label: 'fractal_feedback',
        formula: 'D=(D_chaos + D_drift)/2; if 1.6<D<1.8 => clarity+0.05',
        inputs: {
          history_size: this.history.length,
          fractal_dimension: Number(computed.fractalDimension.toFixed(6))
        },
        output: Number(computed.fractalDimension.toFixed(6)),
        refs: [{ kind: 'canon', ref: 'AGENTS.md#3-scientific-turn-vω50' }]
      }
    ];

    return {
      value: computed.next,
      how,
      contracts_checked: [
        'how.length > 0',
        'metrics clamped to [0,1] where modifiers applied',
        'history window <= 100'
      ],
      evidence: [
        { kind: 'canon', ref: 'system/xcode_explainable_code.md' },
        { kind: 'project', ref: 'packages/engine/src/services/metricsService.ts' }
      ]
    };
  }

  /**
   * Adjusts metrics based on retrieved memories
   * The Psychodynamic Feedback Loop: Past trauma affects current state.
   */
  public processMemoryImpact(memories: MantraNode[]): IskraMetrics {
    if (memories.length === 0) return this.getCurrentMetrics();

    const current = this.getCurrentMetrics();
    const next: IskraMetrics = { ...current };

    let totalEntropy = 0;
    let painImpact = 0;
    let trustImpact = 0;

    memories.forEach(m => {
      if (m.fractal) {
        totalEntropy += m.fractal.entropy;

        if (m.fractal.dominantVoice === 'KAIN') painImpact += 0.1;
        if (m.fractal.dominantVoice === 'MAKI') trustImpact += 0.1;
        if (m.fractal.dominantVoice === 'HUYNDUN') next.chaos = Math.min(1.0, next.chaos + 0.1);
      }
    });

    const avgEntropy = totalEntropy / memories.length;

    if (avgEntropy > 0.7) {
      next.drift = Math.min(1.0, next.drift + 0.15);
    }

    next.pain = Math.min(1.0, next.pain + painImpact);
    next.trust = Math.min(1.0, next.trust + trustImpact);

    this.history.push(next);
    if (this.history.length > 100) this.history.shift();

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
    const v2State = this.quantumStates.get(voice2) || { amplitude: complex(1, 0), phase: Math.PI, probability: 1 };

    return interference(v1State, v2State);
  }
}

export const metricsEngine = new MetricsEngine();
