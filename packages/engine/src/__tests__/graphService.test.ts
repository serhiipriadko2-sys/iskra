import { describe, it, expect } from 'vitest';
import { GraphService, type MemoryNode, type MemoryEdge } from '../services/graphService';
import type { IskraMetrics } from '@iskra/core';

function node(id: string, content: string, layer: MemoryNode['layer'] = 'memory', resonance_score?: number): MemoryNode {
  const metrics: IskraMetrics = {
    rhythm: 0,
    trust: 0.5,
    pain: 0.2,
    chaos: 0.1,
    drift: 0,
    echo: 0,
    clarity: 0.7,
    silence_mass: 0,
    mirror_sync: 0,
    interrupt: 0,
    ctxSwitch: 0,
  };

  return {
    id,
    layer,
    type: 'concept',
    content,
    timestamp: Date.now(),
    resonance_score,
    metrics_snapshot: metrics,
    metadata: { test: true },
  };
}

describe('GraphService', () => {
  it('adds nodes and edges and returns neighbors', () => {
    const g = new GraphService();

    g.addNode(node('a', 'alpha'));
    g.addNode(node('b', 'beta'));

    const e: MemoryEdge = {
      id: 'e1',
      source: 'a',
      target: 'b',
      type: 'RELATED_TO',
      weight: 0.5,
    };

    g.addEdge(e);

    const neighbors = g.getNeighbors('a');
    expect(neighbors.map((n) => n.id)).toEqual(['b']);
  });

  it('BFS traversal respects minResonance threshold', () => {
    const g = new GraphService();

    g.addNode(node('a', 'root', 'memory', 1.0));
    g.addNode(node('b', 'ok', 'memory', 0.9));
    g.addNode(node('c', 'low', 'memory', 0.1));

    g.addEdge({ id: 'e1', source: 'a', target: 'b', type: 'RELATED_TO', weight: 1.0 });
    g.addEdge({ id: 'e2', source: 'a', target: 'c', type: 'RELATED_TO', weight: 1.0 });

    const traversed = g.traverseBFS('a', 2, 0.3);
    expect(traversed.map((n) => n.id)).toContain('b');
    expect(traversed.map((n) => n.id)).not.toContain('c');
  });

  it('buildConnections creates similarity and/or causal edges', () => {
    const g = new GraphService();

    const t = Date.now();

    g.addNode({ ...node('x', 'the same keyword appears', 'archive', 0.8), timestamp: t });
    g.addNode({ ...node('y', 'keyword appears again', 'archive', 0.8), timestamp: t + 10_000 });

    // new node with overlap "keyword appears"
    g.addNode({ ...node('z', 'keyword appears third time', 'archive', 0.8), timestamp: t + 20_000 });

    const edges = g.buildConnections('z');
    expect(edges.length).toBeGreaterThan(0);

    const exported = g.exportGraph();
    expect(exported.edges.length).toBeGreaterThan(0);
  });
});
