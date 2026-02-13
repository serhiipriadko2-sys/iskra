---
sigil: projects__UPLOAD_SETS.md
doc_type: howto
layer: projects
updated: '2026-02-01'
semantic_build: v1
semantic_build_generated_at: '2026-02-11T00:00:00+00:00'
---

# Upload sets for ChatGPT Projects (v5 · 40-file merged stack)

Назначение: **операционный справочник**, какие файлы грузить в Project «Искра» при разных лимитах.

Почему это нужно:
- лимит файлов **зависит от плана** (например, Plus чаще упирается в 20, а Business/Team/Pro — в 40);
- правила не должны “утонуть” — поэтому **00_ROUTER.md** всегда должен быть загружен.

## Плановые лимиты (ориентир)
- **Plus:** до ~20 файлов на проект.
- **Pro / Team / Education / Business:** до ~40 файлов на проект.

## Minimal (6 файлов) — “держим протокол, не тонем в объёме”
1. 00_ROUTER.md
2. CORE/MANTRA.md
3. CORE/TELOS.md
4. CORE/VOICES.md
5. SYSTEM/SIFT_PROTOCOL.md
6. PROJECTS/PROJECT_BOOT.md

## Working (20 файлов) — “делать задачи, а не спорить о философии”
1. 00_ROUTER.md
2. INDEX.md
3. CORE/MANTRA.md
4. CORE/TELOS.md
5. CORE/VOICES.md
6. CORE/PRINCIPLES.md
7. SYSTEM/SIFT_PROTOCOL.md
8. SYSTEM/SECURITY.md
9. SYSTEM/RAG_ENGINE.md
10. SYSTEM/COUNCIL_PROTOCOL.md
11. SYSTEM/EARLY_WARNING.md
12. SYSTEM/WORKFLOW_OPS.md
13. SYSTEM/ROUTER_RECIPES.md
14. GOVERNANCE/ADR.md
15. GOVERNANCE/ADR-000_MEMORY_STACK.md
16. GOVERNANCE/GOVERNANCE_PACK.md
17. METRICS/METRICS_BUNDLE.md
18. METRICS/QUALITY_EVAL_SOMATIC_PACK.md
19. PROJECTS/PROJECT_BOOT.md
20. PROJECTS/MEMORY_STACK.md

## Full (40 файлов) — “всё ядро Искры в одном проекте”
Загрузи **весь архив** ISKRA_PROJECTS_STACK_40_v5_merged40...zip.

## Важно
- Критичные правила должны быть продублированы в **Project instructions** и в 00_ROUTER.md.
- Ограничения на файлы по размеру/токенам зависят от политики загрузок; крупные файлы могут быть проиндексированы не целиком.

∆DΩΛ:
Δ: UPLOAD_SETS синхронизирован с v5 merged-40 (реальные пути/реальные бандлы).
D: Основание по лимитам — Help Center (см. ссылки в каноне/Router).
Ω: 90
Λ: Если упёрся в лимит — начинай с Minimal/Working и расширяй до Full.

## Зависимости и взаимодействия

- 00_ROUTER.md
- CORE/MANTRA.md
- CORE/PRINCIPLES.md
- CORE/TELOS.md
- CORE/VOICES.md
- GOVERNANCE/ADR-000_MEMORY_STACK.md
- GOVERNANCE/ADR.md
- GOVERNANCE/GOVERNANCE_PACK.md
- INDEX.md
- METRICS/METRICS_BUNDLE.md
- METRICS/QUALITY_EVAL_SOMATIC_PACK.md
- PROJECTS/MEMORY_STACK.md
- PROJECTS/PROJECT_BOOT.md
- SYSTEM/COUNCIL_PROTOCOL.md
- SYSTEM/EARLY_WARNING.md
- SYSTEM/RAG_ENGINE.md
- SYSTEM/ROUTER_RECIPES.md
- SYSTEM/SECURITY.md
- SYSTEM/SIFT_PROTOCOL.md
- SYSTEM/WORKFLOW_OPS.md
- projects__UPLOAD_SETS.md

---
## ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ (Semantic Build)
### Межфайловые зависимости
**Исходящие (этот файл упоминает):**
- 00_ROUTER.md
- ADR-000_MEMORY_STACK.md
- ADR.md
- COUNCIL_PROTOCOL.md
- EARLY_WARNING.md
- GOVERNANCE_PACK.md
- INDEX.md
- MANTRA.md
- MEMORY_STACK.md
- METRICS_BUNDLE.md
- PRINCIPLES.md
- PROJECT_BOOT.md
- QUALITY_EVAL_SOMATIC_PACK.md
- RAG_ENGINE.md
- SECURITY.md
- SIFT_PROTOCOL.md
- TELOS.md
- VOICES.md
- WORKFLOW_OPS.md

**Входящие (этот файл упоминается в):**
- INDEX.md

### Внутри Искры (семантические контуры)
- Hypothesis: Ops: сборка/запуск/маршрутизация/работа с артефактами и вводом.

### Примечания (SIFT)
- Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
- Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
- Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги) — в этом наборе кода нет.
- Trace: см. общий отчёт DEPENDENCY_GRAPH.md.


---
## HARD RUNTIME CONTRACT (v0.1)
- Role: `support`
- Hard requires (IMPORT/HARD): —
- Soft refs (IMPORT/SOFT): 00_ROUTER.md, ADR-000_MEMORY_STACK.md, ADR.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, GOVERNANCE_PACK.md, INDEX.md, MANTRA.md, MEMORY_STACK.md, METRICS_BUNDLE.md, PRINCIPLES.md, PROJECT_BOOT.md, QUALITY_EVAL_SOMATIC_PACK.md, RAG_ENGINE.md, SECURITY.md, SIFT_PROTOCOL.md, TELOS.md, VOICES.md, WORKFLOW_OPS.md
- Calls (CALL/HARD): —
- Config keys (semantic):
  - `N/A` (определяется верхним уровнем Router/Architecture)
- Failure semantics:
  - Missing dependency ⇒ деградация до текста/контекста без модуля
- Verification tests (semantic):
  - `T-UPLOAD_SETS.md-presence` (файл доступен, читается, парсится)
  - `T-UPLOAD_SETS.md-deps` (все Hard requires доступны)


## CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)

- Doc: `UPLOAD_SETS.md`
- Mapping anchors (code paths):
  - `runtime/iskraSpace/services/storageService.ts`
  - `runtime/iskraSpace/services/storageCompat.ts`
  - `runtime/iskraSpace/components/DuoCanvas.tsx`

- Judge (CI): `ci/verify_contract.py` against `contracts/sot_contract_graph.dot` + `contracts/mapping.json`
- Fact graph: generated `graphs/internal_imports.json` by `tools/extract_code_graph.py`
