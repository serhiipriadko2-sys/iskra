import type { IskraMetrics, MantraNode } from '@iskra/core';
import { calculateResonance } from '@iskra/math';

import type { MemoryService } from './memory.js';
import type { JsonRecord } from './graphService.js';

export type GraphEdgeType = 'SIMILARITY' | 'CAUSAL';

export interface GraphRagOptions {
  seed_k?: number; // initial semantic retrieval size
  expand_depth?: number; // BFS depth
  limit?: number; // final context size
  alpha?: number; // 0..1: semantic vs graph
  similarity_threshold?: number; // 0..1 for building SIMILARITY edges
  causal_window_ms?: number; // for building CAUSAL edges within same layer
  neighbor_m?: number; // per-node neighbor fanout (top-M)
  max_expanded_nodes?: number; // limit total BFS nodes
  // Query-time tuning (used when a DB vector index is configured)
  hnsw_ef_search?: number;
  // Latency budget
  signal?: AbortSignal;
}

export interface GraphRagSeed {
  id: string;
  score: number;
}

export interface GraphRagStep {
  label: string;
  data?: JsonRecord;
}

export interface GraphRagTrace {
  seeds: GraphRagSeed[];
  steps: GraphRagStep[];
}

export interface GraphRagResult {
  nodes: MantraNode[];
  trace: GraphRagTrace;
}

type Edge = { to: string; type: GraphEdgeType; weight: number };

/**
 * GraphRAG retriever (Graph-enhanced vector search):
 * 1) semantic retrieval over memory nodes
 * 2) build a transient graph (similarity + causal)
 * 3) BFS expansion from seeds
 * 4) rerank by alpha*semantic + (1-alpha)*graphProximity
 *
 * This follows the common “vector search + graph traversal” pattern described
 * in GraphRAG field guides and graph-enhanced retrievers.
 */
export class GraphRagRetriever {
  private memory: MemoryService;
  private options: Required<GraphRagOptions>;

  constructor(memory: MemoryService, options?: GraphRagOptions) {
    this.memory = memory;
    this.options = {
      seed_k: options?.seed_k ?? 8,
      expand_depth: options?.expand_depth ?? 2,
      limit: options?.limit ?? 10,
      alpha: options?.alpha ?? 0.75,
      similarity_threshold: options?.similarity_threshold ?? 0.78,
      causal_window_ms: options?.causal_window_ms ?? 3_600_000,
      neighbor_m: options?.neighbor_m ?? 12,
      max_expanded_nodes: options?.max_expanded_nodes ?? 100,
      hnsw_ef_search: options?.hnsw_ef_search ?? 80,
      signal: options?.signal ?? new AbortController().signal,
    };
  }

  async retrieve(query: string, metrics: IskraMetrics): Promise<GraphRagResult> {
    const trace: GraphRagTrace = {
      seeds: [],
      steps: [],
    };

    if (this.options.signal.aborted) throw new Error('GraphRAG Aborted before start');

    const queryEmbedding = await this.memory.embed(query, { signal: this.options.signal });

    // Seed selection:
    // - If a DB vector index is configured, take a larger preselect window (seed_k*4)
    //   and then apply the same (semantic+resonance) scoring.
    // - Otherwise fallback to scanning in-memory.
    const seedPreselect = Math.max(this.options.seed_k * 4, this.options.seed_k);
    const seedEf = computeEfSearch(this.options.hnsw_ef_search, seedPreselect);
    const seedHits = await this.memory.vectorSearchByEmbedding(queryEmbedding, {
      limit: seedPreselect,
      efSearch: seedEf.effective,
      rerankK: seedPreselect * 5,
      signal: this.options.signal,
    });

    if (seedHits.length === 0) {
      trace.steps.push({ label: 'empty_memory', data: { total_nodes: 0 } });
      return { nodes: [], trace };
    }

    trace.steps.push({
      label: 'embed_query',
      data: {
        dim: queryEmbedding.length,
        seed_k: this.options.seed_k,
        preselect: seedPreselect,
        hnsw_ef_search_requested: seedEf.requested || this.options.hnsw_ef_search,
        hnsw_ef_search_effective: seedEf.effective,
      },
    });

    const scoredSeeds = seedHits
      .map((hit) => {
        const node = hit.node;
        const semantic = hit.similarity;
        const resonance = node.fractal
          ? calculateResonance(
              metrics.chaos * Math.PI * 2,
              metrics.trust,
              node.fractal.quantumState.phase,
              node.fractal.quantumState.amplitude,
            )
          : 0;
        const score = semantic * 0.7 + resonance * 0.3;
        return { node, semantic, score };
      })
      .sort((a, b) => b.score - a.score);

    const seeds = scoredSeeds.slice(0, Math.min(this.options.seed_k, scoredSeeds.length));
    trace.seeds = seeds.map((s) => ({ id: s.node.id, score: round4(s.score) }));
    trace.steps.push({
      label: 'seed_select',
      data: { seed_k: seeds.length, alpha: this.options.alpha },
    });

    // Graph traversal (lazy top-M neighbors):
    // We avoid building a full similarity graph (O(N^2)).
    const bestDepth: Map<string, number> = new Map();
    const nodeCache: Map<string, MantraNode> = new Map();
    for (const s of seeds) nodeCache.set(s.node.id, s.node);

    const neighborCache: Map<string, Edge[]> = new Map();

    const neighborEf = computeEfSearch(this.options.hnsw_ef_search, this.options.neighbor_m);



    const getNeighborsBatch = async (nodes: MantraNode[]): Promise<Edge[][]> => {
      if (this.options.signal.aborted) throw new Error('Aborted');
      const results: Edge[][] = new Array(nodes.length).fill([]);
      const toFetchIdx: number[] = [];
      const simOptions = [];
      const causalOptions = [];

      for (let i = 0; i < nodes.length; i++) {
        const nodeOpt = nodes[i];
        if (!nodeOpt) continue;
        const cached = neighborCache.get(nodeOpt.id);
        if (cached) {
          results[i] = cached;
        } else {
          simOptions.push(nodeOpt.embedding);
          causalOptions.push({
            centerTs: nodeOpt.timestamp,
            limit: this.options.neighbor_m,
            layer: nodeOpt.layer,
            excludeId: nodeOpt.id,
            windowMs: this.options.causal_window_ms,
            signal: this.options.signal,
          });
        }
      }

      if (toFetchIdx.length > 0) {
        // Run vector memory batches
        const [simBatches, causalBatches] = await Promise.all([
          this.memory.vectorSearchMultiple(simOptions, {
            limit: this.options.neighbor_m,
            minSimilarity: this.options.similarity_threshold,
            efSearch: neighborEf.effective, // Fixed from seedEf!
            rerankK: this.options.neighbor_m * 10,
            signal: this.options.signal,
          }),
          this.memory.causalNeighborsMultiple(causalOptions)
        ]);

        for (let j = 0; j < toFetchIdx.length; j++) {
          const originalIdx = toFetchIdx[j];
          if (originalIdx === undefined) continue;
          const node = nodes[originalIdx];
          if (!node) continue;
          const edges: Edge[] = [];
          
          const sBatch = simBatches[j];
          if (sBatch) {
            for (const h of sBatch) {
              nodeCache.set(h.node.id, h.node);
              edges.push({ to: h.node.id, type: 'SIMILARITY', weight: h.similarity });
            }
          }
          
          const cBatch = causalBatches[j];
          if (cBatch) {
            for (const h of cBatch) {
              nodeCache.set(h.node.id, h.node);
              edges.push({ to: h.node.id, type: 'CAUSAL', weight: h.weight });
            }
          }
          
          neighborCache.set(node.id, edges);
          results[originalIdx] = edges;
        }
      }

      return results;
    };

    await bfsExpandBatch(
      seeds.map((s) => s.node.id),
      getNeighborsBatch,
      nodeCache,
      this.options.expand_depth,
      bestDepth,
      this.options.max_expanded_nodes,
      this.options.signal
    );

    trace.steps.push({
      label: 'bfs_expand',
      data: {
        expand_depth: this.options.expand_depth,
        expanded_unique: bestDepth.size,
        neighbor_m: this.options.neighbor_m,
        hnsw_ef_search_requested: neighborEf.requested || this.options.hnsw_ef_search,
        hnsw_ef_search_effective: neighborEf.effective,
      },
    });

    // Score candidates.
    const candidates = Array.from(bestDepth.entries()).map(([id, depth]) => {
      const node = nodeCache.get(id);
      const semantic = node ? cosineSimilarity(queryEmbedding, node.embedding) : 0;
      const graphProximity = 1 / (1 + depth);
      const finalScore = this.options.alpha * semantic + (1 - this.options.alpha) * graphProximity;
      return { id, depth, semantic, graphProximity, finalScore };
    });

    candidates.sort((a, b) => b.finalScore - a.finalScore);
    const selectedIds = candidates.slice(0, Math.min(this.options.limit, candidates.length)).map((c) => c.id);

    // Ensure seeds are included.
    for (const s of seeds) {
      if (!selectedIds.includes(s.node.id)) {
        selectedIds.push(s.node.id);
      }
    }

    const selected: MantraNode[] = [];
    for (const id of selectedIds) {
      const node = nodeCache.get(id);
      if (node) selected.push(node);
    }

    trace.steps.push({
      label: 'rerank_select',
      data: { limit: this.options.limit, selected: selected.length },
    });

    return { nodes: selected, trace };
  }
}

async function bfsExpandBatch(
  startIds: string[],
  getNeighborsBatch: (nodes: MantraNode[]) => Promise<Edge[][]>,
  nodeCache: Map<string, MantraNode>,
  maxDepth: number,
  bestDepth: Map<string, number>,
  maxNodes: number,
  signal: AbortSignal
): Promise<void> {
  let currentLevel = startIds;
  for (const id of startIds) if (!bestDepth.has(id)) bestDepth.set(id, 0);

  for (let depth = 0; depth < maxDepth; depth++) {
    if (signal.aborted) break;
    if (bestDepth.size >= maxNodes) break;
    if (currentLevel.length === 0) break;

    const nodesToExpand: MantraNode[] = [];
    for (const id of currentLevel) {
      const node = nodeCache.get(id);
      if (node) nodesToExpand.push(node);
    }

    if (nodesToExpand.length === 0) break;

    const edgeBatches = await getNeighborsBatch(nodesToExpand);
    const nextLevel = new Set<string>();

    for (let i = 0; i < nodesToExpand.length; i++) {
        const edges = edgeBatches[i];
        if (!edges) continue;
        for (const e of edges) {
            const nextDepth = depth + 1;
            const prev = bestDepth.get(e.to);
            if (prev === undefined || nextDepth < prev) {
                if (bestDepth.size < maxNodes) {
                    bestDepth.set(e.to, nextDepth);
                    nextLevel.add(e.to);
                }
            }
        }
    }
    currentLevel = Array.from(nextLevel);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    ma += av * av;
    mb += bv * bv;
  }
  const denom = Math.sqrt(ma) * Math.sqrt(mb);
  return denom === 0 ? 0 : dot / denom;
}


function computeEfSearch(requested: number | undefined, minRequired: number): { requested: number; effective: number } {
  const req = typeof requested === 'number' && Number.isFinite(requested) ? Math.floor(requested) : 0;
  const min = Math.max(40, Math.floor(minRequired));
  const cap = 400;
  const base = req > 0 ? req : min;
  const effective = Math.min(Math.max(base, min), cap);
  return { requested: req, effective };
}

function round4(x: number): number {
  return Math.round(x * 10_000) / 10_000;
}
