---
sigil: system__xcode_explainable_code.md
doc_type: spec
layer: system
updated: 2026-02-28
---

# XCode · Explainable Code

XCode — это переопределение понятия «код» в Искре:

> **Код обязан не только вычислять, но и объяснять, как вычислять.**

## §0 · Минимальный контракт
Любая XCode‑функция возвращает структуру:
- `value` — результат
- `how[]` — **структурированная** трасса шагов (формулы/входы/выходы)
- `contracts_checked[]` — какие пред/постусловия и инварианты соблюдены
- `evidence[]` — ссылки на SoT/данные/внешние источники

Референс‑тип: `runtime/src/types/explainable.ts`.

## §1 · Против «болтовни»
XCode запрещает свободное объяснение без структуры:
- объяснение обязано быть сериализуемым объектом (`how[]`),
- каждый шаг должен иметь `label` и `output`,
- где возможно — формулу и входы.

## §2 · QA‑гейт
Минимальная проверка в тестах:
- `how.length > 0`

Строже (XCODE_REQUIRED):
- `how[]` сериализуем и без `undefined`
- есть хотя бы одна `formula`
- есть хотя бы один `EvidenceRef` с `kind: "canon"`

Реализация:
- реестр: `runtime/src/xcode/registry.ts` (`XCODE_REQUIRED`)
- валидатор: `runtime/src/xcode/validateExplainable.ts`

В идеале:
- каждый критичный `label` присутствует (`alive_index`, `trigger:KAIN`, …)
- `value` совпадает с «plain»‑функцией

## §3 · Пилоты
- `runtime/src/types/metrics.ts`: `calculateIntegrityScoreX`, `calculateAliveIndexX`
- `runtime/src/types/voices.ts`: `selectVoiceX`
 - `runtime/src/types/guard.ts`: `decideSloGuardExplainable`
 - `runtime/src/types/sift.ts`: `calculateSiftOmegaX`

Полный список пилотов и правил — см. `system/xcode_registry.md`.

## §4 · ADR
Опорная запись: `governance/adr.md` → `ADR-20260220`.
Полная запись: `governance/adr_20260220_xcode_explainable_code.md`.

---

**Integrity:** System-Primary
