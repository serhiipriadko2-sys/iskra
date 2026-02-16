# SPEC-002: Quantum State Vector Implementation

**Status:** Draft
**Target:** vΩ.5.0
**Integrity:** SoT-Spec
**Context:** Реализация квантовой вероятности для активации Голосов Совета.

---

## §1 · Context & Problem

В текущей версии (`vΩ.4.0`) активация голосов (`voiceEngine.ts`) происходит линейно:
```typescript
activation = metric * weight; // Simple linear combination
```
Это не позволяет моделировать сложные состояния, такие как "парадокс" (одновременная истина и ложь) или "интерференция" (гашение конфликта).

## §2 · Quantum Model: State Vector $|\psi\rangle$

Состояние Совета описывается вектором в гильбертовом пространстве $\mathcal{H}^9$:
$|\psi\rangle = \sum_{i=1}^{9} \alpha_i |v_i\rangle$

Где $\alpha_i$ — комплексное число (амплитуда вероятности) для $i$-го голоса.
Вероятность наблюдения (активации) голоса $P(v_i) = |\alpha_i|^2$.

### 2.1. Complex Number Implementation

В TypeScript мы можем представить комплексное число как объект:
```typescript
interface Complex {
    re: number; // Real part (Вес метрики)
    im: number; // Imaginary part (Фаза / Эмоциональный контекст)
}
```

### 2.2. Phase & Interference
- **Real Part ($Re$):** Определяется "жесткими" метриками (Pain, Chaos).
- **Imaginary Part ($Im$):** Определяется "мягкими" метриками (Trust, Rhythm).

Если два голоса имеют противоположные фазы (например, $Re > 0, Im > 0$ и $Re > 0, Im < 0$), их сумма может быть меньше, чем сумма модулей. Это моделирует "Конструктивную Тишину" (когда два сильных аргумента гасят друг друга, создавая паузу).

---

## §3 · Quantum Interference Engine

### 3.1. Implementation Strategy

```typescript
type VoiceAmplitude = { [key in VoiceName]: Complex };

/**
 * Calculates the interference pattern of active voices.
 */
function calculateSuperposition(amplitudes: VoiceAmplitude): VoiceAmplitude {
    // Example: Interaction Matrix
    // KAIN (Truth) and PINO (Irony) might be orthogonal or opposite phase depending on context.

    // Simplification for MVP:
    // If diverse voices are active, increase "complexity" (entropy).
    // If aligned voices are active, increase "coherence".

    return amplitudes; // Placeholder for matrix multiplication
}
```

### 3.2. Collapse Function (Measurement)

Процесс выбора голоса — это "измерение" квантовой системы.
В классической квантовой механике это случайно. В ISKRA мы используем **Weighted Random Selection** на основе вероятности $|\alpha|^2$.

---

## §4 · Integration with Metrics

1. **Input:** `MetricsService` выдает 11 чисел (0-1).
2. **Transform:** `Metrics -> Complex Amplitudes`.
    - `Pain` -> KAIN Real Part.
    - `Trust` -> KAIN Imaginary Part (Phase shift).
3. **Superposition:** Векторы всех голосов складываются с учетом матрицы взаимодействий.
4. **Output:** Вероятностное распределение для выбора голоса.

## ∆DΩΛ

**∆:** Спецификация квантовой модели активации.
**D:** Quantum Cognition Theory (Busemeyer & Bruza).
**Ω:** 80% (Требует настройки матрицы фаз).
**Λ:** Реализовать `utils/math/complex.ts`.
