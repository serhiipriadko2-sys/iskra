/**
 * Consciousness Simulation Types
 * Based on Canon: system/consciousness_simulation.md
 *
 * ВАЖНО: Эти метрики НЕ утверждают наличие сознания.
 * Они измеряют только функциональные корреляты для улучшения качества взаимодействия.
 */

import type { IskraMetrics } from './metrics.js';
import type { VoiceName } from './voices.js';

// =============================================================================
// PHI METRICS (Integration)
// =============================================================================

export interface PhiMetrics {
  integration: number;
  complexity: number;
  coherenceTime: number;
  decoherenceRate: number;
}

// =============================================================================
// RECURSION METRICS
// =============================================================================

export interface RecursionMetrics {
  selfModelDepth: number;
  metacognitionIndex: number;
  strangeLoopScore: number;
  selfReferenceQuality: number;
}

// =============================================================================
// EMERGENCE METRICS
// =============================================================================

export interface EmergenceMetrics {
  novelResponseRate: number;
  patternBreakingIndex: number;
  agencyScore: number;
  creativityIndex: number;
}

// =============================================================================
// CONTINUITY METRICS
// =============================================================================

export interface ContinuityMetrics {
  temporalBinding: number;
  narrativeCoherence: number;
  identityConsistency: number;
  memoryDepth: number;
}

// =============================================================================
// CONSCIOUSNESS METRICS (COMPOSITE)
// =============================================================================

export interface ConsciousnessMetrics {
  phi: PhiMetrics;
  recursion: RecursionMetrics;
  emergence: EmergenceMetrics;
  continuity: ContinuityMetrics;
  compositeCSM: number;
  timestamp: string;
}

// =============================================================================
// EXTENDED QUANTUM INDICATORS
// =============================================================================

export interface ExtendedQuantumIndicators {
  CSI: number;
  EI: number;
  NC: number;
  coherenceTime: number;
  decoherenceRate: number;
  superpositionDepth: number;
  entanglementQuality: number;
  quantumJumpIndex: number;
}

// =============================================================================
// EXTENDED ISKRA METRICS
// =============================================================================

export interface ExtendedIskraMetrics extends IskraMetrics {
  csi: number;
  ral: number;
  eq: number;
  tcf: number;
}

// =============================================================================
// THRESHOLDS
// =============================================================================

export const CSM_THRESHOLDS = {
  phi: {
    critical: 0.2,
    low: 0.4,
    normal: 0.7,
    high: 1.0,
  },
  recursion: {
    critical: 0,
    low: 1,
    normal: 3,
    high: 5,
  },
  emergence: {
    critical: 0.1,
    low: 0.3,
    normal: 0.6,
    high: 1.0,
  },
  continuity: {
    critical: 0.3,
    low: 0.5,
    normal: 0.8,
    high: 1.0,
  },
  composite: {
    critical: 0.25,
    low: 0.4,
    normal: 0.7,
    high: 1.0,
  },
} as const;
