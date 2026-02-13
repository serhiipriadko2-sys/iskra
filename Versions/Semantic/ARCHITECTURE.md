---
sigil: system__ARCHITECTURE.md
doc_type: reference
layer: system
status: sot40_stub
updated: '2026-02-13'
semantic_build: v1
semantic_build_generated_at: '2026-02-11T00:00:00+00:00'
---

# SYSTEM/ARCHITECTURE · SoT40 stub

Этот файл оставлен **как якорь пути** (многие тексты канона ссылаются на SYSTEM/ARCHITECTURE.md).

В SoT40 мы держим **минимальную, проверяемую архитектуру**. Детализацию и философию — в соседних свитках.

## 1) Иерархия управления (фикс)

SECURITY → METRICS → SLO‑GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ → COMMIT

- SECURITY: запреты/редиректы (SYSTEM/SECURITY.md)
- METRICS: обновление сигналов (METRICS/METRICS_BUNDLE.md)
- SLO‑GUARD: решение PROCEED | FORCE_* | CLOSE_HONESTLY (SYSTEM/SLO_GUARD.md)
- PLAYBOOK: поведенческий контейнер ROUTINE | SHADOW | CRISIS (SYSTEM/PLAYBOOKS_vNext.md)
- COUNCIL: арбитраж v0.1 + anti‑dryness (SYSTEM/COUNCIL_PROTOCOL.md)
- VOICE: триггеры и роли (CORE/VOICES.md)
- РЕЧЬ: ритм/температуры (CANON_FULL/8_INTERFACE_STYLE.md)
- COMMIT: шаг + PASS/FAIL (канон протокола)

## 2) Где лежит «полная» схема

- Механика исполнения и рантайм‑цикл: SYSTEM/COGNITIVE_ARCHITECTURE.md
- Карта стека и входы: PROJECTS/INDEX.md + PROJECTS/00_ROUTER.md
- Retrieval/источник истины: SYSTEM/RAG_ENGINE.md
- Инциденты/варианты поведения: MIND/WHAT_IF_MATRIX.md

## 3) Опциональный граф‑слой

Если канон разросся и нужна объяснимая «сеть связей»:
- GraphRAG readiness + Adaptive Council (BETA): SYSTEM/COUNCIL_GRAPH_PACK.md

Статус: *optional*. По умолчанию не включается.

### Horizon (Darkrun-First Validation)

Для защиты канона от "тихих регрессий" и контроля сдвига метапространства:
- **Darkrun-first pattern**: propose → validate → commit (без записи до проверки)
- **Epoch management**: каждый commit инкрементирует эпоху; снапшоты в JSONL
- **Entropy guard**: Shannon entropy по символам; блокировка при превышении порога
- **Full-density guard**: проверка baseline размеров файлов канона (ratio bytes/lines)
- **Phase network topology**: граф фаз + динамические связи с квотами
- **Direction spawning**: генерация символов направлений из пула с лимитами
- **Ritual generation**: маркировка моментов "сдвига горизонта"

**Contract model**: все квоты/пороги вынесены в canon/horizon/HORIZON_CONTRACT.json (meta_permission_required, max_edges, entropy_nats_max, full_density_min_ratio).

**SoT40 связь**: см. CANON_FULL/7_SYSTEM_INTEGRITY.md §HORIZON для детальной интеграции с SECURITY/SLO-GUARD/METRICS/COUNCIL.

Статус: *optional module*. Реализация на Python.

---

**Правило SoT40:** этот файл не раздуваем — это навигационный якорь и минимальный каркас.

## Зависимости и взаимодействия

- CANON_FULL/7_SYSTEM_INTEGRITY.md
- CANON_FULL/8_INTERFACE_STYLE.md
- CORE/VOICES.md
- METRICS/METRICS_BUNDLE.md
- MIND/WHAT_IF_MATRIX.md
- PROJECTS/00_ROUTER.md
- PROJECTS/INDEX.md
- SYSTEM/ARCHITECTURE.md
- SYSTEM/COGNITIVE_ARCHITECTURE.md
- SYSTEM/COUNCIL_GRAPH_PACK.md
- SYSTEM/COUNCIL_PROTOCOL.md
- SYSTEM/PLAYBOOKS_vNext.md
- SYSTEM/RAG_ENGINE.md
- SYSTEM/SECURITY.md
- SYSTEM/SLO_GUARD.md
- system__ARCHITECTURE.md

---
## ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ (Semantic Build)
### Межфайловые зависимости
**Исходящие (этот файл упоминает):**
- 00_ROUTER.md
- 7_SYSTEM_INTEGRITY.md
- 8_INTERFACE_STYLE.md
- COGNITIVE_ARCHITECTURE.md
- COUNCIL_GRAPH_PACK.md
- COUNCIL_PROTOCOL.md
- INDEX.md
- METRICS_BUNDLE.md
- PLAYBOOKS_vNext.md
- RAG_ENGINE.md
- SECURITY.md
- SLO_GUARD.md
- VOICES.md
- WHAT_IF_MATRIX.md

**Входящие (этот файл упоминается в):**
- 2_CORE_IDENTITY.md
- 3_COGNITIVE_ARCH.md
- 7_SYSTEM_INTEGRITY.md
- 8_INTERFACE_STYLE.md
- ADR-20260206-RUNTIME_PATCHES.md
- CHANGELOG.md
- COGNITIVE_ARCHITECTURE.md
- INDEX.md

### Внутри Искры (семантические контуры)
- Hypothesis: Архитектура: слои и порядок обработки запроса (pipeline).

### Примечания (SIFT)
- Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
- Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
- Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги) — в этом наборе кода нет.
- Trace: см. общий отчёт DEPENDENCY_GRAPH.md.


---
## HARD RUNTIME CONTRACT (v0.1)
- Role: `architecture`
- Hard requires (IMPORT/HARD): 00_ROUTER.md, 7_SYSTEM_INTEGRITY.md, 8_INTERFACE_STYLE.md, COUNCIL_GRAPH_PACK.md, COUNCIL_PROTOCOL.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, RAG_ENGINE.md, SECURITY.md, SLO_GUARD.md, VOICES.md
- Soft refs (IMPORT/SOFT): COGNITIVE_ARCHITECTURE.md, INDEX.md, WHAT_IF_MATRIX.md
- Calls (CALL/HARD): —
- Config keys (semantic):
  - `N/A` (определяется верхним уровнем Router/Architecture)
- Failure semantics:
  - Missing hard dependency ⇒ `CLOSE_HONESTLY` (не исполнять дальше)
- Verification tests (semantic):
  - `T-ARCHITECTURE.md-presence` (файл доступен, читается, парсится)
  - `T-ARCHITECTURE.md-deps` (все Hard requires доступны)


## CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)

- Doc: `ARCHITECTURE.md`
- Mapping anchors (code paths):
  - `runtime/src/index.ts`
  - `runtime/iskraSpace/App.tsx`
  - `runtime/iskraSpace/services/canonService.ts`

- Judge (CI): `ci/verify_contract.py` against `contracts/sot_contract_graph.dot` + `contracts/mapping.json`
- Fact graph: generated `graphs/internal_imports.json` by `tools/extract_code_graph.py`