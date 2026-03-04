import { describe, it, expect, beforeEach } from 'vitest'
import { VoiceQuantumField } from '../../services/voiceSystem.js'
import { DEFAULT_METRICS } from '@iskra/core'
import type { IskraMetrics } from '@iskra/core'

type VoiceGateCase = {
  id: string;
  voice: string;
  metrics: IskraMetrics;
};

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


  it('should gate KAIN when pain is below its manifest threshold', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.1, chaos: 0.1, drift: 0.1, trust: 0.9, rhythm: 80 };
    vs.update(metrics);

    const sup = vs.getSuperposition(9);
    const kain = sup.find((v) => v.id === 'KAIN');
    expect(kain).toBeDefined();
    expect(kain!.prob).toBe(0);
  });

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

  it('should expose typed computation trace for explainability', () => {
    const metrics: IskraMetrics = {
      ...DEFAULT_METRICS,
      trust: 0.9,
      pain: 0.8,
      chaos: 0.1,
      drift: 0.1,
    }

    vs.update(metrics)

    const trace = vs.getLastTrace()
    expect(trace).not.toBeNull()

    expect(trace).toEqual(
      expect.objectContaining({
        time: 0.1,
        metrics,
        priorityMultipliers: expect.objectContaining({
          MAKI: 1.6,
          KAIN: 0.6,
        }),
      }),
    )

    const compact = trace!.voices
      .filter((voice) => voice.id === 'MAKI' || voice.id === 'KAIN')
      .map((voice) => ({
        id: voice.id,
        thresholdMatched: voice.thresholdMatched,
        priorityMultiplier: voice.priorityMultiplier,
        resonanceContributionCount: voice.resonanceContributions.length,
        probabilityAfterNormalization: Number(voice.probabilityAfterNormalization.toFixed(6)),
      }))
      .sort((a, b) => a.id.localeCompare(b.id))

    expect(compact).toMatchInlineSnapshot(`
      [
        {
          "id": "KAIN",
          "priorityMultiplier": 0.6,
          "probabilityAfterNormalization": 0.030842,
          "resonanceContributionCount": 1,
          "thresholdMatched": true,
        },
        {
          "id": "MAKI",
          "priorityMultiplier": 1.6,
          "probabilityAfterNormalization": 0.756434,
          "resonanceContributionCount": 2,
          "thresholdMatched": true,
        },
      ]
    `)
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
