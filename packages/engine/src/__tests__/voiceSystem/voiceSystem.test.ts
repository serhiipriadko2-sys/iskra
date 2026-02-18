import { describe, it, expect, beforeEach } from 'vitest'
import { VoiceQuantumField } from '../../services/voiceSystem.js'
import { DEFAULT_METRICS } from '@iskra/core'
import type { IskraMetrics } from '@iskra/core'

describe('VoiceQuantumField', () => {
  let vs: VoiceQuantumField

  beforeEach(() => {
    vs = new VoiceQuantumField()
  })

  it('should initialize with 9 voices', () => {
    const superposition = vs.getSuperposition(9)
    expect(superposition).toHaveLength(9)
  })

  it('should amplify KAIN when pain is high', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 40, trust: 0.2, pain: 0.9, chaos: 0.1, drift: 0.1 }
    vs.update(metrics)

    const top = vs.getSuperposition(1)[0]
    expect(top.id).toBe('KAIN')
  })

  it('should amplify HUYNDUN when chaos is high', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 40, trust: 0.2, chaos: 0.9, pain: 0.1, drift: 0.1 }
    vs.update(metrics)

    const top = vs.getSuperposition(1)[0]
    expect(top.id).toBe('HUYNDUN')
  })

  it('should amplify ISKRIV when drift is high', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 40, trust: 0.2, drift: 0.9, pain: 0.1, chaos: 0.1 }
    vs.update(metrics)

    const top = vs.getSuperposition(1)[0]
    expect(top.id).toBe('ISKRIV')
  })

  it('should not amplify MAKI when trust threshold is not met', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 40, trust: 0.7, pain: 0.9, chaos: 0.1, drift: 0.1 }
    vs.update(metrics)

    const top = vs.getSuperposition(1)[0]
    expect(top.id).toBe('KAIN')
  })

  it('should amplify MAKI when trust and pain thresholds are met', () => {
    const metrics: IskraMetrics = {
      ...DEFAULT_METRICS,
      trust: 0.9,
      pain: 0.8,
      chaos: 0.1,
      drift: 0.1,
    }
    vs.update(metrics)

    const top = vs.getSuperposition(1)[0]
    expect(top.id).toBe('MAKI')
  })
})
