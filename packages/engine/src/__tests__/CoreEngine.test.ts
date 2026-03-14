import { describe, it, expect } from 'vitest';
import { CoreEngine } from '../CoreEngine';
import { MemoryService, EmbeddingProvider } from '../services/memory';
import { MetricsEngine } from '../services/metricsService';
import { VoiceQuantumField } from '../services/voiceSystem';
import { IskraMetrics } from '@iskra/core';

class MockEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string) {
    if (text.toLowerCase().includes('pain')) return [1, 0];
    return [0.5, 0.5];
  }
}

describe('CoreEngine Integration', () => {
  it('should process input and return a voice', async () => {
    const memory = new MemoryService(new MockEmbeddingProvider());
    const metrics = new MetricsEngine();
    const voices = new VoiceQuantumField();

    const engine = new CoreEngine(memory, metrics, voices);

    const response = await engine.processInput('Hello world');

    expect(response.value.voice).toBeDefined();
    expect(response.value.metrics).toBeDefined();
    expect(response.value.superposition.length).toBeGreaterThan(0);
  });

  it('should shift towards KAIN when retrieving overwhelming painful memories', async () => {
    const memory = new MemoryService(new MockEmbeddingProvider());
    const metrics = new MetricsEngine();
    const voices = new VoiceQuantumField();

    // Add OVERWHELMING amount of painful memories to break through default Trust/Clarity
    // Default Trust=0.7 (Boost 1.4), Clarity=0.8 (Boost 1.6).
    // We need Pain > 0.8 to compete.
    // Initial Pain=0.1. Each memory +0.1.
    // Need 8 memories to reach 0.9.

    for (let i = 0; i < 9; i++) {
        await memory.addMemory(`pain memory ${i}`, {
            fractalDimension: 1.5,
            entropy: 0.1,
            dominantVoice: 'KAIN',
            quantumState: { amplitude: 1.0, phase: 0 }
        });
    }

    const engine = new CoreEngine(memory, metrics, voices);

    // Process input "pain"
    const response = await engine.processInput('I feel pain');

    // Metrics should reflect high pain
    expect(response.value.metrics.pain).toBeGreaterThan(0.8);

    // Check if KAIN is present
    const kainEntry = response.value.superposition.find(v => v.id === 'KAIN');

    if (!kainEntry) {
         console.log('Superposition:', JSON.stringify(response.value.superposition, null, 2));
         console.log('Metrics:', JSON.stringify(response.value.metrics, null, 2));
    }

    expect(kainEntry).toBeDefined();
    if (kainEntry) {
        expect(kainEntry.prob).toBeGreaterThan(0.1);
    }
  });
});
