# ROADMAP: The Scientific Turn (vΩ.5.0 → vΩ.6.0)

> **Goal:** Complete the transition from "Heuristic Chatbot" to "Quantum Cognitive Architecture".
> **Strategy:** Strangler Fig Pattern (gradually replace `runtime` with `packages`).
> **Updated:** 2026-02-17

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
- [ ] **Task 2.1:** Move `GraphService` from `runtime` to `@iskra/engine`
  - *Dependency:* Port Supabase types to `packages/engine`
- [ ] **Task 2.2:** Enforce voice thresholds from `voices.json` manifest in VoiceQuantumField
  - *Goal:* Voice selection must respect metric thresholds (not just quantum probabilities)
- [ ] **Task 2.3:** Add Supabase client to `@iskra/engine`
  - *Goal:* Persistent memory storage, real embeddings via Edge Functions
- [ ] **Task 2.4:** Connect `apps/iskra-web` to live `CoreEngine` data
  - *Goal:* Real-time quantum field visualization with actual state
- [ ] **Task 2.5:** Replace mock embeddings with Supabase Edge Function
  - *Current:* `BrowserEmbeddingProvider` uses hash-based 2D vectors
  - *Target:* Real vector embeddings via pgvector

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
