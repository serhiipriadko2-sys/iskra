import { describe, it, expect } from 'vitest';
import type { EmbeddingProvider } from '../services/memory';
import { MemoryService } from '../services/memory';
import { GraphRagRetriever } from '../services/graphRag';
import type { FractalMetadata, IskraMetrics } from '@iskra/core';

class BagEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<number[]> {
    const lower = text.toLowerCase();
    const v = [
      count(lower, 'apple'),
      count(lower, 'banana'),
      count(lower, 'orchard'),
      count(lower, 'car'),
    ];
    return normalize(v);
  }
}

function count(s: string, w: string): number {
  return s.split(/\s+/).filter(Boolean).filter((x) => x === w).length;
}

function normalize(v: number[]): number[] {
  const m = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
  return m === 0 ? v.map(() => 0) : v.map((x) => x / m);
}

const fractal: FractalMetadata = {
  fractalDimension: 1.5,
  entropy: 0.2,
  dominantVoice: 'ISKRA',
  quantumState: { amplitude: 0.8, phase: 0.2 },
};

const metrics: IskraMetrics = {
  rhythm: 0,
  trust: 0.8,
  pain: 0.1,
  chaos: 0.1,
  drift: 0,
  echo: 0,
  clarity: 0.7,
  silence_mass: 0,
  mirror_sync: 0,
  interrupt: 0,
  ctxSwitch: 0,
};

describe('GraphRagRetriever', () => {
  it('retrieves semantic seeds and expands via transient graph', async () => {
    const mem = new MemoryService(new BagEmbeddingProvider());

    // Two close “apple” memories, same layer, near timestamps -> CAUSAL edge.
    const a = await mem.addMemory('apple orchard', fractal, 'memory');
    const b = await mem.addMemory('apple banana', fractal, 'memory');

    // Unrelated memory.
    await mem.addMemory('car engine', fractal, 'memory');

    // Make timestamps close.
    a.timestamp = new Date(Date.now() - 1_000).toISOString();
    b.timestamp = new Date(Date.now() - 500).toISOString();

    const r = new GraphRagRetriever(mem, {
      seed_k: 2,
      expand_depth: 1,
      limit: 5,
      similarity_threshold: 0.5,
      causal_window_ms: 5_000,
    });

    const out = await r.retrieve('apple', metrics);
    const ids = out.nodes.map((n) => n.id);

    expect(ids).toContain(a.id);
    expect(ids).toContain(b.id);
    expect(out.trace.seeds.length).toBeGreaterThan(0);
    expect(out.trace.steps.map((s) => s.label)).toContain('bfs_expand');
  });

  it('expands to a non-seed neighbor through batch lookup when seed_k is one', async () => {
    const mem = new MemoryService(new BagEmbeddingProvider());

    const seed = await mem.addMemory('apple orchard', fractal, 'memory');
    const neighbor = await mem.addMemory('apple banana', fractal, 'memory');
    await mem.addMemory('car engine', fractal, 'memory');

    seed.timestamp = new Date(Date.now() - 1_000).toISOString();
    neighbor.timestamp = new Date(Date.now() - 500).toISOString();

    const r = new GraphRagRetriever(mem, {
      seed_k: 1,
      expand_depth: 1,
      limit: 5,
      neighbor_m: 3,
      similarity_threshold: 0.45,
      causal_window_ms: 5_000,
    });

    const out = await r.retrieve('apple orchard', metrics);
    const seedIds = out.trace.seeds.map((s) => s.id);
    const ids = out.nodes.map((n) => n.id);

    expect(seedIds).toEqual([seed.id]);
    expect(seedIds).not.toContain(neighbor.id);
    expect(ids).toContain(seed.id);
    expect(ids).toContain(neighbor.id);
  });
});
