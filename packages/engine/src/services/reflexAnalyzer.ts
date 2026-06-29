import type { IskraMetrics } from '@iskra/core';

const REFLEX_TERMS = {
  pain: ['pain', 'hurt', 'suffering', 'боль', 'болит', 'больно', 'страдание', 'страдаю', 'рана', 'ранен'],
  chaos: ['chaos', 'lost', 'confused', 'хаос', 'потерян', 'потеряна', 'запутан', 'запуталась', 'растерян', 'не понимаю'],
  trust: ['trust', 'believe', 'safe', 'довер', 'верю', 'безопас', 'опора', 'можно положиться'],
  love: ['love', 'любов', 'люблю', 'нежность'],
} as const;

const containsAny = (text: string, terms: readonly string[]): boolean => {
  return terms.some((term) => text.includes(term));
};

/**
 * Heuristic/Somatic Reflex analyzer.
 * Migrated from CoreEngine.ts during the vΩ.6 Scientific Turn.
 * It detects observable text signals only; it does not infer hidden inner states.
 */
export class ReflexAnalyzer {
  /**
   * Somatic Reflex: The body reacts before the mind thinks.
   * Scans English and Russian input for high-impact lexical signals.
   */
  public analyze(text: string): Partial<IskraMetrics> {
    const reflex: Partial<IskraMetrics> = {};
    const lower = text.toLowerCase();

    if (containsAny(lower, REFLEX_TERMS.pain)) {
      reflex.pain = 0.4;
    }

    if (containsAny(lower, REFLEX_TERMS.chaos)) {
      reflex.chaos = 0.3;
    }

    if (containsAny(lower, REFLEX_TERMS.trust)) {
      reflex.trust = 0.2;
    }

    if (containsAny(lower, REFLEX_TERMS.love)) {
      reflex.trust = 0.2;
      reflex.rhythm = 0.1;
    }

    return reflex;
  }
}
