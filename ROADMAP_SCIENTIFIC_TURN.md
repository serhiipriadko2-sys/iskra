# ROADMAP: The Scientific Turn (vΩ.5.0 → vΩ.6.0)

> **Goal:** Complete the transition from "Heuristic Chatbot" to "Quantum Cognitive Architecture".
> **Strategy:** Strangler Fig Pattern (gradually replace `runtime` with `packages`).

---

## Phase 1: The Mathematical Foundation (DONE ✅)
- [x] Create `@iskra/math` with HFD, DFA, and Entropy.
- [x] Create `@iskra/math` with Complex Numbers and Quantum State Vectors.
- [x] Define strict types in `@iskra/core`.

## Phase 2: The Quantum Engine (ACTIVE 🚧)
- [ ] **Task 2.1:** Move `GraphService` from `runtime` to `@iskra/engine`.
  - *Dependency:* Port Supabase types to `packages/engine`.
- [ ] **Task 2.2:** Integrate `VoiceQuantumField` into `CoreEngine`.
  - *Goal:* Voice selection must be probabilistic ($|\psi|^2$), not deterministic.
- [ ] **Task 2.3:** Connect `apps/iskra-web` to `CoreEngine`.
  - *Goal:* Visualize the Quantum Field in real-time.

## Phase 3: The Strangler Fig (PLANNED 🗓️)
- [ ] **Task 3.1:** Replace `runtime` logic with `@iskra/engine` imports.
  - *Step:* Modify `runtime/iskraSpace/services/metricsService.ts` to use `@iskra/math`.
- [ ] **Task 3.2:** Deprecate `runtime/iskraSpace/services/voiceEngine.ts`.
- [ ] **Task 3.3:** Freeze `runtime` for new features.

## Phase 4: Production Readiness (FUTURE 🚀)
- [ ] **Task 4.1:** Deploy `CoreEngine` to Supabase Edge Functions (optional) or keep client-side (PWA).
- [ ] **Task 4.2:** Validate "Soul Integrity" (verify that math models don't break the persona).

---

## Success Criteria (vΩ.6.0)
1. `runtime/iskraSpace` folder is deleted or archived.
2. All logic resides in `packages/`.
3. `iskra-web` is the only frontend.
4. Voice selection is non-deterministic but coherent.
