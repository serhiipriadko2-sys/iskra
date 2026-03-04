import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import { DEFAULT_METRICS, VOICES, VOICE_RUNTIME_CONFIG } from '@iskra/core'
import type { IskraMetrics, VoiceID } from '@iskra/core'

import {
  applyRuleConditions,
  buildMetricsArbitrary,
  buildMetricsViolatingRuleArbitrary,
  getProbability,
  passesThresholds,
} from '../utils/voice-property-helpers.js'

describe('VoiceQuantumField property-based invariants', () => {
  it('normalizes probabilities to 1.0 for generated metrics', () => {
    fc.assert(
      fc.property(buildMetricsArbitrary({}), (metrics) => {
        const sum = VOICES.map((voice) => getProbability(metrics, voice.id)).reduce((acc, prob) => acc + prob, 0)
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
