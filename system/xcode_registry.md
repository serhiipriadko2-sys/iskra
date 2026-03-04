---
sigil: system__xcode_registry.md
doc_type: spec
layer: system
updated: 2026-03-01
---

# XCode Registry — XCODE_REQUIRED

> **Цель:** одна каноническая точка правды, какие вычисления обязаны быть Explainable.

## §0 · Зачем нужен реестр

ADR‑20260220 вводит XCode (Compute + Contract + Trace). Для «критичных вычислений» это не рекомендация, а **обязательство**: значение должно сопровождаться проверяемой трассой и ссылками (evidence). Реестр нужен, чтобы:

- не терять список обязанных функций при росте кода,
- иметь один QA‑гейт в CI,
- делать изменения видимыми (diff реестра = изменение контракта).

## §1 · Где живёт реестр (machine‑readable)

Источник истины для CI/QA:

- `runtime/src/xcode/registry.ts` → экспорт `XCODE_REQUIRED`.

Каждая запись содержит:
- `id` — стабильный идентификатор (для логов/CI)
- `canon[]` — ссылки, почему это XCODE_REQUIRED
- `probe()` — минимальный прогон (Explainable + legacy expected)

## §2 · Валидация (что считается PASS)

В тестах реестр валидируется через:

- `runtime/src/xcode/validateExplainable.ts`

Минимальный набор требований для XCODE_REQUIRED:
- `how.length > 0`
- JSON‑безопасность `how.inputs`/`how.output` (без `undefined`)
- есть хотя бы одна `formula`
- есть хотя бы один `EvidenceRef` с `kind: "canon"`
- `value` совпадает с legacy‑функцией (deepEqual или tolerance)

## §3 · Правило изменения

Добавить новый модуль в XCODE_REQUIRED можно только если:

1) существует legacy‑функция (plain) и explainable‑функция (X)
2) есть probe‑сценарий и тест PASS
3) в ADR‑20260220 обновлён scope (если добавляем новую категорию, а не пилот)

## §4 · Список кандидатов (scope ADR‑20260220)

См. `governance/adr_20260220_xcode_explainable_code.md` §2:

- metrics (integrity_score / alive_index)
- guard решения
- SIFT/Trace «вердикты»
  - `sift.calculateSiftVerdictFlipX` (пилот: flip status)

---

**Integrity:** System-Primary
