import { describe, it, expect } from 'vitest';
import { MetricsEngine } from '../services/metricsService';
import { MantraNode, DEFAULT_METRICS } from '../../../core/src/index';

describe('MetricsEngine Memory Integration', () => {
  it('should increase drift when retrieving high entropy memories', () => {
    const engine = new MetricsEngine();
    const chaoticMemory: MantraNode = {
      id: '1',
      content: 'Chaos everywhere',
      embedding: [],
      timestamp: new Date().toISOString(),
      layer: 'memory',
      fractal: {
        fractalDimension: 1.9,
        entropy: 0.9,
        dominantVoice: 'HUYNDUN',
        quantumState: { amplitude: 1, phase: Math.PI }
      }
    };
    const initialMetrics = engine.getCurrentMetrics();
    const newMetrics = engine.processMemoryImpact([chaoticMemory]);
    expect(newMetrics.drift).toBeGreaterThan(initialMetrics.drift);
    expect(newMetrics.chaos).toBeGreaterThan(initialMetrics.chaos);
  });
});
