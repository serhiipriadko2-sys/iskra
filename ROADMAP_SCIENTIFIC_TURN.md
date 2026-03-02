# ROADMAP: The Scientific Turn (vΩ.5.0 → vΩ.6.0)

> **Goal:** Complete the transition from "Heuristic Chatbot" to "Quantum Cognitive Architecture".
> **Strategy:** Strangler Fig Pattern (gradually replace `runtime` with `packages`).
> **Updated:** 2026-03-01

---

## Phase 1: The Mathematical Foundation (DONE)

- [x] Create `@iskra/math` with Higuchi Fractal Dimension (HFD)
- [x] Create `@iskra/math` with Detrended Fluctuation Analysis (DFA)
- [x] Create `@iskra/math` with Shannon Entropy (LOOP/FLOW/CHAOS)
- [x] Create `@iskra/math` with Complex Numbers and Quantum State Vectors
- [x] Implement quantum interference and resonance calculations
- [x] Implement Collapse State Index (CSI), Entanglement Index (EI), Nonlocality (NC)
- [x] Define strict types in `@iskra/core` (IskraMetrics, VoiceID, MantraNode, FractalMetadata)
- [x] Create voice manifest (`packages/core/manifest/voices.json`) with quantum params
- [x] Comprehensive test coverage for all math functions

---

## Phase 2: The Quantum Engine (ACTIVE)

### Completed
- [x] **CoreEngine** — 6-step processing pipeline (Somatic → Entropy → Memory → Resonance → Voice → Collapse)
- [x] **MemoryService** — Fractal memory with semantic + resonance retrieval (70/30 weighting)
- [x] **MetricsEngine** — Metric updates with entropy feedback loop and self-organized criticality
- [x] **VoiceQuantumField** — Probability evolution and wave function collapse
- [x] **iskra-web** — ChatInterface, QuantumField visualization, useEngine hook, somatic feedback

### In Progress
- [x] **Task 2.1:** Move `GraphService` from `runtime` to `@iskra/engine`
  - *Result:* `packages/engine/src/services/graphService.ts` (in-memory GraphRAG skeleton, strict types)
  - *Note:* Supabase persistence stays a separate layer (Task 2.3) to avoid secrets in code.
- [x] **Task 2.2:** Enforce voice thresholds from `voices.json` manifest in VoiceQuantumField
  - *Goal:* Voice selection must respect metric thresholds (not just quantum probabilities)
- [x] **Task 2.3:** Add Supabase client to `@iskra/engine` (DONE)
  - *Goal:* Persistent memory storage, real embeddings via Edge Functions
- [ ] **Task 2.4:** Connect `apps/iskra-web` to live `CoreEngine` data
  - *Goal:* Real-time quantum field visualization with actual state
- [x] **Task 2.5:** Replace mock embeddings with Supabase Edge Function (DONE)
  - *Current:* Fallback remains for local dev.
  - *Target:* Real vector embeddings via pgvector

### Completed (2026-03-01)
- [x] **Task 2.3:** Add Supabase client to `@iskra/engine`
  - *Result:* `createSupabaseClient()` in `packages/engine/src/infra/supabaseClient.ts`.
  - *Security:* anon-key only in browser; service-role is forbidden in frontend.
- [x] **Task 2.5:** Replace mock embeddings with Supabase Edge Function
  - *Result:* `SupabaseEdgeEmbeddingProvider` + `supabase/functions/embed` Edge Function; web uses Edge call when env is configured.

- [x] **Task 2.7:** Harden Edge embeddings (security + cost)
  - *Result:* CORS preflight + Authorization required + optional rate limiting in `embed`.
  - *Result:* `SafeEmbeddingProvider` adds input hygiene + PII policy + cache.

- [x] **Task 2.6:** GraphRAG expansion — graph-enhanced retrieval in `@iskra/engine` (vector seeds + transient graph traversal + rerank)
  - *Goal:* After semantic+resonance top-K, expand via BFS over `GraphService` edges.
  - *Constraint:* Must remain deterministic + testable (no hidden heuristics).

- [x] **Task 2.8:** Supabase pgvector HNSW index for GraphRAG (seeds + neighbors)
  - *Goal:* Remove O(N²) similarity graph; use DB ANN index: `topK(query_embedding)` and `topM(node_embedding)`.
  - *Result:* `supabase/migrations/*_pgvector_hnsw.sql` + engine `SupabasePgvectorHnswIndex` + GraphRAG lazy top‑M traversal.

---

## Phase 3: The Strangler Fig (PLANNED)

- [ ] **Task 3.1:** Replace `runtime` logic with `@iskra/engine` imports
  - *Step:* Modify `runtime/iskraSpace/services/metricsService.ts` to use `@iskra/math`
- [ ] **Task 3.2:** Deprecate `runtime/iskraSpace/services/voiceEngine.ts`
  - *Replacement:* `packages/engine/src/services/voiceSystem.ts`
- [ ] **Task 3.3:** Migrate GraphService and RAG from `runtime` to `@iskra/engine`
- [ ] **Task 3.4:** Freeze `runtime` for new features
- [ ] **Task 3.5:** Archive or delete `runtime/` directory

---

## Phase 4: Production Readiness (FUTURE)

- [ ] **Task 4.1:** Deploy `CoreEngine` (Supabase Edge Functions or client-side PWA)
- [ ] **Task 4.2:** Integrate LLM text generation (Gemini / Claude)
- [ ] **Task 4.3:** Validate "Soul Integrity" (verify math models preserve persona)
- [ ] **Task 4.4:** Performance audit (bundle size, load times)
- [ ] **Task 4.5:** Security audit (`npm audit`, RLS verification)
- [ ] **Task 4.6:** E2E testing with Playwright
- [ ] **Task 4.7:** CI/CD GitHub Actions integration

---

## Success Criteria (vΩ.6.0)

1. `runtime/` directory is archived or deleted.
2. All logic resides in `packages/`.
3. `iskra-web` is the only frontend.
4. Voice selection is probabilistic but threshold-constrained.
5. Memory persists in Supabase with real vector embeddings.
6. All tests pass, coverage >= 90%.
