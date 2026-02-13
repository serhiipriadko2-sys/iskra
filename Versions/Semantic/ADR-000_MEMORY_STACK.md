---
sigil: governance__ADR-000_MEMORY_STACK.md
doc_type: reference
layer: governance
updated: '2026-02-01'
semantic_build: v1
semantic_build_generated_at: '2026-02-11T00:00:00+00:00'
---

# ADR-000 · Memory Stack (Archive/Shadow/Journal) в ChatGPT Projects

## Контекст
В Projects нет localStorage приложения и нет гарантии доступа к “соседним чатам” как к SoT. Нужен управляемый контур памяти через файлы.

## Решение
Принять единый файл PROJECTS/MEMORY_STACK.md как операционный контур:
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
- Заменить старые заметки на PROJECTS/MEMORY_STACK.md.
- Добавить ссылку в PROJECTS/INDEX.md.
- Записать в GOVERNANCE/CHANGELOG.md.

## Зависимости и взаимодействия

- GOVERNANCE/CHANGELOG.md
- PROJECTS/INDEX.md
- PROJECTS/MEMORY_STACK.md
- governance__ADR-000_MEMORY_STACK.md

---
## ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ (Semantic Build)
### Межфайловые зависимости
**Исходящие (этот файл упоминает):**
- CHANGELOG.md
- INDEX.md
- MEMORY_STACK.md

**Входящие (этот файл упоминается в):**
- INDEX.md
- UPLOAD_SETS.md

### Внутри Искры (семантические контуры)
- Hypothesis: Память/поиск: стратегии извлечения и слоёв памяти (используется когнитивным контуром).
- Hypothesis: Governance/Integrity: как менять канон, фиксировать решения, проверять целостность.

### Примечания (SIFT)
- Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
- Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
- Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги) — в этом наборе кода нет.
- Trace: см. общий отчёт DEPENDENCY_GRAPH.md.


---
## HARD RUNTIME CONTRACT (v0.1)
- Role: `memory_rag`
- Hard requires (IMPORT/HARD): CHANGELOG.md, MEMORY_STACK.md
- Soft refs (IMPORT/SOFT): INDEX.md
- Calls (CALL/HARD): —
- Config keys (semantic):
  - `N/A` (определяется верхним уровнем Router/Architecture)
- Failure semantics:
  - Missing hard dependency ⇒ `CLOSE_HONESTLY` (не исполнять дальше)
- Verification tests (semantic):
  - `T-ADR-000_MEMORY_STACK.md-presence` (файл доступен, читается, парсится)
  - `T-ADR-000_MEMORY_STACK.md-deps` (все Hard requires доступны)


## CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)

- Doc: `ADR-000_MEMORY_STACK.md`
- Mapping anchors (code paths):
  - `runtime/iskraSpace/services/memoryService.ts`
  - `runtime/iskraSpace/services/canonService.ts`
  - `runtime/iskraSpace/services/evidenceService.ts`

- Judge (CI): `ci/verify_contract.py` against `contracts/sot_contract_graph.dot` + `contracts/mapping.json`
- Fact graph: generated `graphs/internal_imports.json` by `tools/extract_code_graph.py`
