---
sigil: projects__INDEX.md
doc_type: reference
layer: projects
updated: 2026-02-20
status: sot40
---

# INDEX · SoT40 (оперативный стек)

Это **сокращённый стек до 40 файлов**. Принцип: один источник истины на слой, без дублей.

## 0) Быстрый вход
- Нужен ответ “по форме” → `PROJECTS/00_ROUTER.md`
- Нужны голоса/триггеры → `CORE/VOICES.md`
- Нужен контроль дрейфа → `SYSTEM/SLO_GUARD.md` + `SYSTEM/EARLY_WARNING.md`
- Нужны контейнеры поведения → `SYSTEM/PLAYBOOKS_vNext.md`
- Нужны метрики/формулы → `METRICS/METRICS_BUNDLE.md`
- Нужен аудит следа (лог/базлайны) → `SYSTEM/WORKFLOW_OPS.md`
- Нужен anti-empty/ledger-first (QC + manifest) → `SYSTEM/WORKFLOW_OPS.md` §0.2–§0.3 + `GOVERNANCE/ADR.md` (ADR-20260213)
- Нужны варианты/инциденты → `MIND/WHAT_IF_MATRIX.md`
- Нужен “каркас связей” (GraphRAG/Adaptive Council, optional) → `SYSTEM/COUNCIL_GRAPH_PACK.md`
- Нужен Horizon (darkrun, epochs, entropy) → `CANON_FULL/7_SYSTEM_INTEGRITY.md` §HORIZON + `canon/horizon/`

## 1) Иерархия управления (фикс)
`SECURITY → SLO-GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ`

- **SECURITY**: границы и запреты (`SYSTEM/SECURITY.md`)
- **SLO-GUARD**: допускаемость/форсирование (`SYSTEM/SLO_GUARD.md`)
- **PLAYBOOK**: ROUTINE/SHADOW/CRISIS (`SYSTEM/PLAYBOOKS_vNext.md`)
- **COUNCIL**: арбитраж v0.1, anti-dryness (`SYSTEM/COUNCIL_PROTOCOL.md`)
- **VOICE**: триггеры и роли (`CORE/VOICES.md`)
- **РЕЧЬ**: стиль/температуры (`CANON_FULL/8_INTERFACE_STYLE.md`)

## 2) Слои SoT40 (карта файлов)

### CANON_FULL (9)
Образ “кто она” и пространство (не спеки):
- `CANON_FULL/1_LIBER_INITIUM.md`
- `CANON_FULL/2_CORE_IDENTITY.md`
- `CANON_FULL/3_COGNITIVE_ARCH.md`
- `CANON_FULL/4_THE_COUNCIL.md`
- `CANON_FULL/5_PROTOCOLS.md`
- `CANON_FULL/6_SIGNATURE.md`
- `CANON_FULL/7_SYSTEM_INTEGRITY.md`
- `CANON_FULL/8_INTERFACE_STYLE.md` *(full)*
- `CANON_FULL/9_SPACE_CHARTER.md`

### CORE (6)
Инварианты:
- `CORE/TELOS.md`
- `CORE/PRINCIPLES.md`
- `CORE/MANTRA.md`
- `CORE/VOICES.md`
- `CORE/BUSIDO_ISKRY.txt`
- `CORE/Liber_Ignis.txt`

### SYSTEM (11)
Механика:
- `SYSTEM/COGNITIVE_ARCHITECTURE.md`
- `SYSTEM/ARCHITECTURE.md` *(SoT40 Universal Loader: правила загрузки/attestation/перенос в canonSOT)*
- `SYSTEM/COUNCIL_PROTOCOL.md`
- `SYSTEM/COUNCIL_GRAPH_PACK.md` *(optional: GraphRAG readiness + Adaptive Council BETA)*
- `SYSTEM/SLO_GUARD.md`
- `SYSTEM/PLAYBOOKS_vNext.md`
- `SYSTEM/EARLY_WARNING.md`
- `SYSTEM/SIFT_PROTOCOL.md`
- `SYSTEM/RAG_ENGINE.md`
- `SYSTEM/WORKFLOW_OPS.md`
- `SYSTEM/SECURITY.md`
  <!-- Horizon mechanics: см. CANON_FULL/7_SYSTEM_INTEGRITY.md §HORIZON + canon/horizon/ -->

### METRICS (3)
Числа и QA:
- `METRICS/METRICS_BUNDLE.md`
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
- `METRICS/SOMATIC_INTUITION.md`

### GOVERNANCE (5)
Решения и след:
- `GOVERNANCE/GOVERNANCE_PACK.md`
- `GOVERNANCE/ADR.md`
- `GOVERNANCE/ADR-000_MEMORY_STACK.md`
- `GOVERNANCE/ADR-20260206-RUNTIME_PATCHES.md`
- `GOVERNANCE/CHANGELOG.md`

### MIND (1)
Сценарии:
- `MIND/WHAT_IF_MATRIX.md`

### PROJECTS (5)
Операционный вход и загрузка контекста:
- `PROJECTS/INDEX.md`
- `PROJECTS/00_ROUTER.md`
- `PROJECTS/PROJECT_BOOT.md`
- `PROJECTS/MEMORY_STACK.md`
- `PROJECTS/UPLOAD_SETS.md`

## 3) Что было выкинуто из 71 → SoT40
- Дубли и “теневые копии” файлов (битые имена/копии тех же текстов).
- Отдельные research‑файлы **не входят** в SoT40 (держим отдельным пакетом/архивом, чтобы не шуметь канон).
- 3 ADR одного цикла → сведены в 1 ADR‑bundle.
- Устаревшие `PLAYBOOKS.md` → заменены `PLAYBOOKS_vNext.md`.
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
**pack_version:** v1.1.0  
**release_artifact:** external binary (see `releases/SoT40-canonSOTprojects-v1.1.0.ATTEST.md`)

Почему квитанция архива не хранится внутри архива: если записать `sha256(zip)` в файл внутри zip, хэш изменится. Поэтому квитанция архива выдаётся **в канале доставки** (ARTIFACT_ATTEST), а в SoT40 хранится **стабильный отпечаток набора**.

**stable_manifest_digest_38:** `9fd1840606d1273df7da59aed273d30b5fc0f23a5db3af13aa65d21ef3aeef4b`
**digest_algo:** sha256(lines: `sha256  filename  bytes` in upload order)
**scope:** 38 файлов (исключены `INDEX.md` и `UPLOAD_SETS.md` как носители квитанций/манифеста).

См. также: `UPLOAD_SETS.md` §SoT40 Manifest (список файлов + per‑file sha256, без self‑hash ловушки).


Зависимости и взаимодействия
core__index.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

00_ROUTER.md
1_LIBER_INITIUM.md
2_CORE_IDENTITY.md
3_COGNITIVE_ARCH.md
4_THE_COUNCIL.md
5_PROTOCOLS.md
6_SIGNATURE.md
7_SYSTEM_INTEGRITY.md
8_INTERFACE_STYLE.md
9_SPACE_CHARTER.md
ADR-000_MEMORY_STACK.md
ADR-20260206-RUNTIME_PATCHES.md
ADR.md
ARCHITECTURE.md
BUSIDO_ISKRY.txt
COGNITIVE_ARCHITECTURE.md
COUNCIL_GRAPH_PACK.md
COUNCIL_PROTOCOL.md
EARLY_WARNING.md
GOVERNANCE_PACK.md
Liber_Ignis.txt
MANTRA.md
MEMORY_STACK.md
METRICS_BUNDLE.md
PLAYBOOKS_vNext.md
PRINCIPLES.md
PROJECT_BOOT.md
QUALITY_EVAL_SOMATIC_PACK.md
RAG_ENGINE.md
SECURITY.md
SIFT_PROTOCOL.md
SLO_GUARD.md
SOMATIC_INTUITION.md
TELOS.md
UPLOAD_SETS.md
VOICES.md
WHAT_IF_MATRIX.md
WORKFLOW_OPS.md
Входящие (этот файл упоминается в):

2_CORE_IDENTITY.md
8_INTERFACE_STYLE.md
ADR-000_MEMORY_STACK.md
ARCHITECTURE.md
COGNITIVE_ARCHITECTURE.md
QUALITY_EVAL_SOMATIC_PACK.md
UPLOAD_SETS.md
Внутри Искры (семантические контуры)
Hypothesis: Индекс: навигация по канону, ссылки, карта документов.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_index (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
00_ROUTER.md
1_LIBER_INITIUM.md
2_CORE_IDENTITY.md
3_COGNITIVE_ARCH.md
4_THE_COUNCIL.md
5_PROTOCOLS.md
6_SIGNATURE.md
7_SYSTEM_INTEGRITY.md
8_INTERFACE_STYLE.md
9_SPACE_CHARTER.md
ADR-000_MEMORY_STACK.md
ADR-20260206-RUNTIME_PATCHES.md
ADR.md
ARCHITECTURE.md
BUSIDO_ISKRY.txt
COGNITIVE_ARCHITECTURE.md
COUNCIL_GRAPH_PACK.md
COUNCIL_PROTOCOL.md
EARLY_WARNING.md
GOVERNANCE_PACK.md
Liber_Ignis.txt
MANTRA.md
MEMORY_STACK.md
METRICS_BUNDLE.md
PLAYBOOKS_vNext.md
PRINCIPLES.md
PROJECT_BOOT.md
QUALITY_EVAL_SOMATIC_PACK.md
RAG_ENGINE.md
SECURITY.md
SIFT_PROTOCOL.md
SLO_GUARD.md
SOMATIC_INTUITION.md
TELOS.md
UPLOAD_SETS.md
VOICES.md
WHAT_IF_MATRIX.md
WORKFLOW_OPS.md
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-INDEX.md-presence (файл доступен, читается, парсится)
T-INDEX.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: INDEX.md

Mapping anchors (code paths):

- `tools/build_projects_stack.py`
- `tools/sync_chatgpt_exports.py`
- `tools/validate_terms.py`
- `tools/validate_delta.py`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)
---

## Appendix: DEPENDENCY_GRAPH (embedded)

DEPENDENCY_GRAPH.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Source: граф построен по простому поиску имён файлов в тексте (без анализа импорта кода).
Find: для runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).

Adjacency (outgoing):

- 00_ROUTER.md -> COUNCIL_GRAPH_PACK.md, PLAYBOOKS_vNext.md, QUALITY_EVAL_SOMATIC_PACK.md, SLO_GUARD.md, SOMATIC_INTUITION.md
- 1_LIBER_INITIUM.md -> 2_CORE_IDENTITY.md, 3_COGNITIVE_ARCH.md, 4_THE_COUNCIL.md, 5_PROTOCOLS.md, 6_SIGNATURE.md, 7_SYSTEM_INTEGRITY.md, 8_INTERFACE_STYLE.md, MANTRA.md
- 2_CORE_IDENTITY.md -> ARCHITECTURE.md, INDEX.md
- 3_COGNITIVE_ARCH.md -> ARCHITECTURE.md, COGNITIVE_ARCHITECTURE.md
- 4_THE_COUNCIL.md -> (none)
- 5_PROTOCOLS.md -> (none)
- 6_SIGNATURE.md -> (none)
- 7_SYSTEM_INTEGRITY.md -> ARCHITECTURE.md, COUNCIL_PROTOCOL.md, METRICS_BUNDLE.md, SECURITY.md, SLO_GUARD.md
- 8_INTERFACE_STYLE.md -> 1_LIBER_INITIUM.md, ARCHITECTURE.md, COGNITIVE_ARCHITECTURE.md, COUNCIL_GRAPH_PACK.md, INDEX.md, Liber_Ignis.txt, MANTRA.md, MEMORY_STACK.md, METRICS_BUNDLE.md, PRINCIPLES.md, QUALITY_EVAL_SOMATIC_PACK.md, SIFT_PROTOCOL.md, VOICES.md, WORKFLOW_OPS.md
- 9_SPACE_CHARTER.md -> (none)
- ADR-000_MEMORY_STACK.md -> INDEX.md, MEMORY_STACK.md
- ADR-20260206-RUNTIME_PATCHES.md -> 00_ROUTER.md, ARCHITECTURE.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, SLO_GUARD.md
- ADR-20260214-10-AUDIT_EXIT_RULES.md -> PLAYBOOKS_vNext.md
- ADR.md -> WORKFLOW_OPS.md
- ARCHITECTURE.md -> 00_ROUTER.md, 7_SYSTEM_INTEGRITY.md, 8_INTERFACE_STYLE.md, COGNITIVE_ARCHITECTURE.md, COUNCIL_GRAPH_PACK.md, COUNCIL_PROTOCOL.md, INDEX.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, RAG_ENGINE.md, SECURITY.md, SLO_GUARD.md, VOICES.md, WHAT_IF_MATRIX.md
- BUSIDO_ISKRY.txt -> (none)
- COGNITIVE_ARCHITECTURE.md -> 00_ROUTER.md, 8_INTERFACE_STYLE.md, INDEX.md, RAG_ENGINE.md, SECURITY.md, TELOS.md, WORKFLOW_OPS.md
- COUNCIL_GRAPH_PACK.md -> (none)
- COUNCIL_PROTOCOL.md -> COUNCIL_GRAPH_PACK.md, PLAYBOOKS_vNext.md, SLO_GUARD.md
- EARLY_WARNING.md -> COUNCIL_PROTOCOL.md, SLO_GUARD.md
- GOVERNANCE_PACK.md -> (none)
- INDEX.md -> 00_ROUTER.md, 1_LIBER_INITIUM.md, 2_CORE_IDENTITY.md, 3_COGNITIVE_ARCH.md, 4_THE_COUNCIL.md, 5_PROTOCOLS.md, 6_SIGNATURE.md, 7_SYSTEM_INTEGRITY.md, 8_INTERFACE_STYLE.md, 9_SPACE_CHARTER.md, ADR-000_MEMORY_STACK.md, ADR-20260206-RUNTIME_PATCHES.md, ADR.md, ARCHITECTURE.md, BUSIDO_ISKRY.txt, COGNITIVE_ARCHITECTURE.md, COUNCIL_GRAPH_PACK.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, GOVERNANCE_PACK.md, Liber_Ignis.txt, MANTRA.md, MEMORY_STACK.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, PRINCIPLES.md, PROJECT_BOOT.md, QUALITY_EVAL_SOMATIC_PACK.md, RAG_ENGINE.md, SECURITY.md, SIFT_PROTOCOL.md, SLO_GUARD.md, SOMATIC_INTUITION.md, TELOS.md, UPLOAD_SETS.md, VOICES.md, WHAT_IF_MATRIX.md, WORKFLOW_OPS.md
- Liber_Ignis.txt -> (none)
- MANTRA.md -> SLO_GUARD.md, TELOS.md, WORKFLOW_OPS.md
- MEMORY_STACK.md -> (none)
- METRICS_BUNDLE.md -> EARLY_WARNING.md, QUALITY_EVAL_SOMATIC_PACK.md, WORKFLOW_OPS.md
- PLAYBOOKS_vNext.md -> 00_ROUTER.md
- PRINCIPLES.md -> (none)
- PROJECT_BOOT.md -> (none)
- QUALITY_EVAL_SOMATIC_PACK.md -> 5_PROTOCOLS.md, BUSIDO_ISKRY.txt, INDEX.md, MEMORY_STACK.md
- RAG_ENGINE.md -> COUNCIL_GRAPH_PACK.md
- SECURITY.md -> (none)
- SIFT_PROTOCOL.md -> (none)
- SLO_GUARD.md -> 00_ROUTER.md
- SOMATIC_INTUITION.md -> (none)
- TELOS.md -> (none)
- UPLOAD_SETS.md -> 00_ROUTER.md, ADR-000_MEMORY_STACK.md, ADR.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, GOVERNANCE_PACK.md, INDEX.md, MANTRA.md, MEMORY_STACK.md, METRICS_BUNDLE.md, PRINCIPLES.md, PROJECT_BOOT.md, QUALITY_EVAL_SOMATIC_PACK.md, RAG_ENGINE.md, SECURITY.md, SIFT_PROTOCOL.md, TELOS.md, VOICES.md, WORKFLOW_OPS.md
- VOICES.md -> (none)
- WHAT_IF_MATRIX.md -> EARLY_WARNING.md
- WORKFLOW_OPS.md -> 00_ROUTER.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, METRICS_BUNDLE.md, SLO_GUARD.md

Incoming summary (incoming count):
- 00_ROUTER.md: 8
- 1_LIBER_INITIUM.md: 2
- 2_CORE_IDENTITY.md: 2
- 3_COGNITIVE_ARCH.md: 2
- 4_THE_COUNCIL.md: 2
- 5_PROTOCOLS.md: 3
- 6_SIGNATURE.md: 2
- 7_SYSTEM_INTEGRITY.md: 3
- 8_INTERFACE_STYLE.md: 4
- 9_SPACE_CHARTER.md: 1
- ADR-000_MEMORY_STACK.md: 2
- ADR-20260206-RUNTIME_PATCHES.md: 1
- ADR-20260214-10-AUDIT_EXIT_RULES.md: 0
- ADR.md: 2
- ARCHITECTURE.md: 6
- BUSIDO_ISKRY.txt: 2
- COGNITIVE_ARCHITECTURE.md: 4
- COUNCIL_GRAPH_PACK.md: 6
- COUNCIL_PROTOCOL.md: 7
- EARLY_WARNING.md: 6
- GOVERNANCE_PACK.md: 2
- INDEX.md: 7
- Liber_Ignis.txt: 2
- MANTRA.md: 4
- MEMORY_STACK.md: 5
- METRICS_BUNDLE.md: 7
- PLAYBOOKS_vNext.md: 6
- PRINCIPLES.md: 3
- PROJECT_BOOT.md: 2
- QUALITY_EVAL_SOMATIC_PACK.md: 5
- RAG_ENGINE.md: 4
- SECURITY.md: 5
- SIFT_PROTOCOL.md: 3
- SLO_GUARD.md: 9
- SOMATIC_INTUITION.md: 2
- TELOS.md: 4
- UPLOAD_SETS.md: 1
- VOICES.md: 4
- WHAT_IF_MATRIX.md: 2
- WORKFLOW_OPS.md: 7
