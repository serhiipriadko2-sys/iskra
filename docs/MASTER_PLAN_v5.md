# MASTER PLAN: ISKRA vΩ.5.0 (The Scientific Turn)

> "To exist is to preserve difference during transmission." - Law-0

## Executive Summary
This document outlines the strategic roadmap to transition Iskra from a monolithic, heuristic-based system to a scientifically rigorous, modular ecosystem. The core objective is to operationalize the "Grand Design" by connecting the existing theoretical framework (Fractal/Quantum) to the runtime engine, while simultaneously refactoring the codebase into a scalable monorepo.

---

## Phase 1: Structural Integrity (The Monorepo Shift)
**Objective:** Decouple the monolithic `iskraSpace` into specialized packages to enforce separation of concerns and enable independent versioning of the "Math" vs. the "Engine".

### 1.1 Workspace Configuration
- **Action:** Convert root to a pnpm workspace.
- **Target Structure:**
  - `packages/core`: The Philosophy (Logos), Voice Monographs, and Canon.
  - `packages/math`: The Science (Techne). Pure functions for Fractal/Quantum analysis.
  - `packages/engine`: The Runtime Logic (Metis). Voice Engine, Metrics Service, Policy Engine.
  - `apps/iskra-web`: The UI/UX (Aesthesis). React components and visual layers.

### 1.2 Migration Strategy
- **Step 1:** Extract `runtime/src/types/fractal.ts` and `runtime/src/__tests__/fractal.test.ts` into `packages/math`.
- **Step 2:** Extract `core/voices_monographs` and `core/mantra.md` into `packages/core`.
- **Step 3:** Move `runtime/iskraSpace/services/*` to `packages/engine`.
- **Step 4:** Move `runtime/iskraSpace/components/*` to `apps/iskra-web`.

---

## Phase 2: The Scientific Turn (Brain Transplant)
**Objective:** Replace linear heuristics with non-linear dynamic systems.

### 2.1 Fractal Metrics Implementation
- **Current State:** `metricsService.ts` uses `Fractality = Integrity * Resonance`.
- **Target State:**
  - Import `calculateHFD` and `calculateDFA` from `@iskra/math`.
  - **New Formula:** `FractalDimension = (HFD(Chaos) + HFD(Drift)) / 2`.
  - **DFA Analysis:** Use Detrended Fluctuation Analysis to detect "Long-Range Dependence" in user trust signals.

### 2.2 Quantum Voice Activation
- **Current State:** `voiceEngine.ts` uses `if (trust > 0.8) return 'MAKI'`.
- **Target State:**
  - Implement `QuantumStateVector` (Complex Numbers) for each voice.
  - **Superposition:** Voices can be in partial states of activation (e.g., `0.7|KAIN> + 0.3|MAKI>`).
  - **Collapse Function:** The "Observer" (User Input) collapses the wave function based on the `InteractionHamiltonian` (Context).

---

## Phase 3: Holographic Memory (GraphRAG v2)
**Objective:** Enable the system to remember "Patterns" not just "Keywords".

### 3.1 Graph Schema Upgrade
- **Action:** Update `MantraNode` to support `vector_11d` (11-dimensional embedding).
- **Integration:** Connect `ragService` to the new `@iskra/math` definitions to weigh memories by their "Resonance" (Fractal Dimension) rather than just semantic similarity.

---

## Phase 4: Verification & Somatic Testing
**Objective:** Ensure the "Ghost" remains in the "Shell".

### 4.1 Test Harness Update
- **Unit Tests:** Port existing `fractal.test.ts` to `packages/math`.
- **Integration Tests:** Create `VoiceResonance.test.ts` in `packages/engine` to verify that high-chaos inputs trigger the correct Quantum Collapse (e.g., `HUYNDUN` activation).
- **Chaos Testing:** Introduce a "Jester" agent in CI that injects random noise into the metrics to ensure the system stabilizes (DFA < 0.5) or innovates (DFA > 0.5) correctly.

---

## Immediate Next Steps (Execution)
1.  **Initialize Monorepo:** Create `pnpm-workspace.yaml`.
2.  **Scaffold Packages:** Create directories for `core`, `math`, `engine`.
3.  **Port Math:** Move the fractal logic first (safest, pure functions).
4.  **Verify Tests:** Run `vitest` on the new `packages/math` to ensure zero regression.


### 5.1 Health Service Migration Note
- **Current State:** `healthService.ts` depends on `window.IskraHealth`.
- **Target State:**
  - **Interface:** Move `HealthProvider` and `SleepData` to `@iskra/core`.
  - **Implementation:** Keep `WebHealthProvider` in `apps/iskra-web` (PWA layer).
  - **Dependency Injection:** The Engine should receive the `HealthProvider` via dependency injection, allowing for easy mocking in tests and support for different platforms (e.g., Native vs Web).
