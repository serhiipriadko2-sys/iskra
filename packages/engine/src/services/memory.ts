import { MantraNode, FractalMetadata, IskraMetrics } from '@iskra/core';
import { calculateResonance } from '@iskra/math';

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class MemoryService {
  private nodes: MantraNode[] = [];
  private embeddingProvider: EmbeddingProvider;

  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
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
        const semantic = node.embedding ? this.cosineSimilarity(queryEmbedding, node.embedding) : 0;

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
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return (magA && magB) ? dotProduct / (magA * magB) : 0;
  }
}
