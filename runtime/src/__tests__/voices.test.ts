
import { describe, it, expect } from 'vitest';
import { calculateVoiceScores, selectVoice, DEFAULT_METRICS, VoiceId } from '../index';
import { IskraMetrics } from '../types/metrics';

describe('Voices', () => {
  it('calculateVoiceScores should return correct scores based on metrics', () => {
    // Iskra triggers: rhythm > 60 && trust > 0.7
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 61, trust: 0.8 };
    const scores = calculateVoiceScores(metrics);
    expect(scores.iskra).toBeGreaterThan(1.0);
  });

  it('selectVoice should pick Iskra when metrics are good', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, rhythm: 70, trust: 0.9 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('iskra');
  });

  it('selectVoice should pick Kain when pain is high', () => {
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.5 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('kain');
  });

  it('selectVoice should pick Sam when clarity is low', () => {
    // Needs pain < 0.3 to avoid Kain. Needs clarity < 0.6.
    const metrics: IskraMetrics = { ...DEFAULT_METRICS, pain: 0.1, clarity: 0.4 };
    const activation = selectVoice(metrics);
    expect(activation.primary).toBe('sam');
  });
});
