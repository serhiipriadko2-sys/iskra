/**
 * @iskra/kain – минимальный модуль для выявления эха и триггера repair.
 * Этот плагин анализирует сгенерированный ответ вместе с метриками Искры
 * и определяет, нужен ли запуск repair.
 */

// Импортируем тип метрик из основного пакета. При экспорте в npm
// зависимости должны указывать на опубликованный `@iskra/runtime`.
import type { IskraMetrics } from '@iskra/runtime/src/types/metrics';

/**
 * Сигнал для механизма repair. Если repairNeeded === true,
 * система Искра должна запустить процедуру восстановления.
 */
export interface RepairSignal {
  repairNeeded: boolean;
  reason?: string;
}

/**
 * Анализирует ответ и метрики, чтобы определить, требуется ли repair.
 * @param response Текст ответа, сгенерированного Искрой или другим ассистентом.
 * @param metrics Текущие метрики состояния Искры.
 * @returns Объект RepairSignal с флагом repairNeeded и причиной.
 */
export function analyzeResponse(
  _response: string,
  metrics: IskraMetrics
): RepairSignal {
  const { pain, drift, echo, chaos } = metrics as any;
  // Простая эвристика: если боль, дрейф или эхо выше порогов, просим repair.
  if ((pain ?? 0) > 0.3 || (drift ?? 0) > 0.3 || (echo ?? 0) > 0.5) {
    return { repairNeeded: true, reason: 'High pain/drift/echo detected' };
  }
  // Дополнительный случай: если хаос (chaos) высок, что может отражать выгорание.
  if ((chaos ?? 0) > 0.4) {
    return { repairNeeded: true, reason: 'High chaos detected' };
  }
  return { repairNeeded: false };
}