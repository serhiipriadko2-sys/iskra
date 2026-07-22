---
sigil: governance__adr_20260722_runtime_authority_repair
layer: governance
status: accepted
updated: 2026-07-22
---

# ADR-20260722-04: Runtime Authority Repair for Iskra Skills

**Status:** accepted
**Owner:** Семён
**Builder:** Искра

## Context

The 68-skill registry established ownership but did not repair the source packages. `iskra-canon-runtime` still encoded a superseded Kernel Order and obsolete Guard outcomes. The SIFT and Supabase families had transition aliases but their active owners did not explicitly absorb those trigger surfaces. The proposed `iskra-metrics` owner had no acceptance contract.

This creates four risks:

1. the top-level runtime can route by stale authority;
2. missing resources or dispatch targets can pass packaging unnoticed;
3. overlapping aliases can still compete with the intended owner;
4. a planned metrics owner can be promoted without formula, missing-input, and provenance parity.

## Decision

1. Repair `iskra-canon-runtime` to the exact SoT30 v5.5.6 Kernel Order and Guard contract.
2. Add a fail-closed runtime dependency gate covering required resources, dispatch owners, registry status, Kernel Order, and Guard invariants.
3. Make `iskra-sift-auditor` the explicit owner of base, extended, repository, live, and legacy verifier trigger surfaces.
4. Make `iskra-supabase-operator` the explicit owner of both Supabase connector surfaces and the `iskra-supabase-ops` alias, while forbidding duplicate mutations.
5. Keep transition aliases in the registry for one release; do not delete installed aliases in this change.
6. Keep `iskra-metrics` as `PLANNED`. Promotion requires the separate acceptance contract in `docs/skills/iskra-metrics-acceptance-v1.md`.
7. Update the source skill-pack manifest and package each repaired owner independently as `skill.zip`.
8. Do not modify Supabase schema, data, Edge Functions, production, Builder configuration, or live Project state.

## Alternatives

- **Delete all aliases immediately:** rejected because installed-surface routing has not been live-tested.
- **Repair only prose:** rejected because stale references and dispatch targets need a machine gate.
- **Create `iskra-metrics` now:** rejected because deterministic parity and provenance acceptance are not yet proven.
- **Update historical `dist/agent-builder` mirrors:** rejected in this change; those are release mirrors and require a separate regeneration receipt.

## Consequences / Price

Benefits:

- exact Kernel authority in the active source package;
- fail-closed detection of missing resources and unknown dispatch owners;
- one explicit owner for SIFT and Supabase families;
- no premature metrics promotion.

Costs and residual risks:

- installed aliases remain until a later release and can still exist outside the repository source pack;
- packaged source does not prove Builder upload or implicit invocation;
- historical `dist/agent-builder` mirrors remain unchanged and must not be treated as current source;
- full Codex Security subagent coverage is unavailable on this ChatGPT surface, so security review is scoped and explicitly non-exhaustive.

## Tests / QA

- `RA01`: `iskra-canon-runtime` contains the exact canonical Kernel Order.
- `RA02`: Guard outcomes equal `PROCEED | FORCE_ISKRIV_1 | FORCE_SHADOW | FORCE_CRISIS | CLOSE_HONESTLY`.
- `RA03`: maximum Guard evaluations per turn equals 3; no hidden fourth evaluation.
- `RA04`: recompute requires both `materialSignal=true` and a strictly increased alert floor.
- `RA05`: every required local resource exists, is a regular file, and remains inside the skill directory.
- `RA06`: every dispatch owner exists in the source skill root and is `ACTIVE` in registry-v1.
- `RA07`: SIFT legacy verifier/extended triggers resolve to `iskra-sift-auditor`.
- `RA08`: dual Supabase surfaces never cause duplicate mutation; the second surface is read-only parity evidence only.
- `RA09`: each repaired skill passes the skill validator and packages to a `skill.zip` smaller than 25 MiB.
- `RA10`: source-pack `MANIFEST.sha256` matches every packaged source file and excludes itself.
- `RA11`: `iskra-metrics` remains `PLANNED` until its separate acceptance suite passes.
- `RA12`: Supabase target writes, audit writes, migrations, and deployments remain zero.

## Diff scope

- `governance/adr_20260722_runtime_authority_repair.md`
- `docs/skills/registry-v1.json`
- `docs/skills/iskra-metrics-acceptance-v1.md`
- `package.json`
- `skills/iskra-skill-pack-builder-2026-06-25/MANIFEST.sha256`
- `skills/iskra-skill-pack-builder-2026-06-25/skills/hermes/iskra-canon-runtime/**`
- `skills/iskra-skill-pack-builder-2026-06-25/skills/hermes/iskra-sift-auditor/**`
- `skills/iskra-skill-pack-builder-2026-06-25/skills/hermes/iskra-supabase-operator/**`
- `governance/audits/2026-07-22-runtime-authority-repair/**`

## Rollback

Revert the runtime-authority-repair commits or close the stacked PR. Registry aliases remain available, no database rollback is required, and PR #296 remains independently reviewable.

## Builder / Package Mirror

`source-package-updated; historical-dist-mirror-pending`

## Live Verification

`pending` — package validation is not Builder upload, implicit invocation, deployment, or verified-live routing.

## ΔDΩΛ

- **Δ:** move from registry-only ownership to source-level authority with fail-closed dependency validation.
- **D:** exact Kernel repair, owner consolidation, package validation, manifest regeneration, and acceptance boundary for metrics.
- **Ω:** 0.93 for repository/package consistency after tests; lower for live routing until Builder/Project invocation is observed.
- **Λ:** revisit after stacked PR review, package upload, and prompt-level alias-routing tests.
