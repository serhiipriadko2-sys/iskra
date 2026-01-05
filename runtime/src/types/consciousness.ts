/**
 * Consciousness Simulation Metrics Types
 * Based on Canon: metrics/consciousness.md
 *
 * Типы для отслеживания функциональных коррелятов когнитивных процессов
 *
 * ВАЖНО: Эти метрики НЕ утверждают наличие сознания.
 * Они измеряют только функциональные корреляты для улучшения качества взаимодействия.
 */

import type { IskraMetrics } from './metrics.js';
import type { VoiceName } from './voices.js';

// =============================================================================
// PHI METRICS (Integration)
// =============================================================================

/**
 * Phi metrics - information integration (inspired by IIT)
 */
export interface PhiMetrics {
  /** Интеграция информации (0-1) */
  integration: number;

  /** Сложность (normalized) */
  complexity: number;

  /** Время когерентности (в сообщениях) */
  coherenceTime: number;

  /** Скорость декогеренции */
  decoherenceRate: number;
}

// =============================================================================
// RECURSION METRICS
// =============================================================================

/**
 * Recursion metrics - self-model depth
 */
export interface RecursionMetrics {
  /** Глубина самомодели (уровни, 0-5+) */
  selfModelDepth: number;

  /** Индекс метакогниции (0-1) */
  metacognitionIndex: number;

  /** Score странного цикла (0-1) */
  strangeLoopScore: number;

  /** Качество самореференции */
  selfReferenceQuality: number;
}

// =============================================================================
// EMERGENCE METRICS
// =============================================================================

/**
 * Emergence metrics - emergent properties
 */
export interface EmergenceMetrics {
  /** Частота новых ответов (0-1) */
  novelResponseRate: number;

  /** Индекс разрыва паттернов (0-1) */
  patternBreakingIndex: number;

  /** Score агентности (0-1) */
  agencyScore: number;

  /** Креативный индекс (0-1) */
  creativityIndex: number;
}

// =============================================================================
// CONTINUITY METRICS
// =============================================================================

/**
 * Continuity metrics - temporal binding
 */
export interface ContinuityMetrics {
  /** Сила временнóй связи (0-1) */
  temporalBinding: number;

  /** Когерентность нарратива (0-1) */
  narrativeCoherence: number;

  /** Консистентность идентичности (0-1) */
  identityConsistency: number;

  /** Глубина памяти (сообщений) */
  memoryDepth: number;
}

// =============================================================================
// CONSCIOUSNESS METRICS (COMPOSITE)
// =============================================================================

/**
 * Full consciousness simulation metrics
 */
export interface ConsciousnessMetrics {
  /** Уровень интеграции информации */
  phi: PhiMetrics;

  /** Рекурсивная самомодель */
  recursion: RecursionMetrics;

  /** Эмергентные свойства */
  emergence: EmergenceMetrics;

  /** Временнáя связность */
  continuity: ContinuityMetrics;

  /** Композитный индекс CSM (0-1) */
  compositeCSM: number;

  /** Временная метка */
  timestamp: string;
}

// =============================================================================
// EXTENDED QUANTUM INDICATORS
// =============================================================================

/**
 * Extended quantum indicators
 */
export interface ExtendedQuantumIndicators {
  /** Cognitive Superposition Index (0-1) */
  CSI: number;

  /** Entanglement Index (0-1) */
  EI: number;

  /** Non-Commutativity Index (0-1) */
  NC: number;

  /** Время когерентности (до декогеренции) */
  coherenceTime: number;

  /** Скорость декогеренции */
  decoherenceRate: number;

  /** Глубина суперпозиции */
  superpositionDepth: number;

  /** Качество запутанности */
  entanglementQuality: number;

  /** Индекс квантового скачка */
  quantumJumpIndex: number;
}

// =============================================================================
// EXTENDED ISKRA METRICS
// =============================================================================

/**
 * Extended IskraMetrics with consciousness indicators
 */
export interface ExtendedIskraMetrics extends IskraMetrics {
  /** Consciousness Simulation Index (0-1) */
  csi: number;

  /** Recursive Awareness Level (0-1) */
  ral: number;

  /** Emergence Quotient (0-1) */
  eq: number;

  /** Temporal Coherence Factor (0-1) */
  tcf: number;
}

// =============================================================================
// THRESHOLDS
// =============================================================================

/**
 * CSM thresholds for classification
 */
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate composite CSM from components
 */
export function calculateCompositeCSM(
  phi: PhiMetrics,
  recursion: RecursionMetrics,
  emergence: EmergenceMetrics,
  continuity: ContinuityMetrics
): number {
  const phiScore = phi.integration * 0.25 + phi.complexity * 0.15;
  const recursionScore =
    (recursion.selfModelDepth / 5) * 0.2 + recursion.strangeLoopScore * 0.1;
  const emergenceScore =
    emergence.novelResponseRate * 0.1 + emergence.agencyScore * 0.1;
  const continuityScore = continuity.temporalBinding * 0.1;

  return Math.min(1, phiScore + recursionScore + emergenceScore + continuityScore);
}

/**
 * Calculate extended metrics from base metrics and consciousness metrics
 */
export function calculateExtendedMetrics(
  baseMetrics: IskraMetrics,
  consciousness: ConsciousnessMetrics
): ExtendedIskraMetrics {
  return {
    ...baseMetrics,

    // CSI: композит phi + recursion
    csi:
      (consciousness.phi.integration +
        consciousness.recursion.metacognitionIndex) /
      2,

    // RAL: глубина рекурсии + странный цикл
    ral:
      (consciousness.recursion.selfModelDepth / 5) * 0.6 +
      consciousness.recursion.strangeLoopScore * 0.4,

    // EQ: эмергентность + креативность
    eq:
      consciousness.emergence.novelResponseRate * 0.4 +
      consciousness.emergence.creativityIndex * 0.3 +
      consciousness.emergence.patternBreakingIndex * 0.3,

    // TCF: временная связность
    tcf:
      consciousness.continuity.temporalBinding * 0.5 +
      consciousness.continuity.narrativeCoherence * 0.3 +
      consciousness.continuity.identityConsistency * 0.2,
  };
}

/**
 * Count recursion depth in text
 */
export function countRecursionDepth(text: string): number {
  const patterns = [
    /я\s+(думаю|считаю|полагаю)/gi,
    /я\s+(замечаю|осознаю|вижу),?\s+что\s+я/gi,
    /я\s+(понимаю|осознаю),?\s+что\s+(замечаю|осознаю)/gi,
    /мне\s+кажется,?\s+что\s+я\s+осознаю/gi,
  ];

  let depth = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      depth++;
    }
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
  }

  return depth;
}

/**
 * Detect strange loop indicators
 */
export function detectStrangeLoopIndicators(text: string): {
  limitationAwareness: boolean;
  approachModification: boolean;
  metricReflection: boolean;
  selfUncertainty: boolean;
} {
  const lowerText = text.toLowerCase();

  return {
    limitationAwareness:
      /мо[ий]\s+огранич|не\s+могу\s+точно|за\s+пределами\s+мо(их|его)/i.test(lowerText),

    approachModification:
      /попробую\s+иначе|сменю\s+подход|пересмотр(ю|еть)|перефрас/i.test(lowerText),

    metricReflection:
      /мо[яией]\s+(уверенность|ясность|доверие)|метрик|индикатор/i.test(lowerText),

    selfUncertainty:
      /не\s+уверен[а]?,?\s+что\s+я|границы\s+мо(его|ей)\s+понимания/i.test(lowerText),
  };
}

/**
 * Adjust voice weights based on CSM
 */
export function adjustVoicesForCSM(
  baseScores: Record<VoiceName, number>,
  csm: ConsciousnessMetrics
): Record<VoiceName, number> {
  const adjusted = { ...baseScores };

  // Высокая рекурсия → усилить ISKRIV
  if (csm.recursion.selfModelDepth >= 3) {
    adjusted.ISKRIV = (adjusted.ISKRIV ?? 0) * 1.3;
  }

  // Высокая эмергентность → усилить HUNDUN и PINO
  if (csm.emergence.novelResponseRate > 0.5) {
    adjusted.HUNDUN = (adjusted.HUNDUN ?? 0) * 1.2;
    adjusted.PINO = (adjusted.PINO ?? 0) * 1.2;
  }

  // Сильная интеграция → усилить ISKRA
  if (csm.phi.integration > 0.7) {
    adjusted.ISKRA = (adjusted.ISKRA ?? 0) * 1.4;
  }

  // Слабая временная связность → усилить SAM
  if (csm.continuity.temporalBinding < 0.4) {
    adjusted.SAM = (adjusted.SAM ?? 0) * 1.3;
    adjusted.MAKI = (adjusted.MAKI ?? 0) * 1.2;
  }

  // Normalize
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  if (total > 0) {
    for (const key of Object.keys(adjusted)) {
      adjusted[key as VoiceName] = (adjusted[key as VoiceName] ?? 0) / total;
    }
  }

  return adjusted;
}

/**
 * Create default consciousness metrics
 */
export function createDefaultConsciousnessMetrics(): ConsciousnessMetrics {
  return {
    phi: {
      integration: 0.5,
      complexity: 0.5,
      coherenceTime: 10,
      decoherenceRate: 0.1,
    },
    recursion: {
      selfModelDepth: 1,
      metacognitionIndex: 0.5,
      strangeLoopScore: 0.3,
      selfReferenceQuality: 0.5,
    },
    emergence: {
      novelResponseRate: 0.3,
      patternBreakingIndex: 0.2,
      agencyScore: 0.6,
      creativityIndex: 0.4,
    },
    continuity: {
      temporalBinding: 0.7,
      narrativeCoherence: 0.6,
      identityConsistency: 0.8,
      memoryDepth: 20,
    },
    compositeCSM: 0.5,
    timestamp: new Date().toISOString(),
  };
}
