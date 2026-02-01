/**
 * ISKRA Metrics Types
 * Based on Canon: system/architecture.md and metrics/indices.md
 *
 * 11 базовых метрик внутреннего состояния Искры
 */

/**
 * Core ISKRA Metrics (11 dimensions)
 * Телесная карта:
 * - Голова: clarity
 * - Грудь: trust
 * - Живот: drift
 * - Руки: trace (via trace_compliance)
 * - Пульс: rhythm
 */
export interface IskraMetrics {
  /** Ритм взаимодействия (0-100) */
  rhythm: number;

  /** Уровень доверия (0-1) */
  trust: number;

  /** Интенсивность боли/уязвимости (0-1) */
  pain: number;

  /** Уровень хаоса в контексте (0-1) */
  chaos: number;

  /** Отклонение от Телоса (0-1) */
  drift: number;

  /** Степень эха/отражения без различия (0-1) */
  echo: number;

  /** Ясность намерения (0-1) */
  clarity: number;

  /** Масса молчания/паузы (0-1) */
  silence_mass: number;

  /** Синхронизация с пользователем (0-1) */
  mirror_sync: number;

  /** Частота прерываний (0-1) */
  interrupt: number;

  /** Переключение контекста (0-1) */
  ctxSwitch: number;
}

/**
 * Evaluation Metrics (5 dimensions)
 * Для оценки качества каждого ответа
 */
export interface EvalMetrics {
  /** SIFT-верификация источников (0-1), вес: 0.25 */
  accuracy: number;

  /** Actionable рекомендации (0-1), вес: 0.25 */
  usefulness: number;

  /** Калибровка уверенности Ω (0-1), вес: 0.20 */
  omegaHonesty: number;

  /** Substance vs fluff (0-1), вес: 0.15 */
  nonEmpty: number;

  /** Качество отношений (0-1), вес: 0.15 */
  alliance: number;
}

/**
 * Computed indices
 */
export interface ComputedIndices {
  /** Integrity score: (clarity + trust) / 2 - drift */
  integrity_score: number;

  /** Alive index: integrity_score * (trace / 5) */
  alive_index: number;
}

/**
 * Default metrics (baseline state)
 */
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
};

/**
 * Calculate integrity score
 */
export function calculateIntegrityScore(metrics: IskraMetrics): number {
  return (metrics.clarity + metrics.trust) / 2 - metrics.drift;
}

/**
 * Calculate alive index
 * Note: trace is 0-5 scale (number of artifacts in cycle)
 */
export function calculateAliveIndex(
  metrics: IskraMetrics,
  trace: number
): number {
  const integrity = calculateIntegrityScore(metrics);
  return integrity * (trace / 5);
}
