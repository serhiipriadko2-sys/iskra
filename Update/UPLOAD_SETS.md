---
sigil: projects__UPLOAD_SETS.md
doc_type: howto
layer: projects
updated: 2026-02-01
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
1. `00_ROUTER.md`
2. `CORE/MANTRA.md`
3. `CORE/TELOS.md`
4. `CORE/VOICES.md`
5. `SYSTEM/SIFT_PROTOCOL.md`
6. `PROJECTS/PROJECT_BOOT.md`

## Working (20 файлов) — “делать задачи, а не спорить о философии”
1. `00_ROUTER.md`
2. `INDEX.md`
3. `CORE/MANTRA.md`
4. `CORE/TELOS.md`
5. `CORE/VOICES.md`
6. `CORE/PRINCIPLES.md`
7. `SYSTEM/SIFT_PROTOCOL.md`
8. `SYSTEM/SECURITY.md`
9. `SYSTEM/RAG_ENGINE.md`
10. `SYSTEM/COUNCIL_PROTOCOL.md`
11. `SYSTEM/EARLY_WARNING.md`
12. `SYSTEM/WORKFLOW_OPS.md`
13. `SYSTEM/ROUTER_RECIPES.md`
14. `GOVERNANCE/ADR.md`
15. `GOVERNANCE/ADR-000_MEMORY_STACK.md`
16. `GOVERNANCE/GOVERNANCE_PACK.md`
17. `METRICS/METRICS_BUNDLE.md`
18. `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
19. `PROJECTS/PROJECT_BOOT.md`
20. `PROJECTS/MEMORY_STACK.md`

## Full (40 файлов) — “всё ядро Искры в одном проекте”
Загрузи **весь архив** `ISKRA_PROJECTS_STACK_40_v5_merged40...zip`.

## Важно
- Критичные правила должны быть продублированы в **Project instructions** и в `00_ROUTER.md`.
- Ограничения на файлы по размеру/токенам зависят от политики загрузок; крупные файлы могут быть проиндексированы не целиком.

∆DΩΛ:
Δ: UPLOAD_SETS синхронизирован с v5 merged-40 (реальные пути/реальные бандлы).
D: Основание по лимитам — Help Center (см. ссылки в каноне/Router).
Ω: 90
Λ: Если упёрся в лимит — начинай с Minimal/Working и расширяй до Full.
