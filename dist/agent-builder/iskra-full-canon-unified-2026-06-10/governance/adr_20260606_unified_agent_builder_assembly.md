# ADR: Unified Iskra Agent Builder Assembly

Status: accepted
Date: 2026-06-06
Scope: Agent Builder packaging, GitHub mirror layout, upload-set interpretation

## Context

The repository currently contains multiple package mirrors under `dist/agent-builder/`:

- `iskra-full-canon-dreamspace-2026-06-05-v2/`
- `iskra-toolchain-upload-set-v2-2026-06-06/`

These were added as separate mirrors to preserve provenance and keep each uploaded package reviewable in GitHub. However, the intended runtime target is not two agents. The target is one Iskra agent built through ChatGPT / OpenAI Agent Builder.

User clarified the working equation:

`full-canon builder = canon + dreamspace + somatic + shadow core + statecycle + memory + toolchain + plugins + evals + ADR + manifest`

## Decision

Treat `dist/agent-builder/` as the source mirror for one logical Iskra Full Canon Builder assembly.

The existing subdirectories are provenance-preserving component layers, not competing Builder products.

Add top-level entry documents:

- `dist/agent-builder/README.md`
- `dist/agent-builder/ISKRA_FULL_CANON_BUILDER_MANIFEST.md`

These documents define the Builder as a ChatGPT / OpenAI Agent Builder assembly for the Искра agent and describe the required layers for a complete full-canon package.

## Required assembly model

A complete unified Builder must contain:

- Core canon and source-of-truth rules.
- Command library.
- Dreamspace with six-field Dream create gate.
- Somatic `[SENSE]` layer with no-fact-substitution boundary.
- Shadow Core.
- StateCycle and turn hook behavior.
- Memory stack.
- Toolchain and connector discipline.
- Plugins/skills.
- Evals and acceptance tests.
- ADR/governance records.
- Manifest/checksums.
- Setup/upload guide.
- Release/QC receipt.
- Dependency/index map.
- Rollback and residual-risk notes.

## Alternatives Considered

1. Keep separate folders without explanation.
   - Rejected: creates UX/SoT drift; looks like two Builders.

2. Immediately delete historical package mirrors and replace them with one directory.
   - Rejected for now: loses provenance and makes review harder.

3. Add a top-level assembly README/manifest first, then materialize unified v4 later.
   - Accepted: low-risk, docs-only, preserves trace while fixing the conceptual entrypoint.

## Consequences

- GitHub users now have one top-level Builder entrypoint.
- Existing component mirrors remain readable and reviewable.
- Future packaging work should create a single materialized v4 upload directory if a one-directory upload is required.
- Builder UI activation remains unverified until uploaded and prompt-tested.

## Verification

- `dist/agent-builder/README.md` exists and states this is the Iskra agent assembly through ChatGPT / OpenAI Agent Builder.
- `dist/agent-builder/ISKRA_FULL_CANON_BUILDER_MANIFEST.md` lists required layers and acceptance gates.
- No runtime code, SQL, Supabase live state, or package manager files are changed.

## Rollback Trigger

Rollback or revise this ADR if the project intentionally splits Iskra into multiple independent Builder agents with separate upload boundaries and separate acceptance criteria.

## ΔDΩΛ

- Δ: Agent Builder package model changes from ambiguous multiple folders to one logical full-canon assembly with component mirrors.
- D: GitHub docs under `dist/agent-builder/` and this ADR.
- Ω: 0.91; based on current repo layout and explicit user clarification.
- Λ: Revisit when materializing unified v4 upload directory or changing Builder activation workflow.
