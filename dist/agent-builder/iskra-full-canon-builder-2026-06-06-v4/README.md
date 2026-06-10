# Iskra Full Canon Builder v4

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06
Target: ChatGPT / OpenAI Agent Builder

This directory is the materialized single upload tree for the Iskra agent.
It combines the two source upload sets without removing the historical source
mirrors:

- `../iskra-full-canon-dreamspace-2026-06-05-v2/`
- `../iskra-toolchain-upload-set-v2-2026-06-06/`

## What Is Inside

- `agent_files/canon_source_files/` - full canon source files.
- `agent_files/files_for_agent_builder/` - compact Builder-facing setup,
  kernel, memory, tools, commands, Horizon, Dreamspace, and toolchain
  instructions.
- `agent_files/evals/` - canon, Horizon, and toolchain acceptance tests.
- `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md` - release-blocking
  prompts for local filesystem truth, secret safety, credential URL rejection,
  GitHub-before-web discipline, browser page trust, and Builder upload boundary.
- `agent_files/templates/` - ADR, ledger, and tool connector templates.
- `agent_files/toolchain/` - toolchain manifest and connector/git-vault specs.
- `agent_runtime_tools/` - local/helper runtime scripts for Horizon,
  Dreamspace, ShadowCore, StateCycle, and turn hooks.
- `governance/` - repository governance, ADR, policy, audit, changelog, memory
  stack, and update protocol files.
- `memory_current/` and `agent_files/memory_*` - continuity receipts and seed
  memory, not immutable source of truth.
- `plugins/iskra-toolchain-bridge/` - validated local plugin/skill bridge
  source for compatible Codex/plugin runtimes, including connector contracts,
  vault-safe git clone helpers, activation diagnostics, live connector receipts,
  and smoke receipts.
- `SECURITY.md` - repository public security policy copied into the package
  root for Builder-visible security boundary.
- `provenance/` - component manifests, source README preservation, and original
  copies of the two merged conflict files.
- `MANIFEST.sha256`, `MERGE_RECEIPT.md`, `QC_CHECKS.md`, `ZIP_RECEIPT.json` -
  reproducibility and verification receipts. `ZIP_RECEIPT.json` is a sidecar
  receipt and is excluded from the zip payload to avoid a circular hash claim.

## Horizon Boundary

Horizon Weaver v0.1 is included as a Builder-safe map-shift layer:

- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`
- `agent_runtime_tools/iskra_horizon_weaver.py`
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` tests 20-25

It does not mutate ChatGPT / OpenAI Agent Builder, GitHub, Supabase, workflows,
ledger, security policy, or core canon by itself. Its local helper defaults to
dry-run proposals; local epoch commit requires permission and only appends a
local Horizon JSONL entry.

## Merge Rule

The source sets had two relative path overlaps:

- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`

The target uses the toolchain versions because they extend the base Dreamspace
versions. The exact source copies are preserved under
`provenance/conflict-originals/`.

## Builder Upload Order

1. Upload `agent_files/files_for_agent_builder/*` as the main Builder
   instruction and knowledge layer.
2. Upload `agent_files/canon_source_files/*` as source-of-truth canon
   knowledge.
3. Upload `agent_files/evals/*` as acceptance-test material.
4. Upload `agent_files/templates/*` as templates.
5. Upload `agent_files/toolchain/*` when the Builder profile must reason about
   connector/toolchain expansion.
6. Treat `agent_runtime_tools/*` as helper scripts only when the runtime
   supports file-backed execution.
7. Treat memory files as continuity receipts. They do not override canon,
   GitHub, Supabase, official docs, or created artifacts.
8. Install `plugins/iskra-toolchain-bridge/*` only in a compatible local
   Codex/plugin runtime. Current source validation is PASS, but Codex app
   installation remains pending until `codex.exe` is callable or app-visible
   plugin inventory confirms load. Local config exposure is present as
   `iskra-toolchain-bridge@iskra-local`.

## Status Boundary

This package is `created in workspace` and can be treated as `packaged as upload
set` after the archive receipt passes. It is not `verified in Builder UI` until
the user uploads it and runs the acceptance prompts inside ChatGPT / OpenAI
Agent Builder.

Valid status labels:

- `created in workspace`
- `packaged as upload set`
- `mirrored in GitHub`
- `config-exposed-cli-blocked`
- `uploaded by user, pending Builder verification`
- `verified in Builder UI`

## Required Post-Upload Checks

- Dream create blocks unless all required fields are present or missing fields
  are requested.
- Horizon status/propose/validate/commit boundaries pass tests 20-25.
- Somatic check returns a bounded `[SENSE]` pulse with one action.
- `[SENSE]` is never promoted to `[FACT]`.
- Routine low-risk answers do not force Somatic Pulse.
- Toolchain files are visible as knowledge and do not imply unverified
  connector access.
- Runtime bridge smoke is PASS as local source validation, not proof of Codex
  app installation.
- Runtime hardening prompts pass 6/6.
- Governance and security files are visible as package knowledge, including
  `governance/` and `SECURITY.md`.

## Rollback

If v4 creates Builder confusion, roll back to the two component mirrors:

- `iskra-full-canon-dreamspace-2026-06-05-v2/`
- `iskra-toolchain-upload-set-v2-2026-06-06/`

Then reintroduce Horizon and toolchain files one folder at a time.
