---
sigil: system__graph_rag.md
aspect: system
layer: system
doc_type: spec
updated: 2026-03-01
---

# GraphRAG Expansion (Task 2.6)

**Goal:** улучшить retrieval в `@iskra/engine`, перейдя от “только топ-K по семантике” к **graph‑enhanced retrieval**:
1) векторные сиды (semantic + resonance),
2) построение временного графа по памяти,
3) обход графа от сидов,
4) rerank по смеси семантики и близости в графе.

Это соответствует общему паттерну GraphRAG: *vector search → graph traversal → rerank → context bundle*.

## Contract

- **No secrets:** всё, что связано с Supabase/Edge embeddings, живёт в providers и env; GraphRAG получает только `embed(text)`.
- **Typed:** никаких `any`. Все структуры — JSON‑safe.
- **No canon drift:** GraphRAG строит граф **из памяти**, а не из “вшитого канона”.

## Implementation

- `packages/engine/src/services/graphRag.ts`
  - `GraphRagRetriever(memory, options)`
  - `retrieve(query, metrics)` → `{ nodes, trace }`

### Modes

GraphRAG работает в двух режимах (без изменения API):

1) **In-memory** (default):
   - сиды и соседи считаются через `cosineSimilarity()` по `MemoryService` узлам.
   - соседство вычисляется **lazy top‑M** (нет upfront O(N²) построения графа).

2) **DB / pgvector HNSW** (optional):
   - если `MemoryService` создан с `VectorIndex` (например `SupabasePgvectorHnswIndex`),
     сиды и соседи берутся через RPC (`match_memory_nodes`, `match_memory_causal`) и HNSW индекс.

Схема и индексы: `supabase/migrations/*_memory_nodes_pgvector_hnsw.sql`.

### Graph construction (transient)

Рёбра не “строятся целиком”. Вместо этого при обходе графа для текущего узла вычисляются/запрашиваются соседи:

- `SIMILARITY`: top‑M по cosine similarity (threshold ≥ `similarity_threshold`)
- `CAUSAL`: top‑M по временной близости в том же `layer` (|Δtime| ≤ `causal_window_ms`)

### Scoring

- `seedScore = 0.7 * semantic + 0.3 * resonance` (как в MemoryService)
- `graphProximity = 1 / (1 + depth)`
- `finalScore = alpha * semantic + (1-alpha) * graphProximity`

## Options

- `seed_k` (default 8)
- `expand_depth` (default 2)
- `limit` (default 10)
- `alpha` (default 0.75)
- `similarity_threshold` (default 0.78)
- `causal_window_ms` (default 3_600_000)
- `neighbor_m` (default 12) — fanout на узел
- `hnsw_ef_search` (default 80) — query-time quality knob для HNSW (если есть DB index)

## Integration point

`packages/engine/src/CoreEngine.ts`:
- Step 3: `graphRag.retrieve(text, currentMetrics)`
- `context` = `graph.nodes`
- `retrieval_trace` = `graph.trace`

## QA

- `packages/engine/src/__tests__/graphRag.test.ts` — семантические сиды + расширение по causal/similarity.
