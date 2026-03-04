import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

import type { IskraMetrics, VoiceThresholds } from '@iskra/core'
import { DEFAULT_METRICS } from '@iskra/core'

import {
  applyRuleConditions,
  buildMetricsArbitrary,
  buildMetricsViolatingRuleArbitrary,
  getMetricDomain,
  passesThresholds,
} from './voice-property-helpers.js'

describe('voice-property-helpers', () => {
  it('returns expected metric domains', () => {
    expect(getMetricDomain('rhythm')).toEqual({ min: 0, max: 100 })
    expect(getMetricDomain('trust')).toEqual({ min: 0, max: 1 })
    expect(getMetricDomain('pain')).toEqual({ min: 0, max: 1 })
  })

  it('applyRuleConditions brings metrics into threshold bounds', () => {
    const conditions: VoiceThresholds = {
      trust: { min: 0.8 },
      pain: { min: 0.3 },
      chaos: { max: 0.4 },
    }

    const metrics: IskraMetrics = {
      ...DEFAULT_METRICS,
      trust: 0.1,
      pain: 0.1,
      chaos: 0.9,
    }

    const adjusted = applyRuleConditions(metrics, conditions)

    expect(adjusted.trust).toBe(0.8)
    expect(adjusted.pain).toBe(0.3)
    expect(adjusted.chaos).toBe(0.4)
    expect(passesThresholds(conditions, adjusted)).toBe(true)
  })

  it('buildMetricsArbitrary generates metrics that satisfy conditions', () => {
    const conditions: VoiceThresholds = {
      trust: { min: 0.8 },
      pain: { min: 0.3 },
      chaos: { max: 0.4 },
    }

    fc.assert(
      fc.property(buildMetricsArbitrary(conditions), (metrics) => {
        expect(passesThresholds(conditions, metrics)).toBe(true)
      }),
      { numRuns: 100 },
    )
  })

  it('buildMetricsViolatingRuleArbitrary always violates at least one threshold', () => {
    const conditions: VoiceThresholds = {
      trust: { min: 0.8 },
      pain: { min: 0.3 },
    }

    fc.assert(
      fc.property(buildMetricsViolatingRuleArbitrary(conditions), (metrics) => {
        expect(passesThresholds(conditions, metrics)).toBe(false)
      }),
      { numRuns: 100 },
    )
  })
})
