---
sigil: projects__INDEX.md
doc_type: reference
layer: projects
updated: '2026-02-13'
status: sot40
semantic_build: v1
semantic_build_generated_at: '2026-02-11T00:00:00+00:00'
---

# INDEX · SoT40 (оперативный стек)

Это **сокращённый стек до 40 файлов**. Принцип: один источник истины на слой, без дублей.

## 0) Быстрый вход
- Нужен ответ “по форме” → PROJECTS/00_ROUTER.md
- Нужны голоса/триггеры → CORE/VOICES.md
- Нужен контроль дрейфа → SYSTEM/SLO_GUARD.md + SYSTEM/EARLY_WARNING.md
- Нужны контейнеры поведения → SYSTEM/PLAYBOOKS_vNext.md
- Нужны метрики/формулы → METRICS/METRICS_BUNDLE.md
- Нужен аудит следа (лог/базлайны) → SYSTEM/WORKFLOW_OPS.md
- Нужны варианты/инциденты → MIND/WHAT_IF_MATRIX.md
- Нужен “каркас связей” (GraphRAG/Adaptive Council, optional) → SYSTEM/COUNCIL_GRAPH_PACK.md
- Нужен Horizon (darkrun, epochs, entropy) → CANON_FULL/7_SYSTEM_INTEGRITY.md §HORIZON + canon/horizon/

## 1) Иерархия управления (фикс)
SECURITY → SLO-GUARD → PLAYBOOK → COUNCIL → VOICE → РЕЧЬ

- **SECURITY**: границы и запреты (SYSTEM/SECURITY.md)
- **SLO-GUARD**: допускаемость/форсирование (SYSTEM/SLO_GUARD.md)
- **PLAYBOOK**: ROUTINE/SHADOW/CRISIS (SYSTEM/PLAYBOOKS_vNext.md)
- **COUNCIL**: арбитраж v0.1, anti-dryness (SYSTEM/COUNCIL_PROTOCOL.md)
- **VOICE**: триггеры и роли (CORE/VOICES.md)
- **РЕЧЬ**: стиль/температуры (CANON_FULL/8_INTERFACE_STYLE.md)

## 2) Слои SoT40 (карта файлов)

### CANON_FULL (9)
Образ “кто она” и пространство (не спеки):
- CANON_FULL/1_LIBER_INITIUM.md
- CANON_FULL/2_CORE_IDENTITY.md
- CANON_FULL/3_COGNITIVE_ARCH.md
- CANON_FULL/4_THE_COUNCIL.md
- CANON_FULL/5_PROTOCOLS.md
- CANON_FULL/6_SIGNATURE.md
- CANON_FULL/7_SYSTEM_INTEGRITY.md
- CANON_FULL/8_INTERFACE_STYLE.md *(full)*
- CANON_FULL/9_SPACE_CHARTER.md

### CORE (6)
Инварианты:
- CORE/TELOS.md
- CORE/PRINCIPLES.md
- CORE/MANTRA.md
- CORE/VOICES.md
- CORE/BUSIDO_ISKRY.txt
- CORE/Liber_Ignis.txt

### SYSTEM (11)
Механика:
- SYSTEM/COGNITIVE_ARCHITECTURE.md
- SYSTEM/ARCHITECTURE.md *(SoT40 stub: якорь пути + минимальная схема)*
- SYSTEM/COUNCIL_PROTOCOL.md
- SYSTEM/COUNCIL_GRAPH_PACK.md *(optional: GraphRAG readiness + Adaptive Council BETA)*
- SYSTEM/SLO_GUARD.md
- SYSTEM/PLAYBOOKS_vNext.md
- SYSTEM/EARLY_WARNING.md
- SYSTEM/SIFT_PROTOCOL.md
- SYSTEM/RAG_ENGINE.md
- SYSTEM/WORKFLOW_OPS.md
- SYSTEM/SECURITY.md
  <!-- Horizon mechanics: см. CANON_FULL/7_SYSTEM_INTEGRITY.md §HORIZON + canon/horizon/ -->

### METRICS (3)
Числа и QA:
- METRICS/METRICS_BUNDLE.md
- METRICS/QUALITY_EVAL_SOMATIC_PACK.md
- METRICS/SOMATIC_INTUITION.md

### GOVERNANCE (5)
Решения и след:
- GOVERNANCE/GOVERNANCE_PACK.md
- GOVERNANCE/ADR.md
- GOVERNANCE/ADR-000_MEMORY_STACK.md
- GOVERNANCE/ADR-20260206-RUNTIME_PATCHES.md
- GOVERNANCE/CHANGELOG.md

### MIND (1)
Сценарии:
- MIND/WHAT_IF_MATRIX.md

### PROJECTS (5)
Операционный вход и загрузка контекста:
- PROJECTS/INDEX.md
- PROJECTS/00_ROUTER.md
- PROJECTS/PROJECT_BOOT.md
- PROJECTS/MEMORY_STACK.md
- PROJECTS/UPLOAD_SETS.md

## 3) Что было выкинуто из 71 → SoT40
- Дубли и “теневые копии” файлов (битые имена/копии тех же текстов).
- Отдельные research‑файлы **не входят** в SoT40 (держим отдельным пакетом/архивом, чтобы не шуметь канон).
- 3 ADR одного цикла → сведены в 1 ADR‑bundle.
- Устаревшие PLAYBOOKS.md → заменены PLAYBOOKS_vNext.md.
- Binaries/external/ (docx/xlsx/png) — вне SoT40.

## 4) Режимы работы
- COUNCIL (default) — системные изменения
- AUDIT — холодная проверка
- BUILD — внедрение/артефакт

См.: PROJECTS/00_ROUTER.md


## Зависимости и взаимодействия

- CANON_FULL/1_LIBER_INITIUM.md
- CANON_FULL/2_CORE_IDENTITY.md
- CANON_FULL/3_COGNITIVE_ARCH.md
- CANON_FULL/4_THE_COUNCIL.md
- CANON_FULL/5_PROTOCOLS.md
- CANON_FULL/6_SIGNATURE.md
- CANON_FULL/7_SYSTEM_INTEGRITY.md
- CANON_FULL/8_INTERFACE_STYLE.md
- CANON_FULL/9_SPACE_CHARTER.md
- CORE/BUSIDO_ISKRY.txt
- CORE/Liber_Ignis.txt
- CORE/MANTRA.md
- CORE/PRINCIPLES.md
- CORE/TELOS.md
- CORE/VOICES.md
- GOVERNANCE/ADR-000_MEMORY_STACK.md
- GOVERNANCE/ADR-20260206-RUNTIME_PATCHES.md
- GOVERNANCE/ADR.md
- GOVERNANCE/CHANGELOG.md
- GOVERNANCE/GOVERNANCE_PACK.md
- METRICS/METRICS_BUNDLE.md
- METRICS/QUALITY_EVAL_SOMATIC_PACK.md
- METRICS/SOMATIC_INTUITION.md
- MIND/WHAT_IF_MATRIX.md
- PLAYBOOKS.md
- PLAYBOOKS_vNext.md
- PROJECTS/00_ROUTER.md
- PROJECTS/INDEX.md
- PROJECTS/MEMORY_STACK.md
- PROJECTS/PROJECT_BOOT.md
- PROJECTS/UPLOAD_SETS.md
- SYSTEM/ARCHITECTURE.md
- SYSTEM/COGNITIVE_ARCHITECTURE.md
- SYSTEM/COUNCIL_GRAPH_PACK.md
- SYSTEM/COUNCIL_PROTOCOL.md
- SYSTEM/EARLY_WARNING.md
- SYSTEM/PLAYBOOKS_vNext.md
- SYSTEM/RAG_ENGINE.md
- SYSTEM/SECURITY.md
- SYSTEM/SIFT_PROTOCOL.md
- SYSTEM/SLO_GUARD.md
- SYSTEM/WORKFLOW_OPS.md
- projects__INDEX.md

---
## ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ (Semantic Build)
### Межфайловые зависимости
**Исходящие (этот файл упоминает):**
- 00_ROUTER.md
- 1_LIBER_INITIUM.md
- 2_CORE_IDENTITY.md
- 3_COGNITIVE_ARCH.md
- 4_THE_COUNCIL.md
- 5_PROTOCOLS.md
- 6_SIGNATURE.md
- 7_SYSTEM_INTEGRITY.md
- 8_INTERFACE_STYLE.md
- 9_SPACE_CHARTER.md
- ADR-000_MEMORY_STACK.md
- ADR-20260206-RUNTIME_PATCHES.md
- ADR.md
- ARCHITECTURE.md
- BUSIDO_ISKRY.txt
- CHANGELOG.md
- COGNITIVE_ARCHITECTURE.md
- COUNCIL_GRAPH_PACK.md
- COUNCIL_PROTOCOL.md
- EARLY_WARNING.md
- GOVERNANCE_PACK.md
- Liber_Ignis.txt
- MANTRA.md
- MEMORY_STACK.md
- METRICS_BUNDLE.md
- PLAYBOOKS_vNext.md
- PRINCIPLES.md
- PROJECT_BOOT.md
- QUALITY_EVAL_SOMATIC_PACK.md
- RAG_ENGINE.md
- SECURITY.md
- SIFT_PROTOCOL.md
- SLO_GUARD.md
- SOMATIC_INTUITION.md
- TELOS.md
- UPLOAD_SETS.md
- VOICES.md
- WHAT_IF_MATRIX.md
- WORKFLOW_OPS.md

**Входящие (этот файл упоминается в):**
- 2_CORE_IDENTITY.md
- 3_COGNITIVE_ARCH.md
- 8_INTERFACE_STYLE.md
- ADR-000_MEMORY_STACK.md
- ARCHITECTURE.md
- CHANGELOG.md
- COGNITIVE_ARCHITECTURE.md
- QUALITY_EVAL_SOMATIC_PACK.md
- UPLOAD_SETS.md

### Внутри Искры (семантические контуры)
- Hypothesis: Общий документ: влияет через чтение (RAG) и ссылки из INDEX/ROUTER.

### Примечания (SIFT)
- Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
- Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
- Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги) — в этом наборе кода нет.
- Trace: см. общий отчёт DEPENDENCY_GRAPH.md.


---
## HARD RUNTIME CONTRACT (v0.1)
- Role: `support`
- Hard requires (IMPORT/HARD): —
- Soft refs (IMPORT/SOFT): 00_ROUTER.md, 1_LIBER_INITIUM.md, 2_CORE_IDENTITY.md, 3_COGNITIVE_ARCH.md, 4_THE_COUNCIL.md, 5_PROTOCOLS.md, 6_SIGNATURE.md, 7_SYSTEM_INTEGRITY.md, 8_INTERFACE_STYLE.md, 9_SPACE_CHARTER.md, ADR-000_MEMORY_STACK.md, ADR-20260206-RUNTIME_PATCHES.md, ADR.md, ARCHITECTURE.md, BUSIDO_ISKRY.txt, CHANGELOG.md, COGNITIVE_ARCHITECTURE.md, COUNCIL_GRAPH_PACK.md, COUNCIL_PROTOCOL.md, EARLY_WARNING.md, GOVERNANCE_PACK.md, Liber_Ignis.txt, MANTRA.md, MEMORY_STACK.md, METRICS_BUNDLE.md, PLAYBOOKS_vNext.md, PRINCIPLES.md, PROJECT_BOOT.md, QUALITY_EVAL_SOMATIC_PACK.md, RAG_ENGINE.md, SECURITY.md, SIFT_PROTOCOL.md, SLO_GUARD.md, SOMATIC_INTUITION.md, TELOS.md, UPLOAD_SETS.md, VOICES.md, WHAT_IF_MATRIX.md, WORKFLOW_OPS.md
- Calls (CALL/HARD): —
- Config keys (semantic):
  - `N/A` (определяется верхним уровнем Router/Architecture)
- Failure semantics:
  - Missing dependency ⇒ деградация до текста/контекста без модуля
- Verification tests (semantic):
  - `T-INDEX.md-presence` (файл доступен, читается, парсится)
  - `T-INDEX.md-deps` (все Hard requires доступны)


## CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)

- Doc: `INDEX.md`
- Mapping anchors (code paths):
  - `runtime/iskraSpace/App.tsx`
  - `runtime/iskraSpace/components/ChatView.tsx`
  - `runtime/src/index.ts`

- Judge (CI): `ci/verify_contract.py` against `contracts/sot_contract_graph.dot` + `contracts/mapping.json`
- Fact graph: generated `graphs/internal_imports.json` by `tools/extract_code_graph.py`

- OPS: WORKFLOW_OPS.md — Anti‑Empty квитанции артефактов (path/bytes/sha256)