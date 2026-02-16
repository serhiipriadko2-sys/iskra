import { describe, it, expect } from 'vitest';
import { MemoryService, EmbeddingProvider } from '../services/memory.js';
import { IskraMetrics } from '@iskra/core';

// Mock Embedding Provider
class MockEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    if (text.includes('pain')) return [1, 0];
    if (text.includes('joy')) return [0, 1];
    return [0.707, 0.707];
  }
}

describe('MemoryService', () => {
  it('should retrieve memories based on semantic similarity', async () => {
    const service = new MemoryService(new MockEmbeddingProvider());
    await service.addMemory('I feel immense pain', {
      fractalDimension: 1.5,
      entropy: 0.8,
      dominantVoice: 'KAIN',
      quantumState: { amplitude: 0.9, phase: Math.PI }
    });
    const metrics: IskraMetrics = { rhythm: 0, trust: 0.5, pain: 0.1, chaos: 0.1, drift: 0, echo: 0, clarity: 0, silence_mass: 0, mirror_sync: 0, interrupt: 0, ctxSwitch: 0 };
    const results = await service.retrieve('pain', metrics);
    expect(results[0].content).toBe('I feel immense pain');
  });

  it('should boost resonance when metrics align with memory state', async () => {
    const service = new MemoryService(new MockEmbeddingProvider());
    await service.addMemory('Chaos reigns', {
      fractalDimension: 1.8,
      entropy: 0.9,
      dominantVoice: 'HUYNDUN',
      quantumState: { amplitude: 1.0, phase: Math.PI }
    });
    await service.addMemory('Order prevails', {
      fractalDimension: 1.1,
      entropy: 0.1,
      dominantVoice: 'SAM',
      quantumState: { amplitude: 1.0, phase: 0 }
    });
    const chaoticMetrics: IskraMetrics = { rhythm: 0, trust: 1.0, pain: 0, chaos: 0.5, drift: 0, echo: 0, clarity: 0, silence_mass: 0, mirror_sync: 0, interrupt: 0, ctxSwitch: 0 };
    const results = await service.retrieve('neutral query', chaoticMetrics);
    expect(results[0].content).toBe('Chaos reigns');
  });
});
