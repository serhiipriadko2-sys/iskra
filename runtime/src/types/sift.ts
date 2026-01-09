/**
 * SIFT Protocol Types
 * Based on Canon: system/sift_protocol.md
 *
 * Типы для системы верификации информации
 */

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
