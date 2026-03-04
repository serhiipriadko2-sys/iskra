---
sigil: governance__ADR-20260220_XCODE_EXPLAINABLE_CODE.md
doc_type: reference
layer: governance
updated: 2026-02-20
status: proposed
---

# ADR-20260220 · XCode / Explainable Code (Compute + Contract + Trace)

## 0) Контекст

В Искре “код” часто читается как “функция возвращает значение”.
Но по канону мы держим различие через **след/артефакт** и проверяемость, а не через красивый текст.

Нужно переопределить “код” как **исполняемое объяснение**:
- что вычислено (`value`)
- **как** вычислено (структурированная трасса шагов)
- какие проверки/инварианты применены (contracts)
- на каких основаниях держится (evidence refs)

Риск: если “объяснение” будет свободным текстом — появится новый слой эха/галлюцинаций.
Поэтому “как” должно быть **структурой**, которую можно валидировать и тестировать.

## 1) Решение

Вводим договор **XCode**:

> **Код = Compute + Contract + Trace.**

Для “критичных вычислений” (метрики/guard/сдвиги фаз/индексы качества) вводится формат результата
`Explainable<T>`: значение + машинно‑проверяемая трасса + список проверенных контрактов + evidence refs.

### Минимальный интерфейс (TypeScript)

```ts
export type EvidenceKind = "canon" | "project" | "web" | "data";

export type EvidenceRef = {
  kind: EvidenceKind;
  ref: string; // напр. "system/cycle_engine.md#§3"
};

export interface ExplainStep {
  label: string;                 // "alive_index"
  formula?: string;              // "(clarity+trust)/2 - drift"
  inputs?: Record<string, number | string | boolean | null>;
  output?: unknown;
  refs?: EvidenceRef[];          // ссылки на канон/файлы/данные
}

export interface Explainable<T> {
  value: T;
  how: ExplainStep[];            // MUST be non-empty для XCode-модулей
  contracts_checked?: string[];  // "0<=drift<=1", "trace in [0..5]"
  assumptions?: string[];
  evidence?: EvidenceRef[];      // общий список refs (опционально)
}
```

## 2) Scope: где XCode обязателен

### XCODE_REQUIRED (первые кандидаты)
1) `integrity_score / alive_index` и производные индексы (metrics)
2) `guard` решения (SLO guard / ранние предупреждения)
3) критичные “вердикты” в SIFT/Trace (когда меняем статус claim)
   - пилот: `calculateSiftVerdictFlipX(previous, next)` (verdict flip)

### XCODE_OPTIONAL
- утилиты/рендеринг/UI
- “сырой сбор данных” без принятия решения

## 3) Альтернативы

1) Литературное программирование (narrative-first) — риск расхождения текста и кода.
2) Contracts-only (design by contract) — объяснимость растёт, но нет трассы шагов.
3) Trace-only — может превратиться в лог без проверяемых контрактов.

Выбрано: **Trace-first + Contracts** (Iskra-native).

## 4) Последствия

Плюсы:
- вычисления становятся **проверяемыми**, а не “магическими”
- появляется единый формат для UI/логов/QA
- упрощается аудит (trace → evidence → SoT)

Минусы/цена:
- больше кода (шаги, ссылки, контракты)
- нужен стандарт сериализации `how` и лимиты (чтобы не раздувать ответ)

## 5) Тесты / QA

PASS условия (минимум для принятия):
- `Explainable<T>` тип добавлен в runtime (общий слой)
- есть минимум 1 пилот‑модуль, который возвращает `Explainable` (например `alive_index`)
- есть **реестр XCODE_REQUIRED** и валидатор структуры
- тест: `how.length > 0` + есть `formula` и минимум 1 `EvidenceRef`

Реализация (reference):
- реестр: `runtime/src/xcode/registry.ts` (`XCODE_REQUIRED`)
- валидатор: `runtime/src/xcode/validateExplainable.ts`
- QA: `runtime/src/__tests__/xcode_registry.test.ts`

FAIL:
- “объяснение” только текстом, без структуры/refs/проверок.

## 6) ΔDΩΛ

Δ: “Код” в Искре фиксируется как Compute+Contract+Trace (XCode), чтобы вычисления были объяснимыми и проверяемыми.  
D: core/principles.md §0, system/sift_protocol.md §Trace, system/cycle_engine.md §3.  
Ω: 78%  
Λ: принять ADR → расширить XCode на guard и SIFT‑вердикты, добавить валидатор “how not empty”.
