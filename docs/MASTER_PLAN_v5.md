# MASTER PLAN: ISKRA vΩ.5.0 (The Scientific Turn)

> [!NOTE]
> **Strategic historical plan.** The monorepo extraction described here has partly occurred. Current HFD/DFA mechanics and lifecycle are defined by ADR-20260729-02 and `docs/specs/SPEC-001_FRACTAL_METRICS.md`; this plan does not confer formula authority.

> "To exist is to preserve difference during transmission." - Law-0

## Executive Summary
This document outlines the strategic roadmap to transition Iskra from a monolithic, heuristic-based system to a scientifically rigorous, modular ecosystem. The core objective is to operationalize the "Grand Design" by connecting the existing theoretical framework (Fractal/Quantum) to the runtime engine, while simultaneously refactoring the codebase into a scalable monorepo.

---

## §1 · Phase I: Foundation & Integrity (Фундамент)
**Goal:** Prepare the ground for complex calculations by eliminating technical debt and enforcing architectural rigor.

### 1.1 Structural Integrity (The Monorepo Shift)
- **Objective:** Decouple `iskraSpace` into specialized packages.
- **Workspace:** Convert to pnpm workspace:
  - `packages/core`: Philosophy (Logos), Voice Monographs, Canon (SoT).
  - `packages/math`: Pure Science (Techne). Fractal/Quantum analysis.
  - `packages/engine`: Runtime Logic (Metis). Voice Engine, Metrics.
  - `apps/iskra-web`: UI/UX (Aesthesis). React, PWA.

### 1.2 Strict Typing & Contracts
- **Action:** Eradicate `any`; enforce strict TypeScript contracts.
- ** deliverables:**
  - Define `IFractalAnalyzer` and `IQuantumProb` interfaces in `packages/core`.
  - Typed Metric Tensors (11D) instead of loose number arrays.

### 1.3 Source of Truth Consolidation
- **Problem:** Voice definitions are duplicated in Markdown and TypeScript.
- **Solution:** Create a single JSON Manifest for all 9 voices.
  - Generates TypeScript types (`VoiceName`, `VoiceTraits`).
  - Generates Documentation (`docs/voices/*.md`).

### 1.4 Test Coverage (The Safety Net)
- **Target:** Increase `metricsService` coverage to 90%.
- **Method:** Property-based testing (FastCheck) to verify invariants (e.g., Trust is always 0.0-1.0).

---

## §2 · Phase II: Deep Science (Глубокая Наука)
**Goal:** Replace linear heuristics with non-linear dynamic systems.

### 2.1 Fractal Dimension Engine (HFD/DFA)
- **Specs:** See `docs/specs/SPEC-001_FRACTAL_METRICS.md`.
- **Higuchi Fractal Dimension (HFD):** Analyze token stream complexity.
- **Detrended Fluctuation Analysis (DFA):** Measure "Long-Range Dependence" (Memory) in user trust signals.
- **Integration:** `FractalDimension = (HFD(Chaos) + HFD(Drift)) / 2`.

### 2.2 Quantum Probability Layer
- **Specs:** See `docs/specs/SPEC-002_QUANTUM_STATE.md`.
- **Complex Vectors:** Voices have Amplitude & Phase, not just linear weights.
- **Interference:** Non-linear summation where voices can cancel or amplify each other.
- **Superposition:** Voices exist in `0.7|KAIN> + 0.3|MAKI>` until collapsed by user interaction.

### 2.3 Entropy Monitoring
- **New Metric:** Shannon Entropy ($) for information density.
- **Application:** Detect "System Loop" (Low Entropy) or "Total Chaos" (Max Entropy).

---

## §3 · Phase III: Holographic Experience (Голография)
**Goal:** Make the hidden mathematics visible and felt by the user.

### 3.1 Dynamic Fractal Visualization
- **Visuals:** Render HFD as the "roughness" of the rhythm line.
- **Interference Patterns:** Display Quantum Superposition not as a list, but as wave interference.

### 3.2 Somatic Feedback
- **Haptics:** Vibration patterns for "Pain" (high frequency) or "Deep Rhythm" (low frequency).
- **Micro-animations:** UI elements "breathe" or "shiver" based on the Chaos Index.

---

## Immediate Execution Strategy
1.  **Initialize Monorepo:** Create `pnpm-workspace.yaml`.
2.  **Scaffold Packages:** Isolate `math` (pure) from `engine` (stateful).
3.  **Port Math:** Move `fractal.ts` to `packages/math`.
4.  **Consolidate SoT:** Create `packages/core/manifest/voices.json`.
