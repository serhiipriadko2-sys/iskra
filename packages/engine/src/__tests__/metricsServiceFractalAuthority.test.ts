import { describe, expect, it } from 'vitest'
import { DEFAULT_METRICS } from '@iskra/core'
import { MetricsEngine } from '../services/metricsService'

describe('MetricsEngine typed fractal authority migration', () => {
  it('does not manufacture a numeric fractal dimension for short history', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS)
    const result = engine.updateExplainable({})
    const step = result.how.find((entry) => entry.label === 'fractal_feedback')

    expect(step).toBeDefined()
    expect(step?.output).toBeNull()
    expect(step?.inputs).toMatchObject({
      chaos_status: 'unavailable',
      drift_status: 'unavailable',
      fractal_dimension: null,
    })
    expect(result.value.clarity).toBe(DEFAULT_METRICS.clarity)
  })

  it('uses computed typed HFD only after the minimum sample count', () => {
    const engine = new MetricsEngine(DEFAULT_METRICS)
    for (let index = 0; index < 19; index += 1) {
      engine.update({ chaos: index % 2 === 0 ? 0.01 : -0.01 })
    }

    const result = engine.updateExplainable({})
    const step = result.how.find((entry) => entry.label === 'fractal_feedback')
    expect(step?.inputs).toMatchObject({
      chaos_status: 'computed',
      drift_status: 'computed',
    })
    expect(typeof step?.output).toBe('number')
  })
})
