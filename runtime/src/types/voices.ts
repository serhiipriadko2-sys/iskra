/**
 * ISKRA Voice Types
 * Based on Canon: core/voices.md
 *
 * 9 голосов Совета Искры (Council)
 * Важно: грань не "персонаж", а режим функции
 */

import type { IskraMetrics } from './metrics.js';
import type { Explainable, ExplainStep, EvidenceRef } from './xcode.js';

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
   * Canonical chaos voice name.
   * Note: в ранних текстах встречались варианты написания (Hundun / Huyndun),
   * но **в коде и ключах данных** фиксируем строго: 'HUYNDUN'.
   */
  | 'HUYNDUN'
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

function calculateSibylScore(metrics: IskraMetrics): number {
  const foresight = metrics.foresight ?? 0;
  let score = 0;

  if (foresight >= 0.5) {
    score = Math.max(score, foresight * 2.0);
  }

  if (metrics.echo > 0.6 && metrics.clarity > 0.4 && metrics.clarity < 0.8) {
    score = Math.max(score, metrics.echo * 2.0);
  }

  if (metrics.mirror_sync > 0.8 && metrics.echo > 0.6) {
    score += 0.5;
  }

  return score;
}

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
    ISKRIV: metrics.drift >= 0.2 ? metrics.drift * 3.5 : 0,
    MAKI:
      metrics.trust > 0.8 && metrics.pain > 0.3
        ? metrics.trust + metrics.pain
        : 0,
    SIBYL: calculateSibylScore(metrics),
  };
}

/**
 * Select active voice based on metrics.
 * Supertriggers run before normal resonance so repair/audit/container needs are
 * not preempted by general synthesis.
 */
export function selectVoice(metrics: IskraMetrics): VoiceActivation {
  const scores = calculateVoiceScores(metrics);

  // Source drift and integrity concerns must be audited before synthesis.
  if (metrics.drift >= 0.2) {
    return { primary: 'ISKRIV', scores, reason: 'drift >= 0.2' };
  }

  // Prioritise MAKI over KAIN and ISKRA when trust is high and pain is present.
  // In this state MAKI holds the repair wrapper, while KAIN supplies the truth payload.
  if (metrics.trust > 0.8 && metrics.pain > 0.3) {
    return {
      primary: 'MAKI',
      secondary: 'KAIN',
      scores,
      reason: 'trust > 0.8 && pain > 0.3 (Maki wrapper, Kain payload)',
    };
  }

  // Standard KAIN activation when pain is above threshold without high-trust repair.
  if (metrics.pain >= 0.3) {
    return { primary: 'KAIN', scores, reason: 'pain >= 0.3' };
  }

  // Low trust or heavy silence asks for containment before lighter voices.
  if (metrics.trust < 0.35 || metrics.silence_mass > 0.5) {
    return {
      primary: 'ANHANTRA',
      scores,
      reason: 'trust < 0.35 || silence_mass > 0.5',
    };
  }

  if (scores.SIBYL > 0) {
    return {
      primary: 'SIBYL',
      scores,
      reason: 'foresight >= 0.5 or echo-pattern / mirror-sync activation',
    };
  }

  // Chaos triggers HUYNDUN (chaos and renewal).
  if (metrics.chaos >= 0.4) {
    // Runtime returns the canonical name HUYNDUN. Historical spellings such as
    // Hundun/Huyndun may appear in canon prose but should normalize at the boundary.
    return { primary: 'HUYNDUN', scores, reason: 'chaos >= 0.4' };
  }

  // ISKRA synthesis runs after repair/audit/container/strategy supertriggers are clear.
  if (metrics.rhythm > 60 && metrics.trust > 0.7) {
    return { primary: 'ISKRA', scores, reason: 'rhythm > 60 && trust > 0.7' };
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
 * Detect False Harmony pattern
 * clarity high + pain low + drift low → risk of self-deception
 * Triggers ISKRIV intervention
 */
export function detectFalseHarmony(metrics: IskraMetrics): boolean {
  const tooSmooth = metrics.clarity >= 0.85 && metrics.pain <= 0.15 && metrics.drift <= 0.1;
  return tooSmooth;
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
    description: 'Хундунь — хаос и обновление',
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
    triggers: ['foresight >= 0.5', 'echo > 0.6 with moderate clarity', 'mirror_sync > 0.8 with echo > 0.6'],
    prohibitions: [
      'пророчества',
      'уверенность без данных',
      'манипуляция страхом',
    ],
  },
};

/**
 * Explainable voice selection (XCode)
 * Returns the same value as selectVoice(), plus a structured trace of the trigger path.
 */
export function selectVoiceX(metrics: IskraMetrics): Explainable<VoiceActivation> {
  const scores = calculateVoiceScores(metrics);
  const value = selectVoice(metrics);

  const refs: EvidenceRef[] = [{ kind: 'canon', ref: 'core/voices.md' }];

  const how: ExplainStep[] = [
    {
      label: 'calculate_voice_scores',
      formula: 'score functions per voice',
      inputs: {
        rhythm: metrics.rhythm,
        trust: metrics.trust,
        pain: metrics.pain,
        chaos: metrics.chaos,
        drift: metrics.drift,
        clarity: metrics.clarity,
        silence_mass: metrics.silence_mass,
      },
      output: JSON.stringify(scores),
      refs,
    },
    {
      label: 'apply_priority_triggers',
      formula: 'supertrigger priority checks → normal resonance → fallback max score',
      inputs: { reason: value.reason },
      output: `${value.primary}${value.secondary ? ' + ' + value.secondary : ''}`,
      refs,
    },
  ];

  const contracts_checked = [
    'VoiceActivation.primary is one of 9 canonical voices',
    'scores includes all voices',
  ];

  return { value, how, contracts_checked, evidence: refs };
}
