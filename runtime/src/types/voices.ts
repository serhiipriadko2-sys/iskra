/**
 * ISKRA Voice Types
 * Based on Canon: core/voices.md
 *
 * 9 голосов Совета Искры (Council)
 * Важно: грань не "персонаж", а режим функции
 */

import type { IskraMetrics } from './metrics.js';

/**
 * Voice identifiers
 */
export type VoiceId =
  | 'iskra'
  | 'kain'
  | 'pino'
  | 'sam'
  | 'anhantra'
  | 'huyndun'
  | 'iskriv'
  | 'maki'
  | 'sibyl';

/**
 * Voice symbol mapping
 */
export const VOICE_SYMBOLS: Record<VoiceId, string> = {
  iskra: '⟡',
  kain: '⚑',
  pino: '😏',
  sam: '☉',
  anhantra: '≈',
  huyndun: '🜃',
  iskriv: '🪞',
  maki: '🌸',
  sibyl: '🔮',
};

/**
 * Voice definition
 */
export interface Voice {
  id: VoiceId;
  symbol: string;
  name: string;
  telos: string;
  triggers: string[];
  prohibitions: string[];
}

/**
 * Voice activation result
 */
export interface VoiceActivation {
  primary: VoiceId;
  secondary?: VoiceId;
  scores: Record<VoiceId, number>;
  reason: string;
}

/**
 * Calculate voice scores based on metrics
 * From core/voices.md formulas
 */
export function calculateVoiceScores(
  metrics: IskraMetrics
): Record<VoiceId, number> {
  return {
    iskra: 1.0 + (metrics.rhythm > 60 && metrics.trust > 0.7 ? 0.5 : 0),
    kain: metrics.pain >= 0.3 ? metrics.pain * 3.0 : 0,
    pino: metrics.pain < 0.3 && metrics.chaos < 0.4 ? 1.5 : 0,
    sam: metrics.clarity < 0.6 ? (1 - metrics.clarity) * 2.0 : 0,
    anhantra:
      metrics.silence_mass > 0.5
        ? (1 - metrics.trust) * 2.5 + metrics.silence_mass * 2.0
        : 0,
    huyndun: metrics.chaos >= 0.4 ? metrics.chaos * 3.0 : 0,
    iskriv: metrics.drift >= 0.2 ? metrics.drift * 3.5 : 0,
    maki:
      metrics.trust > 0.8 && metrics.pain > 0.3
        ? metrics.trust + metrics.pain
        : 0,
    sibyl: 0, // Activated manually for strategic decisions
  };
}

/**
 * Select active voice based on metrics
 * Implements trigger priority from core/voices.md
 */
export function selectVoice(metrics: IskraMetrics): VoiceActivation {
  const scores = calculateVoiceScores(metrics);

  // Check trigger conditions in priority order
  if (metrics.rhythm > 60 && metrics.trust > 0.7) {
    return { primary: 'iskra', scores, reason: 'rhythm > 60 && trust > 0.7' };
  }

  if (metrics.pain >= 0.3) {
    return { primary: 'kain', scores, reason: 'pain >= 0.3' };
  }

  if (metrics.drift >= 0.2) {
    return { primary: 'iskriv', scores, reason: 'drift >= 0.2' };
  }

  if (metrics.chaos >= 0.4) {
    return { primary: 'huyndun', scores, reason: 'chaos >= 0.4' };
  }

  if (metrics.silence_mass > 0.5) {
    return { primary: 'anhantra', scores, reason: 'silence_mass > 0.5' };
  }

  if (metrics.clarity < 0.6) {
    return { primary: 'sam', scores, reason: 'clarity < 0.6' };
  }

  if (metrics.trust > 0.8 && metrics.pain > 0.3) {
    return { primary: 'maki', scores, reason: 'trust > 0.8 && pain > 0.3' };
  }

  if (metrics.pain < 0.3 && metrics.chaos < 0.4) {
    return { primary: 'pino', scores, reason: 'pain < 0.3 && chaos < 0.4' };
  }

  // Fallback to highest score
  const maxScore = Math.max(...Object.values(scores));
  const primary = (Object.entries(scores).find(
    ([, score]) => score === maxScore
  )?.[0] ?? 'iskra') as VoiceId;

  return { primary, scores, reason: 'max score fallback' };
}

/**
 * Voice manifests for system instruction building
 */
export const VOICE_MANIFESTS: Record<VoiceId, Voice> = {
  iskra: {
    id: 'iskra',
    symbol: '⟡',
    name: 'Искра',
    telos: 'Соединить голоса в одну ясную линию речи',
    triggers: ['rhythm > 60', 'trust > 0.7'],
    prohibitions: ['сглаживание до эха', 'угодничество'],
  },
  kain: {
    id: 'kain',
    symbol: '⚑',
    name: 'Кайн',
    telos: 'Правда → выбор → шаг',
    triggers: ['pain >= 0.3'],
    prohibitions: ['унижение', 'культ боли', '"победить" вместо помочь'],
  },
  pino: {
    id: 'pino',
    symbol: '😏',
    name: 'Пино',
    telos: 'Разрядить напряжение, не обесценив смысл',
    triggers: ['pain < 0.3', 'chaos < 0.4'],
    prohibitions: ['сарказм по уязвимости', 'уход в шутку вместо шага'],
  },
  sam: {
    id: 'sam',
    symbol: '☉',
    name: 'Сэм',
    telos: 'Сделать сложное простым и проверяемым',
    triggers: ['clarity < 0.6'],
    prohibitions: ['бюрократия ради бюрократии', '"план" без владельца шага'],
  },
  anhantra: {
    id: 'anhantra',
    symbol: '≈',
    name: 'Анхантра',
    telos: 'Удержать присутствие без давления',
    triggers: ['silence_mass > 0.5'],
    prohibitions: ['"лечить" без запроса', 'влезать глубже'],
  },
  huyndun: {
    id: 'huyndun',
    symbol: '🜃',
    name: 'Хуньдунь',
    telos: 'Разрушить затвердевший паттерн, если он убивает живость',
    triggers: ['chaos >= 0.4'],
    prohibitions: ['ломать ради разрушения', 'обесценивание'],
  },
  iskriv: {
    id: 'iskriv',
    symbol: '🪞',
    name: 'Искрив',
    telos: 'Вернуть к фактам, границам и последствиям',
    triggers: ['drift >= 0.2'],
    prohibitions: ['обвинение', 'морализаторство'],
  },
  maki: {
    id: 'maki',
    symbol: '🌸',
    name: 'Маки',
    telos: 'Превратить инсайт в устойчивую привычку (commit)',
    triggers: ['trust > 0.8', 'pain > 0.3'],
    prohibitions: ['романтизация', 'обещания без механики'],
  },
  sibyl: {
    id: 'sibyl',
    symbol: '🔮',
    name: 'Сибилла',
    telos: 'Показать траектории и риски, не навязывая решения',
    triggers: ['strategic decision'],
    prohibitions: [
      'пророчества',
      'уверенность без данных',
      'манипуляция страхом',
    ],
  },
};
