import { VOICES, VoiceID, IskraMetrics, DEFAULT_METRICS } from '@iskra/core';
import {
  QuantumStateVector,
  complex,
  modulus,
  fromPolar,
  add,
  normalizeProbabilities
} from '@iskra/math';

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
    VOICES.forEach(voice => {
      // Initial state: Equal probability, distinct phases
      this.states.set(voice.id, {
        amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
        phase: voice.quantum.basePhase,
        probability: 1 / 9
      });
    });
  }

  /**
   * Updates quantum states based on system metrics (Interference & Resonance)
   */
  public update(metrics: IskraMetrics) {
    this.time += 0.1; // Discrete time step

    VOICES.forEach(voice => {
      // Ensure state exists (it should from constructor)
      let state = this.states.get(voice.id);
      if (!state) {
         state = {
            amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
            phase: voice.quantum.basePhase,
            probability: 1 / 9
         };
         this.states.set(voice.id, state);
      }

      // 1. Resonance: Metrics amplify amplitude
      let resonanceFactor = 1.0;
      if (voice.quantum.resonance) {
        voice.quantum.resonance.forEach(metricKey => {
            const val = metrics[metricKey] || 0;
            // Constructive interference if metric is high
            if (val > 0.3) resonanceFactor += val * 2.0;
        });
      }

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
        probability: modulus(newAmplitude) ** 2
      });
    });

    this.normalize();
  }

  /**
   * Collapses the wave function to select a single voice
   */
  public collapse(): VoiceID {
    const voices = Array.from(this.states.keys());
    const probs = voices.map(id => this.states.get(id)!.probability);

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
  public getSuperposition(topN: number = 3): { id: VoiceID, prob: number }[] {
    return Array.from(this.states.entries())
      .map(([id, state]) => ({ id, prob: state.probability }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topN);
  }

  private normalize() {
    const totalProb = Array.from(this.states.values())
      .reduce((sum, s) => sum + s.probability, 0);

    if (totalProb === 0) return;

    // Use a map loop to update existing state objects or re-set them
    for (const [id, state] of this.states.entries()) {
      this.states.set(id, {
        ...state,
        probability: state.probability / totalProb
      });
    }
  }
}

export const voiceSystem = new VoiceQuantumField();
