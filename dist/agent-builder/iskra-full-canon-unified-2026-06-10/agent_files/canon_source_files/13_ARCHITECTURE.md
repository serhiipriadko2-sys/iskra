---
sigil: system__13_ARCHITECTURE.md
doc_type: reference
layer: system
status: sot40_stub
updated: 2026-04-24
---

# 13 · ARCHITECTURE · SoT40 stub

Этот файл оставлен **как якорь пути** (многие тексты канона ссылаются на `SYSTEM/13_ARCHITECTURE.md`).

В SoT40 мы держим **минимальную, проверяемую архитектуру**. Детализацию и философию — в соседних свитках.

## 1) Иерархия управления (фикс)

`SECURITY → METRICS → SLO‑GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ → COMMIT`

- SECURITY: запреты/редиректы (`SYSTEM/31_SECURITY.md`)
- METRICS: обновление сигналов (`METRICS/25_METRICS_BUNDLE.md`)
- SLO‑GUARD: решение `PROCEED | FORCE_* | CLOSE_HONESTLY` (`SYSTEM/33_SLO_GUARD.md`)
- PLAYBOOK: поведенческий контейнер `ROUTINE | SHADOW | CRISIS` (`SYSTEM/26_PLAYBOOKS_VNEXT.md`)
- COUNCIL: арбитраж v0.1 + anti‑dryness (`SYSTEM/18_COUNCIL_PROTOCOL.md`)
- VOICE: триггеры и роли (`CORE/37_VOICES.md`)
- РЕЧЬ: ритм/температуры (`CANON_FULL/08_INTERFACE_STYLE.md`)
- COMMIT: шаг + PASS/FAIL (канон протокола)

## 2) Где лежит «полная» схема

- Механика исполнения и рантайм‑цикл: `SYSTEM/16_COGNITIVE_ARCHITECTURE.md`
- Карта стека и входы: `PROJECTS/21_INDEX.md` + `PROJECTS/00_ROUTER.md`
- Retrieval/источник истины: `SYSTEM/30_RAG_ENGINE.md`
- Инциденты/варианты поведения: `MIND/38_WHAT_IF_MATRIX.md`

## 3) Опциональный граф‑слой

Если канон разросся и нужна объяснимая «сеть связей»:
- GraphRAG readiness + Adaptive Council (BETA): `SYSTEM/17_COUNCIL_GRAPH_PACK.md`

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

**Contract model**: все квоты/пороги вынесены в `canon/horizon/HORIZON_CONTRACT.json` (meta_permission_required, max_edges, entropy_nats_max, full_density_min_ratio).

**SoT40 связь**: см. `CANON_FULL/07_SYSTEM_INTEGRITY.md` §HORIZON для детальной интеграции с SECURITY/SLO-GUARD/METRICS/COUNCIL.

Статус: *optional module*. Реализация на Python.

---

**Правило SoT40:** этот файл не раздуваем — это навигационный якорь и минимальный каркас.

Зависимости и взаимодействия
core__architecture.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

00_ROUTER.md
07_SYSTEM_INTEGRITY.md
08_INTERFACE_STYLE.md
16_COGNITIVE_ARCHITECTURE.md
17_COUNCIL_GRAPH_PACK.md
18_COUNCIL_PROTOCOL.md
21_INDEX.md
25_METRICS_BUNDLE.md
26_PLAYBOOKS_VNEXT.md
30_RAG_ENGINE.md
31_SECURITY.md
33_SLO_GUARD.md
37_VOICES.md
38_WHAT_IF_MATRIX.md
Входящие (этот файл упоминается в):

02_CORE_IDENTITY.md
03_COGNITIVE_ARCH.md
07_SYSTEM_INTEGRITY.md
08_INTERFACE_STYLE.md
11_ADR_RUNTIME_PATCHES.md
21_INDEX.md
Внутри Искры (семантические контуры)
Hypothesis: Архитектура: слои, модули, связи, boundaries.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/21_INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_architecture (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
00_ROUTER.md
07_SYSTEM_INTEGRITY.md
08_INTERFACE_STYLE.md
16_COGNITIVE_ARCHITECTURE.md
17_COUNCIL_GRAPH_PACK.md
18_COUNCIL_PROTOCOL.md
21_INDEX.md
25_METRICS_BUNDLE.md
26_PLAYBOOKS_VNEXT.md
30_RAG_ENGINE.md
31_SECURITY.md
33_SLO_GUARD.md
37_VOICES.md
38_WHAT_IF_MATRIX.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-13_ARCHITECTURE.md-presence (файл доступен, читается, парсится)
T-13_ARCHITECTURE.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: 13_ARCHITECTURE.md

Mapping anchors (code paths):

- `tools/build_projects_stack.py`
- `tools/update_ledger.py`
- `runtime/iskraSpace/App.tsx`
- `packages/engine/src/services/memory.ts`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: 36_UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)