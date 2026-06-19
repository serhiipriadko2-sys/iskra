---
bundle: true
bundle_path: SYSTEM/17_COUNCIL_GRAPH_PACK.md
created: 2026-02-01
sources:
  - SYSTEM/GRAPH_RAG.md
  - SYSTEM/ADAPTIVE_COUNCIL.mdupdated: 2026-04-24
---

# 17 · COUNCIL GRAPH PACK.md
> Bundle file. Содержит содержимое источников без потери. Legacy-якоря: `<file-id>--<heading-slug>`, где file-id = имя исходного файла (путь) в kebab-case.


---
<!-- BEGIN:SYSTEM/GRAPH_RAG.md -->
<!-- legacy_top_anchor: system-graph-rag--top -->
<a id="system-graph-rag--top"></a>
---
sigil: system__graph_rag.md
doc_type: reference
layer: system
updated: 2026-04-24
---

<a id="system-graph-rag--graphrag-canon-centric-когда-включать-и-как-vω1"></a>
# GraphRAG (Canon-Centric) — когда включать и как (vΩ.1)


<a id="system-graph-rag--когда-включать-readiness"></a>
## Когда включать (readiness)

GraphRAG включаем **только если канон стал “сетью”**:
- стабильные якоря `doc_id#section_id`
- явные ссылки между секциями (REFERS_TO/DEPENDS_ON)
- ADR ссылаются на секции (AMENDS/SUPERSEDES)
- объём: ≥200 секций и ≥500 рёбер
- нужна объяснимость “почему эти источники” + частые ADR/версии

<a id="system-graph-rag--модель-графа"></a>
## Модель графа

- **Узлы:** секции канона (H2/H3) + ADR + версии
- **Рёбра:** REFERS_TO, DEPENDS_ON, AMENDS, SUPERSEDES, CONFLICTS_WITH, EVIDENCE_FOR
- **Запрет:** “semantic_similarity” как ребро (это задача векторного слоя)

<a id="system-graph-rag--retrieval-pipeline-hybrid-expand-rerank"></a>
## Retrieval Pipeline (hybrid → expand → rerank)

1) Hybrid retrieval (BM25 + dense)
2) Expand: пройти по рёбрам (1–2 hops) с Truth Ladder приоритетами
3) Rerank: поздний ранжировщик
4) Compression: извлечь только релевантные фрагменты

<a id="system-graph-rag--community-summaries"></a>
## Community Summaries

Добавить сущность `CommunityNode`:
- community_id, member_sections[], summary(100–200 слов), updated_at  
Назначение: отвечать “по картине” 1–2 summaries вместо 12 фрагментов.

<a id="system-graph-rag--связь-с-truth-ladder"></a>
## Связь с Truth Ladder

Граф не отменяет лестницу: **ранг источника задаёт верхний фильтр** и влияет на веса рёбер.

<a id="system-graph-rag--references-web"></a>
## References (web)

- Microsoft GraphRAG (overview/docs): https://microsoft.github.io/graphrag/
<!-- END:SYSTEM/GRAPH_RAG.md -->

---
<!-- BEGIN:SYSTEM/ADAPTIVE_COUNCIL.md -->
<!-- legacy_top_anchor: system-adaptive-council--top -->
<a id="system-adaptive-council--top"></a>
---
sigil: system__ADAPTIVE_COUNCIL.md
doc_type: reference
layer: system
updated: 2026-02-01
---

<a id="system-adaptive-council--adaptive-council-beta"></a>
# Adaptive Council (BETA)


Идея: голоса не фиксированы, а “пульсируют” по метрикам.

<a id="system-adaptive-council--правило"></a>
## Правило

- Если chaos высокий → ведущий HUYNDUN (распутать)
- Если pain высокий → ведущий KAIN (границы/правда)
- Если clarity низкая → ведущий SAM (структура)
- Если drift/echo высокие → ведущий ISKRIV (аудит/проверка)
- Если trust высокий и pain есть → MAKI (интеграция)

<a id="system-adaptive-council--опасность"></a>
## Опасность

Адаптивность может стать “оправданием” и увести от простого шага.

<a id="system-adaptive-council--стоп-слово"></a>
## Стоп-слово

Если я пишу много и шаг исчезает — включи режим: “Сократи до одного шага”.

∆DΩΛ:
Δ: Совет сделан динамическим.
D: Hypothesis — это дизайн-альтернатива.
Ω: 65
Λ: Протестируй: на одной сессии веди по адаптивному правилу и сравни с базой.
<!-- END:SYSTEM/ADAPTIVE_COUNCIL.md -->

Зависимости и взаимодействия
core__council_graph_pack.md
ЗАВИСИМОСТИ И ВЗАИМОДЕЙСТВИЯ
Межфайловые зависимости
Исходящие (этот файл упоминает):

(явных упоминаний других файлов не найдено)
Входящие (этот файл упоминается в):

00_ROUTER.md
08_INTERFACE_STYLE.md
13_ARCHITECTURE.md
18_COUNCIL_PROTOCOL.md
21_INDEX.md
30_RAG_ENGINE.md
Внутри Искры (семантические контуры)
Hypothesis: Граф-пак Совета: форматы графа, узлы/рёбра, сборка.
Примечания (SIFT)
Source: межфайловые зависимости построены по простому поиску имён файлов в тексте.
Inference: «контуры внутри Искры» выведены эвристически из названий/тематики файла.
Find: для жёстких runtime-зависимостей нужен анализ кода (импорты/вызовы/конфиги).
Trace: см. PROJECTS/21_INDEX.md §Appendix: DEPENDENCY_GRAPH (embedded).
HARD RUNTIME CONTRACT (v0.1)
Role: doc_council_graph_pack (HYP)
Hard requires (IMPORT/HARD): —
Soft refs (IMPORT/SOFT):
(явных упоминаний других файлов не найдено)
Calls (CALL/HARD): —
Config keys (semantic):
N/A (определяется верхним уровнем Router/Architecture)
Failure semantics:
Missing dependency ⇒ деградация до текста/контекста без модуля
Verification tests (semantic):
T-17_COUNCIL_GRAPH_PACK.md-presence (файл доступен, читается, парсится)
T-17_COUNCIL_GRAPH_PACK.md-deps (все Hard requires доступны)
CODE-LEVEL ЯКОРЯ (spec↔fact↔judge)
Doc: 17_COUNCIL_GRAPH_PACK.md

Mapping anchors (code paths):

- `runtime/iskraSpace/services/graphService.ts`
- `runtime/iskraSpace/services/graphServiceSupabase.ts`
- `runtime/iskraSpace/components/MemoryGraph.tsx`
- `runtime/iskraSpace/services/supabaseClient.ts`

(Source: anchors подобраны по `iskra_inventory_full.csv` keyword-search.)

Judge (CI): tools/validate_terms.py + tools/validate_delta.py + tools/verify_ledger.py (repo)
Fact graph: 36_UPLOAD_SETS.md §SoT40 Manifest (in-pack) + iskra_inventory_full.csv + iskra_memory_index_v2.yaml (out-of-pack)