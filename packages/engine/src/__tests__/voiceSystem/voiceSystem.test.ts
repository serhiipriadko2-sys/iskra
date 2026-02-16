import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceQuantumField } from '../../services/voiceSystem.js';
import { DEFAULT_METRICS } from '@iskra/core';
import type { IskraMetrics } from '@iskra/core';

describe('VoiceQuantumField', () => {
  let vs: VoiceQuantumField;

  beforeEach(() => {
    vs = new VoiceQuantumField();
  });

  it('should initialize with 9 voices', () => {
    const superposition = vs.getSuperposition(9);
    expect(superposition).toHaveLength(9);
  });

  it.skip('should amplify KAIN when pain is high', () => {
    // KAIN resonates with 'pain'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.9, chaos: 0.1, drift: 0.1 };

    // We update multiple times to let phase/resonance stabilize if needed,
    // though current logic is instant for amplitude.
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('KAIN');
  });

  it.skip('should amplify HUYNDUN when chaos is high', () => {
    // HUYNDUN resonates with 'chaos'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, chaos: 0.9, pain: 0.1, drift: 0.1 };
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('HUYNDUN');
  });

  it.skip('should amplify ISKRIV when drift is high', () => {
    // ISKRIV resonates with 'drift'
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, drift: 0.9, pain: 0.1, chaos: 0.1 };
    vs.update(metrics);

    const top = vs.getSuperposition(1)[0];
    expect(top.id).toBe('ISKRIV');
  });

  it.skip('should amplify MAKI when trust and pain are high (Integration)', () => {
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
});
