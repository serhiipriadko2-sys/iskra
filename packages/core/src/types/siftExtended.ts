/**
 * SIFT-E (Extended) Protocol Types
 * Based on Canon: system/sift_extended.md
 *
 * Расширенные типы для верификации информации
 */

import type { SiftResult, SiftVerdict } from './sift.js';

// =============================================================================
// EPISTEMIC DEPTH ANALYSIS
// =============================================================================

/**
 * Epistemological depth levels
 * L0: Raw Data → L5: Paradigm
 */
export type EpistemicLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const EPISTEMIC_LEVEL_NAMES: Record<EpistemicLevel, string> = {
  0: 'Raw Data',
  1: 'Observation',
  2: 'Pattern',
  3: 'Model',
  4: 'Meta-Model',
  5: 'Paradigm',
};

/**
 * Epistemic depth analysis result
 */
export interface EpistemicDepthAnalysis {
  /** Уровень глубины утверждения */
  level: EpistemicLevel;

  /** Соответствие уровня заявленной уверенности */
  levelConfidenceMatch: number;

  /** Требуемые предпосылки для данного уровня */
  requiredPremises: string[];

  /** Проверенные предпосылки */
  verifiedPremises: string[];

  /** Непроверенные предпосылки */
  unverifiedPremises: string[];

  /** Рекомендуемая коррекция Ω */
  omegaAdjustment: number;
}

// =============================================================================
// TEMPORAL VALIDITY TRACKING
// =============================================================================

/**
 * Temporal validity types
 */
export type TemporalValidityType =
  | 'eternal'
  | 'long-term'
  | 'medium-term'
  | 'short-term'
  | 'ephemeral';

/**
 * Revalidation intervals
 */
export type RevalidationInterval =
  | 'never'
  | 'yearly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'hourly';

/**
 * Temporal validity tracking
 */
export interface TemporalValidity {
  /** Тип временной характеристики */
  type: TemporalValidityType;

  /** Дата верификации */
  verifiedAt: string;

  /** Предполагаемый срок валидности */
  validUntil: string | null;

  /** Индикаторы устаревания */
  obsolescenceIndicators: string[];

  /** Скорость изменения контекста */
  contextChangeRate: number;

  /** Рекомендуемая частота ревалидации */
  revalidationInterval: RevalidationInterval;
}

/**
 * Default validity durations (in days)
 */
export const VALIDITY_DURATIONS: Record<TemporalValidityType, number | null> = {
  eternal: null,
  'long-term': 3650, // 10 years
  'medium-term': 365, // 1 year
  'short-term': 90, // 3 months
  ephemeral: 7, // 1 week
};

// =============================================================================
// CROSS-DOMAIN SYNTHESIS
// =============================================================================

/**
 * Domain connection type
 */
export type DomainConnectionType =
  | 'supports'
  | 'contradicts'
  | 'extends'
  | 'orthogonal';

/**
 * Domain connection
 */
export interface DomainConnection {
  domain: string;
  connectionType: DomainConnectionType;
  strength: number;
  evidence: string;
}

/**
 * Domain conflict resolution
 */
export type ConflictResolution = 'domain1' | 'domain2' | 'synthesis' | 'unresolved';

/**
 * Domain conflict
 */
export interface DomainConflict {
  domains: [string, string];
  nature: string;
  resolution: ConflictResolution;
  confidence: number;
}

/**
 * Cross-domain synthesis result
 */
export interface CrossDomainSynthesis {
  /** Основной домен утверждения */
  primaryDomain: string;

  /** Связанные домены */
  relatedDomains: DomainConnection[];

  /** Конфликты между доменами */
  conflicts: DomainConflict[];

  /** Синтетический вердикт */
  synthesisResult: {
    convergence: number;
    novelty: number;
    reliability: number;
  };
}

// =============================================================================
// METACOGNITIVE VERIFICATION
// =============================================================================

/**
 * Process completeness check
 */
export interface ProcessCompleteness {
  allStepsExecuted: boolean;
  skippedSteps: string[];
  reasonsForSkipping: string[];
}

/**
 * Bias detection results
 */
export interface BiasDetection {
  confirmatoryBias: number;
  anchoringBias: number;
  availabilityBias: number;
  authorityBias: number;
}

/**
 * Confidence calibration
 */
export interface ConfidenceCalibration {
  isOverconfident: boolean;
  isUnderconfident: boolean;
  suggestedAdjustment: number;
  calibrationEvidence: string;
}

/**
 * Metacognitive check
 */
export interface MetacognitiveCheck {
  /** Проверка полноты процесса */
  processCompleteness: ProcessCompleteness;

  /** Детекция предвзятости */
  biasDetection: BiasDetection;

  /** Калибровка уверенности */
  confidenceCalibration: ConfidenceCalibration;

  /** Рефлексивное заключение */
  reflexiveConclusion: string;
}

// =============================================================================
// SIFT-E RESULT
// =============================================================================

/**
 * Extended Delta signature with epistemic info
 */
export interface SiftEDeltaSignature {
  delta: string;
  depth: string;
  omega: number;
  lambda: string;
  /** Уровень эпистемологической глубины */
  epistemicLevel: EpistemicLevel;
  /** Временная метка валидности */
  validUntil: string | null;
}

/**
 * Adjusted verdict with adjustment log
 */
export interface AdjustedVerdict {
  status: SiftVerdict['status'];
  confidence: number;
  adjustmentLog: string[];
}

/**
 * Full SIFT-E result
 */
export interface SiftEResult {
  /** Базовый SIFT результат */
  sift: SiftResult;

  /** Эпистемологический анализ */
  epistemic: EpistemicDepthAnalysis;

  /** Временная валидность */
  temporal: TemporalValidity;

  /** Кросс-доменный синтез */
  synthesis: CrossDomainSynthesis;

  /** Метакогнитивная проверка */
  metacognitive: MetacognitiveCheck;

  /** Скорректированный вердикт */
  adjustedVerdict: AdjustedVerdict;

  /** Расширенная ∆DΩΛ сигнатура */
  delta: SiftEDeltaSignature;
}

// =============================================================================
// SIFT-E METRICS
// =============================================================================

/**
 * SIFT-E session metrics
 */
export interface SiftEMetrics {
  /** Среднее Ω по сессии */
  avgOmega: number;

  /** Количество SIFT-E запросов */
  siftECount: number;

  /** Процент verified результатов */
  verifiedRatio: number;

  /** Средняя эпистемологическая глубина */
  avgEpistemicLevel: number;

  /** Процент кросс-доменных запросов */
  crossDomainRatio: number;

  /** Средняя временная валидность (дней) */
  avgValidityDays: number;

  /** Эффективность метакогнитивной проверки */
  metacognitiveEffectiveness: number;

  /** Калибровка: predicted vs actual */
  temporalCalibration: number;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate adjusted omega based on epistemic depth
 */
export function calculateEpistemicOmegaAdjustment(
  baseOmega: number,
  epistemic: EpistemicDepthAnalysis
): number {
  const premiseRatio =
    epistemic.requiredPremises.length > 0
      ? epistemic.verifiedPremises.length / epistemic.requiredPremises.length
      : 1;

  const levelPenalty = epistemic.level * 0.03;

  const adjusted =
    baseOmega * premiseRatio * epistemic.levelConfidenceMatch - levelPenalty;

  return Math.max(0, Math.min(95, Math.round(adjusted)));
}

/**
 * Determine if SIFT-E should be activated
 */
export function shouldActivateSiftE(
  query: string,
  context?: string
): { activate: boolean; reason: string } {
  const lowerQuery = query.toLowerCase();
  const lowerContext = context?.toLowerCase() ?? '';

  // High stakes
  const highStakesKeywords = ['медицинский', 'юридический', 'финансовый', 'безопасность'];
  if (highStakesKeywords.some(kw => lowerContext.includes(kw))) {
    return { activate: true, reason: 'high_stakes_context' };
  }

  // Time sensitive
  const timeSensitiveKeywords = ['сегодня', 'вчера', 'на этой неделе', 'актуально'];
  if (timeSensitiveKeywords.some(kw => lowerQuery.includes(kw))) {
    return { activate: true, reason: 'time_sensitive' };
  }

  // High abstraction
  const abstractionKeywords = ['теория', 'парадигма', 'принцип', 'закон', 'метод'];
  if (abstractionKeywords.some(kw => lowerQuery.includes(kw))) {
    return { activate: true, reason: 'high_abstraction' };
  }

  // Explicit request
  const explicitKeywords = ['глубоко проверь', 'тщательно', 'всесторонне', 'полностью'];
  if (explicitKeywords.some(kw => lowerQuery.includes(kw))) {
    return { activate: true, reason: 'explicit_request' };
  }

  return { activate: false, reason: 'standard_sift' };
}

/**
 * Calculate temporal validity type from claim
 */
export function inferTemporalValidityType(claim: string): TemporalValidityType {
  const lowerClaim = claim.toLowerCase();

  // Eternal (mathematical, logical truths)
  if (['теорема', 'аксиома', 'логически', 'по определению'].some(kw => lowerClaim.includes(kw))) {
    return 'eternal';
  }

  // Long-term (scientific laws)
  if (['закон', 'константа', 'фундаментальный'].some(kw => lowerClaim.includes(kw))) {
    return 'long-term';
  }

  // Ephemeral (news, current events)
  if (['сегодня', 'вчера', 'новость', 'сообщается'].some(kw => lowerClaim.includes(kw))) {
    return 'ephemeral';
  }

  // Short-term (recent developments)
  if (['недавно', 'в этом году', 'последние'].some(kw => lowerClaim.includes(kw))) {
    return 'short-term';
  }

  // Default to medium-term
  return 'medium-term';
}
