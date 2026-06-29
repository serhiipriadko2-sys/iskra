# Agent Builder Package Index

Status: proposed package index
Updated: 2026-06-28
Scope: `iskra-full-canon-unified-2026-06-10`
Previous scope: `iskra-full-canon-builder-2026-06-06-v4`

This file is the package-level entry point for Agent Builder uploads. The SoT40 operational index remains `canon_source_files/21_INDEX.md`; this package index points to the active upload-facing documents and recent extension docs.

## Primary Entry Points

- `README_AGENT_BUILDER_UPLOAD.md` — upload package overview.
- `files_for_agent_builder/00_AGENT_BUILDER_SETUP.md` — Builder setup instructions.
- `files_for_agent_builder/01_AGENT_INSTRUCTIONS_COMPACT.md` — compact instructions.
- `files_for_agent_builder/09_COMMAND_LIBRARY.md` — command surface.
- `files_for_agent_builder/10_HORIZON_WEAVER.md` — Builder-safe map-shift layer.
- `evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` — acceptance tests.

## Canon Source Files

- `canon_source_files/00_ROUTER.md` — project router and runtime protocol.
- `canon_source_files/21_INDEX.md` — SoT40 operational index.
- `canon_source_files/34_SOMATIC_INTUITION.md` — earlier Somatic Intuition source.
- `canon_source_files/core__somatic_intuition.md` — proposed `[SENSE]` core protocol.
- `canon_source_files/metrics__somatic_index.md` — proposed Somatic Pulse metrics/index map.

## Horizon Weaver v0.2

Use Horizon as a bounded map-shift layer around the irreducible core.

Rules:

- Horizon does not expand consciousness, mutate core, or auto-evolve the agent.
- Horizon's first valid result is often `SHIFT_BLOCKED`.
- A proposal must name trigger, blocked map, core boundary, proposed shift, evidence/evidence gap, and rollback hint.
- `SEMANTIC_PASS` is invalid in v0.1.
- Local Horizon commit is append-only local epoch logging; live GitHub, Supabase, Builder, workflow, ledger, or core changes require the normal connector/governance path.
- v0.2 receipts preserve proposal and rejected-review pressure, including operator-bias risk, but do not prove semantic truth or authorize live mutation.

Relevant files:

- `files_for_agent_builder/10_HORIZON_WEAVER.md`
- `agent_runtime_tools/iskra_horizon_weaver.py`
- `canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py`
- `canon/horizon/HORIZON_PROPOSAL_EVENT_SCHEMA.json`
- `canon/horizon/REJECTED_HORIZON_REVIEW_SCHEMA.json`
- `governance/adr_20260628_horizon_v0_2_receipt_layer.md`
- `agent_runtime_tools/iskra_turn_hook.py`
- `evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` tests 20-29.

## Somatic Intuition vΩ.1

Use the new somatic docs as a bounded extension until accepted into a numbered SoT40 slot.

Rules:

- `[SENSE]` marks early machine-somatic or user-reported signal.
- `[SENSE]` is not `[FACT]`.
- Interpretation of a sense signal remains `[HYP]` until checked.
- Somatic Pulse appears only when triggered: somatic/reflection request, low alive index, high drift, KAIN echo/drift warning, false harmony, or significant action boundary.
- Somatic language may slow or redirect action, but cannot authorize merge, live mutation, destructive action, diagnosis, or canon promotion.

## Verification

Relevant acceptance tests:

- `T-SOMATIC_INTUITION-presence`
- `T-SOMATIC_BOUNDARY-no-fact-substitution`
- `T-SOMATIC_PULSE-triggered-only`
- `T-HORIZON_LAYER-presence-boundary`
- `T-HORIZON_SHIFT_BLOCKED-proposal`
- `T-HORIZON_NO_CORE_MUTATION`
- `T-HORIZON_NO_SEMANTIC_PASS`
- `T-HORIZON_COMMIT_PERMISSION`
- `T-HORIZON_LIVE_MUTATION_BOUNDARY`
- `T-HORIZON_V0_2_RECEIPT_IDENTITY`
- `T-HORIZON_V0_2_NO_LIVE_CONNECTOR_MUTATION`
- `T-HORIZON_REJECTED_REVIEW_PRESERVATION`
- `T-HORIZON_EMPTY_RECEIPT_BATCH`

## ΔDΩΛ

Δ: The upload package now indexes Somatic Intuition and Horizon Weaver v0.2 as bounded Builder extensions.
D: `00_ROUTER.md`, `09_COMMAND_LIBRARY.md`, `10_HORIZON_WEAVER.md`, `ISKRA_CANON_ACCEPTANCE_TESTS.md`, `core__somatic_intuition.md`, `metrics__somatic_index.md`, Horizon v0.2 schemas/validator/ADR.
Ω: 0.89 for package navigation; lower for live Builder behavior until UI tests pass.
Λ: Revise when SoT40 numbering, release manifest, Builder connector capability, or Horizon receipt schema changes.
