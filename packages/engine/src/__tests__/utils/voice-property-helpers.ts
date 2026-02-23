import fc, { Arbitrary } from 'fast-check'

import { VoiceQuantumField } from '../../services/voiceSystem.js'
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

export const getMetricDomain = (metricKey: keyof VoiceThresholds): { min: number; max: number } => {
  if (metricKey === 'rhythm') {
    return { min: 0, max: 100 }
  }

  return { min: 0, max: 1 }
}

export const getProbability = (metrics: IskraMetrics, voiceId: VoiceID): number => {
  const field = new VoiceQuantumField()
  field.update(metrics)
  const states = field.getSuperposition(9)
  return states.find((state) => state.id === voiceId)?.prob ?? 0
}

export const isThresholdSatisfied = (
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

export const passesThresholds = (conditions: VoiceThresholds, metrics: IskraMetrics): boolean => {
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

export const buildMetricsArbitrary = (conditions: VoiceThresholds): Arbitrary<IskraMetrics> => {
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
  const epsilon = metricKey === 'rhythm' ? 1 : 0.01
  const domain = getMetricDomain(metricKey)

  if (typeof threshold.min === 'number' && threshold.min > domain.min) {
    return Math.max(domain.min, threshold.min - epsilon)
  }

  if (typeof threshold.max === 'number' && threshold.max < domain.max) {
    return Math.min(domain.max, threshold.max + epsilon)
  }

  if (typeof threshold.min === 'number') {
    return domain.min
  }

  if (typeof threshold.max === 'number') {
    return domain.max
  }

  return domain.min
}

export const applyRuleConditions = (metrics: IskraMetrics, conditions: VoiceThresholds): IskraMetrics => {
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

export const buildMetricsViolatingRuleArbitrary = (
  conditions: VoiceThresholds,
): Arbitrary<IskraMetrics> => {
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
