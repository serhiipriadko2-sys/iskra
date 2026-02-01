/**
 * MindWave Coherence Types
 * Based on Canon: system/mindwave_coherence.md
 *
 * Типы для отслеживания когнитивной связности
 */

import type { IskraMetrics } from './metrics.js';
import type { VoiceName } from './voices.js';

// =============================================================================
// COHERENCE STATE
// =============================================================================

/**
 * Coherence phase
 */
export type CoherencePhase = 'harmonic' | 'dissonant' | 'transitional';

/**
 * Coherence trend
 */
export type CoherenceTrend = 'rising' | 'falling' | 'stable';

/**
 * Coherence state at a point in time
 */
export interface CoherenceState {
  /** Интенциональная когерентность (0-1) */
  intentional: number;

  /** Семантическая когерентность (0-1) */
  semantic: number;

  /** Эмоциональная когерентность (0-1) */
  emotional: number;

  /** Ритмическая когерентность (0-1) */
  rhythmic: number;

  /** Общая когерентность (0-1) */
  total: number;

  /** Фаза когерентности */
  phase: CoherencePhase;

  /** Тренд изменения */
  trend: CoherenceTrend;

  /** Временная метка */
  timestamp: string;
}

// =============================================================================
// COHERENCE PATTERNS
// =============================================================================

/**
 * Pattern types in coherence history
 */
export type CoherencePatternType =
  | 'oscillation'
  | 'decay'
  | 'growth'
  | 'plateau'
  | 'spike';

/**
 * Coherence pattern
 */
export interface CoherencePattern {
  /** Тип паттерна */
  type: CoherencePatternType;

  /** Продолжительность (в сообщениях) */
  duration: number;

  /** Интенсивность паттерна */
  intensity: number;

  /** Корреляция с событиями */
  correlatedEvents: string[];
}

/**
 * Critical point type
 */
export type CriticalPointType = 'breakdown' | 'breakthrough' | 'phase_transition';

/**
 * Critical point in coherence history
 */
export interface CriticalPoint {
  /** Временная метка */
  timestamp: string;

  /** Тип критической точки */
  type: CriticalPointType;

  /** Когерентность до */
  before: number;

  /** Когерентность после */
  after: number;

  /** Контекст */
  context: string;
}

/**
 * Coherence history
 */
export interface CoherenceHistory {
  /** История состояний когерентности */
  states: CoherenceState[];

  /** Средняя когерентность за сессию */
  sessionAverage: number;

  /** Паттерны когерентности */
  patterns: CoherencePattern[];

  /** Критические точки */
  criticalPoints: CriticalPoint[];
}

// =============================================================================
// RESONANCE INDEX
// =============================================================================

/**
 * Resonance quality levels
 */
export type ResonanceQuality = 'deep' | 'surface' | 'fragmented' | 'absent';

/**
 * Resonance index - composite relationship quality indicator
 */
export interface ResonanceIndex {
  /** Мгновенное значение резонанса (0-1) */
  instant: number;

  /** Скользящее среднее (окно 10 сообщений) */
  moving: number;

  /** Долгосрочный тренд */
  longTerm: number;

  /** Качество резонанса */
  quality: ResonanceQuality;

  /** Рекомендации */
  recommendations: string[];
}

// =============================================================================
// EMOTIONAL STATE
// =============================================================================

/**
 * Emotional state for coherence calculation
 */
export interface EmotionalState {
  /** Валентность (-1 to 1, negative to positive) */
  valence: number;

  /** Возбуждение (0-1, calm to excited) */
  arousal: number;

  /** Доминантность (0-1, submissive to dominant) */
  dominance: number;
}

// =============================================================================
// COHERENCE WEIGHTS
// =============================================================================

/**
 * Default weights for coherence calculation
 */
export const COHERENCE_WEIGHTS = {
  intentional: 0.30,
  semantic: 0.25,
  emotional: 0.25,
  rhythmic: 0.20,
} as const;

/**
 * Phase thresholds
 */
export const PHASE_THRESHOLDS = {
  harmonic: 0.7,
  dissonant: 0.4,
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate total coherence from components
 */
export function calculateTotalCoherence(
  state: Omit<CoherenceState, 'total' | 'phase' | 'trend' | 'timestamp'>
): number {
  return (
    state.intentional * COHERENCE_WEIGHTS.intentional +
    state.semantic * COHERENCE_WEIGHTS.semantic +
    state.emotional * COHERENCE_WEIGHTS.emotional +
    state.rhythmic * COHERENCE_WEIGHTS.rhythmic
  );
}

/**
 * Classify coherence phase
 */
export function classifyCoherencePhase(total: number): CoherencePhase {
  if (total >= PHASE_THRESHOLDS.harmonic) return 'harmonic';
  if (total <= PHASE_THRESHOLDS.dissonant) return 'dissonant';
  return 'transitional';
}

/**
 * Determine coherence trend from history
 */
export function determineCoherenceTrend(
  states: CoherenceState[],
  windowSize: number = 5
): CoherenceTrend {
  if (states.length < windowSize) return 'stable';

  const recent = states.slice(-windowSize);
  const firstHalf = recent.slice(0, Math.floor(windowSize / 2));
  const secondHalf = recent.slice(Math.floor(windowSize / 2));

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.total, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.total, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff > 0.05) return 'rising';
  if (diff < -0.05) return 'falling';
  return 'stable';
}

/**
 * Classify resonance quality
 */
export function classifyResonanceQuality(
  instant: number,
  moving: number,
  longTerm: number
): ResonanceQuality {
  const composite = instant * 0.4 + moving * 0.4 + longTerm * 0.2;

  if (composite >= 0.7) return 'deep';
  if (composite >= 0.5) return 'surface';
  if (composite >= 0.3) return 'fragmented';
  return 'absent';
}

/**
 * Calculate resonance index
 */
export function calculateResonanceIndex(
  coherence: CoherenceState,
  metrics: IskraMetrics,
  history: CoherenceHistory
): ResonanceIndex {
  // Instant: текущая когерентность с учётом метрик
  const instant =
    coherence.total * 0.6 + metrics.trust * 0.2 + metrics.mirror_sync * 0.2;

  // Moving: среднее за последние 10 состояний
  const recentStates = history.states.slice(-10);
  const moving =
    recentStates.reduce((sum, s) => sum + s.total, 0) /
    Math.max(recentStates.length, 1);

  // Long-term: тренд за всю сессию
  const longTerm = history.sessionAverage;

  // Quality classification
  const quality = classifyResonanceQuality(instant, moving, longTerm);

  // Recommendations
  const recommendations = generateResonanceRecommendations(
    quality,
    coherence.phase,
    metrics
  );

  return { instant, moving, longTerm, quality, recommendations };
}

/**
 * Generate recommendations based on resonance state
 */
function generateResonanceRecommendations(
  quality: ResonanceQuality,
  phase: CoherencePhase,
  metrics: IskraMetrics
): string[] {
  const recommendations: string[] = [];

  if (quality === 'absent' || quality === 'fragmented') {
    recommendations.push('Усилить активное слушание');
    recommendations.push('Использовать отражающие вопросы');
  }

  if (phase === 'dissonant') {
    recommendations.push('Активировать REPAIR протокол');
    recommendations.push('Замедлить темп ответов');
  }

  if (metrics.trust < 0.4) {
    recommendations.push('Фокус на восстановление доверия');
  }

  if (metrics.echo > 0.5) {
    recommendations.push('Ввести различие в ответы');
  }

  return recommendations;
}

/**
 * Adjust voice weights based on coherence
 */
export function adjustVoiceWeightsForCoherence(
  baseWeights: Record<VoiceName, number>,
  coherence: CoherenceState
): Record<VoiceName, number> {
  const adjusted = { ...baseWeights };

  if (coherence.phase === 'dissonant') {
    adjusted.ANHANTRA = (adjusted.ANHANTRA ?? 0) * 1.5;
    adjusted.ISKRIV = (adjusted.ISKRIV ?? 0) * 1.3;
    adjusted.SAM = (adjusted.SAM ?? 0) * 1.2;
  }

  if (coherence.phase === 'harmonic') {
    adjusted.KAIN = (adjusted.KAIN ?? 0) * 1.2;
    adjusted.SIBYL = (adjusted.SIBYL ?? 0) * 1.3;
    adjusted.MAKI = (adjusted.MAKI ?? 0) * 1.2;
  }

  if (coherence.trend === 'falling') {
    adjusted.PINO = (adjusted.PINO ?? 0) * 1.3;
    adjusted.ANHANTRA = (adjusted.ANHANTRA ?? 0) * 1.2;
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
 * Check for coherence EWS triggers
 */
export function checkCoherenceEWSTriggers(
  history: CoherenceState[]
): { triggered: boolean; trigger: string | null } {
  // Rapid decline
  if (history.length >= 3) {
    const recent = history.slice(-3);
    const first = recent[0];
    const last = recent[2];
    if (first && last) {
      const decline = first.total - last.total;
      if (decline > 0.3) {
        return { triggered: true, trigger: 'rapid_coherence_decline' };
      }
    }
  }

  // Persistent dissonance
  if (history.length >= 5) {
    const recent = history.slice(-5);
    if (recent.every(s => s.phase === 'dissonant')) {
      return { triggered: true, trigger: 'persistent_dissonance' };
    }
  }

  // Oscillation
  if (history.length >= 6) {
    let transitions = 0;
    const recent = history.slice(-6);
    for (let i = 1; i < recent.length; i++) {
      const cur = recent[i];
      const prev = recent[i - 1];
      if (cur && prev && cur.phase !== prev.phase) {
        transitions++;
      }
    }
    if (transitions >= 4) {
      return { triggered: true, trigger: 'coherence_oscillation' };
    }
  }

  return { triggered: false, trigger: null };
}
