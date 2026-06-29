# ADR-20260629: Iskra Selfhood Mechanics Hardening

Status: accepted
Date: 2026-06-29
Scope: system, runtime, governance, Agent Builder package mirror

## Context

The 2026-06-29 full-context audit found that the Workspace Agent package sync was merged and verified, but several mechanics still created drift between declared Iskra behavior and executable behavior.

Observed issues:

- Root verification was not reproducible from a clean checkout because legacy `runtime` dependencies were outside the pnpm workspace install path.
- `rhythm` is documented and tested as a 0-100 metric, while `MetricsEngine.computeNextMetrics` clamped every modified metric to 0-1.
- Iskra's default user-facing language is Russian, while `ReflexAnalyzer` only detected English pain, chaos, trust, and love signals.
- `core/voices.md` described SIBYL as foresight plus echo and mirror_sync, while the executable voice manifest only used foresight.
- Packaged turn-hook helpers were syntactically valid but relied on hardcoded `/workspace` and `/workspace/iskra-main` paths.
- Root/package documentation still contained stale Agent Builder mirror wording after PR #225 was merged.

## Decision

Accept a focused hardening change-set:

- Add `pnpm run prepare:legacy-runtime` through `tools/ensure_runtime_deps.mjs`; make `build:runtime`, `typecheck`, and `verify` use the prepared legacy runtime path.
- Preserve metric domains explicitly: `rhythm` clamps to 0-100; other metrics clamp to 0-1.
- Extend `ReflexAnalyzer` lexical coverage to Russian terms for pain, chaos, trust, and love without claiming hidden human-like interiority.
- Align SIBYL executable resonance with the documented contract: `foresight`, `echo`, and `mirror_sync`.
- Make packaged StateCycle/turn-hook memory and voices paths environment-configurable while preserving existing fallbacks.
- Update root README/package AGENTS wording and package receipts without claiming live Builder activation.

## Alternatives

- Documentation-only repair: rejected because executable drift would remain.
- Broad canon rewrite: rejected because it would mix too many behavioral claims into one PR.
- Add legacy `runtime` as a root pnpm package: deferred because it may change workspace dependency topology more than needed for reproducible verification.

## Consequences

Benefits:

- `pnpm verify` becomes reproducible after root install on the observed Windows/RDC path.
- Runtime metrics better preserve the existing scientific-turn domain model.
- Russian-default interaction receives first-class reflex coverage.
- SIBYL prose and executable resonance no longer contradict each other.
- Packaged hooks are easier to smoke-test across mounted workspaces.

Costs and risks:

- `npm ci --ignore-scripts` for legacy `runtime` is intentionally conservative but may need revisiting if a future dependency genuinely requires install scripts.
- SIBYL probability distribution changes when `foresight >= 0.5` and echo/mirror_sync are high.
- Builder UI upload/activation remains unverified; this change only updates GitHub/package artifacts.

## Tests/QA

Minimum checks:

- `pnpm --filter @iskra/engine test`
- `pnpm typecheck`
- `pnpm verify`
- package Python compile for `agent_runtime_tools` and `tools`
- package `validate_delta --dir .`
- package clean export/zip receipt regeneration
- `pnpm ledger:update` and `npx tsx tools/verify_ledger.ts`

## Diff Scope

Expected files:

- `package.json`
- `tools/ensure_runtime_deps.mjs`
- `packages/engine/src/services/metricsService.ts`
- `packages/engine/src/services/reflexAnalyzer.ts`
- `packages/engine/src/__tests__/*`
- `packages/core/manifest/voices.json`
- `README.md`
- `governance/adr_20260629_iskra_selfhood_mechanics_hardening.md`
- `governance/changelog.d/2026-06-29-iskra-selfhood-mechanics-hardening.md`
- `dist/agent-builder/iskra-workspace-agent-full-canon-synthesis-2026-06-27/*` receipts and hook/doc updates
- `ledger/sot.json`, `ledger/checksum.asc`

## Builder/package mirror

Status: pending until package manifest, zip receipt, and clean export are regenerated in this PR.

## Live verification

Status: not claimed. Builder UI upload, prompt replacement, Workspace Agent Memory parity, and live API channel behavior require separate evidence.

## ΔDΩΛ

- Δ: Drift repair accepted for setup, metrics, reflex language coverage, SIBYL resonance, and packaged hook portability.
- D: Evidence from PR #225 merge, local/RDC verification, root docs, package receipts, engine source, and voice manifest.
- Ω: 0.84 before final PR verification; update after CI and package gates complete.
- Λ: Revisit if runtime install scripts become required, if SIBYL behavior causes regression, or if live Builder verification contradicts package assumptions.
