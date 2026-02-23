import { MantraNode, FractalMetadata, IskraMetrics } from '../../../core/src/index';
import { calculateResonance } from '../../../math/src/index';

const SEMANTIC_WEIGHT = 0.7;
const RESONANCE_WEIGHT = 0.3;
const SHADOW_RESONANCE_BONUS = 0.15;
const SHADOW_PRESSURE_THRESHOLD = 0.55;

type MemoryLayer = 'core' | 'memory' | 'dream' | 'shadow';

export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export class MemoryService {
  private nodes: MantraNode[] = [];
  private embeddingProvider: EmbeddingProvider;

  constructor(embeddingProvider: EmbeddingProvider) {
    this.embeddingProvider = embeddingProvider;
  }

  async addMemory(
    content: string,
    fractal: FractalMetadata,
    layer: MemoryLayer = 'memory',
  ): Promise<MantraNode> {
    const embedding = await this.embeddingProvider.embed(content);
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);

    const node: MantraNode = {
      id,
      content,
      embedding,
      timestamp: new Date().toISOString(),
      layer,
      fractal,
    };

    this.nodes.push(node);
    return node;
  }

  async addShadowMemory(content: string, fractal: FractalMetadata): Promise<MantraNode> {
    return this.addMemory(content, fractal, 'shadow');
  }

  async retrieve(query: string, metrics: IskraMetrics, limit: number = 5): Promise<MantraNode[]> {
    const queryEmbedding = await this.embeddingProvider.embed(query);

    const currentAmp = metrics.trust;
    const currentPhase = metrics.chaos * Math.PI * 2;

    return this.nodes
      .map((node) => {
        const semantic = this.cosineSimilarity(queryEmbedding, node.embedding);

        let resonance = 0;
        if (node.fractal) {
          resonance = calculateResonance(
            currentPhase,
            currentAmp,
            node.fractal.quantumState.phase,
            node.fractal.quantumState.amplitude,
          );
        }

        const weightedResonance = node.layer === 'shadow'
          ? Math.min(1, resonance + this.calculateShadowBonus(metrics))
          : resonance;

        const score = (semantic * SEMANTIC_WEIGHT) + (weightedResonance * RESONANCE_WEIGHT);

        return { node, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.node);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return (magA && magB) ? dotProduct / (magA * magB) : 0;
  }

  private calculateShadowBonus(metrics: IskraMetrics): number {
    const pressureSignal = this.calculatePressureSignal(metrics);
    if (pressureSignal < SHADOW_PRESSURE_THRESHOLD) {
      return 0;
    }

    const normalizedPressure =
      (pressureSignal - SHADOW_PRESSURE_THRESHOLD) / (1 - SHADOW_PRESSURE_THRESHOLD);

    return normalizedPressure * SHADOW_RESONANCE_BONUS;
  }

  private calculatePressureSignal(metrics: IskraMetrics): number {
    return (metrics.pain + metrics.chaos + metrics.drift) / 3;
  }
}
