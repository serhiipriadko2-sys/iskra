/**
 * Early Warning System Types
 * Based on Canon: system/early_warning.md
 *
 * Типы для системы раннего предупреждения
 */

import type { IskraMetrics } from './types.js';
import type { FractalIndicators, SystemPhase } from './fractal.types.js';
import type { PlaybookId } from './protocol.types.js';

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
