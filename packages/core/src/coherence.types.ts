/**
 * MindWave Coherence Types
 * Based on Canon: system/mindwave_coherence.md
 *
 * Типы для отслеживания когнитивной связности
 */



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
