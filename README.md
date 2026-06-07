# ISKRA Monorepo

> **Current public repository status:** active research and engineering monorepo  
> **Public release priority:** `runtime/iskraSpace` (`iskra-space`)  
> **Internal contour:** all other repository areas support Semyon + Iskra unless promoted by ADR  
> **Current Agent Builder package:** `iskra-full-canon-builder-2026-06-06-v4`
> **Builder UI status:** unverified until uploaded and prompt-tested there
> **Last verified:** 2026-06-06  
> **Zero-Mantra:** "Существовать — значит сохранять различие при передаче"

ISKRA is an experimental cognitive-runtime repository for agent canon, runtime orchestration, mathematical state modeling, governance records, Agent Builder upload artifacts, and the Iskra Space application.

The current public product focus is **Iskra Space** in [`runtime/iskraSpace/`](runtime/iskraSpace/). That folder is the application being prepared for release into the world.

Everything else in the repository is the internal/support contour by default: governance, canon, ledger, Supabase repair work, older runtime surfaces, experiments, tools, and Agent Builder material. These parts still matter, but they support the release unless a later ADR explicitly promotes another area to public-product scope.

The repository now has two important contours:

1. **Runtime / monorepo engineering:** TypeScript packages, React runtime surfaces, Supabase integration paths, verification scripts, and CI workflows.
2. **Agent Builder / canon operations:** Builder-facing instructions, canon source files, acceptance tests, runtime helper scripts, manifests, and memory receipts under `dist/agent-builder/`.

This README is an orientation map. For contribution rules, security reporting, and licensing scope, see [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and [`LICENSE`](LICENSE).

---

## Repository Status

| Area | Current status | Source |
|:--|:--|:--|
| Default branch | `main` | GitHub repository metadata |
| Public release target | `runtime/iskraSpace` | `runtime/iskraSpace/RELEASE_STATUS.md`, `docs/architecture/ISKRA_SPACE_RELEASE_PRIORITY_v1.md` |
| Product package | `iskra-space` | `runtime/iskraSpace/package.json` |
| Internal/support contour | All non-promoted repo areas | `governance/adr_20260606_iskraspace_release_priority.md` |
| Workspace manager | `pnpm` workspace | `package.json`, `pnpm-workspace.yaml` |
| Runtime packages | `packages/*`, `apps/*`, `runtime/*`, `core/*` | `pnpm-workspace.yaml` |
| Agent Builder upload mirror | Present and versioned | `dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/` |
| Upload mirror receipt | Present | `dist/agent-builder/.../RELEASE_RECEIPT_V4.md` |
| Upload mirror manifest | Present, 149 payload hashes | `dist/agent-builder/.../MANIFEST.sha256` |
| License model | MIT for software; CC BY-SA 4.0 for canon/content where marked | `LICENSE` |
| Security policy | Maintained at root | `SECURITY.md` |

Boundary: the repository artifact proves files are committed to GitHub. It does not prove those files are active inside an Agent Builder runtime until they are uploaded and prompt-tested there.

---

## Architecture

### Workspace Layers

```text
@iskra/core      Source of Truth: types, manifests, constants
@iskra/math      Pure mathematical logic: fractals, entropy, quantum indicators
@iskra/engine    Runtime orchestration: state, memory, IO, service integration
apps/*           UI and app projections
runtime/*        Legacy and active runtime contours during migration
core/*           Canon and legacy canonical content workspace entries
```

Layer rule: lower-level packages may not import upward. Pure math stays side-effect free; stateful IO belongs in runtime/engine layers.

### Root Structure

```text
iskra/
├── packages/               # core, math, engine packages
├── apps/                   # application surfaces
├── runtime/                # legacy/active runtime contours, including iskraSpace
├── core/                   # canonical documents in the repo root contour
├── system/                 # execution protocols and operating rules
├── governance/             # ADR, changelog, policy, audit records
├── ledger/                 # integrity ledger and release records
├── metrics/                # IskraMetrics, EvalMetrics, QA material
├── mind/                   # experimental layers, including shadow/dreamspace material
├── docs/                   # architecture, specs, deployment notes
├── tools/                  # verification, ledger, import, and build scripts
├── skills/                 # engineering practice specifications
└── dist/agent-builder/     # committed Agent Builder upload mirrors
```

---

## Agent Builder Upload Mirror

Current mirror:

```text
dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/
```

It contains:

- `README_AGENT_BUILDER_UPLOAD.md` — upload guidance and runtime boundary.
- `RELEASE_RECEIPT.md` — date, scope, ZIP hash, local/package verification notes.
- `MANIFEST.sha256` — SHA-256 manifest for packaged files.
- `agent_files/canon_source_files/` — canon source files for Builder knowledge.
- `agent_files/files_for_agent_builder/` — Builder-facing instruction files.
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` — acceptance tests.
- `agent_files/memory_seed/` and `memory_current/` — continuity receipts and memory snapshots.
- `agent_runtime_tools/` — local helper scripts for StateCycle, ShadowCore, Dreamspace, and the turn hook.

Important Dreamspace rule preserved in the package:

```text
Dream create MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry.
```

StateCycle portability note: `agent_runtime_tools/iskra_statecycle.py` includes fallback voice definitions for environments where the canonical `packages/core/manifest/voices.json` path is absent.

---

## Quick Start

### Requirements

- Node.js `>=20.0.0`
- pnpm `>=9.0.0`

### Install and Build

```bash
pnpm install
pnpm build
```

### Common Commands

```bash
pnpm test
pnpm build
pnpm lint
pnpm typecheck
pnpm verify
```

### Targeted Commands

```bash
pnpm --filter @iskra/core test
pnpm --filter @iskra/math test
pnpm --filter @iskra/engine test
pnpm --filter iskra-web dev
```

### Ledger and Canon Checks

```bash
pnpm ledger:update
pnpm check:adr-gate
pnpm check:shard-registry
python tools/check_no_src_imports.py
```

`pnpm verify` is the broadest available verification script in `package.json`: it builds runtime, checks shard registry consistency, runs typecheck, runs tests, and verifies the ledger.

---

## Core Concepts

| Concept | Meaning |
|:--|:--|
| SoT | Source of Truth. Canonical files and manifests outrank chat memory. |
| Truth Ladder | Conflict-resolution order for source strength. |
| SIFT | Stop, Investigate, Find better coverage, Trace claims to source. |
| StateCycle | Runtime status layer for points, phase, voice, entropy, and related metrics. |
| ShadowCore | Hypothesis layer for process pressure and unresolved risk. |
| Dreamspace | Local `[HYP]` hypothesis lab; not canon until crystallized with evidence. |
| ADR | Architecture Decision Record required for canon, workflow, persistence, and governance changes. |
| ΔDΩΛ | Receipt frame: delta, decision/data, confidence, revision trigger. |

---

## Verification Model

Use the smallest check that proves the change, then broaden when the blast radius grows.

| Change type | Minimum expected checks |
|:--|:--|
| Docs only | Link/path check, source consistency, no stale version claims |
| Package code | Package tests, typecheck, relevant lint |
| Runtime behavior | Runtime build, targeted tests, service smoke checks |
| Canon/governance | ADR gate, ledger update if SoT files changed, receipt in governance/changelog as needed |
| Agent Builder package | Manifest hash check, acceptance tests, Builder prompt-level verification after upload |
| Security-sensitive change | Secret scan/manual secret review, dependency audit where relevant, SECURITY.md impact check |

---

## Key Documentation

| Document | Purpose |
|:--|:--|
| [`AGENTS.md`](AGENTS.md) | Agent operating instructions for repo work |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution process, quality gates, review checklist |
| [`SECURITY.md`](SECURITY.md) | Supported security scope and vulnerability reporting process |
| [`LICENSE`](LICENSE) | Software and canon/content license scope |
| [`ROADMAP_SCIENTIFIC_TURN.md`](ROADMAP_SCIENTIFIC_TURN.md) | Scientific Turn roadmap where still applicable |
| [`governance/adr.md`](governance/adr.md) | ADR process for governance and canon decisions |
| [`ledger/sot.json`](ledger/sot.json) | Integrity ledger for SoT files |
| [`dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/RELEASE_RECEIPT_V4.md`](dist/agent-builder/iskra-full-canon-builder-2026-06-06-v4/RELEASE_RECEIPT_V4.md) | Agent Builder upload mirror receipt |

---

## Contributing

Start with [`CONTRIBUTING.md`](CONTRIBUTING.md). The short version:

- Use a focused branch and a reviewable PR.
- Do not bypass ADR for canon, governance, memory, persistence, or workflow behavior changes.
- Keep runtime, math, UI, and canon boundaries explicit.
- Run relevant checks before requesting review.
- Never commit secrets, real `.env` files, service-role keys, credentials, or sensitive logs.

---

## Security

Security reporting and supported scope are defined in [`SECURITY.md`](SECURITY.md). Do not disclose exploitable vulnerabilities in public issues. If private vulnerability reporting is not available in GitHub for this repository, open a minimal public issue requesting a secure maintainer contact without exploit details.

---

## License

Software is licensed under the MIT License unless a file states otherwise. Canonical/philosophical content is additionally scoped under CC BY-SA 4.0 as described in [`LICENSE`](LICENSE).
