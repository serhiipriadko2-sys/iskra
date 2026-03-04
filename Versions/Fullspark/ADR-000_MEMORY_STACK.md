---
sigil: governance__ADR-000_MEMORY_STACK.md
doc_type: reference
layer: governance
updated: 2026-02-01
---

# ADR-000 · Memory Stack (Archive/Shadow/Journal) в ChatGPT Projects

## Контекст
В Projects нет localStorage приложения и нет гарантии доступа к “соседним чатам” как к SoT. Нужен управляемый контур памяти через файлы.

## Решение
Принять единый файл `PROJECTS/MEMORY_STACK.md` как операционный контур:
- ARCHIVE: только Claim+Evidence+SIFT.
- SHADOW: сырьё, но с Next evidence + Promotion rule.
- JOURNAL: хроника процесса, не канон.

Promotion: Shadow → Evidence/SIFT → Archive. Если promotion меняет канон — отдельный ADR.

## Альтернативы
1) Три файла вместо одного (меньше шум, больше слотов).
2) Только чаты (быстро, но нет SoT).
3) Внешняя БД (лучше контроль, но нужна инфра).

## Последствия
+ Меньше галлюцинаций фактов; + прозрачный рост знаний; − нужна дисциплина.

## Тесты
- Smoke: 1 запись ARCH/SHD/JRN.
- Retrieval: факт из Archive всегда с Evidence.
- Drift: 2 ответа подряд без Evidence → режим «короче+цитаты».

## Миграция
- Заменить старые заметки на `PROJECTS/MEMORY_STACK.md`.
- Добавить ссылку в `PROJECTS/INDEX.md`.
- Записать в `GOVERNANCE/CHANGELOG.md`.

Зависимости и взаимодействия
core__adr_000_memory_stack.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

INDEX.md
MEMORY_STACK.md
Входящие (этот файл упоминается в):

INDEX.md
UPLOAD_SETS.md
Внутри Искры (семантические контуры)
Hypothesis: ADR-000: Memory Stack как базовая архитектурная фиксация.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_adr_000_memory_stack (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
INDEX.md
MEMORY_STACK.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-ADR-000_MEMORY_STACK.md-presence (файл доступен, читается, парсится)
T-ADR-000_MEMORY_STACK.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: ADR-000_MEMORY_STACK.md

Mapping anchors (code paths):

- `packages/engine/src/services/memory.ts`
- `runtime/iskraSpace/components/MemoryView.tsx`
- `runtime/iskraSpace/services/memoryService.ts`
- `packages/engine/src/__tests__/memory.test.ts`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)