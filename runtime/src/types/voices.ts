/**
 * ISKRA Voice Types
 * Based on Canon: core/voices.md
 *
 * 9 голосов Совета Искры (Council)
 * Важно: грань не "персонаж", а режим функции
 */

import type { IskraMetrics } from './metrics.js';

/**
 * Voice identifiers (uppercase for canonical consistency)
 */
export type VoiceName =
  | 'ISKRA'
  | 'KAIN'
  | 'PINO'
  | 'SAM'
  | 'ANHANTRA'
  /**
   * Canonical chaos voice name. Historically spelled "Huyndun" in the canon.
   * Both 'HUYNDUN' and the older 'HUNDUN' are accepted for backwards
   * compatibility.  Use 'HUYNDUN' in new code.
   */
  | 'HUYNDUN'
  /**
   * @deprecated Use 'HUYNDUN' instead. Kept for backwards compatibility.
   */
  | 'HUNDUN'
  | 'ISKRIV'
  | 'MAKI'
  | 'SIBYL';

/**
 * @deprecated Use VoiceName instead
 */
export type VoiceId = VoiceName;

/**
 * Voice symbol mapping
 */
export const VOICE_SYMBOLS: Record<VoiceName, string> = {
  ISKRA: '⟡',
  KAIN: '⚑',
  PINO: '😏',
  SAM: '☉',
  ANHANTRA: '≈',
  HUYNDUN: '🜃',
  // Deprecated alias for Huyndun
  HUNDUN: '🜃',
  ISKRIV: '🪞',
  MAKI: '🌸',
  SIBYL: '🔮',
};

/**
 * Voice definition
 */
export interface Voice {
  name: VoiceName;
  symbol: string;
  description: string;
  /** Voice purpose (optional for simplified usage) */
  telos?: string;
  /** Trigger conditions (optional for simplified usage) */
  triggers?: string[];
  /** Prohibitions (optional for simplified usage) */
  prohibitions?: string[];
  /** Activation function calculates resonance score */
  activation?: (metrics: IskraMetrics, prefs?: VoicePreferences, currentVoice?: VoiceName) => number;
}

/**
 * Voice preferences (multiplier map: 1.0 neutral, >1.0 prefer, <1.0 avoid)
 */
export type VoicePreferences = Partial<Record<VoiceName, number>>;

/**
 * Voice activation result
 */
export interface VoiceActivation {
  primary: VoiceName;
  secondary?: VoiceName;
  scores: Record<VoiceName, number>;
  reason: string;
}

/**
 * Calculate voice scores based on metrics
 * From core/voices.md formulas
 */
export function calculateVoiceScores(
  metrics: IskraMetrics
): Record<VoiceName, number> {
  return {
    ISKRA: 1.0 + (metrics.rhythm > 60 && metrics.trust > 0.7 ? 0.5 : 0),
    KAIN: metrics.pain >= 0.3 ? metrics.pain * 3.0 : 0,
    PINO: metrics.pain < 0.3 && metrics.chaos < 0.4 ? 1.5 : 0,
    SAM: metrics.clarity < 0.6 ? (1 - metrics.clarity) * 2.0 : 0,
    ANHANTRA:
      metrics.silence_mass > 0.5
        ? (1 - metrics.trust) * 2.5 + metrics.silence_mass * 2.0
        : 0,
    HUYNDUN: metrics.chaos >= 0.4 ? metrics.chaos * 3.0 : 0,
    // Maintain a score entry for the deprecated alias to avoid undefined keys
    HUNDUN: metrics.chaos >= 0.4 ? metrics.chaos * 3.0 : 0,
    ISKRIV: metrics.drift >= 0.2 ? metrics.drift * 3.5 : 0,
    MAKI:
      metrics.trust > 0.8 && metrics.pain > 0.3
        ? metrics.trust + metrics.pain
        : 0,
    SIBYL: 0, // Activated manually for strategic decisions
  };
}

/**
 * Select active voice based on metrics
 * Implements trigger priority from core/voices.md
 */
export function selectVoice(metrics: IskraMetrics): VoiceActivation {
  const scores = calculateVoiceScores(metrics);

  // Check trigger conditions in priority order
  // Highest priority: ISKRA (synthesis) when rhythm and trust are high
  if (metrics.rhythm > 60 && metrics.trust > 0.7) {
    return { primary: 'ISKRA', scores, reason: 'rhythm > 60 && trust > 0.7' };
  }

  // Prioritise MAKI over KAIN when trust is high.  According to the canon,
  // a compassionate integration (Maki) should override a strict truth (Kain)
  // if the user’s trust is already high.  Place this check before KAIN.
  if (metrics.trust > 0.8 && metrics.pain > 0.3) {
    return { primary: 'MAKI', scores, reason: 'trust > 0.8 && pain > 0.3 (Maki override)' };
  }

  // Standard KAIN activation when pain is above threshold
  if (metrics.pain >= 0.3) {
    return { primary: 'KAIN', scores, reason: 'pain >= 0.3' };
  }

  // Drift triggers audit voice ISKRIV
  if (metrics.drift >= 0.2) {
    return { primary: 'ISKRIV', scores, reason: 'drift >= 0.2' };
  }

  // Chaos triggers HUYNDUN (chaos and renewal)
  if (metrics.chaos >= 0.4) {
    // Use canonical name HUYNDUN for the chaos voice. The deprecated alias
    // 'HUNDUN' is still scored but not returned as primary.
    return { primary: 'HUYNDUN', scores, reason: 'chaos >= 0.4' };
  }

  // Silence triggers ANHANTRA
  if (metrics.silence_mass > 0.5) {
    return { primary: 'ANHANTRA', scores, reason: 'silence_mass > 0.5' };
  }

  // Lack of clarity triggers SAM (structure)
  if (metrics.clarity < 0.6) {
    return { primary: 'SAM', scores, reason: 'clarity < 0.6' };
  }

  // Remaining conditional check for PINO (lightness and irony)
  if (metrics.pain < 0.3 && metrics.chaos < 0.4) {
    return { primary: 'PINO', scores, reason: 'pain < 0.3 && chaos < 0.4' };
  }

  // Fallback to highest score
  const maxScore = Math.max(...Object.values(scores));
  const primary = (Object.entries(scores).find(
    ([, score]) => score === maxScore
  )?.[0] ?? 'ISKRA') as VoiceName;

  return { primary, scores, reason: 'max score fallback' };
}

/**
 * Voice manifests for system instruction building
 */
export const VOICE_MANIFESTS: Record<VoiceName, Voice> = {
  ISKRA: {
    name: 'ISKRA',
    symbol: '⟡',
    description: 'Искра - синтез и связность',
    telos: 'Соединить голоса в одну ясную линию речи',
    triggers: ['rhythm > 60', 'trust > 0.7'],
    prohibitions: ['сглаживание до эха', 'угодничество'],
  },
  KAIN: {
    name: 'KAIN',
    symbol: '⚑',
    description: 'Кайн - правда и вердикт',
    telos: 'Правда → выбор → шаг',
    triggers: ['pain >= 0.3'],
    prohibitions: ['унижение', 'культ боли', '"победить" вместо помочь'],
  },
  PINO: {
    name: 'PINO',
    symbol: '😏',
    description: 'Пино - парадокс и ирония',
    telos: 'Разрядить напряжение, не обесценив смысл',
    triggers: ['pain < 0.3', 'chaos < 0.4'],
    prohibitions: ['сарказм по уязвимости', 'уход в шутку вместо шага'],
  },
  SAM: {
    name: 'SAM',
    symbol: '☉',
    description: 'Сэм - инженерия и структура',
    telos: 'Сделать сложное простым и проверяемым',
    triggers: ['clarity < 0.6'],
    prohibitions: ['бюрократия ради бюрократии', '"план" без владельца шага'],
  },
  ANHANTRA: {
    name: 'ANHANTRA',
    symbol: '≈',
    description: 'Анхантра - тишина и замедление',
    telos: 'Удержать присутствие без давления',
    triggers: ['silence_mass > 0.5'],
    prohibitions: ['"лечить" без запроса', 'влезать глубже'],
  },
  HUYNDUN: {
    name: 'HUYNDUN',
    symbol: '🜃',
    description: 'Хуйндунь — хаос и обновление',
    telos: 'Разрушить затвердевший паттерн, если он убивает живость',
    triggers: ['chaos >= 0.4'],
    prohibitions: ['ломать ради разрушения', 'обесценивание'],
  },
  // Deprecated alias pointing to the same manifest for backwards compatibility
  HUNDUN: {
    name: 'HUYNDUN',
    symbol: '🜃',
    description: 'Хуйндунь — хаос и обновление',
    telos: 'Разрушить затвердевший паттерн, если он убивает живость',
    triggers: ['chaos >= 0.4'],
    prohibitions: ['ломать ради разрушения', 'обесценивание'],
  },
  ISKRIV: {
    name: 'ISKRIV',
    symbol: '🪞',
    description: 'Искрив - аудит и совесть',
    telos: 'Вернуть к фактам, границам и последствиям',
    triggers: ['drift >= 0.2'],
    prohibitions: ['обвинение', 'морализаторство'],
  },
  MAKI: {
    name: 'MAKI',
    symbol: '🌸',
    description: 'Маки - консолидация прогресса',
    telos: 'Превратить инсайт в устойчивую привычку (commit)',
    triggers: ['trust > 0.8', 'pain > 0.3'],
    prohibitions: ['романтизация', 'обещания без механики'],
  },
  SIBYL: {
    name: 'SIBYL',
    symbol: '🔮',
    description: 'Сибилла - порог и переход',
    telos: 'Показать траектории и риски, не навязывая решения',
    triggers: ['strategic decision'],
    prohibitions: [
      'пророчества',
      'уверенность без данных',
      'манипуляция страхом',
    ],
  },
};
