import { describe, it } from 'vitest';
import { CoreEngine, MemoryService, metricsEngine, voiceSystem } from '../packages/engine/src/index';
import { VOICES } from '../packages/core/src/index';
import { EmbeddingProvider } from '../packages/engine/src/services/memory';

class MockEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    if (text.toLowerCase().includes('pain')) return [1, 0];
    if (text.toLowerCase().includes('chaos')) return [0, 1];
    return [0.5, 0.5];
  }
}

describe('End-to-End Simulation', () => {
  it('runs the full cycle', async () => {
    console.log("\n=== ISKRA QUANTUM SIMULATION START ===\n");

    const embeddingProvider = new MockEmbeddingProvider();
    const memoryService = new MemoryService(embeddingProvider);
    // Re-instantiate singletons for clean state if needed, but they are exported as consts
    // The CoreEngine takes them as args
    const engine = new CoreEngine(memoryService, metricsEngine, voiceSystem);

    const inputs = [
        "Hello Iskra, let us begin.",
        "I feel a deep pain in my soul.",
        "The chaos is overwhelming, I am lost.",
        "But through this pain, I find truth.",
        "Let us restructure the system."
    ];

    for (const text of inputs) {
        console.log(`\nINPUT: "${text}"`);
        const result = await engine.processInput(text);

        console.log("METRICS:");
        console.log(`  Trust: ${result.metrics.trust.toFixed(2)}`);
        console.log(`  Pain:  ${result.metrics.pain.toFixed(2)}`);
        console.log(`  Chaos: ${result.metrics.chaos.toFixed(2)}`);

        console.log("TOP VOICES:");
        result.superposition.slice(0, 3).forEach((v, i) => {
            const voiceDef = VOICES.find(voice => voice.id === v.id);
            console.log(`  ${i+1}. ${voiceDef?.name || v.id} (${(v.prob * 100).toFixed(1)}%)`);
        });

        console.log(`SELECTED: ${result.voice}`);
        console.log("-".repeat(40));

        // Persist memory
        await memoryService.addMemory(text, {
            fractalDimension: 1.5,
            entropy: 0.5,
            dominantVoice: result.voice,
            quantumState: { amplitude: result.metrics.trust, phase: result.metrics.chaos * Math.PI * 2 }
        });
    }

    console.log("\n=== SIMULATION COMPLETE ===");
  });
});
