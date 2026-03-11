# Scientific Turn & XCode — Status Snapshot (2026-03-11, rev3)

## Цель
Дать проверяемый статус по двум вопросам:
1) завершён ли Scientific Turn;
2) завершён ли XCode.

Ключевой принцип: **SoT-first** (факты только из файлов и тестовых квитанций).

## Метод

Статусы checker: `verified | partial | unknown | false`.

> Automation: run `python tools/check_scientific_turn_xcode_impl.py --json` to reproduce this status from code/doc facts.

Проверены источники:
- `AGENTS.md` (phase/task tracker)
- `apps/iskra-web/src/*` (фактическая интеграция web ↔ engine)
- `governance/adr_20260220_xcode_explainable_code.md` (governance-state)
- `system/xcode_explainable_code.md`, `system/xcode_registry.md` (контракт/QA)
- `packages/engine/src/services/metricsService.ts`, `packages/engine/src/services/explainableValidator.ts` (active-layer implementation)
- runtime XCode tests (registry + gate)

Команды:
- `pnpm --filter @iskra/engine test`
- `cd runtime && npx vitest run src/__tests__/xcode_registry.test.ts src/__tests__/xcode_gate.test.ts`

---

## A) Scientific Turn

### Вердикт
**partial** — реализация есть, но трекер/фаза в SoT ещё открыты.

### Fact Trace (quote ≤20 words)
| # | Source | Quote | Meaning |
|---|---|---|---|
| 1 | `AGENTS.md` | `| 2 | Quantum Engine | ACTIVE |` | Phase 2 официально не закрыта. |
| 2 | `AGENTS.md` | `Task 2.4 ... Connect apps/iskra-web to live CoreEngine data` (unchecked) | По трекеру пункт не done. |
| 3 | `apps/iskra-web/src/engineInstance.ts` | `new CoreEngine(memoryService, metricsEngine, voiceSystem)` | Web создаёт живой engine instance. |
| 4 | `apps/iskra-web/src/hooks/useEngine.ts` | `const response = await engine.processInput(text)` | Hook ходит в runtime engine-пайплайн. |
| 5 | `apps/iskra-web/src/components/ChatInterface.tsx` | `Retrieved ${response.context.length} memory nodes` | UI использует живой ответ engine. |

### Интерпретация
- Реальный код подтверждает интеграцию web с `CoreEngine`.
- Но в SoT-трекере Task 2.4 остаётся открытой.

### Риск
Роадмап-решения могут опираться на устаревший статус (ложный приоритет работ).

### Рекомендованное действие
Синхронизировать канонический трекер с кодовой реальностью: либо закрыть Task 2.4, либо явно описать недостающий критерий done.

---

## B) XCode

### Вердикт
**partial** — runtime+engine контур реализован, но governance-статус ещё не финализирован.

### Fact Trace (quote ≤20 words)
| # | Source | Quote | Meaning |
|---|---|---|---|
| 1 | `governance/adr_20260220_xcode_explainable_code.md` | `status: proposed` | ADR формально не принят. |
| 2 | `system/xcode_explainable_code.md` | `Код обязан ... объяснять, как вычислять` | Канон XCode зафиксирован как требование. |
| 3 | `system/xcode_explainable_code.md` | `реестр: runtime/src/xcode/registry.ts` | Есть привязка к machine-readable реестру. |
| 4 | `system/xcode_registry.md` | `экспорт XCODE_REQUIRED` | Центр правды для обязательных XCode модулей. |
| 5 | `system/xcode_registry.md` | `how.length > 0` + `formula` + `EvidenceRef kind: "canon"` | Чёткий QA-pass контракт. |
| 6 | `packages/engine/src/services/metricsService.ts` | `public updateExplainable(` | XCode-стиль добавлен в активный `@iskra/engine`. |
| 7 | `packages/engine/src/services/explainableValidator.ts` | `export function validateExplainable` | Есть валидация explainable-контракта в engine-слое. |

### Интерпретация
- XCode-пилоты и QA-гейт операционно существуют.
- Без принятого ADR финальное «done» по governance не доказано.

### Риск
Неопределённость границ: где XCode обязателен уже сейчас (runtime only vs packages).

### Рекомендованное действие
Продвинуть ADR (proposed → accepted/superseded) и зафиксировать explicit DoD по слоям.

---

## Тестовые квитанции
- `pnpm --filter @iskra/engine test` → **PASS** (11 files, 41 tests).
- `cd runtime && npx vitest run src/__tests__/xcode_registry.test.ts src/__tests__/xcode_gate.test.ts` → **PASS** (2 files, 11 tests).

## Итоговый синтез
- **Scientific Turn:** `partial` (кодовая реализация > статус-трекер).
- **XCode:** `partial` (техконтур есть, governance closure открыт).

## ΔDΩΛ
- **Δ:** Уточнён статус как расщепление «implementation vs governance». 
- **D:** SoT-файлы + runtime/web trace + тестовые квитанции.
- **Ω:** 92%
- **Λ:** В ближайшем governance-цикле: обновить Task 2.4 и статус ADR-20260220 или зафиксировать причину defer.
