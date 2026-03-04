import { describe, it, expect } from 'vitest';

import type { EmbeddingProvider, VectorIndex, VectorSearchHit, VectorSearchOptions } from '../services/memory';
import { MemoryService } from '../services/memory';
import { GraphRagRetriever } from '../services/graphRag';
import type { FractalMetadata, IskraMetrics, MantraNode } from '@iskra/core';

class FixedEmbeddingProvider implements EmbeddingProvider {
  async embed(_text: string): Promise<number[]> {
    // Normalized 2D (toy)
    return [1, 0];
  }
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

function mkNode(id: string, content: string, ts: string): MantraNode {
  return {
    id,
    content,
    layer: 'memory',
    timestamp: ts,
    embedding: [1, 0],
    fractal,
  };
}

class DummyVectorIndex implements VectorIndex {
  private readonly a = mkNode('a', 'apple orchard', new Date(Date.now() - 1000).toISOString());
  private readonly b = mkNode('b', 'apple banana', new Date(Date.now() - 500).toISOString());

  async searchByEmbedding(_q: number[], opts: VectorSearchOptions): Promise<VectorSearchHit[]> {
    // Seeds call has no excludeId -> return both.
    if (!opts.excludeId) {
      return [
        { node: this.a, similarity: 0.9 },
        { node: this.b, similarity: 0.85 },
      ].slice(0, opts.limit);
    }

    // Neighbor call excludes current id -> return the other.
    const out: VectorSearchHit[] = [];
    if (opts.excludeId === 'a') out.push({ node: this.b, similarity: 0.85 });
    if (opts.excludeId === 'b') out.push({ node: this.a, similarity: 0.9 });
    return out.slice(0, opts.limit);
  }
}

describe('GraphRagRetriever (DB/HNSW mode)', () => {
  it('works when MemoryService has a VectorIndex and no in-memory nodes', async () => {
    const mem = new MemoryService(new FixedEmbeddingProvider(), new DummyVectorIndex());
    const r = new GraphRagRetriever(mem, {
      seed_k: 2,
      expand_depth: 1,
      neighbor_m: 4,
      similarity_threshold: 0.5,
    });

    const out = await r.retrieve('apple', metrics);
    const ids = out.nodes.map((n) => n.id);

    expect(ids).toContain('a');
    expect(ids).toContain('b');
    expect(out.trace.steps.map((s) => s.label)).toContain('seed_select');
    expect(out.trace.steps.map((s) => s.label)).toContain('bfs_expand');
  });
});
