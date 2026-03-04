import { VOICES, type VoiceID, type IskraMetrics, type VoiceThresholds } from '@iskra/core';
import { type QuantumStateVector, modulus, fromPolar } from '@iskra/math';

/**
 * Convert thresholds from the voice manifest into a hard gate (0 or 1).
 * Scientific Turn rule: voice selection is probabilistic but threshold-constrained.
 */
function thresholdGate(metrics: IskraMetrics, thresholds: VoiceThresholds): number {
  for (const key of Object.keys(thresholds) as (keyof VoiceThresholds)[]) {
    const rule = thresholds[key];
    if (!rule) continue;

    const metricKey = key as keyof IskraMetrics;
    const value = metrics[metricKey] ?? 0;

    if (rule.min !== undefined && value < rule.min) return 0;
    if (rule.max !== undefined && value > rule.max) return 0;
  }
  return 1;
}

function calculateResonanceFactor(voiceId: VoiceID, metrics: IskraMetrics): number {
  switch (voiceId) {
    case 'KAIN':
      return 1 + metrics.pain * 3.0
    case 'HUYNDUN':
      return 1 + metrics.chaos * 3.0
    case 'ISKRIV':
      return 1 + metrics.drift * 3.5
    case 'MAKI':
      return 1 + metrics.trust + metrics.pain
    case 'SAM':
      return 1 + (1 - metrics.clarity) * 2.0
    case 'ANHANTRA':
      return 1 + (1 - metrics.trust) * 2.5 + metrics.silence_mass * 2.0
    case 'SIBYL':
      return 1 + (metrics.foresight ?? 0) * 2.0
    case 'PINO':
      return 1.5
    case 'ISKRA':
    default:
      return 1 + metrics.trust * 0.5
  }
}

/**
 * Voice Quantum Field
 * Manages the superposition of all 9 voices.
 * SPEC-002: Quantum State
 */
export class VoiceQuantumField {
  private states: Map<VoiceID, QuantumStateVector> = new Map();
  private time: number = 0;

  constructor() {
    this.initializeStates();
  }

  private initializeStates() {
    VOICES.forEach((voice) => {
      // Initial state: Equal probability, distinct phases
      this.states.set(voice.id, {
        amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
        phase: voice.quantum.basePhase,
        probability: 1 / 9,
      });
    });
  }

  /**
   * Updates quantum states based on system metrics (Interference & Resonance)
   */
  public update(metrics: IskraMetrics) {
    this.time += 0.1; // Discrete time step

    VOICES.forEach((voice) => {
      // Ensure state exists (it should from constructor)
      let state = this.states.get(voice.id);
      if (!state) {
        state = {
          amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
          phase: voice.quantum.basePhase,
          probability: 1 / 9,
        };
        this.states.set(voice.id, state);
      }

      // 0. Threshold gate (manifest constraint)
      const gate = thresholdGate(metrics, voice.thresholds);

      // 1. Resonance: Voice-specific formulas from manifest
      let resonanceFactor = calculateResonanceFactor(voice.id, metrics);

      // MAKI has explicit priority over KAIN when trust and pain are high.
      if (voice.id === 'KAIN' && metrics.trust >= 0.8 && metrics.pain >= 0.3) {
        resonanceFactor *= 0.25;
      }

      // Apply gate after resonance so we keep the same dynamics but respect constraints.
      resonanceFactor *= gate;

      // 2. Oscillation: Phase shifts over time
      const freq = voice.quantum.baseFreq;
      // High chaos accelerates phase shift (instability)
      const chaosMod = 1 + (metrics.chaos || 0) * 2;
      const newPhase = (state.phase + freq * chaosMod * 0.1) % (2 * Math.PI);

      // 3. Update State
      const newAmplitude = fromPolar(resonanceFactor, newPhase);

      this.states.set(voice.id, {
        amplitude: newAmplitude,
        phase: newPhase,
        probability: modulus(newAmplitude) ** 2,
      });
    });

    this.normalize();
  }

  /**
   * Collapses the wave function to select a single voice
   */
  public collapse(): VoiceID {
    const voices = Array.from(this.states.keys());
    const probs = voices.map((id) => this.states.get(id)!.probability);

    // Weighted random selection
    const sum = probs.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;

    for (let i = 0; i < voices.length; i++) {
      r -= probs[i];
      if (r <= 0) return voices[i];
    }

    return 'ISKRA'; // Fallback
  }

  /**
   * Returns the top N most probable voices (Superposition view)
   */
  public getSuperposition(topN: number = 3): { id: VoiceID; prob: number }[] {
    return Array.from(this.states.entries())
      .map(([id, state]) => ({ id, prob: state.probability }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topN);
  }

  private normalize() {
    const totalProb = Array.from(this.states.values()).reduce(
      (sum, s) => sum + s.probability,
      0
    );

    if (totalProb === 0) return;

    // Use a map loop to update existing state objects or re-set them
    for (const [id, state] of this.states.entries()) {
      this.states.set(id, {
        ...state,
        probability: state.probability / totalProb,
      });
    }
  }
}

export const voiceSystem = new VoiceQuantumField();
