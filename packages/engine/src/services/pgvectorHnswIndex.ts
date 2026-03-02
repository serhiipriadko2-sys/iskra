import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  VectorIndex,
  VectorSearchHit,
  VectorSearchOptions,
  CausalNeighborHit,
  CausalNeighborsOptions,
} from './memory.js';

import type { MantraNode, FractalMetadata } from '@iskra/core';

/**
 * Supabase Postgres (pgvector) HNSW-backed VectorIndex.
 *
 * Expects SQL migrations to be applied (see supabase/migrations/*_pgvector_hnsw.sql).
 *
 * SECURITY:
 * - Keep RLS enabled on memory_nodes.
 * - This index is SECURITY INVOKER: results are filtered by RLS for the caller.
 */

export interface SupabasePgvectorHnswIndexOptions {
  matchFn?: string;
  causalFn?: string;
  upsertFn?: string;
}

type MatchRow = {
  id: string;
  content: string;
  layer: string;
  ts: string;
  fractal: unknown;
  embedding: number[];
  similarity: number;
};

type CausalRow = {
  id: string;
  content: string;
  layer: string;
  ts: string;
  fractal: unknown;
  embedding: number[];
  weight: number;
};

function asLayer(x: string): MantraNode['layer'] {
  if (x === 'core' || x === 'memory' || x === 'dream') return x;
  return 'memory';
}

function asNumberArray(x: unknown): number[] {
  if (Array.isArray(x)) return x.map((v) => (typeof v === 'number' ? v : Number(v))).filter((v) => Number.isFinite(v));
  return [];
}

function asFractalMetadata(x: unknown): FractalMetadata | undefined {
  if (!x || typeof x !== 'object') return undefined;
  const o = x as Record<string, unknown>;

  const fdRaw = o.fractalDimension;
  const entRaw = o.entropy;
  const dvRaw = o.dominantVoice;
  const qsRaw = o.quantumState;

  const fractalDimension = typeof fdRaw === 'number' ? fdRaw : Number(fdRaw);
  const entropy = typeof entRaw === 'number' ? entRaw : Number(entRaw);
  if (!Number.isFinite(fractalDimension) || !Number.isFinite(entropy)) return undefined;

  const dominantVoice = typeof dvRaw === 'string' ? dvRaw : 'ISKRA';

  if (!qsRaw || typeof qsRaw !== 'object') return undefined;
  const qs = qsRaw as Record<string, unknown>;
  const ampRaw = qs.amplitude;
  const phRaw = qs.phase;
  const amplitude = typeof ampRaw === 'number' ? ampRaw : Number(ampRaw);
  const phase = typeof phRaw === 'number' ? phRaw : Number(phRaw);
  if (!Number.isFinite(amplitude) || !Number.isFinite(phase)) return undefined;

  return {
    fractalDimension,
    entropy,
    dominantVoice: dominantVoice as unknown as FractalMetadata['dominantVoice'],
    quantumState: { amplitude, phase },
  };
}

export class SupabasePgvectorHnswIndex implements VectorIndex {
  private readonly matchFn: string;
  private readonly causalFn: string;
  private readonly upsertFn: string;

  constructor(
    private readonly supabase: SupabaseClient,
    options: SupabasePgvectorHnswIndexOptions = {},
  ) {
    this.matchFn = options.matchFn ?? 'match_memory_nodes';
    this.causalFn = options.causalFn ?? 'match_memory_causal';
    this.upsertFn = options.upsertFn ?? 'upsert_memory_node';
  }

  async searchByEmbedding(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchHit[]> {
    const { data, error } = await this.supabase.rpc(this.matchFn, {
      query_embedding: queryEmbedding,
      match_count: options.limit,
      rerank_k: options.rerankK ?? null,
      min_similarity: options.minSimilarity ?? null,
      filter_layer: options.layer ?? null,
      exclude_id: options.excludeId ?? null,
      ef_search: options.efSearch ?? null,
    });

    if (error) {
      throw new Error(`SupabasePgvectorHnswIndex.searchByEmbedding failed: ${error.message}`);
    }

    const rows = (Array.isArray(data) ? data : []) as MatchRow[];
    return rows.map((r) => ({
      similarity: typeof r.similarity === 'number' ? r.similarity : Number(r.similarity),
      node: {
        id: r.id,
        content: r.content,
        layer: asLayer(r.layer),
        timestamp: r.ts,
        fractal: asFractalMetadata(r.fractal),
        embedding: asNumberArray(r.embedding),
      },
    }));
  }

  async causalNeighbors(options: CausalNeighborsOptions): Promise<CausalNeighborHit[]> {
    const { data, error } = await this.supabase.rpc(this.causalFn, {
      center_ts: options.centerTs,
      match_count: options.limit,
      filter_layer: options.layer ?? null,
      exclude_id: options.excludeId ?? null,
      window_ms: options.windowMs ?? 3_600_000,
    });

    if (error) {
      throw new Error(`SupabasePgvectorHnswIndex.causalNeighbors failed: ${error.message}`);
    }

    const rows = (Array.isArray(data) ? data : []) as CausalRow[];
    return rows.map((r) => ({
      weight: typeof r.weight === 'number' ? r.weight : Number(r.weight),
      node: {
        id: r.id,
        content: r.content,
        layer: asLayer(r.layer),
        timestamp: r.ts,
        fractal: asFractalMetadata(r.fractal),
        embedding: asNumberArray(r.embedding),
      },
    }));
  }

  async upsert(node: MantraNode): Promise<void> {
    const { error } = await this.supabase.rpc(this.upsertFn, {
      p_id: node.id,
      p_content: node.content,
      p_layer: node.layer,
      p_ts: node.timestamp,
      p_fractal: node.fractal ?? null,
      p_embedding: node.embedding,
    });

    if (error) {
      throw new Error(`SupabasePgvectorHnswIndex.upsert failed: ${error.message}`);
    }
  }
}
