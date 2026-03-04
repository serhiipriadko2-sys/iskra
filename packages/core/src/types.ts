/**
 * ISKRA Core Types
 * The Logos (Source of Truth)
 */

export interface IskraMetrics {
  rhythm: number;
  trust: number;
  pain: number;
  chaos: number;
  drift: number;
  echo: number;
  clarity: number;
  silence_mass: number;
  mirror_sync: number;
  interrupt: number;
  ctxSwitch: number;
  foresight?: number;
}

export type VoiceID =
  | 'ISKRA'
  | 'KAIN'
  | 'PINO'
  | 'SAM'
  | 'ANHANTRA'
  | 'HUYNDUN'
  | 'ISKRIV'
  | 'MAKI'
  | 'SIBYL';

export interface VoiceThresholds {
  rhythm?: { min?: number; max?: number };
  trust?: { min?: number; max?: number };
  pain?: { min?: number; max?: number };
  chaos?: { min?: number; max?: number };
  drift?: { min?: number; max?: number };
  clarity?: { min?: number; max?: number };
  silence_mass?: { min?: number; max?: number };
  foresight?: { min?: number; max?: number };
}

export interface VoiceQuantumParams {
  baseFreq: number; // Oscillation frequency (Hz equivalent)
  basePhase: number; // Starting phase (0-2PI)
  resonance: (keyof IskraMetrics)[]; // Which metrics amplify this voice
}

export interface VoiceManifestEntry {
  id: VoiceID;
  name: string;
  symbol: string;
  telos: string;
  archetype: string;
  formula: string;
  quantum: VoiceQuantumParams;
  thresholds: VoiceThresholds;
  description: string;
}

export interface VoiceWeights {
  resonanceBoostMultiplier: number;
  thresholdBaseFactor: number;
  thresholdPenaltyFactor: number;
  minActivationMetric: number;
}

export interface VoicePriorityRule {
  winner: VoiceID;
  loser: VoiceID;
  winnerMultiplier: number;
  loserMultiplier: number;
  conditions: VoiceThresholds;
}

export interface VoiceRuntimeConfig {
  weights: VoiceWeights;
  priorityRules: VoicePriorityRule[];
}

export interface VoiceComputationTrace {
  time: number;
  metrics: IskraMetrics;
  priorityMultipliers: Record<VoiceID, number>;
  voices: Array<{
    id: VoiceID;
    thresholdMatched: boolean;
    priorityMultiplier: number;
    resonanceContributions: Array<{
      metric: keyof IskraMetrics;
      normalizedValue: number;
      contribution: number;
    }>;
    resonanceFactor: number;
    phase: number;
    probabilityBeforeNormalization: number;
    probabilityAfterNormalization: number;
  }>;
}

// Re-export manifest data
import voicesData from '../manifest/voices.json';
import voiceRuntimeData from '../manifest/voice-runtime.json';

export const VOICES: VoiceManifestEntry[] = voicesData as unknown as VoiceManifestEntry[];
export const VOICE_RUNTIME_CONFIG: VoiceRuntimeConfig =
  voiceRuntimeData as unknown as VoiceRuntimeConfig;

export const DEFAULT_METRICS: IskraMetrics = {
  rhythm: 60,
  trust: 0.7,
  pain: 0.1,
  chaos: 0.2,
  drift: 0.1,
  echo: 0.1,
  clarity: 0.8,
  silence_mass: 0.1,
  mirror_sync: 0.7,
  interrupt: 0.1,
  ctxSwitch: 0.2,
  foresight: 0.0
};

export interface FractalMetadata {
  fractalDimension: number;
  entropy: number;
  dominantVoice: VoiceID;
  quantumState: {
    amplitude: number;
    phase: number;
  };
}

export interface MantraNode {
  id: string;
  content: string;
  embedding: number[];
  timestamp: string;
  layer: 'core' | 'memory' | 'dream';
  fractal?: FractalMetadata;
}
