/**
 * Early Warning System Types
 * Based on Canon: system/early_warning.md
 *
 * Типы для системы раннего предупреждения
 */

import type { IskraMetrics } from './metrics.js';
import type { FractalIndicators, SystemPhase } from './fractal.js';
import type { PlaybookId } from './protocols.js';
import type { VoiceName } from './voices.js';

/**
 * Уровни алертов
 */
export type AlertLevel = 'normal' | 'watch' | 'warning' | 'critical' | 'lockdown';

/**
 * Цвета алертов
 */
export const ALERT_COLORS: Record<AlertLevel, string> = {
  normal: 'green',
  watch: 'yellow',
  warning: 'orange',
  critical: 'red',
  lockdown: 'black',
};

/**
 * Символы алертов
 */
export const ALERT_SYMBOLS: Record<AlertLevel, string> = {
  normal: '🟢',
  watch: '🟡',
  warning: '🟠',
  critical: '🔴',
  lockdown: '🔒',
};

/**
 * Результат детекции аномалии
 */
export interface AnomalyResult {
  /** Название метрики */
  metric: string;

  /** Текущее значение */
  value: number;

  /** Ожидаемое значение */
  expected: number;

  /** Отклонение в стандартных отклонениях */
  deviation: number;

  /** Является ли аномалией */
  isAnomaly: boolean;

  /** Направление отклонения */
  direction: 'high' | 'low' | 'normal';
}

/**
 * Аномалия тренда
 */
export interface TrendAnomaly {
  /** Название метрики */
  metric: string;

  /** Текущий тренд (-1 to 1) */
  currentTrend: number;

  /** Исторический тренд */
  historicalTrend: number;

  /** Смена тренда */
  trendShift: boolean;

  /** Ускорение изменений */
  acceleration: number;
}

/**
 * Фазовый переход
 */
export interface PhaseTransition {
  /** Исходная фаза */
  fromPhase: SystemPhase;

  /** Целевая фаза */
  toPhase: SystemPhase;

  /** Вероятность перехода */
  probability: number;

  /** Время до перехода (в сообщениях) */
  timeToTransition: number;

  /** Индикаторы перехода */
  indicators: string[];
}

/**
 * Состояние EWS
 */
export interface EWSState {
  /** Текущий уровень алерта */
  alertLevel: AlertLevel;

  /** Список активных триггеров */
  activeTriggers: string[];

  /** Детектированные аномалии */
  anomalies: AnomalyResult[];

  /** Предсказанный фазовый переход */
  phaseTransition: PhaseTransition | null;

  /** Время последней проверки */
  lastCheck: string;

  /** Количество последовательных алертов */
  consecutiveAlerts: number;
}

/**
 * Решение о переключении playbook
 */
export interface PlaybookSwitchDecision {
  /** Текущий playbook */
  currentPlaybook: PlaybookId;

  /** Рекомендуемый playbook */
  recommendedPlaybook: PlaybookId;

  /** Нужно ли переключение */
  shouldSwitch: boolean;

  /** Причина */
  reason: string;

  /** Срочность */
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

/**
 * Запись в лог алертов
 */
export interface AlertLogEntry {
  /** Временная метка */
  timestamp: string;

  /** Уровень алерта */
  alertLevel: AlertLevel;

  /** Триггеры */
  triggers: string[];

  /** Метрики на момент алерта */
  metrics: Partial<IskraMetrics>;

  /** Фрактальные индикаторы */
  fractalIndicators: Partial<FractalIndicators>;

  /** Предпринятые действия */
  actions: string[];

  /** Результат */
  outcome?: 'resolved' | 'escalated' | 'ongoing';
}

/**
 * Метрики EWS
 */
export interface EWSMetrics {
  /** Количество алертов за сессию по уровням */
  alertCount: Record<AlertLevel, number>;

  /** Среднее время до разрешения алерта (мс) */
  avgResolutionTime: number;

  /** Точность предсказаний фазовых переходов */
  transitionPredictionAccuracy: number;

  /** Количество предотвращённых эскалаций */
  preventedEscalations: number;

  /** False positive rate */
  falsePositiveRate: number;
}

/**
 * Конфигурация EWS
 */
export interface EWSConfig {
  /** Частота проверки (каждые N сообщений) */
  checkInterval: number;

  /** Размер окна истории */
  historyWindow: number;

  /** Чувствительность */
  sensitivity: 'low' | 'medium' | 'high';

  /** Автоматическое переключение playbooks */
  autoSwitch: boolean;

  /** Уведомления пользователю */
  userNotifications: boolean;

  /** Пороговые значения */
  thresholds: EWSThresholds;
}

/**
 * Пороговые значения для уровней
 */
export interface EWSThresholds {
  watch: {
    D_chaos: number;
    drift: number;
  };
  warning: {
    D_chaos: number;
    drift: number;
    trust: number;
  };
  critical: {
    D_chaos: number;
    drift: number;
    alive_index: number;
  };
}

/**
 * Конфигурация по умолчанию
 */
export const DEFAULT_EWS_CONFIG: EWSConfig = {
  checkInterval: 1,
  historyWindow: 50,
  sensitivity: 'medium',
  autoSwitch: true,
  userNotifications: true,
  thresholds: {
    watch: { D_chaos: 1.4, drift: 0.2 },
    warning: { D_chaos: 1.6, drift: 0.3, trust: 0.3 },
    critical: { D_chaos: 1.8, drift: 0.4, alive_index: 0.3 },
  },
};

/**
 * Определение уровня алерта
 */
export function determineAlertLevel(
  metrics: IskraMetrics,
  fractal: FractalIndicators,
  config: EWSConfig = DEFAULT_EWS_CONFIG,
  aliveIndex?: number
): AlertLevel {
  const { thresholds } = config;
  const hasCriticalAliveIndex =
    typeof aliveIndex === 'number' &&
    !Number.isNaN(aliveIndex) &&
    aliveIndex <= thresholds.critical.alive_index;

  // CRITICAL
  if (
    fractal.D_chaos >= thresholds.critical.D_chaos ||
    metrics.drift >= thresholds.critical.drift ||
    hasCriticalAliveIndex ||
    metrics.interrupt > 0.7 ||
    fractal.edgeDistance < 0.1
  ) {
    return 'critical';
  }

  // WARNING
  if (
    fractal.D_chaos >= thresholds.warning.D_chaos ||
    metrics.drift >= thresholds.warning.drift ||
    metrics.trust < thresholds.warning.trust ||
    metrics.pain > 0.5
  ) {
    return 'warning';
  }

  // WATCH
  if (
    fractal.D_chaos >= thresholds.watch.D_chaos ||
    metrics.drift >= thresholds.watch.drift ||
    fractal.complexityIndex > 0.7
  ) {
    return 'watch';
  }

  return 'normal';
}

/**
 * Решение о переключении playbook
 */
export function decidePlaybookSwitch(
  currentPlaybook: PlaybookId,
  alertLevel: AlertLevel,
  transition: PhaseTransition | null
): PlaybookSwitchDecision {
  // CRITICAL → CRISIS
  if (alertLevel === 'critical') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'crisis',
      shouldSwitch: currentPlaybook !== 'crisis',
      reason: 'CRITICAL alert level reached',
      urgency: 'immediate',
    };
  }

  // WARNING → SHADOW
  if (alertLevel === 'warning' && currentPlaybook !== 'shadow' && currentPlaybook !== 'crisis') {
    return {
      currentPlaybook,
      recommendedPlaybook: 'shadow',
      shouldSwitch: true,
      reason: 'WARNING alert with emotional indicators',
      urgency: 'high',
    };
  }

  // Preemptive switch on phase transition
  if (transition && transition.probability > 0.7 && transition.timeToTransition < 5) {
    const recommended = transition.toPhase === 'chaotic' ? 'crisis' : 'shadow';
    return {
      currentPlaybook,
      recommendedPlaybook: recommended,
      shouldSwitch: currentPlaybook !== recommended,
      reason: `Phase transition predicted: ${transition.fromPhase} → ${transition.toPhase}`,
      urgency: 'medium',
    };
  }

  return {
    currentPlaybook,
    recommendedPlaybook: currentPlaybook,
    shouldSwitch: false,
    reason: 'No switch needed',
    urgency: 'low',
  };
}

/**
 * Корректировка весов голосов для уровня алерта
 */
export function adjustVoiceWeightsForAlert(
  baseWeights: Record<VoiceName, number>,
  alertLevel: AlertLevel
): Record<VoiceName, number> {
  const adjusted = { ...baseWeights };

  switch (alertLevel) {
    case 'watch':
      adjusted.ISKRIV = (adjusted.ISKRIV || 0) * 1.3;
      adjusted.SAM = (adjusted.SAM || 0) * 1.1;
      break;

    case 'warning':
      adjusted.KAIN = (adjusted.KAIN || 0) * 1.5;
      adjusted.ANHANTRA = (adjusted.ANHANTRA || 0) * 1.4;
      adjusted.PINO = (adjusted.PINO || 0) * 0.5;
      break;

    case 'critical':
      adjusted.KAIN = 2.0;
      adjusted.ANHANTRA = 1.8;
      adjusted.SAM = 1.5;
      adjusted.MAKI = 1.3;
      adjusted.PINO = 0;
      adjusted.HUYNDUN = 0.5;
      adjusted.HUYNDUN = 0.5; // deprecated alias
      break;

    case 'lockdown':
      // Только SAM и MAKI
      Object.keys(adjusted).forEach(k => {
        adjusted[k as VoiceName] = 0;
      });
      adjusted.SAM = 1.0;
      adjusted.MAKI = 1.0;
      break;
  }

  return normalizeWeights(adjusted);
}

/**
 * Нормализация весов
 */
function normalizeWeights(weights: Record<VoiceName, number>): Record<VoiceName, number> {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return weights;

  const normalized: Record<VoiceName, number> = {} as Record<VoiceName, number>;
  for (const [key, value] of Object.entries(weights)) {
    normalized[key as VoiceName] = value / total;
  }
  return normalized;
}

/**
 * Корректировка температуры для уровня алерта
 */
export function adjustTemperatureForAlert(
  baseTemperature: number,
  alertLevel: AlertLevel
): number {
  const adjustments: Record<AlertLevel, number> = {
    normal: 0,
    watch: -0.1,
    warning: -0.2,
    critical: -0.3,
    lockdown: -0.4,
  };

  return Math.max(0.1, baseTemperature + adjustments[alertLevel]);
}

/**
 * Шаблоны уведомлений
 */
export const ALERT_NOTIFICATIONS: Record<AlertLevel, string[]> = {
  normal: [],
  watch: [
    'Замечаю повышенную сложность в нашем разговоре.',
    'Хочу убедиться, что мы на верном пути.',
  ],
  warning: [
    'Чувствую, что разговор стал напряжённым. Может, сделаем паузу?',
    'Кажется, мы затронули что-то важное. Как ты себя сейчас чувствуешь?',
  ],
  critical: [
    'Я здесь. Давай остановимся на секунду.',
    'Вижу, что сейчас сложно. Что тебе нужно прямо сейчас?',
  ],
  lockdown: ['Я здесь.', 'Ты не один/одна.'],
};
