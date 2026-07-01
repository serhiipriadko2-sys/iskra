import { describe, expect, it } from 'vitest';

import { DEFAULT_METRICS, type IskraMetrics } from '../metrics.js';
import { selectVoice } from '../voices.js';

function metrics(overrides: Partial<IskraMetrics>): IskraMetrics {
  return { ...DEFAULT_METRICS, ...overrides };
}

describe('selectVoice supertrigger priority', () => {
  it('routes high trust and pain to MAKI with KAIN payload before ISKRA synthesis', () => {
    const result = selectVoice(
      metrics({ rhythm: 80, trust: 0.9, pain: 0.4, drift: 0.05 })
    );

    expect(result.primary).toBe('MAKI');
    expect(result.secondary).toBe('KAIN');
    expect(result.reason).toContain('Maki wrapper');
  });

  it('routes drift to ISKRIV before synthesis and chaos resonance', () => {
    const result = selectVoice(
      metrics({ rhythm: 82, trust: 0.85, chaos: 0.55, drift: 0.25 })
    );

    expect(result.primary).toBe('ISKRIV');
    expect(result.reason).toContain('drift');
  });

  it('keeps KAIN primary for pain without high trust', () => {
    const result = selectVoice(
      metrics({ trust: 0.55, pain: 0.45, drift: 0.05 })
    );

    expect(result.primary).toBe('KAIN');
  });

  it('uses ANHANTRA for low trust or heavy silence before lighter voices', () => {
    const result = selectVoice(
      metrics({ trust: 0.25, silence_mass: 0.7, pain: 0.1, drift: 0.05 })
    );

    expect(result.primary).toBe('ANHANTRA');
  });

  it('uses SIBYL for strategic foresight before routine lightness', () => {
    const result = selectVoice(
      metrics({ foresight: 0.65, drift: 0.05, pain: 0.1 })
    );

    expect(result.primary).toBe('SIBYL');
  });

  it('keeps HUYNDUN available as the canonical chaos voice', () => {
    const result = selectVoice(
      metrics({ chaos: 0.5, drift: 0.05, foresight: 0 })
    );

    expect(result.primary).toBe('HUYNDUN');
  });

  it('keeps ISKRA for ordinary high-rhythm synthesis after supertriggers are clear', () => {
    const result = selectVoice(
      metrics({ rhythm: 80, trust: 0.75, pain: 0.1, drift: 0.05 })
    );

    expect(result.primary).toBe('ISKRA');
  });
});
