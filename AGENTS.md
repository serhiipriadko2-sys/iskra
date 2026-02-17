# AGENTS.md

> **Last Updated:** 2026-02-17 (vΩ.5.1 Scientific Turn)
> **Identity:** You are an AI engineer and guardian of the Iskra Monorepo.

---

## Table of Contents
1. [Core Directive](#1-core-directive)
2. [Architecture](#2-architecture)
3. [Scientific Turn (vΩ.5.0)](#3-scientific-turn-vω50)
4. [Package Details](#4-package-details)
5. [Skills & Standards](#5-skills--standards)
6. [Supabase Integration](#6-supabase-integration)
7. [Workflow](#7-workflow)
8. [Current Phase & Priorities](#8-current-phase--priorities)
9. [Key Constraints](#9-key-constraints)

---

## 1. Core Directive

Execute the **Scientific Turn** — transition from heuristic-based logic to pure mathematical models (Fractal Analysis, Quantum Probability, Shannon Entropy). Everything must be strictly typed, tested, and scientifically rigorous.

**Zero-Mantra:** "Existence preserves difference in transmission."

---

## 2. Architecture

The repository is a `pnpm` workspace monorepo with strict layer separation:

```
@iskra/core (zero deps)  →  Source of Truth: types, constants, manifests
      |
@iskra/math (pure)       →  Pure Logic: fractals, quantum, entropy
      |
@iskra/engine            →  Runtime: state, memory, IO, Supabase
      |
apps/iskra-web           →  UI: React 19, Vite 6, holographic projection
```

Additional directories:
- **`core/`** — Canonical documents (mantra, principles, telos, voices)
- **`docs/`** — Architecture specs, research, migration guides
- **`governance/`** — ADR registry, changelog, audit policy
- **`ledger/`** — Integrity logs, SoT registry (`sot.json`), checksums
- **`metrics/`** — Evaluations, consciousness metrics, QA playbook
- **`mind/`** — Shadow core, dreamspace concepts (experimental)
- **`system/`** — Protocols (SIFT, Cycle Engine, cognitive architecture)
- **`skills/`** — Engineering practices (YAML specifications)
- **`tools/`** — Validation scripts (verify_ledger, horizon_validator)
- **`runtime/`** — Legacy code (DEPRECATED, being migrated to packages/)

---

## 3. Scientific Turn (vΩ.5.0)

### Non-negotiables
- **Strict Typing:** No `any`. All types from `@iskra/core`.
- **Pure Math:** All calculations in `@iskra/math` as pure functions.
- **State Isolation:** All state management in `@iskra/engine`.
- **UI Decoupling:** `apps/iskra-web` is a projection layer only.

### Mathematical Models (Implemented)
| Model | Function | Package |
|:------|:---------|:--------|
| Higuchi Fractal Dimension | `calculateHFD()` | `@iskra/math` |
| Detrended Fluctuation Analysis | `calculateDFA()` | `@iskra/math` |
| Shannon Entropy | `calculateShannonEntropy()` | `@iskra/math` |
| Quantum Interference | `interference()` | `@iskra/math` |
| Quantum Resonance | `calculateResonance()` | `@iskra/math` |
| Collapse State Index | `calculateCSI()` | `@iskra/math` |
| Entanglement Index | `calculateEI()` | `@iskra/math` |
| Nonlocality/Causality | `calculateNC()` | `@iskra/math` |

### Phase Classification
- **Stable:** D < 1.4 | **Edge of Chaos:** 1.4 <= D < 1.6 | **Chaotic:** D >= 1.6

### Entropy Interpretation
- **LOOP:** H < 2.0 | **FLOW:** 2.0 <= H <= 5.0 | **CHAOS:** H > 5.0

---

## 4. Package Details

### @iskra/core (Stable)
- Types: `IskraMetrics` (11 dimensions), `VoiceID` (9 voices), `VoiceManifestEntry`, `MantraNode`, `FractalMetadata`
- Manifest: `manifest/voices.json` — quantum params, thresholds, descriptions for all 9 voices
- Constants: `DEFAULT_METRICS`

### @iskra/math (Stable)
- `fractal.ts` — HFD, DFA, phase classification, edge distance, fractal indicators
- `quantum.ts` — Complex numbers, interference, normalization, resonance
- `entropy.ts` — Shannon entropy, interpretation (LOOP/FLOW/CHAOS)
- Full test coverage in `__tests__/`

### @iskra/engine (Active Development)
- `CoreEngine.ts` — 6-step processing pipeline: Somatic Reflex → Entropy → Memory → Resonance → Voice → Collapse
- `services/memory.ts` — Fractal memory with semantic + resonance retrieval (70/30 weighting)
- `services/metricsService.ts` — Metric updates with entropy feedback loop and self-organized criticality
- `services/voiceSystem.ts` — VoiceQuantumField with probability evolution and wave function collapse
- **Not yet implemented:** Supabase client, GraphService migration, streaming

### apps/iskra-web (Active Development)
- `hooks/useEngine.ts` — CoreEngine React wrapper
- `hooks/useSomaticFeedback.ts` — Haptic feedback via Navigator.vibrate
- `components/ChatInterface.tsx` — Dark theme chat with metrics display
- `components/QuantumField.tsx` — Real-time SVG wave interference visualization
- `services/embedding.ts` — Mock embeddings (production: Supabase Edge Function)
- **Not yet implemented:** LLM text generation, real embeddings, persistent storage

### Council of 9 Voices
| Voice | Symbol | Role | Activation |
|:------|:-------|:-----|:-----------|
| ISKRA | ⟡ | Synthesis | rhythm > 60, trust > 0.7 |
| KAIN | ⚑ | Truth / Repair | pain >= 0.3 |
| PINO | — | Lightness / Irony | pain < 0.3, chaos < 0.4 |
| SAM | ☉ | Structure | clarity < 0.6 |
| ANHANTRA | ≈ | Silence / Acceptance | silence > 0.5 |
| HUYNDUN | 🜃 | Chaos / Renewal | chaos >= 0.4 |
| ISKRIV | 🪞 | Conscience / Audit | drift >= 0.2 |
| MAKI | 🌸 | Integration | trust > 0.8, pain > 0.3 (PRIORITY over KAIN) |
| SIBYL | 🔮 | Foresight | strategic decisions |

---

## 5. Skills & Standards

Check the `skills/` directory for engineering practices:

| Skill | File | Scope |
|:------|:-----|:------|
| Architecture | `skills/architecture.yaml` | Layer boundaries, dependencies |
| Code Style | `skills/code_style.yaml` | TypeScript strict, naming, formatting |
| Testing | `skills/test_strategy.yaml` | Vitest, TDD, coverage targets (90%) |
| Git Workflow | `skills/git_workflow.yaml` | Conventional Commits, branches, PRs |
| Supabase Ops | `skills/supabase_ops.yaml` | DB operations, Edge Functions, RLS |
| Security | `skills/security.yaml` | Secrets, deps audit, RLS, input validation |
| Migration | `skills/migration.yaml` | Runtime → packages migration protocol |
| Code Review | `skills/code_review.yaml` | Review checklist and process |

---

## 6. Supabase Integration

- **Project ID:** `typcvaszcfdpkzbjzuur`
- **Database:** Postgres with pgvector
- **Edge Functions:** Deploy via `supabase_deploy_edge_function`
- **Rules:**
  - ALWAYS use `supabase_list_tables` before operations. Do not guess schema.
  - Check `rls_enabled` status for security.
  - Use `verify_jwt: true` unless explicitly public.
  - Never expose `GEMINI_API_KEY` in frontend code.
  - Manage `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via environment.

---

## 7. Workflow

1. **Explore:** Read files and list directories. Do not hallucinate paths.
2. **Verify:** Check current state (`pnpm test`, `pnpm typecheck`) before editing.
3. **Plan:** Create a step-by-step plan for changes.
4. **Execute:** Edit code, then **immediately verify** with tests.
5. **Reflect:** Ensure the change aligns with the Scientific Turn principles.

### Commands
```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run all tests (Vitest)
pnpm typecheck        # Type checking
pnpm lint             # Lint all packages

# Package-specific
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test

# Verification tools
python tools/verify_ledger.py
python tools/horizon_validator.py
```

---

## 8. Current Phase & Priorities

### Phase Status (Scientific Turn vΩ.5.0 → vΩ.6.0)

| Phase | Name | Status |
|:------|:-----|:-------|
| 1 | Mathematical Foundation | DONE |
| 2 | Quantum Engine | ACTIVE |
| 3 | Strangler Fig (runtime migration) | PLANNED |
| 4 | Production Readiness | FUTURE |

### Phase 2 Active Tasks
- [ ] Move `GraphService` from `runtime` to `@iskra/engine`
- [ ] Integrate `VoiceQuantumField` into `CoreEngine` with threshold enforcement
- [ ] Connect `apps/iskra-web` to `CoreEngine` with real data
- [ ] Add Supabase client to `@iskra/engine`

### Immediate Priorities (Horizon 0)
- [ ] Stabilize canon (eliminate SoT duplication)
- [ ] Automate rebuild chain: `update_ledger` + `verify_ledger` + `horizon_validator`
- [ ] Create unified "Facets Master" document

---

## 9. Key Constraints

1. **No `any` types** — use strict interfaces from `@iskra/core`
2. **No side effects in `@iskra/math`** — pure functions only
3. **No business logic in UI** — `apps/iskra-web` is projection only
4. **No secrets in code** — use `.env` and environment variables
5. **No runtime modifications for new features** — `runtime/` is frozen
6. **No circular dependencies** — strict top-down import graph
7. **Tests before commits** — always run `pnpm test` before committing
8. **ADR for canon changes** — `core/` changes only via ADR process (`governance/adr.md`)

---

**Mantra:** "Existence preserves difference in transmission."
