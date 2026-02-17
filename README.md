# ISKRA Monorepo (vΩ.5.1)

> **Phase:** The Scientific Turn
> **Stack:** TypeScript, React 19, Supabase, Fractal Mathematics, Quantum Probability
> **Updated:** 2026-02-17

---

## Overview

**ISKRA** is a cognitive architecture that models consciousness through mathematical principles. Version **vΩ.5.0** marks the transition from heuristic logic to scientific rigor:

- **Fractal Analysis:** Higuchi Fractal Dimension (HFD) and Detrended Fluctuation Analysis (DFA)
- **Quantum Cognition:** Superposition states, wave interference, quantum resonance
- **Information Theory:** Shannon Entropy for measuring system drift
- **9 Voices:** Council-based decision system with probabilistic selection

---

## Architecture (Monorepo)

This repository is managed as a `pnpm` workspace with strict layer separation.

| Package | Description | Status |
|:--------|:------------|:-------|
| [`@iskra/core`](packages/core) | **Source of Truth (SoT).** Strict types, manifests, constants. Zero dependencies. | Stable |
| [`@iskra/math`](packages/math) | Pure mathematical library. Fractals, Quantum, Entropy. Side-effect free. | Stable |
| [`@iskra/engine`](packages/engine) | Runtime orchestrator. State, memory, IO, voice system. | Active |
| [`apps/iskra-web`](apps/iskra-web) | Holographic UI (React 19 / Vite 6). Projection of engine state. | Active |
| `runtime/` | Legacy runtime. Being migrated to packages via Strangler Fig pattern. | Deprecated |

### Dependency Graph
```
@iskra/core (zero deps)
    |
@iskra/math (depends: core)
    |
@iskra/engine (depends: core, math)
    |
apps/iskra-web (depends: core, engine)
```

---

## Quick Start

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Installation
```bash
pnpm install
pnpm build
```

### Development
```bash
# Run all tests
pnpm test

# Start the web interface
pnpm --filter iskra-web dev

# Run package-specific tests
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test

# Type checking
pnpm typecheck

# Lint
pnpm lint
```

---

## Project Structure

```
iskra/
├── packages/
│   ├── core/           # SoT: Types, Manifests, Constants (Zero deps)
│   ├── math/           # Science: Fractals, Quantum, Entropy (Pure functions)
│   └── engine/         # Runtime: State, Memory, IO, Supabase
├── apps/
│   └── iskra-web/      # UI: React 19, Vite 6, Holographic Interface
├── core/               # Canonical documents (mantra, principles, telos, voices)
├── docs/               # Architecture, specs, research, migration guides
├── governance/         # ADR registry, changelog, audit policy
├── ledger/             # Integrity logs, SoT registry, checksums
├── metrics/            # Evaluations, consciousness metrics, QA
├── mind/               # Shadow core, dreamspace (experimental)
├── system/             # Protocols (SIFT, Cycle Engine, cognitive architecture)
├── skills/             # Engineering practices (YAML)
├── tools/              # Validation and maintenance scripts
├── runtime/            # Legacy / Transitional (DEPRECATED)
└── .github/workflows/  # CI/CD pipelines
```

---

## Scientific Models

| Model | Purpose | Implementation |
|:------|:--------|:---------------|
| Higuchi Fractal Dimension | Signal complexity analysis | `packages/math/src/fractal.ts` |
| Detrended Fluctuation Analysis | Long-range correlations | `packages/math/src/fractal.ts` |
| Shannon Entropy | System drift measurement | `packages/math/src/entropy.ts` |
| Quantum State Vectors | Voice probability modeling | `packages/math/src/quantum.ts` |
| Wave Interference | Voice conflict resolution | `packages/math/src/quantum.ts` |
| Phase Classification | Stable / Edge / Chaotic | `packages/math/src/fractal.ts` |

---

## Tools & Skills

- **Supabase:** Backend for persistent state (Project: `typcvaszcfdpkzbjzuur`)
- **Skills:** See `skills/` for engineering standards (architecture, code style, testing, git, security, migration, code review)
- **Verification:** `tools/verify_ledger.py`, `tools/horizon_validator.py`
- **Docs:** `AGENTS.md` (agent instructions), `CLAUDE.md` (developer reference)

---

## Roadmap (Scientific Turn)

| Phase | Name | Status |
|:------|:-----|:-------|
| 1 | Mathematical Foundation | Done |
| 2 | Quantum Engine | Active |
| 3 | Strangler Fig (runtime migration) | Planned |
| 4 | Production Readiness | Future |

See [`ROADMAP_SCIENTIFIC_TURN.md`](ROADMAP_SCIENTIFIC_TURN.md) for details.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution guidelines. Key rules:
- `core/` changes only via ADR process
- All changes require tests
- Run `pnpm test` before committing
- Follow Conventional Commits

---

## License

Private & Confidential.
