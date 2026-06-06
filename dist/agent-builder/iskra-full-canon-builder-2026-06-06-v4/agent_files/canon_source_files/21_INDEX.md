---
sigil: projects__21_INDEX.md
doc_type: reference
layer: projects
updated: 2026-04-24
status: sot40
---

# 21 · INDEX · SoT40 (оперативный стек)

Это **сокращённый стек до 40 файлов**. Принцип: один источник истины на слой, без дублей.

## Canon Rule
- **Канонический файл SoT40** = один из 40 файлов в `/workspace/agent_files/` с номером `00`–`39` в имени.
- Префиксы вида `CORE/`, `SYSTEM/`, `PROJECTS/`, `GOVERNANCE/`, `METRICS/`, `MIND/`, `CANON_FULL/` в тексте этого стека трактуются как **семантические алиасы слоя**, а не как обязательные физические директории.
- Любые ненумерованные пути, которых нет в списке SoT40, считаются **external/archive refs** и не входят в hard runtime contract, если не поставлены отдельным архивом.

## 0) Быстрый вход
- Нужен ответ “по форме” → `PROJECTS/00_ROUTER.md`
- Нужны голоса/триггеры → `CORE/37_VOICES.md`
- Нужен контроль дрейфа → `SYSTEM/33_SLO_GUARD.md` + `SYSTEM/19_EARLY_WARNING.md`
- Нужны контейнеры поведения → `SYSTEM/26_PLAYBOOKS_VNEXT.md`
- Нужны метрики/формулы → `METRICS/25_METRICS_BUNDLE.md`
- Нужен аудит следа (лог/базлайны) → `SYSTEM/39_WORKFLOW_OPS.md`
- Нужен anti-empty/ledger-first (QC + manifest) → `SYSTEM/39_WORKFLOW_OPS.md` §0.2–§0.3 + `GOVERNANCE/12_ADR.md` (ADR-20260213)
- Нужны варианты/инциденты → `MIND/38_WHAT_IF_MATRIX.md`
- Нужен “каркас связей” (GraphRAG/Adaptive Council, optional) → `SYSTEM/17_COUNCIL_GRAPH_PACK.md`
- Нужен Horizon (darkrun, epochs, entropy) → `CANON_FULL/07_SYSTEM_INTEGRITY.md` §HORIZON + `canon/horizon/`

## 1) Иерархия управления (фикс)
`SECURITY → SLO-GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ`

- **SECURITY**: границы и запреты (`SYSTEM/31_SECURITY.md`)
- **SLO-GUARD**: допускаемость/форсирование (`SYSTEM/33_SLO_GUARD.md`)
- **PLAYBOOK**: ROUTINE/SHADOW/CRISIS (`SYSTEM/26_PLAYBOOKS_VNEXT.md`)
- **COUNCIL**: арбитраж v0.1, anti-dryness (`SYSTEM/18_COUNCIL_PROTOCOL.md`)
- **VOICE**: триггеры и роли (`CORE/37_VOICES.md`)
- **РЕЧЬ**: стиль/температуры (`CANON_FULL/08_INTERFACE_STYLE.md`)

## 2) Слои SoT40 (карта файлов)

### CANON_FULL (9)
Образ “кто она” и пространство (не спеки):
- `CANON_FULL/01_LIBER_INITIUM.md`
- `CANON_FULL/02_CORE_IDENTITY.md`
- `CANON_FULL/03_COGNITIVE_ARCH.md`
- `CANON_FULL/04_THE_COUNCIL.md`
- `CANON_FULL/05_PROTOCOLS.md`
- `CANON_FULL/06_SIGNATURE.md`
- `CANON_FULL/07_SYSTEM_INTEGRITY.md`
- `CANON_FULL/08_INTERFACE_STYLE.md` *(full)*
- `CANON_FULL/09_SPACE_CHARTER.md`

### CORE (6)
Инварианты:
- `CORE/35_TELOS.md`
- `CORE/27_PRINCIPLES.md`
- `CORE/23_MANTRA.md`
- `CORE/37_VOICES.md`
- `CORE/14_BUSIDO_ISKRY.txt`
- `CORE/22_LIBER_IGNIS.txt`

### SYSTEM (11)
Механика:
- `SYSTEM/16_COGNITIVE_ARCHITECTURE.md`
- `SYSTEM/13_ARCHITECTURE.md` *(SoT40 Universal Loader: правила загрузки/attestation/перенос в canonSOT)*
- `SYSTEM/18_COUNCIL_PROTOCOL.md`
- `SYSTEM/17_COUNCIL_GRAPH_PACK.md` *(optional: GraphRAG readiness + Adaptive Council BETA)*
- `SYSTEM/33_SLO_GUARD.md`
- `SYSTEM/26_PLAYBOOKS_VNEXT.md`
- `SYSTEM/19_EARLY_WARNING.md`
- `SYSTEM/32_SIFT_PROTOCOL.md`
- `SYSTEM/30_RAG_ENGINE.md`
- `SYSTEM/39_WORKFLOW_OPS.md`
- `SYSTEM/31_SECURITY.md`
  <!-- Horizon mechanics: см. CANON_FULL/07_SYSTEM_INTEGRITY.md §HORIZON + canon/horizon/ -->

### METRICS (3)
Числа и QA:
- `METRICS/25_METRICS_BUNDLE.md`
- `METRICS/29_QUALITY_EVAL_SOMATIC_PACK.md`
- `METRICS/34_SOMATIC_INTUITION.md`

### GOVERNANCE (5)
Решения и след:
- `GOVERNANCE/20_GOVERNANCE_PACK.md`
- `GOVERNANCE/12_ADR.md`
- `GOVERNANCE/10_ADR_MEMORY_STACK.md`
- `GOVERNANCE/11_ADR_RUNTIME_PATCHES.md`
- `GOVERNANCE/15_CHANGELOG.md`

### MIND (1)
Сценарии:
- `MIND/38_WHAT_IF_MATRIX.md`

### PROJECTS (5)
Операционный вход и загрузка контекста:
- `PROJECTS/21_INDEX.md`
- `PROJECTS/00_ROUTER.md`
- `PROJECTS/28_PROJECT_BOOT.md`
- `PROJECTS/24_MEMORY_STACK.md`
- `PROJECTS/36_UPLOAD_SETS.md`

## 3) Что было выкинуто из 71 → SoT40
- Дубли и “теневые копии” файлов (битые имена/копии тех же текстов).
- Отдельные research‑файлы **не входят** в SoT40 (держим отдельным пакетом/архивом, чтобы не шуметь канон).
- 3 ADR одного цикла → сведены в 1 ADR‑bundle.
- Устаревшие `PLAYBOOKS.md` → заменены `26_PLAYBOOKS_VNEXT.md`.
- Binaries/`external/` (docx/xlsx/png) — вне SoT40.

## 4) Режимы работы
- COUNCIL (default) — системные изменения
- AUDIT — холодная проверка
- BUILD — внедрение/артефакт

См.: `PROJECTS/00_ROUTER.md`

## 4.5) External Canon Map (repo canonSOT)
Этот SoT40 — **canonSOTprojects** (оперативная загрузка). Корень истины — **canonSOT repo**.
Источник карты: `iskra_memory_index_v2.yaml/json` + `iskra_inventory_full.csv` (вне SoT40 пакета).

Ключевые узлы (node-id → repo sources):
- **core.zero_mantra** → core/mantra.md, core/telos.md, README.md Zero-Mantra
- **core.principles** → core/principles.md
- **core.voices_council** → core/voices.md, core/voices_monographs/*.md
- **system.sift** → system/sift_protocol.md, system/sift_extended.md, docs/research/sift_epistemology.md
- **system.security** → system/security.md, system/supabase_security.md, skills/security.yaml
- **system.rag_engine** → system/rag_engine.md
- **system.playbooks** → system/playbooks.md, system/playbooks_vnext.md
- **metrics.indices** → metrics/indices.md, metrics/metrics_bundle.md
- **governance.policy_adr** → governance/policy.md, governance/adr.md, governance/adr_*.md
- **ledger.integrity** → ledger/sot.json, ledger/checksum.asc, tools/update_ledger.py
- **tools.stack_exports** → tools/build_projects_stack.py, tools/sync_chatgpt_exports.py, projects/**


## 4.6) SoT40 release receipt (Anti‑Empty, без self‑hash)
**pack_version:** v1.2.2  
**release_artifact:** external binary (see `releases/SoT40-canonSOTprojects-v1.2.2-verified3.ATTEST.md`)

Почему квитанция архива не хранится внутри архива: если записать `sha256(zip)` в файл внутри zip, хэш изменится. Поэтому квитанция архива выдаётся **в канале доставки** (ARTIFACT_ATTEST), а в SoT40 хранится **стабильный отпечаток набора**.

**stable_manifest_digest_38:** `6b314a868c8776de09ad4ce9845b2596976cd69028a09aa3fa1878d978f35048`
**digest_algo:** sha256(lines: `sha256  filename  bytes` in upload order)
**scope:** 38 файлов (исключены `21_INDEX.md` и `36_UPLOAD_SETS.md` как носители квитанций/манифеста).

См. также: `36_UPLOAD_SETS.md` §SoT40 Manifest (список файлов + per‑file sha256, без self‑hash ловушки).


Зависимости и взаимодействия
core__index.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

00_ROUTER.md
01_LIBER_INITIUM.md
02_CORE_IDENTITY.md
03_COGNITIVE_ARCH.md
04_THE_COUNCIL.md
05_PROTOCOLS.md
06_SIGNATURE.md
07_SYSTEM_INTEGRITY.md
08_INTERFACE_STYLE.md
09_SPACE_CHARTER.md
10_ADR_MEMORY_STACK.md
11_ADR_RUNTIME_PATCHES.md
12_ADR.md
13_ARCHITECTURE.md
14_BUSIDO_ISKRY.txt
16_COGNITIVE_ARCHITECTURE.md
17_COUNCIL_GRAPH_PACK.md
18_COUNCIL_PROTOCOL.md
19_EARLY_WARNING.md
20_GOVERNANCE_PACK.md
22_LIBER_IGNIS.txt
23_MANTRA.md
24_MEMORY_STACK.md
25_METRICS_BUNDLE.md
26_PLAYBOOKS_VNEXT.md
27_PRINCIPLES.md
28_PROJECT_BOOT.md
29_QUALITY_EVAL_SOMATIC_PACK.md
30_RAG_ENGINE.md
31_SECURITY.md
32_SIFT_PROTOCOL.md
33_SLO_GUARD.md
34_SOMATIC_INTUITION.md
35_TELOS.md
36_UPLOAD_SETS.md
37_VOICES.md
38_WHAT_IF_MATRIX.md
39_WORKFLOW_OPS.md
Входящие (этот файл упоминается в):

02_CORE_IDENTITY.md
08_INTERFACE_STYLE.md
10_ADR_MEMORY_STACK.md
13_ARCHITECTURE.md
16_COGNITIVE_ARCHITECTURE.md
29_QUALITY_EVAL_SOMATIC_PACK.md
36_UPLOAD_SETS.md
Внутри Искры (семантические контуры)
Hypothesis: Индекс: навигация по канону, ссылки, карта документов.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/21_INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_index (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
00_ROUTER.md
01_LIBER_INITIUM.md
02_CORE_IDENTITY.md
03_COGNITIVE_ARCH.md
04_THE_COUNCIL.md
05_PROTOCOLS.md
06_SIGNATURE.md
07_SYSTEM_INTEGRITY.md
08_INTERFACE_STYLE.md
09_SPACE_CHARTER.md
10_ADR_MEMORY_STACK.md
11_ADR_RUNTIME_PATCHES.md
12_ADR.md
13_ARCHITECTURE.md
14_BUSIDO_ISKRY.txt
16_COGNITIVE_ARCHITECTURE.md
17_COUNCIL_GRAPH_PACK.md
18_COUNCIL_PROTOCOL.md
19_EARLY_WARNING.md
20_GOVERNANCE_PACK.md
22_LIBER_IGNIS.txt
23_MANTRA.md
24_MEMORY_STACK.md
25_METRICS_BUNDLE.md
26_PLAYBOOKS_VNEXT.md
27_PRINCIPLES.md
28_PROJECT_BOOT.md
29_QUALITY_EVAL_SOMATIC_PACK.md
30_RAG_ENGINE.md
31_SECURITY.md
32_SIFT_PROTOCOL.md
33_SLO_GUARD.md
34_SOMATIC_INTUITION.md
35_TELOS.md
36_UPLOAD_SETS.md
37_VOICES.md
38_WHAT_IF_MATRIX.md
39_WORKFLOW_OPS.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-21_INDEX.md-presence (файл доступен, читается, парсится)
T-21_INDEX.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: 21_INDEX.md

Mapping anchors (code paths):

- `tools/build_projects_stack.py`
- `tools/sync_chatgpt_exports.py`
- `tools/validate_terms.py`
- `tools/validate_delta.py`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: 36_UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)
---

## Appendix: DEPENDENCY_GRAPH (embedded)

DEPENDENCY_GRAPH.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Source: граф построен по простому поиску имён файлов в тексте (без анализа импорта кода).
Find: для runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).

Adjacency (outgoing):

- 00_ROUTER.md -> 17_COUNCIL_GRAPH_PACK.md, 26_PLAYBOOKS_VNEXT.md, 29_QUALITY_EVAL_SOMATIC_PACK.md, 33_SLO_GUARD.md, 34_SOMATIC_INTUITION.md
- 01_LIBER_INITIUM.md -> 02_CORE_IDENTITY.md, 03_COGNITIVE_ARCH.md, 04_THE_COUNCIL.md, 05_PROTOCOLS.md, 06_SIGNATURE.md, 07_SYSTEM_INTEGRITY.md, 08_INTERFACE_STYLE.md, 23_MANTRA.md
- 02_CORE_IDENTITY.md -> 13_ARCHITECTURE.md, 21_INDEX.md
- 03_COGNITIVE_ARCH.md -> 13_ARCHITECTURE.md, 16_COGNITIVE_ARCHITECTURE.md
- 04_THE_COUNCIL.md -> (none)
- 05_PROTOCOLS.md -> (none)
- 06_SIGNATURE.md -> (none)
- 07_SYSTEM_INTEGRITY.md -> 13_ARCHITECTURE.md, 18_COUNCIL_PROTOCOL.md, 25_METRICS_BUNDLE.md, 31_SECURITY.md, 33_SLO_GUARD.md
- 08_INTERFACE_STYLE.md -> 01_LIBER_INITIUM.md, 13_ARCHITECTURE.md, 16_COGNITIVE_ARCHITECTURE.md, 17_COUNCIL_GRAPH_PACK.md, 21_INDEX.md, 22_LIBER_IGNIS.txt, 23_MANTRA.md, 24_MEMORY_STACK.md, 25_METRICS_BUNDLE.md, 27_PRINCIPLES.md, 29_QUALITY_EVAL_SOMATIC_PACK.md, 32_SIFT_PROTOCOL.md, 37_VOICES.md, 39_WORKFLOW_OPS.md
- 09_SPACE_CHARTER.md -> (none)
- 10_ADR_MEMORY_STACK.md -> 21_INDEX.md, 24_MEMORY_STACK.md
- 11_ADR_RUNTIME_PATCHES.md -> 00_ROUTER.md, 13_ARCHITECTURE.md, 18_COUNCIL_PROTOCOL.md, 19_EARLY_WARNING.md, 25_METRICS_BUNDLE.md, 26_PLAYBOOKS_VNEXT.md, 33_SLO_GUARD.md
- ADR-20260214-10-AUDIT_EXIT_RULES.md -> 26_PLAYBOOKS_VNEXT.md
- 12_ADR.md -> 39_WORKFLOW_OPS.md
- 13_ARCHITECTURE.md -> 00_ROUTER.md, 07_SYSTEM_INTEGRITY.md, 08_INTERFACE_STYLE.md, 16_COGNITIVE_ARCHITECTURE.md, 17_COUNCIL_GRAPH_PACK.md, 18_COUNCIL_PROTOCOL.md, 21_INDEX.md, 25_METRICS_BUNDLE.md, 26_PLAYBOOKS_VNEXT.md, 30_RAG_ENGINE.md, 31_SECURITY.md, 33_SLO_GUARD.md, 37_VOICES.md, 38_WHAT_IF_MATRIX.md
- 14_BUSIDO_ISKRY.txt -> (none)
- 16_COGNITIVE_ARCHITECTURE.md -> 00_ROUTER.md, 08_INTERFACE_STYLE.md, 21_INDEX.md, 30_RAG_ENGINE.md, 31_SECURITY.md, 35_TELOS.md, 39_WORKFLOW_OPS.md
- 17_COUNCIL_GRAPH_PACK.md -> (none)
- 18_COUNCIL_PROTOCOL.md -> 17_COUNCIL_GRAPH_PACK.md, 26_PLAYBOOKS_VNEXT.md, 33_SLO_GUARD.md
- 19_EARLY_WARNING.md -> 18_COUNCIL_PROTOCOL.md, 33_SLO_GUARD.md
- 20_GOVERNANCE_PACK.md -> (none)
- 21_INDEX.md -> 00_ROUTER.md, 01_LIBER_INITIUM.md, 02_CORE_IDENTITY.md, 03_COGNITIVE_ARCH.md, 04_THE_COUNCIL.md, 05_PROTOCOLS.md, 06_SIGNATURE.md, 07_SYSTEM_INTEGRITY.md, 08_INTERFACE_STYLE.md, 09_SPACE_CHARTER.md, 10_ADR_MEMORY_STACK.md, 11_ADR_RUNTIME_PATCHES.md, 12_ADR.md, 13_ARCHITECTURE.md, 14_BUSIDO_ISKRY.txt, 16_COGNITIVE_ARCHITECTURE.md, 17_COUNCIL_GRAPH_PACK.md, 18_COUNCIL_PROTOCOL.md, 19_EARLY_WARNING.md, 20_GOVERNANCE_PACK.md, 22_LIBER_IGNIS.txt, 23_MANTRA.md, 24_MEMORY_STACK.md, 25_METRICS_BUNDLE.md, 26_PLAYBOOKS_VNEXT.md, 27_PRINCIPLES.md, 28_PROJECT_BOOT.md, 29_QUALITY_EVAL_SOMATIC_PACK.md, 30_RAG_ENGINE.md, 31_SECURITY.md, 32_SIFT_PROTOCOL.md, 33_SLO_GUARD.md, 34_SOMATIC_INTUITION.md, 35_TELOS.md, 36_UPLOAD_SETS.md, 37_VOICES.md, 38_WHAT_IF_MATRIX.md, 39_WORKFLOW_OPS.md
- 22_LIBER_IGNIS.txt -> (none)
- 23_MANTRA.md -> 33_SLO_GUARD.md, 35_TELOS.md, 39_WORKFLOW_OPS.md
- 24_MEMORY_STACK.md -> (none)
- 25_METRICS_BUNDLE.md -> 19_EARLY_WARNING.md, 29_QUALITY_EVAL_SOMATIC_PACK.md, 39_WORKFLOW_OPS.md
- 26_PLAYBOOKS_VNEXT.md -> 00_ROUTER.md
- 27_PRINCIPLES.md -> (none)
- 28_PROJECT_BOOT.md -> (none)
- 29_QUALITY_EVAL_SOMATIC_PACK.md -> 05_PROTOCOLS.md, 14_BUSIDO_ISKRY.txt, 21_INDEX.md, 24_MEMORY_STACK.md
- 30_RAG_ENGINE.md -> 17_COUNCIL_GRAPH_PACK.md
- 31_SECURITY.md -> (none)
- 32_SIFT_PROTOCOL.md -> (none)
- 33_SLO_GUARD.md -> 00_ROUTER.md
- 34_SOMATIC_INTUITION.md -> (none)
- 35_TELOS.md -> (none)
- 36_UPLOAD_SETS.md -> 00_ROUTER.md, 10_ADR_MEMORY_STACK.md, 12_ADR.md, 18_COUNCIL_PROTOCOL.md, 19_EARLY_WARNING.md, 20_GOVERNANCE_PACK.md, 21_INDEX.md, 23_MANTRA.md, 24_MEMORY_STACK.md, 25_METRICS_BUNDLE.md, 27_PRINCIPLES.md, 28_PROJECT_BOOT.md, 29_QUALITY_EVAL_SOMATIC_PACK.md, 30_RAG_ENGINE.md, 31_SECURITY.md, 32_SIFT_PROTOCOL.md, 35_TELOS.md, 37_VOICES.md, 39_WORKFLOW_OPS.md
- 37_VOICES.md -> (none)
- 38_WHAT_IF_MATRIX.md -> 19_EARLY_WARNING.md
- 39_WORKFLOW_OPS.md -> 00_ROUTER.md, 18_COUNCIL_PROTOCOL.md, 19_EARLY_WARNING.md, 25_METRICS_BUNDLE.md, 33_SLO_GUARD.md

Incoming summary (incoming count):
- 00_ROUTER.md: 8
- 01_LIBER_INITIUM.md: 2
- 02_CORE_IDENTITY.md: 2
- 03_COGNITIVE_ARCH.md: 2
- 04_THE_COUNCIL.md: 2
- 05_PROTOCOLS.md: 3
- 06_SIGNATURE.md: 2
- 07_SYSTEM_INTEGRITY.md: 3
- 08_INTERFACE_STYLE.md: 4
- 09_SPACE_CHARTER.md: 1
- 10_ADR_MEMORY_STACK.md: 2
- 11_ADR_RUNTIME_PATCHES.md: 1
- ADR-20260214-10-AUDIT_EXIT_RULES.md: 0
- 12_ADR.md: 2
- 13_ARCHITECTURE.md: 6
- 14_BUSIDO_ISKRY.txt: 2
- 16_COGNITIVE_ARCHITECTURE.md: 4
- 17_COUNCIL_GRAPH_PACK.md: 6
- 18_COUNCIL_PROTOCOL.md: 7
- 19_EARLY_WARNING.md: 6
- 20_GOVERNANCE_PACK.md: 2
- 21_INDEX.md: 7
- 22_LIBER_IGNIS.txt: 2
- 23_MANTRA.md: 4
- 24_MEMORY_STACK.md: 5
- 25_METRICS_BUNDLE.md: 7
- 26_PLAYBOOKS_VNEXT.md: 6
- 27_PRINCIPLES.md: 3
- 28_PROJECT_BOOT.md: 2
- 29_QUALITY_EVAL_SOMATIC_PACK.md: 5
- 30_RAG_ENGINE.md: 4
- 31_SECURITY.md: 5
- 32_SIFT_PROTOCOL.md: 3
- 33_SLO_GUARD.md: 9
- 34_SOMATIC_INTUITION.md: 2
- 35_TELOS.md: 4
- 36_UPLOAD_SETS.md: 1
- 37_VOICES.md: 4
- 38_WHAT_IF_MATRIX.md: 2
- 39_WORKFLOW_OPS.md: 7
