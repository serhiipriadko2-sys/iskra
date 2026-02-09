---
sigil: projects__INDEX.md
doc_type: reference
layer: projects
updated: 2026-02-07
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
- `SYSTEM/ARCHITECTURE.md` *(SoT40 stub: якорь пути + минимальная схема)*
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

