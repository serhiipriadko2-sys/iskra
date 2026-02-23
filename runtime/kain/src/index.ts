/**
 * @iskra/kain – минимальный модуль для выявления эха и триггера repair.
 * Этот плагин анализирует сгенерированный ответ вместе с метриками Искры
 * и определяет, нужен ли запуск repair.
 */

import type { IskraMetrics } from '@iskra/runtime/src/types/metrics';

export interface RepairSignal {
  repairNeeded: boolean;
  reason?: string;
}

const PAIN_THRESHOLD = 0.3;
const DRIFT_THRESHOLD = 0.3;
const ECHO_THRESHOLD = 0.5;
const CHAOS_THRESHOLD = 0.4;
const RESPONSE_ECHO_WORD_THRESHOLD = 3;

function hasResponseEcho(response: string): boolean {
  const words = response
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length === 0) {
    return false;
  }

  const counts = new Map<string, number>();
  words.forEach((word) => {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  });

  return Array.from(counts.values()).some((count) => count >= RESPONSE_ECHO_WORD_THRESHOLD);
}

/**
 * Анализирует ответ и метрики, чтобы определить, требуется ли repair.
 */
export function analyzeResponse(response: string, metrics: IskraMetrics): RepairSignal {
  const pain = metrics.pain ?? 0;
  const drift = metrics.drift ?? 0;
  const echo = metrics.echo ?? 0;
  const chaos = metrics.chaos ?? 0;

  if (pain > PAIN_THRESHOLD || drift > DRIFT_THRESHOLD || echo > ECHO_THRESHOLD) {
    return { repairNeeded: true, reason: 'High pain/drift/echo detected' };
  }

  if (chaos > CHAOS_THRESHOLD) {
    return { repairNeeded: true, reason: 'High chaos detected' };
  }

  if (hasResponseEcho(response)) {
    return { repairNeeded: true, reason: 'High lexical echo detected' };
  }

  return { repairNeeded: false };
}
