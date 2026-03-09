import {
  VOICES,
  VOICE_RUNTIME_CONFIG,
  VoiceComputationTrace,
  VoiceID,
  IskraMetrics,
  VoiceThresholds,
} from '@iskra/core'
import { QuantumStateVector, modulus, fromPolar } from '@iskra/math'

const RHYTHM_NORMALIZATION_MAX = 120

const normalizeMetric = (metricKey: keyof IskraMetrics, value: number | undefined): number => {
  if (metricKey === 'rhythm') {
    return Math.min(1, (value ?? 0) / RHYTHM_NORMALIZATION_MAX)
  }

  return value ?? 0
}

const isThresholdSatisfied = (
  metricKey: keyof VoiceThresholds,
  thresholds: VoiceThresholds,
  metrics: IskraMetrics,
): boolean => {
  const threshold = thresholds[metricKey]
  if (!threshold) {
    return true
  }

  const metricValue = metrics[metricKey] ?? 0

  if (typeof threshold.min === 'number' && metricValue < threshold.min) {
    return false
  }

  if (typeof threshold.max === 'number' && metricValue > threshold.max) {
    return false
  }

  return true
}

const passesThresholds = (thresholds: VoiceThresholds, metrics: IskraMetrics): boolean => {
  const keys = Object.keys(thresholds) as (keyof VoiceThresholds)[]
  return keys.every((metricKey) => isThresholdSatisfied(metricKey, thresholds, metrics))
}

const getPriorityMultipliers = (metrics: IskraMetrics): Record<VoiceID, number> => {
  const multipliers: Record<VoiceID, number> = {
    ISKRA: 1,
    KAIN: 1,
    PINO: 1,
    SAM: 1,
    ANHANTRA: 1,
    HUYNDUN: 1,
    ISKRIV: 1,
    MAKI: 1,
    SIBYL: 1,
  }

  VOICE_RUNTIME_CONFIG.priorityRules.forEach((rule) => {
    if (!passesThresholds(rule.conditions, metrics)) {
      return
    }

    multipliers[rule.winner] *= rule.winnerMultiplier
    multipliers[rule.loser] *= rule.loserMultiplier
  })

  return multipliers
}


/**
 * Voice Quantum Field
 * Manages the superposition of all 9 voices.
 * SPEC-002: Quantum State
 */
export class VoiceQuantumField {
  private states: Map<VoiceID, QuantumStateVector> = new Map()
  private time: number = 0
  private lastTrace: VoiceComputationTrace | null = null

  constructor() {
    this.initializeStates()
  }

  private initializeStates() {
    VOICES.forEach((voice) => {
      this.states.set(voice.id, {
        amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
        phase: voice.quantum.basePhase,
        probability: 1 / 9,
      })
    })
  }

  /**
   * Updates quantum states based on system metrics (Interference & Resonance)
   */
  public update(metrics: IskraMetrics) {
    this.time += 0.1
    const priorityMultipliers = getPriorityMultipliers(metrics)
    const traces: VoiceComputationTrace['voices'] = []

    VOICES.forEach((voice) => {
      const previousState =
        this.states.get(voice.id) ?? {
          amplitude: fromPolar(1 / 9, voice.quantum.basePhase),
          phase: voice.quantum.basePhase,
          probability: 1 / 9,
        }

      const thresholdMatched = passesThresholds(voice.thresholds, metrics)
      const {
        thresholdBaseFactor,
        thresholdPenaltyFactor,
        minActivationMetric,
        resonanceBoostMultiplier,
      } = VOICE_RUNTIME_CONFIG.weights

      let resonanceFactor = thresholdMatched ? thresholdBaseFactor : thresholdPenaltyFactor
      const resonanceContributions: VoiceComputationTrace['voices'][number]['resonanceContributions'] = []

      if (thresholdMatched && voice.quantum.resonance) {
        voice.quantum.resonance.forEach((metricKey) => {
          const metricValue = normalizeMetric(metricKey, metrics[metricKey])

          if (metricValue > minActivationMetric) {
            const contribution = metricValue * resonanceBoostMultiplier
            resonanceFactor += contribution
            resonanceContributions.push({
              metric: metricKey,
              normalizedValue: metricValue,
              contribution,
            })
          }
        })
      }

      resonanceFactor *= priorityMultipliers[voice.id]

      const freq = voice.quantum.baseFreq
      const chaosMod = 1 + (metrics.chaos || 0) * 2
      const newPhase = (previousState.phase + freq * chaosMod * 0.1) % (2 * Math.PI)

      const newAmplitude = fromPolar(resonanceFactor, newPhase)

      this.states.set(voice.id, {
        amplitude: newAmplitude,
        phase: newPhase,
        probability: modulus(newAmplitude) ** 2,
      })

      traces.push({
        id: voice.id,
        thresholdMatched,
        priorityMultiplier: priorityMultipliers[voice.id],
        resonanceContributions,
        resonanceFactor,
        phase: newPhase,
        probabilityBeforeNormalization: modulus(newAmplitude) ** 2,
      })
    })

    this.normalize()

    this.lastTrace = {
      time: this.time,
      metrics,
      priorityMultipliers,
      voices: traces.map((trace) => ({
        ...trace,
        probabilityAfterNormalization: this.states.get(trace.id)?.probability ?? 0,
      })),
    }
  }

  public getLastTrace(): VoiceComputationTrace | null {
    return this.lastTrace
  }

  /**
   * Collapses the wave function to select a single voice
   */
  public collapse(): VoiceID {
    const voices = Array.from(this.states.keys())
    const probs = voices.map((id) => this.states.get(id)!.probability)

    const sum = probs.reduce((a, b) => a + b, 0)
    let r = Math.random() * sum

    for (let i = 0; i < voices.length; i++) {
      r -= probs[i]
      if (r <= 0) {
        return voices[i]
      }
    }

    return 'ISKRA'
  }

  /**
   * Returns the top N most probable voices (Superposition view)
   */
  public getSuperposition(topN: number = 3): { id: VoiceID; prob: number }[] {
    return Array.from(this.states.entries())
      .map(([id, state]) => ({ id, prob: state.probability }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topN)
  }

  private normalize() {
    const totalProb = Array.from(this.states.values()).reduce((sum, s) => sum + s.probability, 0)

    if (totalProb === 0) {
      return
    }

    for (const [id, state] of this.states.entries()) {
      this.states.set(id, {
        ...state,
        probability: state.probability / totalProb,
      })
    }
  }
}

export const voiceSystem = new VoiceQuantumField()
