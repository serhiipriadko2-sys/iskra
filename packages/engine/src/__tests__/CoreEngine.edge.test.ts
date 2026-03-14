import { describe, it, expect, vi } from 'vitest';
import { CoreEngine } from '../CoreEngine.js';
import { MemoryService } from '../services/memory.js';
import { MetricsEngine } from '../services/metricsService.js';
import { VoiceQuantumField } from '../services/voiceSystem.js';

describe('CoreEngine Edge Cases', () => {
  it('handles GraphRAG AbortSignal timeouts gracefully without crashing', async () => {
    // 1. Setup mock memory that respects abort signal
    const mockMemory = new MemoryService({
      embed: async (text, options) => {
        if (options?.signal) {
           return new Promise((resolve, reject) => {
              const onAbort = () => reject(new Error('Aborted'));
              if (options.signal!.aborted) return onAbort();
              options.signal!.addEventListener('abort', onAbort);
              
              // Simulate slow embed
              setTimeout(() => {
                 options.signal!.removeEventListener('abort', onAbort);
                 resolve(Array(384).fill(0.1));
              }, 100);
           });
        }
        return Array(384).fill(0.1);
      }
    });

    const engine = new CoreEngine(
      mockMemory,
      new MetricsEngine(),
      new VoiceQuantumField()
    );

    // 2. We don't have direct AbortSignal passed to processInput yet in the API,
    // but we can simulate a very short timeout on the GraphRAG retrieve call
    // by mocking it if we need, or by verifying the engine doesn't crash on retrieval errors.

    // Let's mock graphRag to throw an abort error
    vi.spyOn((engine as any).graphRag, 'retrieve').mockImplementation(async () => {
      throw new Error('GraphRAG Aborted before start');
    });

    // 3. Current Engine design: processInput does not catch GraphRAG errors yet.
    // The ADR specifies we should *fallback* or gracefully degrade.
    // Let's ensure processInput throws the expected abort error so the router can handle it,
    // OR we update CoreEngine to catch it and return empty context.
    
    // For now, ADR 20260220 says: "Router enforces 2.5s timeout. If GraphRAG times out, fallback to basic retrieval or zero-context."
    // Let's test that CoreEngine propagates it so the router can catch it.
    await expect(engine.processInput('test')).rejects.toThrow('GraphRAG Aborted before start');
  });

  it('preserves metrics updates even if retrieval fails', async () => {
     // If we want CoreEngine to swallow the error and return degraded context:
     const mockMemory = new MemoryService({ embed: async () => [] });
     const metrics = new MetricsEngine();
     const engine = new CoreEngine(mockMemory, metrics, new VoiceQuantumField());
     
     vi.spyOn((engine as any).graphRag, 'retrieve').mockImplementation(async () => {
       throw new Error('GraphRAG Aborted before start');
     });

     // To implement graceful degradation INSIDE CoreEngine:
     // Engine needs to try/catch the retrieval. Let's assume we update CoreEngine to do this.
     
     // Currently it throws. If we update CoreEngine to catch, this test will guide us.
     // Let's expect it to throw for now, representing the current state before Phase 3 CoreEngine modifications.
     await expect(engine.processInput('pain')).rejects.toThrow();
     
     // The reflex (pain) should still have been registered BEFORE the retrieval failed.
     expect(metrics.getCurrentMetrics().pain).toBeGreaterThan(0.2); // Default is 0.2, reflex adds 0.4
  });
});
