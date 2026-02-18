import { describe, it, expect } from 'vitest'
import fc, { Arbitrary } from 'fast-check'

import { VoiceQuantumField } from '../../services/voiceSystem.js'
import { DEFAULT_METRICS, VOICES, VOICE_RUNTIME_CONFIG } from '@iskra/core'
import type { IskraMetrics, VoiceID, VoiceThresholds } from '@iskra/core'

const VALID_METRIC_KEYS: (keyof VoiceThresholds)[] = [
  'rhythm',
  'trust',
  'pain',
  'chaos',
  'drift',
  'clarity',
  'silence_mass',
  'foresight',
]

const getMetricDomain = (metricKey: keyof VoiceThresholds): { min: number; max: number } => {
  if (metricKey === 'rhythm') {
    return { min: 0, max: 100 }
  }

  return { min: 0, max: 1 }
}

const getProbability = (metrics: IskraMetrics, voiceId: VoiceID): number => {
  const field = new VoiceQuantumField()
  field.update(metrics)
  const states = field.getSuperposition(9)
  return states.find((state) => state.id === voiceId)?.prob ?? 0
}

const isThresholdSatisfied = (
  metricKey: keyof VoiceThresholds,
  threshold: { min?: number; max?: number },
  metrics: IskraMetrics,
): boolean => {
  const metricValue = metrics[metricKey] ?? 0

  if (typeof threshold.min === 'number' && metricValue < threshold.min) {
    return false
  }

  if (typeof threshold.max === 'number' && metricValue > threshold.max) {
    return false
  }

  return true
}

const passesThresholds = (conditions: VoiceThresholds, metrics: IskraMetrics): boolean => {
  const entries = Object.entries(conditions) as [keyof VoiceThresholds, { min?: number; max?: number }][]

  return entries.every(([metricKey, threshold]) => isThresholdSatisfied(metricKey, threshold, metrics))
}

const buildThresholdArbitrary = (
  metricKey: keyof VoiceThresholds,
  threshold: { min?: number; max?: number },
): Arbitrary<number> => {
  const domain = getMetricDomain(metricKey)
  const min = threshold.min ?? domain.min
  const max = threshold.max ?? domain.max

  return fc.double({ min, max, noNaN: true, noDefaultInfinity: true })
}

const buildMetricsArbitrary = (conditions: VoiceThresholds): Arbitrary<IskraMetrics> => {
  const baseRecord = {
    rhythm: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
    trust: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    pain: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    chaos: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    drift: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    echo: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    clarity: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    silence_mass: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    mirror_sync: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    interrupt: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    ctxSwitch: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
    foresight: fc.double({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
  }

  const entries = Object.entries(conditions) as [keyof VoiceThresholds, { min?: number; max?: number }][]

  entries.forEach(([metricKey, threshold]) => {
    if (!threshold || !VALID_METRIC_KEYS.includes(metricKey)) {
      return
    }

    if (metricKey === 'foresight') {
      baseRecord.foresight = buildThresholdArbitrary(metricKey, threshold)
      return
    }

    if (metricKey === 'rhythm') {
      baseRecord.rhythm = buildThresholdArbitrary(metricKey, threshold)
      return
    }

    baseRecord[metricKey] = buildThresholdArbitrary(metricKey, threshold)
  })

  return fc.record(baseRecord)
}

const violateThresholdValue = (
  metricKey: keyof VoiceThresholds,
  threshold: { min?: number; max?: number },
): number => {
  const EPSILON = metricKey === 'rhythm' ? 1 : 0.01
  const domain = getMetricDomain(metricKey)

  if (typeof threshold.min === 'number' && threshold.min > domain.min) {
    return Math.max(domain.min, threshold.min - EPSILON)
  }

  if (typeof threshold.max === 'number' && threshold.max < domain.max) {
    return Math.min(domain.max, threshold.max + EPSILON)
  }

  if (typeof threshold.min === 'number') {
    return domain.min
  }

  if (typeof threshold.max === 'number') {
    return domain.max
  }

  return domain.min
}


const applyRuleConditions = (metrics: IskraMetrics, conditions: VoiceThresholds): IskraMetrics => {
  const nextMetrics: IskraMetrics = { ...metrics }
  const entries = Object.entries(conditions) as [keyof VoiceThresholds, { min?: number; max?: number }][]

  entries.forEach(([metricKey, threshold]) => {
    const currentValue = nextMetrics[metricKey] ?? 0

    if (typeof threshold.min === 'number' && currentValue < threshold.min) {
      nextMetrics[metricKey] = threshold.min
      return
    }

    if (typeof threshold.max === 'number' && currentValue > threshold.max) {
      nextMetrics[metricKey] = threshold.max
    }
  })

  return nextMetrics
}

const buildMetricsViolatingRuleArbitrary = (conditions: VoiceThresholds): Arbitrary<IskraMetrics> => {
  const entries = Object.entries(conditions) as [keyof VoiceThresholds, { min?: number; max?: number }][]
  const violableEntries = entries.filter(([metricKey]) => VALID_METRIC_KEYS.includes(metricKey))

  if (violableEntries.length === 0) {
    return buildMetricsArbitrary(conditions)
  }

  const [violationMetric, violationThreshold] = violableEntries[0]

  return buildMetricsArbitrary(conditions).map((metrics) => {
    const violatedValue = violateThresholdValue(violationMetric, violationThreshold)
    return {
      ...metrics,
      [violationMetric]: violatedValue,
    }
  })
}

describe('VoiceQuantumField property-based invariants', () => {
  it('normalizes probabilities to 1.0 for generated metrics', () => {
    fc.assert(
      fc.property(buildMetricsArbitrary({}), (metrics) => {
        const field = new VoiceQuantumField()
        field.update(metrics)
        const sum = field.getSuperposition(9).reduce((acc, voice) => acc + voice.prob, 0)
        expect(sum).toBeCloseTo(1, 10)
      }),
      { numRuns: 100 },
    )
  })

  it('keeps priorityRules aligned with existing voices manifest', () => {
    const voiceIds = new Set<VoiceID>(VOICES.map((voice) => voice.id))

    VOICE_RUNTIME_CONFIG.priorityRules.forEach((rule) => {
      expect(voiceIds.has(rule.winner)).toBe(true)
      expect(voiceIds.has(rule.loser)).toBe(true)
      expect(rule.winner).not.toBe(rule.loser)
      expect(rule.winnerMultiplier).toBeGreaterThan(1)
      expect(rule.loserMultiplier).toBeLessThan(1)
      expect(Object.keys(rule.conditions).length).toBeGreaterThan(0)
    })
  })

  VOICE_RUNTIME_CONFIG.priorityRules.forEach((rule) => {
    it(`enforces priority rule ${rule.winner} > ${rule.loser} when conditions are met`, () => {
      fc.assert(
        fc.property(buildMetricsArbitrary(rule.conditions), (generatedMetrics) => {
          const metrics: IskraMetrics = {
            ...DEFAULT_METRICS,
            ...generatedMetrics,
            rhythm: Math.min(50, generatedMetrics.rhythm),
          }

          const winnerProb = getProbability(metrics, rule.winner)
          const loserProb = getProbability(metrics, rule.loser)

          expect(passesThresholds(rule.conditions, metrics)).toBe(true)
          expect(winnerProb).toBeGreaterThan(loserProb)
        }),
        { numRuns: 100 },
      )
    })



    it(`increases winner-loser gap only when ${rule.winner}>${rule.loser} conditions are satisfied`, () => {
      fc.assert(
        fc.property(buildMetricsViolatingRuleArbitrary(rule.conditions), (generatedMetrics) => {
          const violatedMetrics: IskraMetrics = {
            ...DEFAULT_METRICS,
            ...generatedMetrics,
          }

          const satisfiedMetrics = applyRuleConditions(violatedMetrics, rule.conditions)

          const violatedGap =
            getProbability(violatedMetrics, rule.winner) - getProbability(violatedMetrics, rule.loser)
          const satisfiedGap =
            getProbability(satisfiedMetrics, rule.winner) - getProbability(satisfiedMetrics, rule.loser)

          expect(passesThresholds(rule.conditions, violatedMetrics)).toBe(false)
          expect(passesThresholds(rule.conditions, satisfiedMetrics)).toBe(true)
          expect(satisfiedGap).toBeGreaterThan(violatedGap)
        }),
        { numRuns: 100 },
      )
    })

    it(`does not activate priority rule ${rule.winner} > ${rule.loser} when conditions are not met`, () => {
      fc.assert(
        fc.property(buildMetricsViolatingRuleArbitrary(rule.conditions), (generatedMetrics) => {
          const metrics: IskraMetrics = {
            ...DEFAULT_METRICS,
            ...generatedMetrics,
          }

          const winnerProb = getProbability(metrics, rule.winner)
          const loserProb = getProbability(metrics, rule.loser)

          expect(passesThresholds(rule.conditions, metrics)).toBe(false)
          expect(winnerProb).toBeLessThanOrEqual(loserProb)
        }),
        { numRuns: 100 },
      )
    })
  })
})
