import { MantraNode, FractalMetadata, IskraMetrics } from '@iskra/core';
import { calculateResonance } from '@iskra/math';

export interface EmbeddingProvider {
  embed(text: string, options?: { signal?: AbortSignal }): Promise<number[]>;
}

export interface VectorSearchOptions {
  limit: number;
  /** Optional layer filter. */
  layer?: MantraNode['layer'];
  /** Optional node id to exclude (e.g. self). */
  excludeId?: string;
  /** Optional minimum similarity threshold. */
  minSimilarity?: number;
  /** Query-time HNSW tuning (if supported). */
  efSearch?: number;
  /** Optional preselect size for DB rerank (if supported). */
  rerankK?: number;
  /** Optional abort signal to respect latency budgets. */
  signal?: AbortSignal;
}

export interface VectorSearchHit {
  node: MantraNode;
  /** Cosine similarity in [-1..1] (for normalized vectors). */
  similarity: number;
}

export interface CausalNeighborsOptions {
  centerTs: string;
  limit: number;
  layer?: MantraNode['layer'];
  excludeId?: string;
  windowMs?: number;
  signal?: AbortSignal;
}

export interface CausalNeighborHit {
  node: MantraNode;
  /** Weight in [0..1] (closer in time -> higher). */
  weight: number;
}

/** Optional DB-backed vector index for scaling GraphRAG. */
export interface VectorIndex {
  searchByEmbedding(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchHit[]>;
  searchMultipleByEmbedding?(queryEmbeddings: number[][], options: VectorSearchOptions): Promise<VectorSearchHit[][]>;
  causalNeighbors?(options: CausalNeighborsOptions): Promise<CausalNeighborHit[]>;
  causalNeighborsMultiple?(optionsList: CausalNeighborsOptions[]): Promise<CausalNeighborHit[][]>;
  upsert?(node: MantraNode): Promise<void>;
}

export interface MemoryServiceOptions {
  /** If a VectorIndex is provided, you may choose strict or best-effort persistence on addMemory(). */
  persistence?: 'best_effort' | 'strict';
}

export class MemoryService {
  private nodes: MantraNode[] = [];
  private embeddingProvider: EmbeddingProvider;
  private vectorIndex?: VectorIndex;
  private options: Required<MemoryServiceOptions>;

  constructor(embeddingProvider: EmbeddingProvider, vectorIndex?: VectorIndex, options?: MemoryServiceOptions) {
    this.embeddingProvider = embeddingProvider;
    if (vectorIndex !== undefined) {
      this.vectorIndex = vectorIndex;
    }
    this.options = {
      persistence: options?.persistence ?? 'best_effort',
    };
  }

  /**
   * Expose embeddings for downstream retrievers (GraphRAG).
   * SECURITY: This does not expose keys; it only delegates to the provider.
   */
  async embed(text: string, options?: { signal?: AbortSignal }): Promise<number[]> {
    return this.embeddingProvider.embed(text, options);
  }

  /**
   * Read-only snapshot of all memory nodes.
   * Used by GraphRAG to build a transient graph index.
   */
  getAllNodes(): MantraNode[] {
    return this.nodes.slice();
  }

  /**
   * Vector search (cosine similarity). Uses DB index if provided, otherwise scans in-memory.
   */
  async vectorSearchByEmbedding(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchHit[]> {
    if (options.signal?.aborted) throw new Error('Aborted');
    if (this.vectorIndex) {
      return this.vectorIndex.searchByEmbedding(queryEmbedding, options);
    }

    const limit = Math.max(1, options.limit);
    const layer = options.layer;
    const excludeId = options.excludeId;
    const minSim = options.minSimilarity;

    const hits = this.nodes
      .filter((n) => (layer ? n.layer === layer : true))
      .filter((n) => (excludeId ? n.id !== excludeId : true))
      .map((node) => {
        const similarity = this.cosineSimilarity(queryEmbedding, node.embedding);
        return { node, similarity };
      })
      .filter((h) => (minSim === undefined ? true : h.similarity >= minSim))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return hits;
  }

  /**
   * Batch execution for vector search. Avoids N+1 RPCs.
   */
  async vectorSearchMultiple(queryEmbeddings: number[][], options: VectorSearchOptions): Promise<VectorSearchHit[][]> {
    if (options.signal?.aborted) throw new Error('Aborted');
    if (this.vectorIndex?.searchMultipleByEmbedding) {
      return this.vectorIndex.searchMultipleByEmbedding(queryEmbeddings, options);
    }
    // Fallback: sequential execution if no batch support
    const results = [];
    for (const qe of queryEmbeddings) {
      if (options.signal?.aborted) break;
      results.push(await this.vectorSearchByEmbedding(qe, options));
    }
    return results;
  }

  /**
   * Causal neighbors: same layer, within a time window.
   * Uses VectorIndex implementation if available.
   */
  async causalNeighbors(options: CausalNeighborsOptions): Promise<CausalNeighborHit[]> {
    if (options.signal?.aborted) throw new Error('Aborted');
    if (this.vectorIndex?.causalNeighbors) {
      return this.vectorIndex.causalNeighbors(options);
    }

    const centerMs = Date.parse(options.centerTs);
    if (!Number.isFinite(centerMs)) return [];
    const limit = Math.max(1, options.limit);
    const layer = options.layer;
    const excludeId = options.excludeId;
    const windowMs = options.windowMs ?? 3_600_000;

    const hits = this.nodes
      .filter((n) => (layer ? n.layer === layer : true))
      .filter((n) => (excludeId ? n.id !== excludeId : true))
      .map((node) => {
        const t = Date.parse(node.timestamp);
        if (!Number.isFinite(t)) return null;
        const diff = Math.abs(t - centerMs);
        if (diff > windowMs) return null;
        const weight = 1 - diff / windowMs;
        return { node, weight };
      })
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);

    return hits;
  }

  /**
   * Batch execution for causal neighbors.
   */
  async causalNeighborsMultiple(optionsList: CausalNeighborsOptions[]): Promise<CausalNeighborHit[][]> {
    // Check signal from the first option broadly
    if (optionsList.length > 0 && optionsList[0] && optionsList[0].signal?.aborted) throw new Error('Aborted');

    if (this.vectorIndex?.causalNeighborsMultiple) {
      return this.vectorIndex.causalNeighborsMultiple(optionsList);
    }

    const results = [];
    for (const opt of optionsList) {
      if (opt.signal?.aborted) break;
      results.push(await this.causalNeighbors(opt));
    }
    return results;
  }

  async addMemory(content: string, fractal: FractalMetadata, layer: 'core' | 'memory' | 'dream' = 'memory'): Promise<MantraNode> {
    const embedding = await this.embeddingProvider.embed(content);
    // Use Math.random for ID if crypto is not available, or assume it is available
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);

    const node: MantraNode = {
      id,
      content,
      embedding,
      timestamp: new Date().toISOString(),
      layer,
      fractal
    };

    // Optional persistence (DB). Default: best-effort.
    if (this.vectorIndex?.upsert) {
      try {
        await this.vectorIndex.upsert(node);
      } catch (err) {
        if (this.options.persistence === 'strict') {
          throw err;
        }
      }
    }

    this.nodes.push(node);
    return node;
  }

  async retrieve(query: string, metrics: IskraMetrics, limit: number = 5): Promise<MantraNode[]> {
    const queryEmbedding = await this.embeddingProvider.embed(query);

    // Calculate current system state for resonance
    // We map metrics to quantum state (amplitude/phase)
    // High trust -> High amplitude
    // High chaos -> High phase variance (simplified as phase)
    const currentAmp = metrics.trust;
    const currentPhase = metrics.chaos * Math.PI * 2;

    return this.nodes
      .map(node => {
        // 1. Semantic Similarity (Cosine)
        const semantic = this.cosineSimilarity(queryEmbedding, node.embedding);

        // 2. Fractal Resonance (if fractal data exists)
        let resonance = 0;
        if (node.fractal) {
           resonance = calculateResonance(
             currentPhase,
             currentAmp,
             node.fractal.quantumState.phase,
             node.fractal.quantumState.amplitude
           );
        }

        // Weighted Score: 70% Semantic, 30% Resonance
        // This is the "Fractal" part - state dependent retrieval
        const score = (semantic * 0.7) + (resonance * 0.3);

        return { node, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.node);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * (vecB[i] ?? 0), 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return (magA && magB) ? dotProduct / (magA * magB) : 0;
  }
}
