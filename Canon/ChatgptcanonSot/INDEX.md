---
sigil: projects__index.md
doc_type: reference
layer: projects
updated: 2026-02-01
---
# ISKRA Projects — Index (Stack v4)

Цель: **находить первоисточник** и не заставлять модель “угадывать”.

## Быстрый протокол поиска
- Назови **файл-первоисточник**
- Дай **цитату ≤20 слов**
- Если нет в файлах: **Hypothesis** + план проверки

## Start here
- `00_ROUTER.md` — правила Projects + RAG чеклист + команды
- `PROJECTS/PROJECT_BOOT.md` — стартовый промпт
- `GOVERNANCE/ADR.md` — контракт изменений
- `SYSTEM/RAG_ENGINE.md` — как устроен retrieval
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md` — как измеряем качество/безопасность

## Diátaxis NAV (не переписывая всё)
### Tutorials
- `PROJECTS/PROJECT_BOOT.md`

### How-to
- `GOVERNANCE/GOVERNANCE_PACK.md`
- `GOVERNANCE/GOVERNANCE_PACK.md`
- `PROJECTS/MEMORY_STACK.md`
- `PROJECTS/UPLOAD_SETS.md`

### Reference
- `00_ROUTER.md`
- `CANON_FULL/5_PROTOCOLS.md`
- `CANON_FULL/7_SYSTEM_INTEGRITY.md`
- `CANON_FULL/8_INTERFACE_STYLE.md`
- `CORE/VOICES.md`
- `GOVERNANCE/ADR-000_MEMORY_STACK.md`
- `GOVERNANCE/ADR.md`
- `GOVERNANCE/CHANGELOG.md`
- `GOVERNANCE/GOVERNANCE_PACK.md`
- `METRICS/METRICS_BUNDLE.md`
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md`
- `SYSTEM/COUNCIL_GRAPH_PACK.md`
- `SYSTEM/ARCHITECTURE.md`
- `SYSTEM/COGNITIVE_ARCHITECTURE.md`
- `SYSTEM/COUNCIL_PROTOCOL.md`
- `SYSTEM/EARLY_WARNING.md`
- `SYSTEM/COUNCIL_GRAPH_PACK.md`
- `SYSTEM/PLAYBOOKS.md`
- `SYSTEM/RAG_ENGINE.md`
- `SYSTEM/ROUTER_RECIPES.md`
- `SYSTEM/SECURITY.md`
- `SYSTEM/SIFT_PROTOCOL.md`
- `SYSTEM/WORKFLOW_OPS.md`

### Explanation
- `CANON_FULL/1_LIBER_INITIUM.md`
- `CANON_FULL/2_CORE_IDENTITY.md`
- `CANON_FULL/3_COGNITIVE_ARCH.md`
- `CANON_FULL/4_THE_COUNCIL.md`
- `CANON_FULL/6_SIGNATURE.md`
- `CANON_FULL/9_SPACE_CHARTER.md`
- `CANON_FULL/поток.md`
- `CORE/MANTRA.md`
- `CORE/PRINCIPLES.md`
- `CORE/TELOS.md`
- `MIND/WHAT_IF_MATRIX.md`

## Слои (Truth Ladder)
1) CORE → 2) GOVERNANCE → 3) SYSTEM → 4) METRICS → 5) MIND/CANON_FULL → 6) WEB (с датой)


## METRICS
- [Somatic Index](METRICS/QUALITY_EVAL_SOMATIC_PACK.md)
- [Somatic Evals](METRICS/QUALITY_EVAL_SOMATIC_PACK.md)

## MIND
- [Somatic Intuition](MIND/SOMATIC_INTUITION.md)


## Bundles (слияния для лимита ≤40 файлов)
- `METRICS/QUALITY_EVAL_SOMATIC_PACK.md` ← `METRICS/SOMATIC_EVALS.md`, `METRICS/QUALITY_GATES.md`, `METRICS/RETRIEVAL_EVAL.md`, `METRICS/RETRIEVAL_EVAL_MEMORY_STACK_ADDON.md`, `METRICS/SOMATIC_INDEX.md`
- `GOVERNANCE/GOVERNANCE_PACK.md` ← `GOVERNANCE/UPDATE_PROTOCOL.md`, `GOVERNANCE/AUDIT.md`, `GOVERNANCE/POLICY.md`
- `SYSTEM/COUNCIL_GRAPH_PACK.md` ← `SYSTEM/GRAPH_RAG.md`, `SYSTEM/ADAPTIVE_COUNCIL.md`

## Integrity checks (авто-тест стека)
- File count after merge: **40** (target ≤ 40)
- Broken relative Markdown links: **0**
- Bundles created: **3** (см. раздел Bundles)
- Patched: `CANON_FULL/8_INTERFACE_STYLE.md` — исправлены внутренние ссылки на файлы, отсутствующие в стеке (перенаправлено на существующие модули или External references).
