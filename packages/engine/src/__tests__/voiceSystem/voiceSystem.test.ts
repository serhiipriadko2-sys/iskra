import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceQuantumField } from '../../services/voiceSystem.js';
import { DEFAULT_METRICS } from '@iskra/core';
import type { IskraMetrics } from '@iskra/core';

type VoiceGateCase = {
  id: string;
  voice: string;
  metrics: IskraMetrics;
};

describe('VoiceQuantumField', () => {
  let vs: VoiceQuantumField;

  beforeEach(() => {
    vs = new VoiceQuantumField();
  });

  it('should initialize with 9 voices', () => {
    const superposition = vs.getSuperposition(9);
    expect(superposition).toHaveLength(9);
  });

  it('should amplify KAIN when pain is high', () => {
    // KAIN resonates with 'pain'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.9, chaos: 0.1, drift: 0.1 };

    // We update multiple times to let phase/resonance stabilize if needed,
    // though current logic is instant for amplitude.
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('KAIN');
  });


  it('should gate KAIN when pain is below its manifest threshold', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.1, chaos: 0.1, drift: 0.1, trust: 0.9, rhythm: 80 };
    vs.update(metrics);

    const sup = vs.getSuperposition(9);
    const kain = sup.find((v) => v.id === 'KAIN');
    expect(kain).toBeDefined();
    expect(kain!.prob).toBe(0);
  });

  it('should amplify HUYNDUN when chaos is high', () => {
    // HUYNDUN resonates with 'chaos'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, chaos: 0.9, pain: 0.1, drift: 0.1 };
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('HUYNDUN');
  });

  it('should amplify ISKRIV when drift is high', () => {
    // ISKRIV resonates with 'drift'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, drift: 0.9, pain: 0.1, chaos: 0.1 };
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('ISKRIV');
  });

  it('should amplify MAKI when trust and pain are high (Integration)', () => {
    // MAKI resonates with 'trust' AND 'pain'
    // KAIN resonates with 'pain'

    const metrics: IskraMetrics = {
      ...DEFAULT_METRICS,
      trust: 0.9,
      pain: 0.8,
      chaos: 0.1,
      drift: 0.1
    };
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('MAKI');
  });

  it.each<VoiceGateCase>([
    {
      id: 'ISKRA requires rhythm >= 60',
      voice: 'ISKRA',
      metrics: { ...DEFAULT_METRICS, rhythm: 59 },
    },
    {
      id: 'SAM requires clarity <= 0.6',
      voice: 'SAM',
      metrics: { ...DEFAULT_METRICS, clarity: 0.61 },
    },
    {
      id: 'ANHANTRA requires silence_mass >= 0.5',
      voice: 'ANHANTRA',
      metrics: { ...DEFAULT_METRICS, silence_mass: 0.49 },
    },
    {
      id: 'HUYNDUN requires chaos >= 0.4',
      voice: 'HUYNDUN',
      metrics: { ...DEFAULT_METRICS, chaos: 0.39 },
    },
    {
      id: 'ISKRIV requires drift >= 0.2',
      voice: 'ISKRIV',
      metrics: { ...DEFAULT_METRICS, drift: 0.19 },
    },
    {
      id: 'MAKI requires trust >= 0.8',
      voice: 'MAKI',
      metrics: { ...DEFAULT_METRICS, trust: 0.79, pain: 0.9 },
    },
    {
      id: 'SIBYL requires foresight >= 0.5',
      voice: 'SIBYL',
      metrics: { ...DEFAULT_METRICS, foresight: 0.49 },
    },
    {
      id: 'PINO requires pain <= 0.3',
      voice: 'PINO',
      metrics: { ...DEFAULT_METRICS, pain: 0.31, chaos: 0.1 },
    },
  ])('should enforce manifest threshold gate: $id', ({ voice, metrics }) => {
    vs.update(metrics);
    const gatedVoice = vs.getSuperposition(9).find((item) => item.id === voice);

    expect(gatedVoice).toBeDefined();
    expect(gatedVoice?.prob).toBe(0);
  });

  it('should keep KAIN below MAKI when MAKI priority condition is active', () => {
    const metrics: IskraMetrics = {
      ...DEFAULT_METRICS,
      trust: 0.9,
      pain: 0.9,
      chaos: 0.1,
      drift: 0.1,
    };

    vs.update(metrics);

    const superposition = vs.getSuperposition(9);
    const maki = superposition.find((v) => v.id === 'MAKI');
    const kain = superposition.find((v) => v.id === 'KAIN');

    expect(maki).toBeDefined();
    expect(kain).toBeDefined();
    expect((maki?.prob ?? 0)).toBeGreaterThan(kain?.prob ?? 0);
  });
});
