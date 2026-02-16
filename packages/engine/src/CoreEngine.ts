import { MetricsEngine, metricsEngine as defaultMetrics } from './services/metricsService.js';
import { VoiceQuantumField, voiceSystem as defaultVoices } from './services/voiceSystem.js';
import { MemoryService } from './services/memory.js';
import { IskraMetrics, VoiceID, MantraNode } from '../../core/src/index';

export interface EngineResponse {
  voice: VoiceID;
  metrics: IskraMetrics;
  context: MantraNode[];
  superposition: { id: VoiceID, prob: number }[];
}

export class CoreEngine {
  private memory: MemoryService;
  private metrics: MetricsEngine;
  private voices: VoiceQuantumField;

  constructor(
    memoryService: MemoryService,
    metricsEngine: MetricsEngine = defaultMetrics,
    voiceSystem: VoiceQuantumField = defaultVoices
  ) {
    this.memory = memoryService;
    this.metrics = metricsEngine;
    this.voices = voiceSystem;
  }

  /**
   * Main Cycle: Input -> Entropy -> Memory -> Resonance -> Voice Selection
   */
  public async processInput(text: string): Promise<EngineResponse> {
    // 1. Initial Metric Update (Entropy from text)
    const currentMetrics = this.metrics.update({}, text);

    // 2. Fractal Memory Retrieval
    // Use current state to find resonant memories
    // Retrieve 10 memories for deep context
    const memories = await this.memory.retrieve(text, currentMetrics, 10);

    // 3. Memory Impact on State
    // "The past changes the present"
    const postMemoryMetrics = this.metrics.processMemoryImpact(memories);

    // 4. Update Quantum Voice Field
    // This updates probabilities based on new metrics (Resonance/Chaos)
    this.voices.update(postMemoryMetrics);

    // 5. Collapse Wave Function
    const selectedVoice = this.voices.collapse();
    const superposition = this.voices.getSuperposition();

    return {
      voice: selectedVoice,
      metrics: postMemoryMetrics,
      context: memories,
      superposition
    };
  }

  public getMetrics(): IskraMetrics {
    return this.metrics.getCurrentMetrics();
  }
}
