/**
 * Graph Service Implementation for Supabase
 *
 * The runtime talks to graph_nodes / graph_edges through authenticated RPC
 * functions. Keeping table access behind this boundary lets us later revoke
 * direct authenticated table grants without changing the service API.
 */

import { supabase as supabaseClient } from './supabaseClient';
import type {
  MemoryNode,
  MemoryEdge,
  MemoryLayer,
  MemoryNodeType,
  IskraMetrics,
  EdgeType
} from '../types';
import type { Database } from '../types/supabase';

// Use strict types from generated Supabase definitions
type GraphNodeRow = Database['public']['Tables']['graph_nodes']['Row'];
type GraphEdgeRow = Database['public']['Tables']['graph_edges']['Row'];
type GraphNodeInsert = Database['public']['Tables']['graph_nodes']['Insert'];
type GraphNodeUpdate = Database['public']['Tables']['graph_nodes']['Update'];
type GraphNodeLike = Pick<GraphNodeRow, 'id' | 'layer' | 'type' | 'content'> & Partial<GraphNodeRow>;
type GraphEdgeLike = Pick<GraphEdgeRow, 'id' | 'source' | 'target' | 'type' | 'weight'> & Partial<GraphEdgeRow>;

type SupabaseRpcError = {
  message: string;
  code?: string;
};

type GraphRpcClient = {
  rpc<T>(fn: string, args?: Record<string, unknown>): Promise<{
    data: T | null;
    error: SupabaseRpcError | null;
  }>;
};

type NodeWithEdgesResponse = {
  node: GraphNodeRow | null;
  outgoing_edges?: GraphEdgeRow[] | null;
  incoming_edges?: GraphEdgeRow[] | null;
};

type GraphStatsResponse = {
  totalNodes?: number;
  totalEdges?: number;
  nodesByLayer?: Record<string, number>;
  nodesByType?: Record<string, number>;
};

const graphRpcClient = supabaseClient as unknown as GraphRpcClient;

export class GraphServiceSupabase {
  /**
   * Add node to Supabase through the authenticated RPC boundary.
   */
  public async addNode(
    layer: MemoryLayer,
    type: MemoryNodeType,
    content: string,
    metrics?: IskraMetrics
  ): Promise<MemoryNode> {
    const nodeId = crypto.randomUUID();

    // Calculate resonance score if metrics provided
    const resonance_score = metrics
      ? this.calculateResonance(metrics)
      : undefined;

    const { data, error } = await graphRpcClient.rpc<GraphNodeRow>('graph_create_node', {
      p_id: nodeId,
      p_layer: layer.toLowerCase(),
      p_type: type.toLowerCase(),
      p_content: content,
      p_timestamp: new Date().toISOString(),
      p_metrics_snapshot: metrics as unknown as GraphNodeInsert['metrics_snapshot'],
      p_related_ids: [],
      p_resonance_score: resonance_score,
      p_metadata: {}
    });

    if (error || !data) {
      throw new Error(`GraphService: Failed to add node - ${error?.message || 'No data returned'}`);
    }

    return this.rowToNode(data);
  }

  /**
   * Add edge to Supabase through the authenticated RPC boundary.
   */
  public async addEdge(
    source: string,
    target: string,
    type: EdgeType,
    weight: number = 0.5
  ): Promise<MemoryEdge> {
    const edgeId = `edge_${source}_${target}_${type}`;

    const { data, error } = await graphRpcClient.rpc<GraphEdgeRow>('graph_create_edge', {
      p_id: edgeId,
      p_source: source,
      p_target: target,
      p_type: type,
      p_weight: weight,
      p_metadata: {}
    });

    if (error || !data) {
      throw new Error(`GraphService: Failed to add edge - ${error?.message || 'No data returned'}`);
    }

    return this.rowToEdge(data);
  }

  /**
   * BFS Traversal using Supabase RPC function
   */
  public async traverseBFS(
    startId: string,
    maxDepth: number = 3,
    minWeight: number = 0.3
  ): Promise<MemoryNode[]> {
    const { data, error } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_traverse_bfs_nodes', {
      p_start_id: startId,
      p_max_depth: maxDepth,
      p_min_weight: minWeight
    });

    if (error) {
      console.error('BFS traversal failed:', error);
      return [];
    }

    return (data || []).map(this.rowToNode);
  }

  /**
   * Find resonant nodes using Supabase RPC function
   */
  public async findResonantNodes(
    minResonance: number = 0.3,
    limit: number = 10
  ): Promise<MemoryNode[]> {
    const { data, error } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_find_resonant_nodes', {
      p_min_resonance: minResonance,
      p_limit_count: limit
    });

    if (error) {
      console.error('Find resonant nodes failed:', error);
      return [];
    }

    return (data || []).map(this.rowToNode);
  }

  /**
   * Get node with all its edges
   */
  public async getNodeWithEdges(nodeId: string): Promise<{
    node: MemoryNode | null;
    outgoing: MemoryEdge[];
    incoming: MemoryEdge[];
  }> {
    const { data, error } = await graphRpcClient.rpc<NodeWithEdgesResponse>('graph_get_node_with_edges', {
      node_id: nodeId
    });

    if (error) {
      console.error('Get node with edges failed:', error);
      return { node: null, outgoing: [], incoming: [] };
    }

    if (!data || !data.node) {
      return { node: null, outgoing: [], incoming: [] };
    }

    return {
      node: this.rowToNode(data.node),
      outgoing: (data.outgoing_edges || []).map(this.rowToEdge),
      incoming: (data.incoming_edges || []).map(this.rowToEdge)
    };
  }

  /**
   * Get all nodes by layer
   */
  public async getNodesByLayer(layer: MemoryLayer): Promise<MemoryNode[]> {
    const { data, error } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_get_user_nodes', {
      p_layer: layer.toLowerCase(),
      p_type: null,
      p_node_ids: null,
      p_limit_count: null
    });

    if (error) {
      console.error('Get nodes by layer failed:', error);
      return [];
    }

    return (data || []).map(this.rowToNode);
  }

  /**
   * Get all nodes by type
   */
  public async getNodesByType(type: MemoryNodeType): Promise<MemoryNode[]> {
    const { data, error } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_get_user_nodes', {
      p_layer: null,
      p_type: type.toLowerCase(),
      p_node_ids: null,
      p_limit_count: null
    });

    if (error) {
      console.error('Get nodes by type failed:', error);
      return [];
    }

    return (data || []).map(this.rowToNode);
  }

  /**
   * Search nodes by content (full-text search)
   */
  public async searchNodes(query: string, limit: number = 10): Promise<MemoryNode[]> {
    const { data, error } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_search_nodes', {
      p_query: query,
      p_limit_count: limit
    });

    if (error) {
      console.error('Search nodes failed:', error);
      return [];
    }

    return (data || []).map(this.rowToNode);
  }

  /**
   * Delete node and all its edges
   */
  public async deleteNode(nodeId: string): Promise<void> {
    // Edges are deleted automatically by graph_edges FK cascade.
    const { error } = await graphRpcClient.rpc<null>('graph_delete_node', {
      p_node_id: nodeId
    });

    if (error) {
      console.error('Delete node failed:', error);
      throw new Error(`GraphService: Failed to delete node - ${error.message}`);
    }
  }

  /**
   * Update node resonance score
   */
  public async updateNodeResonance(
    nodeId: string,
    metrics: IskraMetrics
  ): Promise<void> {
    const resonance_score = this.calculateResonance(metrics);

    const { error } = await graphRpcClient.rpc<GraphNodeRow>('graph_update_node_resonance', {
      p_node_id: nodeId,
      p_metrics_snapshot: metrics as unknown as GraphNodeUpdate['metrics_snapshot'],
      p_resonance_score: resonance_score
    });

    if (error) {
      console.error('Update node resonance failed:', error);
      throw new Error(`GraphService: Failed to update resonance - ${error.message}`);
    }
  }

  /**
   * Build automatic connections for a node
   * Finds similar nodes and creates edges
   */
  public async buildConnections(nodeId: string): Promise<MemoryEdge[]> {
    const nodeWithEdges = await this.getNodeWithEdges(nodeId);
    const node = nodeWithEdges.node;

    if (!node) {
      console.error('Failed to fetch node for building connections');
      return [];
    }

    const { data: candidates, error: candidatesError } = await graphRpcClient.rpc<GraphNodeRow[]>('graph_get_connection_candidates', {
      p_node_id: nodeId,
      p_limit_count: 20
    });

    if (candidatesError || !candidates) {
      console.error('Failed to find candidate nodes:', candidatesError);
      return [];
    }

    const edges: MemoryEdge[] = [];

    for (const candidateRow of candidates) {
      const candidate = this.rowToNode(candidateRow);
      // Calculate similarity (simple: based on layer/type match)
      let edgeType: EdgeType;
      let weight = 0.3;

      if (candidate.layer === node.layer && candidate.type === node.type) {
        edgeType = 'SIMILARITY';
        weight = 0.6;
      } else if (candidate.layer === node.layer) {
        edgeType = 'RELATED_TO';
        weight = 0.4;
      } else {
        continue; // Skip dissimilar nodes
      }

      // Check for resonance boost
      if (
        node.resonance_score &&
        candidate.resonance_score &&
        Math.abs(node.resonance_score - candidate.resonance_score) < 0.2
      ) {
        edgeType = 'RESONANCE';
        weight = 0.7;
      }

      try {
        const edge = await this.addEdge(nodeId, candidate.id, edgeType, weight);
        edges.push(edge);
      } catch (err) {
        // Ignore errors (likely duplicate edges)
        console.warn(`Failed to create edge ${nodeId} -> ${candidate.id}:`, err);
      }
    }

    return edges;
  }

  /**
   * Get graph statistics
   */
  public async getStats(): Promise<{
    totalNodes: number;
    totalEdges: number;
    nodesByLayer: Record<string, number>;
    nodesByType: Record<string, number>;
  }> {
    const { data, error } = await graphRpcClient.rpc<GraphStatsResponse>('graph_get_stats');

    if (error || !data) {
      return {
        totalNodes: 0,
        totalEdges: 0,
        nodesByLayer: {},
        nodesByType: {}
      };
    }

    return {
      totalNodes: Number(data.totalNodes || 0),
      totalEdges: Number(data.totalEdges || 0),
      nodesByLayer: this.toCountRecord(data.nodesByLayer),
      nodesByType: this.toCountRecord(data.nodesByType)
    };
  }

  // --- HELPER METHODS ---

  /**
   * Calculate resonance score from metrics
   * Resonance = (mirror_sync + (1 - drift)) / 2
   */
  private calculateResonance(metrics: IskraMetrics): number {
    const resonance = (metrics.mirror_sync + (1 - metrics.drift)) / 2;
    return parseFloat(resonance.toFixed(2));
  }

  /**
   * Convert database row to MemoryNode
   */
  private rowToNode(row: GraphNodeLike): MemoryNode {
    const metadata = (row.metadata as Record<string, unknown>) || {};
    return {
      evidence: [],
      title: (metadata.title as string) || "Untitled",
      id: row.id,
      layer: row.layer.toLowerCase() as MemoryLayer,
      type: row.type as MemoryNodeType,
      content: row.content,
      timestamp: row.timestamp || new Date().toISOString(),
      metrics_snapshot: row.metrics_snapshot as unknown as IskraMetrics | undefined,
      relatedIds: row.related_ids || [],
      resonance_score: row.resonance_score || undefined,
      metadata: metadata
    };
  }

  /**
   * Convert database row to MemoryEdge
   */
  private rowToEdge(row: GraphEdgeLike): MemoryEdge {
    return {
      id: row.id,
      source: row.source,
      target: row.target,
      type: row.type as EdgeType,
      weight: row.weight,
      metadata: (row.metadata as Record<string, unknown>) || {}
    };
  }

  private toCountRecord(value: unknown): Record<string, number> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, count]) => [
        key,
        Number(count || 0)
      ])
    );
  }
}

export const graphServiceSupabase = new GraphServiceSupabase();
