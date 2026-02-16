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
   * Somatic Reflex: The body reacts before the mind thinks.
   * Scans input for high-impact keywords to trigger immediate metric shifts.
   */
  private analyzeReflex(text: string): Partial<IskraMetrics> {
    const reflex: Partial<IskraMetrics> = {};
    const lower = text.toLowerCase();

    // Pain Reflex (KAIN Trigger)
    if (lower.includes('pain') || lower.includes('hurt') || lower.includes('suffering')) {
      reflex.pain = 0.4; // Increase pain significantly (0.4 is a huge jump)
    }

    // Chaos Reflex (HUYNDUN Trigger)
    if (lower.includes('chaos') || lower.includes('lost') || lower.includes('confused')) {
      reflex.chaos = 0.3;
    }

    // Trust Reflex (MAKI Trigger)
    if (lower.includes('trust') || lower.includes('believe') || lower.includes('safe')) {
      reflex.trust = 0.2;
    }

    // Love Reflex (MAKI/ISKRA)
    if (lower.includes('love')) {
        reflex.trust = 0.2;
        reflex.rhythm = 0.1; // Increase BPM slightly (excitement)
    }

    return reflex;
  }

  /**
   * Main Cycle: Input -> Reflex -> Entropy -> Memory -> Resonance -> Voice Selection
   */
  public async processInput(text: string): Promise<EngineResponse> {
    // 1. Somatic Reflex (Immediate Body Reaction)
    const reflex = this.analyzeReflex(text);

    // 2. Initial Metric Update (Entropy + Reflex)
    // Now additive in MetricsEngine
    const currentMetrics = this.metrics.update(reflex, text);

    // 3. Fractal Memory Retrieval
    // Use current state to find resonant memories
    // Retrieve 10 memories for deep context
    const memories = await this.memory.retrieve(text, currentMetrics, 10);

    // 4. Memory Impact on State
    // "The past changes the present"
    const postMemoryMetrics = this.metrics.processMemoryImpact(memories);

    // 5. Update Quantum Voice Field
    // This updates probabilities based on new metrics (Resonance/Chaos)
    this.voices.update(postMemoryMetrics);

    // 6. Collapse Wave Function
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
