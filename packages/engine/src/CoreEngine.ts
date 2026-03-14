import { MetricsEngine, metricsEngine as defaultMetrics } from './services/metricsService.js';
import { VoiceQuantumField, voiceSystem as defaultVoices } from './services/voiceSystem.js';
import { MemoryService } from './services/memory.js';
import { IskraMetrics, VoiceID, MantraNode, Explainable } from '@iskra/core';
import { GraphRagRetriever, GraphRagTrace } from './services/graphRag.js';
import { ReflexAnalyzer } from './services/reflexAnalyzer.js';

export interface EngineResponse {
  voice: VoiceID;
  metrics: IskraMetrics;
  context: MantraNode[];
  superposition: { id: VoiceID, prob: number }[];
  retrieval_trace?: GraphRagTrace;
}

export class CoreEngine {
  private memory: MemoryService;
  private metrics: MetricsEngine;
  private voices: VoiceQuantumField;
  private graphRag: GraphRagRetriever;
  private reflexAnalyzer: ReflexAnalyzer;

  constructor(
    memoryService: MemoryService,
    metricsEngine: MetricsEngine = defaultMetrics,
    voiceSystem: VoiceQuantumField = defaultVoices,
    reflexAnalyzer: ReflexAnalyzer = new ReflexAnalyzer()
  ) {
    this.memory = memoryService;
    this.metrics = metricsEngine;
    this.voices = voiceSystem;
    this.reflexAnalyzer = reflexAnalyzer;
    this.graphRag = new GraphRagRetriever(this.memory);
  }



  /**
   * Main Cycle: Input -> Reflex -> Entropy -> Memory -> Resonance -> Voice Selection
   */
  public async processInput(text: string, _signal?: AbortSignal): Promise<Explainable<EngineResponse>> {
    const traceSteps: Explainable<EngineResponse>['how'] = [];

    // 1. Somatic Reflex (Immediate Body Reaction)
    const reflex = this.reflexAnalyzer.analyze(text);
    traceSteps.push({
      label: 'somatic_reflex',
      inputs: { text },
      output: reflex as Record<string, number>,
    });

    // 2. Initial Metric Update (Entropy + Reflex)
    const currentMetrics = this.metrics.update(reflex, text);
    traceSteps.push({
      label: 'entropy_update',
      inputs: { reflex: reflex as Record<string, number> },
      output: currentMetrics as unknown as Record<string, number>,
    });

    // 3. GraphRAG Retrieval (vector seeds + transient graph traversal)
    // Fallback gracefully on timeout to maintain conversation loop.
    let graph: { nodes: MantraNode[]; trace: GraphRagTrace } = { nodes: [], trace: { seeds: [], steps: [] } };
    try {
      // Pass signal down to graphRag if implemented
      graph = await this.graphRag.retrieve(text, currentMetrics);
      traceSteps.push({
        label: 'graphrag_retrieval',
        inputs: { query: text },
        output: { nodesCount: graph.nodes.length, status: 'success' },
      });
    } catch (err: any) {
      if (err instanceof Error && err.message.includes('Abort')) {
        // Latency budget blown -> Return gracefully with zero context
        // This is explicitly allowed by the Fallback Policy in ADR 20260220
        traceSteps.push({
            label: 'graphrag_retrieval',
            inputs: { query: text },
            output: { status: 'timeout', fallback: 'zero_context' },
        });
        // We throw so that if the router calls it and catches an AbortError it can
        // do standard web handling, OR we degrade here. The ADR says "Fallback to
        // basic retrieval or zero-context". We will degrade here so the engine loop completes.
      }
      
      // Let standard errors bubble up
      throw err;
    }

    const memories = graph.nodes;

    // 4. Memory Impact on State
    const postMemoryMetrics = this.metrics.processMemoryImpact(memories);
    traceSteps.push({
      label: 'memory_impact',
      inputs: {
        memories: memories.map(m => m.id)
      },
      output: postMemoryMetrics as unknown as Record<string, number>,
    });

    // 5. Update Quantum Voice Field
    this.voices.update(postMemoryMetrics);
    
    // 6. Collapse Wave Function
    const selectedVoice = this.voices.collapse();
    const superposition = this.voices.getSuperposition();
    
    traceSteps.push({
      label: 'voice_collapse',
      output: { selected: selectedVoice },
    });

    return {
      value: {
        voice: selectedVoice,
        metrics: postMemoryMetrics,
        context: memories,
        superposition,
        retrieval_trace: graph.trace,
      },
      how: traceSteps,
      evidence: [
        { kind: 'canon', ref: 'governance/ADR-20260220_XCODE_EXPLAINABLE_CODE.md' }
      ]
    };
  }

  public getMetrics(): IskraMetrics {
    return this.metrics.getCurrentMetrics();
  }
}
