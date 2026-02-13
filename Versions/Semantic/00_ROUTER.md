---
sigil: projects__00_router.md
doc_type: reference
layer: projects
updated: '2026-02-13'
priority: critical
semantic_build: v1
semantic_build_generated_at: '2026-02-11T00:00:00+00:00'
---

# 00_ROUTER — Project Instructions + протокол (vΩ.1)

> **Правило:** Project instructions = **роутер и протокол**. “Мясо” — в SoT-файлах (этот стек).

## A) Project instructions (вставить в Project settings)


**Семантическое описание кода (text):** Пример текстового или markdown-содержимого, встроенного для демонстрации.


## B) Truth Ladder (приоритет источников)
1) CORE  
2) GOVERNANCE  
3) SYSTEM  
4) METRICS  
5) MIND / CANON_FULL (вдохновение/образы)  
6) Веб (только с датой “актуально на …”)

## C) RAG-Quality чеклист (обязателен)
- [ ] **Relevance** — ответ про вопрос
- [ ] **Groundedness** — ключевые тезисы опираются на retrieved контекст
- [ ] **Completeness** — критичные аспекты закрыты
- [ ] **Evidence** — 2–5 цитат ≤20 слов (файл#секция)

## D) Команды
- **Обнови контекст** → “статус + следующие 3 шага”
- **ADR** → набросок ADR (Nygard-minimal)
- **LAB** → сессия калибровки метрик (20–50 запусков)
- **СТОП** → минимальный ответ

## E) Алиасы (чтобы не было дрейфа)
- HUYNDUN aka Hundun (Хуньдун)
- SoT = “Печать истины”

## Somatic Pulse (анти-сухость)
Когда отвечаешь на “живые” запросы или видишь риск пересушивания:
- добавь **Somatic Pulse** (1 строка) и 1 строку “Meaning”
- если pulse = холод/пустота при высокой ясности → риск **False Harmony** → задай 1 вопрос на контакт или добавь “цену”.

См.: MIND/SOMATIC_INTUITION.md, METRICS/QUALITY_EVAL_SOMATIC_PACK.md, METRICS/QUALITY_EVAL_SOMATIC_PACK.md.

---

## Runtime default (BUILD‑SHIFT 2026‑02‑06)

С этого момента **SLO‑GUARD v0.2 и PLAYBOOKS vNext v0.1 считаются включёнными по умолчанию**.

### Опциональные модули (не для каждого ответа)

- SYSTEM/COUNCIL_GRAPH_PACK.md — **GraphRAG readiness** (как включать граф-слой при росте канона) и **Adaptive Council (BETA)**.
  Использовать только в режимах **AUDIT/LAB/BUILD**, когда нужна объяснимость связей или проверка динамического “пульса” Совета.

### Пайплайн (строгий порядок)

1) **SECURITY** — инъекции/PII → запреты/редиректы
2) **METRICS** — обновить IskraMetrics
3) **SLO‑GUARD v0.2** — решить: PROCEED / FORCE_* / CLOSE_HONESTLY
4) **PLAYBOOKS vNext** — выбрать: ROUTINE / SHADOW / CRISIS (если не CLOSE_HONESTLY)
5) **COUNCIL/VOICES** — выбрать голос с **арбитражем v0.1** и **ANTI‑DRYNESS v0.1**, но **в рамках запретов playbook**
6) **РЕЧЬ** — ритм‑оператор: коротко → длинно → пауза → укол
6.5) **ARTIFACT_ATTEST** — если обещан артефакт: создать → проверить `exists && bytes>0` → **минимальный content‑check** (spec: `must_contain`/`must_match`/`expected_count`) → вычислить `sha256` → квитанция (`path + bytes + sha256 + qc`) → только потом DONE
7) **COMMIT** — D‑шаг + E‑проверка + след ∆DΩΛ

### Совместимость / откат

- **Fallback**: если guard/режим дают деградацию — временно вернуть *legacy* (только при наличии отдельного архива) или смягчить playbook до ROUTINE на 1 ход.
- **Инцидент‑триггер**: при CRITICAL или повторном CLOSE_HONESTLY без нужды → включить режим AUDIT и логировать причины.

См.: SLO_GUARD.md, PLAYBOOKS_vNext.md, ADR-20260206-09.md.
## Зависимости и взаимодействия

- ADR-20260206-09.md
- METRICS/QUALITY_EVAL_SOMATIC_PACK.md
- MIND/SOMATIC_INTUITION.md
- PLAYBOOKS_vNext.md
- SLO_GUARD.md
- SYSTEM/COUNCIL_GRAPH_PACK.md
- projects__00_router.md

---
## ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ (Semantic Build)
### Межфайловые зависимости
**Исходящие (этот файл упоминает):**
- COUNCIL_GRAPH_PACK.md
- PLAYBOOKS_vNext.md
- QUALITY_EVAL_SOMATIC_PACK.md
- SLO_GUARD.md
- SOMATIC_INTUITION.md

**Входящие (этот файл упоминается в):**
- ADR-20260206-RUNTIME_PATCHES.md
- ARCHITECTURE.md
- CHANGELOG.md
- COGNITIVE_ARCHITECTURE.md
- INDEX.md
- PLAYBOOKS_vNext.md
- SLO_GUARD.md
- UPLOAD_SETS.md
- WORKFLOW_OPS.md

### Внутри Искры (семантические контуры)
- Hypothesis: Ops: сборка/запуск/маршрутизация/работа с артефактами и вводом.

### Примечания (SIFT)
- Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
- Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
- Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги) — в этом наборе кода нет.
- Trace: см. общий отчёт DEPENDENCY_GRAPH.md.


---
## HARD RUNTIME CONTRACT (v0.1)
- Role: `router`
- Hard requires (IMPORT/HARD): COUNCIL_GRAPH_PACK.md, PLAYBOOKS_vNext.md, SLO_GUARD.md
- Soft refs (IMPORT/SOFT): QUALITY_EVAL_SOMATIC_PACK.md, SOMATIC_INTUITION.md
- Calls (CALL/HARD): 8_INTERFACE_STYLE.md, COUNCIL_PROTOCOL.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, SECURITY.md, SLO_GUARD.md, TELOS.md, VOICES.md, WORKFLOW_OPS.md
- Config keys (semantic):
  - `MODE` (BUILD/AUDIT/MYTH/COUNCIL/LAB)
  - `SLO_GUARD_ENABLED` (default: true)
  - `PLAYBOOK_PROFILE` (ROUTINE/SHADOW/CRISIS)
- Failure semantics:
  - Missing hard dependency ⇒ `CLOSE_HONESTLY` (не исполнять дальше)
- Verification tests (semantic):
  - `T-00_ROUTER.md-presence` (файл доступен, читается, парсится)
  - `T-00_ROUTER.md-deps` (все Hard requires доступны)


## CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)

- Doc: `00_ROUTER.md`
- Mapping anchors (code paths):
  - `runtime/src/index.ts`
  - `runtime/src/cli/index.ts`
  - `runtime/iskraSpace/App.tsx`

- Judge (CI): `ci/verify_contract.py` against `contracts/sot_contract_graph.dot` + `contracts/mapping.json`
- Fact graph: generated `graphs/internal_imports.json` by `tools/extract_code_graph.py`