import type { IskraMetrics } from '@iskra/core';

/**
 * GraphService (ported from runtime/iskraSpace/services/graphService.ts)
 *
 * Scientific Turn rule:
 * - Pure logic may live in @iskra/math; state/services live in @iskra/engine.
 * - This service is stateful, but side-effect free (in-memory only).
 *
 * NOTE: Canonical mantra nodes are NOT embedded here to avoid silent canon drift.
 * Seeding is an explicit constructor input.
 */

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
export type JsonRecord = { [k: string]: JsonValue };

export type MemoryLayer = 'core' | 'archive' | 'shadow' | 'dream' | 'memory';

export type MemoryNodeType =
  | 'insight'
  | 'decision'
  | 'artifact'
  | 'shadow_pattern'
  | 'ritual_log'
  | 'dream_crystal'
  | 'knowledge_file'
  | 'event'
  | 'concept'
  | 'fact';

export type EdgeType =
  | 'CAUSAL'
  | 'SIMILARITY'
  | 'RESONANCE'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'DERIVES_FROM'
  | 'RELATED_TO';

export interface MemoryNode {
  id: string;
  layer: MemoryLayer;
  type: MemoryNodeType;
  content: string;
  timestamp: number;
  metrics_snapshot?: IskraMetrics;
  relatedIds?: string[];
  resonance_score?: number;
  metadata?: JsonRecord;
}

export interface MemoryEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number; // 0..1
  metadata?: JsonRecord;
}

export interface MemoryGraph {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
}

export type GraphSeed = {
  nodes?: MemoryNode[];
  edges?: MemoryEdge[];
};

export class GraphService {
  private nodes: Map<string, MemoryNode> = new Map();
  private edges: Map<string, MemoryEdge> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();

  constructor(seed?: GraphSeed) {
    if (seed?.nodes) {
      seed.nodes.forEach((n) => this.addNode(n));
    }
    if (seed?.edges) {
      seed.edges.forEach((e) => this.addEdge(e));
    }
  }

  addNode(node: MemoryNode): string {
    this.nodes.set(node.id, node);
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, new Set());
    }
    return node.id;
  }

  addEdge(edge: MemoryEdge): string {
    if (!this.nodes.has(edge.source) || !this.nodes.has(edge.target)) {
      throw new Error(`Edge source/target not found: ${edge.source} -> ${edge.target}`);
    }

    this.edges.set(edge.id, edge);
    this.adjacency.get(edge.source)?.add(edge.id);
    this.adjacency.get(edge.target)?.add(edge.id);
    return edge.id;
  }

  getNeighbors(nodeId: string, edgeTypes?: EdgeType[]): MemoryNode[] {
    const edgeIds = this.adjacency.get(nodeId);
    if (!edgeIds) return [];

    const neighbors: MemoryNode[] = [];
    for (const edgeId of edgeIds) {
      const edge = this.edges.get(edgeId);
      if (!edge) continue;
      if (edgeTypes && !edgeTypes.includes(edge.type)) continue;

      const neighborId = edge.source === nodeId ? edge.target : edge.source;
      const neighbor = this.nodes.get(neighborId);
      if (neighbor) neighbors.push(neighbor);
    }

    return neighbors;
  }

  traverseBFS(startId: string, maxDepth: number = 3, minResonance: number = 0.3): MemoryNode[] {
    const startNode = this.nodes.get(startId);
    if (!startNode) return [];

    const visited = new Set<string>([startId]);
    const result: MemoryNode[] = [startNode];
    const queue: Array<{ id: string; depth: number }> = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || current.depth >= maxDepth) continue;

      const neighbors = this.getNeighbors(current.id);
      for (const neighbor of neighbors) {
        const resonance = neighbor.resonance_score ?? 0.5;
        if (!visited.has(neighbor.id) && resonance >= minResonance) {
          visited.add(neighbor.id);
          result.push(neighbor);
          queue.push({ id: neighbor.id, depth: current.depth + 1 });
        }
      }
    }

    return result;
  }

  /**
   * Find resonant nodes based on current metrics (heuristic helper).
   */
  findResonantNodes(metrics: IskraMetrics): MemoryNode[] {
    const allNodes = Array.from(this.nodes.values());

    return allNodes.filter((node) => {
      let score = 0;

      // Layer-based resonance (pilot)
      if (metrics.pain > 0.6 && node.layer === 'shadow') score += 0.8;
      if (metrics.clarity > 0.8 && node.layer === 'archive') score += 0.8;
      if (metrics.trust < 0.5 && node.layer === 'core') score += 1.0;

      // Recency bonus
      const age = Date.now() - node.timestamp;
      if (age < 3600_000) score += 0.2;

      // Snapshot similarity (pain distance)
      if (node.metrics_snapshot) {
        const metricDistance = Math.abs(node.metrics_snapshot.pain - metrics.pain);
        if (metricDistance < 0.2) score += 0.3;
      }

      return score > 0.7;
    });
  }

  /**
   * Build automatic edges for a node (simple overlap + temporal in-layer causality).
   */
  buildConnections(newNodeId: string): MemoryEdge[] {
    const newNode = this.nodes.get(newNodeId);
    if (!newNode) return [];

    const connections: MemoryEdge[] = [];
    const allNodes = Array.from(this.nodes.values());

    for (const existingNode of allNodes) {
      if (existingNode.id === newNodeId) continue;

      const similarity = this.calculateSimilarity(newNode.content, existingNode.content);
      if (similarity > 0.7) {
        connections.push({
          id: `edge_${newNodeId}_${existingNode.id}`,
          source: newNodeId,
          target: existingNode.id,
          type: 'SIMILARITY',
          weight: similarity,
        });
      }

      if (newNode.layer === existingNode.layer) {
        const timeDiff = Math.abs(newNode.timestamp - existingNode.timestamp);
        if (timeDiff < 3600_000) {
          connections.push({
            id: `edge_${existingNode.id}_${newNodeId}`,
            source: existingNode.id,
            target: newNodeId,
            type: 'CAUSAL',
            weight: 1.0 - timeDiff / 3600_000,
          });
        }
      }
    }

    for (const edge of connections) {
      try {
        this.addEdge(edge);
      } catch {
        // Ignore edge failures in auto-build.
      }
    }

    return connections;
  }

  exportGraph(): MemoryGraph {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
    };
  }

  importGraph(graph: MemoryGraph): void {
    graph.nodes.forEach((node) => this.addNode(node));
    graph.edges.forEach((edge) => {
      try {
        this.addEdge(edge);
      } catch {
        // Ignore invalid edges on import.
      }
    });
  }

  getNodesByLayer(layer: MemoryLayer): MemoryNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.layer === layer);
  }

  getNode(id: string): MemoryNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MemoryNode[] {
    return Array.from(this.nodes.values());
  }

  clearAll(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
  }

  private calculateSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/).filter(Boolean));
    const words2 = new Set(content2.toLowerCase().split(/\s+/).filter(Boolean));

    const intersectionCount = [...words1].filter((w) => words2.has(w)).length;
    const unionCount = new Set<string>([...words1, ...words2]).size;

    return unionCount === 0 ? 0 : intersectionCount / unionCount;
  }
}
