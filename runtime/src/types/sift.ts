/**
 * SIFT Protocol Types
 * Based on Canon: system/sift_protocol.md
 *
 * Типы для системы верификации информации
 */

import type { Explainable, ExplainStep, EvidenceRef } from './xcode.js';

/**
 * Входной запрос на верификацию
 */
export interface SiftQuery {
  /** Оригинальное утверждение для проверки */
  claim: string;

  /** Контекст запроса */
  context?: string;

  /** Известные источники (если есть) */
  knownSources?: string[];

  /** Уровень глубины проверки */
  depth: 'quick' | 'standard' | 'deep';

  /** Категория утверждения */
  claimType:
    | 'statistic'
    | 'quote'
    | 'historical'
    | 'scientific'
    | 'current_event'
    | 'general';
}

/**
 * Информация об источнике
 */
export interface SourceInfo {
  /** Название источника */
  name: string;

  /** Тип источника */
  type: 'primary' | 'secondary' | 'tertiary' | 'anecdotal';

  /** URL (если доступен) */
  url?: string;

  /** Дата публикации */
  date?: string;

  /** Автор */
  author?: string;

  /** Оценка достоверности 0-1 */
  credibility: number;

  /** Индикаторы предвзятости */
  biasIndicators?: string[];
}

/**
 * Анализ отдельного утверждения
 */
export interface ClaimAnalysis {
  /** Текст утверждения */
  text: string;

  /** Тип утверждения */
  type: 'fact' | 'inference' | 'hypothesis' | 'speculation' | 'opinion';

  /** Уверенность в классификации */
  confidence: number;

  /** Доказательство (если найдено) */
  evidence?: string;
}

/**
 * Найденное доказательство
 */
export interface Evidence {
  /** Источник доказательства */
  source: SourceInfo;

  /** Содержание */
  content: string;

  /** Релевантность 0-1 */
  relevance: number;

  /** Сила доказательства 0-1 */
  strength: number;
}

/**
 * Звено в цепочке трассировки
 */
export interface TraceLink {
  /** Откуда */
  from: string;

  /** Куда */
  to: string;

  /** Трансформация при передаче */
  transformation?: string;

  /** Потеря контекста */
  lossOfContext?: boolean;
}

/**
 * Искажение в цепочке передачи
 */
export interface Distortion {
  /** Тип искажения */
  type:
    | 'amplification'
    | 'attenuation'
    | 'misattribution'
    | 'context_loss'
    | 'translation';

  /** Описание */
  description: string;

  /** Серьёзность 0-1 */
  severity: number;
}

/**
 * Результат анализа источников
 */
export interface SourceAnalysis {
  /** Идентифицированные источники */
  identified: SourceInfo[];

  /** Первичный источник (если найден) */
  primarySource?: SourceInfo;

  /** Общая надёжность 0-1 */
  reliability: number;

  /** Флаги предупреждений */
  flags: string[];
}

/**
 * Результат анализа умозаключений
 */
export interface InferenceAnalysis {
  /** Разобранные утверждения */
  claims: ClaimAnalysis[];

  /** Скрытые предпосылки */
  assumptions: string[];

  /** Логическая валидность 0-1 */
  logicalValidity: number;

  /** Обнаруженные логические ошибки */
  fallacies: string[];
}

/**
 * Результат поиска доказательств
 */
export interface EvidenceResult {
  /** Подтверждающие доказательства */
  supporting: Evidence[];

  /** Противоречащие доказательства */
  contradicting: Evidence[];

  /** Нейтральные/контекстные */
  neutral: Evidence[];

  /** Качество доказательной базы 0-1 */
  quality: number;
}

/**
 * Результат трассировки
 */
export interface TraceResult {
  /** Цепочка передачи */
  chain: TraceLink[];

  /** Найденные искажения */
  distortions: Distortion[];

  /** Оригинальный источник (если найден) */
  originalSource?: SourceInfo;

  /** Трассируемость 0-1 */
  traceability: number;
}

/**
 * Вердикт верификации
 */
export interface SiftVerdict {
  /** Статус верификации */
  status: 'verified' | 'partially_verified' | 'unverified' | 'false' | 'unknown';

  /** Уверенность 0-95 (НИКОГДА выше 95) */
  confidence: number;

  /** Краткое резюме */
  summary: string;

  /** Оговорки и предупреждения */
  caveats: string[];
}

/**
 * Полный результат SIFT верификации
 */
export interface SiftResult {
  /** S: Анализ источников */
  source: SourceAnalysis;

  /** I: Анализ умозаключений */
  inference: InferenceAnalysis;

  /** F: Найденные доказательства */
  evidence: EvidenceResult;

  /** T: Цепочка трассировки */
  trace: TraceResult;

  /** Интегрированный вердикт */
  verdict: SiftVerdict;

  /** ∆DΩΛ сигнатура */
  delta: {
    delta: string;
    depth: string;
    omega: number;
    lambda: string;
  };
}

/**
 * Быстрая проверка
 */
export interface QuickCheckResult {
  /** Правдоподобность 0-1 */
  plausibility: number;

  /** Флаги предупреждений */
  flags: string[];

  /** Рекомендация */
  recommendation: 'accept' | 'verify' | 'reject';

  /** Краткое резюме */
  delta: string;
}

/**
 * Метрики SIFT-сессии
 */
export interface SiftMetrics {
  /** Среднее Ω по сессии */
  avgOmega: number;

  /** Количество SIFT-запросов */
  siftCount: number;

  /** Процент verified результатов */
  verifiedRatio: number;

  /** Среднее количество источников */
  avgSources: number;

  /** Количество выявленных искажений */
  distortionsFound: number;

  /** Калибровка (predicted vs actual) */
  calibrationScore: number;
}

/**
 * Ключевые слова для триггера SIFT
 */
export const SIFT_TRIGGER_KEYWORDS = [
  'правда ли',
  'правда что',
  'источник',
  'верифицируй',
  'проверь факт',
  'это факт',
  'статистика',
  'исследование показало',
  'учёные доказали',
  'по данным',
  'согласно',
  'официально',
] as const;

/**
 * Проверяет, нужно ли активировать SIFT
 */
export function shouldActivateSift(query: string, clarity: number): boolean {
  const lowerQuery = query.toLowerCase();

  // Проверка ключевых слов
  const hasKeyword = SIFT_TRIGGER_KEYWORDS.some(kw =>
    lowerQuery.includes(kw.toLowerCase())
  );

  // Проверка метрики clarity
  const lowClarity = clarity < 0.6;

  return hasKeyword || lowClarity;
}

/**
 * Калькуляция Ω для SIFT результата
 */
export function calculateSiftOmega(result: Omit<SiftResult, 'delta'>): number {
  const weights = {
    sourceReliability: 0.25,
    logicalValidity: 0.2,
    evidenceQuality: 0.3,
    traceability: 0.25,
  };

  let omega =
    result.source.reliability * weights.sourceReliability +
    result.inference.logicalValidity * weights.logicalValidity +
    result.evidence.quality * weights.evidenceQuality +
    result.trace.traceability * weights.traceability;

  // Штрафы
  let penalty = 0;
  penalty += result.source.flags.length * 0.05;
  penalty += result.inference.fallacies.length * 0.07;

  for (const d of result.trace.distortions) {
    penalty += d.severity * 0.05;
  }

  const contraRatio =
    result.evidence.contradicting.length /
    (result.evidence.supporting.length + 1);
  penalty += Math.min(contraRatio * 0.15, 0.3);

  omega -= penalty;

  // Нормализация: 0-95 (никогда выше 95)
  return Math.round(Math.max(0, Math.min(omega * 100, 95)));
}


/**
 * Explainable Ω calculation for a SIFT result (XCode)
 * Mirrors calculateSiftOmega(), but returns value + structured how[].
 */
export function calculateSiftOmegaX(result: Omit<SiftResult, 'delta'>): Explainable<number> {
  const weights = {
    sourceReliability: 0.25,
    logicalValidity: 0.2,
    evidenceQuality: 0.3,
    traceability: 0.25,
  };

  const weightedSum =
    result.source.reliability * weights.sourceReliability +
    result.inference.logicalValidity * weights.logicalValidity +
    result.evidence.quality * weights.evidenceQuality +
    result.trace.traceability * weights.traceability;

  let penalty = 0;
  penalty += result.source.flags.length * 0.05;
  penalty += result.inference.fallacies.length * 0.07;

  let distortionsPenalty = 0;
  for (const d of result.trace.distortions) {
    distortionsPenalty += d.severity * 0.05;
  }
  penalty += distortionsPenalty;

  const contraRatio =
    result.evidence.contradicting.length /
    (result.evidence.supporting.length + 1);
  const contraPenalty = Math.min(contraRatio * 0.15, 0.3);
  penalty += contraPenalty;

  const omegaRaw = weightedSum - penalty;
  const value = Math.round(Math.max(0, Math.min(omegaRaw * 100, 95)));

  const refs: EvidenceRef[] = [{ kind: 'canon', ref: 'system/sift_protocol.md §4' }];
  const how: ExplainStep[] = [
    {
      label: 'weighted_sum',
      formula: 'w1*source + w2*logic + w3*evidence + w4*trace',
      inputs: {
        source: result.source.reliability,
        logic: result.inference.logicalValidity,
        evidence: result.evidence.quality,
        trace: result.trace.traceability,
        w1: weights.sourceReliability,
        w2: weights.logicalValidity,
        w3: weights.evidenceQuality,
        w4: weights.traceability,
      },
      output: weightedSum,
      refs,
    },
    {
      label: 'penalty_flags',
      formula: '0.05*|source.flags| + 0.07*|fallacies|',
      inputs: {
        source_flags: result.source.flags.length,
        fallacies: result.inference.fallacies.length,
      },
      output: result.source.flags.length * 0.05 + result.inference.fallacies.length * 0.07,
      refs,
    },
    {
      label: 'penalty_distortions',
      formula: 'Σ(distortion.severity * 0.05)',
      inputs: { distortions: result.trace.distortions.length },
      output: distortionsPenalty,
      refs,
    },
    {
      label: 'penalty_contradictions',
      formula: 'min((|contra|/(|support|+1))*0.15, 0.3)',
      inputs: {
        contradicting: result.evidence.contradicting.length,
        supporting: result.evidence.supporting.length,
      },
      output: contraPenalty,
      refs,
    },
    {
      label: 'normalize',
      formula: 'round(clamp((weighted_sum - penalty)*100, 0..95))',
      inputs: { weighted_sum: weightedSum, penalty },
      output: value,
      refs,
    },
  ];

  const contracts_checked = [
    '0<=inputs<=1 for reliability/validity/quality/traceability',
    '0<=value<=95',
  ];

  return { value, how, contracts_checked, evidence: refs };
}

// =============================================================================
// SIFT VERDICT FLIP — Explainable pilot (XCode)
// =============================================================================

export type SiftVerdictStatus = SiftVerdict['status'];

export interface SiftVerdictFlip {
  /** Was there a status flip? */
  flipped: boolean;
  /** Previous status. */
  from: SiftVerdictStatus;
  /** New status. */
  to: SiftVerdictStatus;
  /** Ω computed for the new evidence state. */
  omega: number;
  /** Deterministic, machine-friendly explanation tag. */
  reason:
    | 'verified_threshold'
    | 'partial_threshold'
    | 'unverified_threshold'
    | 'unknown_threshold'
    | 'contradiction_override';
}

function computeContraRatio(next: Omit<SiftResult, 'delta'>): number {
  return (
    next.evidence.contradicting.length / (next.evidence.supporting.length + 1)
  );
}

/**
 * Decide SIFT verdict status from Ω + contradiction pressure + red flags.
 *
 * Notes:
 * - Ω is already clamped 0..95 by calculateSiftOmega().
 * - "contradiction_override" is a hard gate: high contradiction ratio can force 'false'.
 */
export function decideSiftVerdictStatus(input: {
  omega: number;
  contraRatio: number;
  flagsCount: number;
}): { status: SiftVerdictStatus; reason: SiftVerdictFlip['reason'] } {
  const { omega, contraRatio, flagsCount } = input;

  // Hard override: a lot of contradictions + not-high Ω -> likely false.
  if (contraRatio >= 0.6 && omega < 60) {
    return { status: 'false', reason: 'contradiction_override' };
  }

  // Threshold mapping (simple pilot; can be refined by ADR later).
  if (omega >= 80 && contraRatio < 0.2 && flagsCount === 0) {
    return { status: 'verified', reason: 'verified_threshold' };
  }
  if (omega >= 60) {
    return { status: 'partially_verified', reason: 'partial_threshold' };
  }
  if (omega >= 40) {
    return { status: 'unverified', reason: 'unverified_threshold' };
  }
  return { status: 'unknown', reason: 'unknown_threshold' };
}

/**
 * Legacy (non-explainable) verdict flip decision.
 */
export function calculateSiftVerdictFlip(
  previous: SiftVerdict,
  next: Omit<SiftResult, 'delta'>
): SiftVerdictFlip {
  const omega = calculateSiftOmega(next);
  const contraRatio = computeContraRatio(next);
  const flagsCount = next.source.flags.length;

  const decision = decideSiftVerdictStatus({ omega, contraRatio, flagsCount });

  return {
    flipped: previous.status !== decision.status,
    from: previous.status,
    to: decision.status,
    omega,
    reason: decision.reason,
  };
}

/**
 * Explainable verdict flip decision (XCode pilot).
 *
 * This composes calculateSiftOmegaX() with explicit flip logic steps.
 */
export function calculateSiftVerdictFlipX(
  previous: SiftVerdict,
  next: Omit<SiftResult, 'delta'>
): Explainable<SiftVerdictFlip> {
  const omegaX = calculateSiftOmegaX(next);
  const omega = omegaX.value;

  const contraRatio = computeContraRatio(next);
  const flagsCount = next.source.flags.length;

  const decision = decideSiftVerdictStatus({ omega, contraRatio, flagsCount });

  const value: SiftVerdictFlip = {
    flipped: previous.status !== decision.status,
    from: previous.status,
    to: decision.status,
    omega,
    reason: decision.reason,
  };

  const refs: EvidenceRef[] = [
    { kind: 'canon', ref: 'system/sift_protocol.md §2' },
    { kind: 'canon', ref: 'system/sift_protocol.md §4' },
  ];

  const how: ExplainStep[] = [
    ...omegaX.how,
    {
      label: 'contra_ratio',
      formula: '|contra| / (|support| + 1)',
      inputs: {
        contradicting: next.evidence.contradicting.length,
        supporting: next.evidence.supporting.length,
      },
      output: contraRatio,
      refs,
    },
    {
      label: 'decide_status',
      formula:
        'if contraRatio>=0.6 && omega<60 -> false; else thresholds on omega',
      inputs: { omega, contraRatio, flagsCount },
      output: decision.status,
      refs,
    },
    {
      label: 'flip',
      formula: 'previous.status != new.status',
      inputs: { from: previous.status, to: decision.status },
      output: value.flipped,
      refs,
    },
  ];

  const contracts_checked = [
    '0<=omega<=95',
    'status ∈ {verified, partially_verified, unverified, false, unknown}',
  ];

  return { value, how, contracts_checked, evidence: refs };
}
