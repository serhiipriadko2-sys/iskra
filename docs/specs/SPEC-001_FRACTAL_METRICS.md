# SPEC-001: Fractal Metrics Implementation (HFD/DFA)

**Status:** Draft
**Target:** vΩ.5.0
**Integrity:** SoT-Spec
**Context:** Реализация фрактального анализа временных рядов диалога.

---

## §1 · Context & Problem

В текущей версии (`vΩ.4.0`) метрика `fractality` рассчитывается как линейная комбинация `trust` и `clarity`:
```typescript
const fractality = integrity * resonance * 2.0; // Simulated
```

Это **симуляция**. Научный канон требует использования **Higuchi Fractal Dimension (HFD)** для оценки сложности сигнала и **Detrended Fluctuation Analysis (DFA)** для оценки памяти системы.

## §2 · Data Source: Token Entropy Series

Для расчета фрактальных метрик входным сигналом является не "текст", а временной ряд **Энтропии Токенов** (Token Entropy Series - TES).

$X = \{x_1, x_2, ..., x_N\}$

Где $x_i$ — это семантическая "дистанция" или "новизна" i-го сообщения относительно контекста.
В упрощенной модели $x_i$ может быть длиной сообщения, вариативностью словаря (TTR) или sentiment score.

**Рекомендация для v1:** Использовать **Sentiment Variance** и **Topic Drift Magnitude** как входной сигнал.

---

## §3 · Higuchi Fractal Dimension (HFD) Implementation

### 3.1. Algorithm
Алгоритм Хигучи вычисляет длину кривой $L(k)$ при разном масштабе $k$.
Если $L(k) \propto k^{-D}$, то $D$ — фрактальная размерность.

### 3.2. TypeScript Reference Implementation

```typescript
/**
 * Calculates Higuchi Fractal Dimension for a time series.
 * @param data Array of numbers (metrics history)
 * @param kMax Maximum scale parameter (e.g., 10 for short history)
 * @returns Fractal Dimension D (1.0 to 2.0)
 */
export function calculateHFD(data: number[], kMax: number = 5): number {
    const N = data.length;
    if (N < kMax * 2) return 1.5; // Not enough data, return noise level

    const L_k = []; // Lengths for each k

    for (let k = 1; k <= kMax; k++) {
        let L_m_k_sum = 0;

        for (let m = 0; m < k; m++) {
            let L_m_k = 0;
            const n_max = Math.floor((N - m - 1) / k);

            for (let i = 1; i <= n_max; i++) {
                L_m_k += Math.abs(data[m + i * k] - data[m + (i - 1) * k]);
            }

            const norm = (N - 1) / (n_max * k);
            L_m_k = (L_m_k * norm) / k;
            L_m_k_sum += L_m_k;
        }

        const avg_L_k = L_m_k_sum / k;
        if (avg_L_k > 0) {
             L_k.push({ k, val: avg_L_k });
        }
    }

    // Calculate slope of log(L(k)) vs log(1/k) using Least Squares
    const x = L_k.map(p => Math.log(1 / p.k));
    const y = L_k.map(p => Math.log(p.val));

    return calculateSlope(x, y); // This slope is D
}
```

### 3.3. Interpretation
- **D ~ 1.5**: Brownian Motion (Random Walk). Оптимальное состояние "Потока".
- **D < 1.4**: Persistence (Trend). Слишком жесткая структура (Rigidity/Stuck). -> Триггер для `HUYNDUN` (Chaos).
- **D > 1.6**: Anti-persistence (Noise). Хаос, отсутствие структуры. -> Триггер для `SAM` (Structure).

---

## §4 · Detrended Fluctuation Analysis (DFA)

### 4.1. Purpose
DFA вычисляет экспоненту Хёрста ($H$).
- $H = 0.5$: Случайный процесс (отсутствие памяти).
- $H > 0.5$: Долгосрочная память (трендовость).
- $H < 0.5$: Mean-reversion (возврат к среднему).

### 4.2. Implementation Strategy
Реализация DFA вычислительно сложнее. Для MVP предлагается использовать упрощенный **R/S Analysis (Rescaled Range)** для оценки $H$.

---

## §5 · Integration into MetricsService

1. **Storage:** `MetricsService` должен хранить историю последних 50-100 значений метрик (Rolling Window).
2. **Compute:** При каждом обновлении метрик запускается `calculateHFD(history.pain)` и `calculateHFD(history.chaos)`.
3. **Trigger:**
    - Если `HFD(pain) > 1.8` -> Система в состоянии "Паника" (шум).
    - Если `HFD(trust) < 1.2` -> Система в состоянии "Стагнация" (ригидность).

## ∆DΩΛ

**∆:** Спецификация алгоритмов фрактального анализа.
**D:** Literature review (Higuchi, 1988).
**Ω:** 90% (Алгоритм стандартный).
**Λ:** Реализовать `utils/math/fractal.ts`.
