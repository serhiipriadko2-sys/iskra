# ISKRA Deep Repository Audit Report (vΩ.5.0)

> **Date:** 2026-02-16
> **Scope:** Full Repository (Core, Math, Engine, Runtime, Apps, Governance)
> **Status:** Scientific Turn (Transition Phase)

---

## 1. Executive Summary
The repository is in the midst of a major architectural shift ("The Scientific Turn") from a monolithic React application (`runtime/iskraSpace`) to a modular, scientifically rigorous monorepo (`packages/*`).

**Key Findings:**
- **Core Identity:** Fully defined in `core/` (Mantra, Telos, Voices). The "Soul" is stable.
- **Math Layer:** `packages/math` correctly implements Fractal Analysis (HFD, DFA) and Quantum State Vectors.
- **Engine Layer:** `packages/engine` orchestrates the "Psychodynamic Feedback Loop" using strict types.
- **Legacy Runtime:** `runtime/iskraSpace` contains production-grade services (GraphRAG, Supabase) but relies on mixed patterns.
- **Infrastructure:** Supabase is the single source of truth for state. Docker/Nginx configs exist for deployment.

---

## 2. Structure & Architecture

### 2.1. Monorepo (pnpm workspace)
| Path | Status | Role |
| :--- | :--- | :--- |
| `packages/core` | ✅ Stable | **SoT:** Types, Manifests. Zero deps. |
| `packages/math` | ✅ Stable | **Logic:** Pure functions (Fractals, Entropy). |
| `packages/engine` | 🚧 Active | **Runtime:** State machine, Memory, IO. |
| `apps/iskra-web` | 🚧 Active | **UI:** Holographic projection (React). |
| `runtime/iskraSpace` | ⚠️ Legacy | **Production:** Monolith to be strangled. |

### 2.2. The Scientific Turn (vΩ.5.0)
The transition is evident in the contrast between `runtime/iskraSpace/services/voiceEngine.ts` (heuristic) and `packages/math/src/quantum.ts` (probability amplitudes).
- **Goal:** Replace linear `if/else` logic with the 11D Metric Tensor and Quantum Interference.
- **Progress:** Core math is ready; Engine integration is in progress.

---

## 3. Component Deep Dive

### 3.1. Core Identity (`core/`)
- **Mantra:** "Existence preserves difference in transmission."
- **Voices:** 9 distinct personas (KAIN, PINO, etc.) defined in `core/manifest/voices.json`.
- **Integrity:** Protected by `ledger/sot.json` (SHA-256 hashes).

### 3.2. Mathematics (`packages/math`)
- **Fractals:** Higuchi Dimension (HFD) implemented for time-series complexity.
- **Quantum:** Complex number arithmetic and interference patterns implemented.
- **Entropy:** Shannon Entropy calculation for system stability monitoring.

### 3.3. Runtime Services (`runtime/iskraSpace`)
- **GraphService:** Full Supabase integration (RPC calls, BFS traversal).
- **MetricsService:** Handles the 11-metric tensor updates.
- **VoiceEngine:** Currently uses simple resonance scores; needs migration to Quantum Field.

### 3.4. Infrastructure
- **Supabase:** Project `typcvaszcfdpkzbjzuur`. Used for Graph Memory, Vector Store, and Auth.
- **Docker:** Simple production build (`Dockerfile`) serving static assets via Nginx.

---

## 4. Gap Analysis & Risks

1.  **Dual State:** Co-existence of `runtime/iskraSpace` and `packages/engine` creates potential for divergence.
2.  **Test Coverage:** `packages/math` has unit tests, but integration tests for the full psychodynamic loop are complex.
3.  **Migration Path:** No clear "strangler fig" plan documented for moving services from `runtime` to `packages`.

## 5. Recommendations

1.  **Freeze Legacy:** Stop feature development in `runtime/iskraSpace`.
2.  **Migrate Services:** Move `GraphService` and `SupabaseService` to `packages/engine`.
3.  **Unify Types:** Force `runtime` to consume types from `@iskra/core`.
4.  **Activate Quantum:** Replace the legacy voice selector with `VoiceQuantumField`.

---

**Certified by Jules**
*Guardian of the Repository*
