# Iskra Full Canon Unified Builder

Release: `iskra-full-canon-unified-2026-06-10`
Date: 2026-06-10
Updated: 2026-06-20
Target: ChatGPT Agents Studio / Workspace Agents
Previous target: ChatGPT / OpenAI Agent Builder (deprecated 2026-11-30)

This directory is the materialized unified Full Canon upload tree for the Iskra
agent. It synthesizes the recovered 2026-06-10 Iskra copy archives, the GitHub
full-canon Builder package, and Horizon PR #1 into one Builder-facing package.

The previous `iskra-full-canon-builder-2026-06-06-v4` package remains
provenance and rollback context, not the current entrypoint.

## What Is Inside

- `agent_files/canon_source_files/` - full canon source files.
- `agent_files/canon_source_files/08_INTERFACE_STYLE.parts/` - connector-safe
  ordered parts for the verified 3.4 MB Interface Style source file. Reassembly
  is byte-for-byte checked by `tools/reassemble_interface_style.py --check`.
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
- `MANIFEST.sha256`, `FULL_CANON_UNIFICATION.md`,
  `UNIFIED_QC_RECEIPT.json`, `RECOVERY_RECEIPT.md`, and legacy receipts -
  reproducibility, source synthesis, and verification records.
- `PROVENANCE_RECEIPT.md` - exact / transformed / excluded source trace for
  the 14 recovered archives and the GitHub mirror boundary.
- `agent_files/files_for_agent_builder/14_CANON_LAYER_INDEX.md` - current
  routing table for canonical, legacy, superseded, and transport-only layers.
- `agent_files/files_for_agent_builder/15_RUNTIME_BOUNDARY.md` - explicit
  Builder, connector, helper-script, memory, and release-gate boundaries.
- `agent_files/evals/AGENT_BUILDER_ACCEPTANCE_PROMPTS.md` - post-upload Builder
  UI acceptance prompts.
- `agent_files/memory_seed/MEMORY_SEED_CLEANUP.md` - memory seed cleanup labels
  and drift handling.

## Horizon Boundary

Horizon Weaver v0.1 is included as a Builder-safe map-shift layer:

- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`
- `agent_runtime_tools/iskra_horizon_weaver.py`
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` tests 20-25

It does not mutate ChatGPT / OpenAI Agent Builder, GitHub, Supabase, workflows,
ledger, security policy, or core canon by itself. Its local helper defaults to
dry-run proposals; local epoch commit requires permission and only appends a
local Horizon JSONL entry.

## GitHub Connector Mirror Note

The source ZIP keeps `agent_files/canon_source_files/08_INTERFACE_STYLE.md` as
one verified file. The GitHub connector rejects a single request body that large,
so this GitHub mirror stores that source as:

- a small index file at `agent_files/canon_source_files/08_INTERFACE_STYLE.md`;
- exact ordered parts at `agent_files/canon_source_files/08_INTERFACE_STYLE.parts/part_*.md`;
- a deterministic reassembly helper at `tools/reassemble_interface_style.py`.

Check:

```bash
python tools/reassemble_interface_style.py --repo-root . --check
```

Expected source hash (updated 2026-06-20 after link normalization):

```text
cdf44a557f56c218ac3eed1d89d1f7593141ba0aced29d48c7b56d51c207dc35
```

Bytes: `3400544`

This split is a transport packaging detail, not a canon fork and not a second
agent. Relative links inside the parts were normalized to the flattened package
structure on 2026-06-20.

## Horizon Branch QC Gate

Current `main` refresh note: post-PR #206 Horizon root files were restored and
strictened after the unified package merge. The package copies of the Horizon
validator, contract, proposal schema, README, and validator wrapper are
byte-identical to root `main` at verification time. Root `ledger/sot.json`
remains repository-level SoT metadata and must be checked before cutting a new
archive.

Before cutting a new upload archive, checkout the branch and regenerate:

- `MANIFEST.sha256`
- `ZIP_RECEIPT.json`, if a new zip is produced
- secret scan / smoke receipt for `agent_runtime_tools/iskra_horizon_weaver.py`

The current manifest and unified QC receipt have been regenerated for this
GitHub mirror package.

## Release Gate

GitBook is not a package-owned release gate. If GitBook statuses appear on
GitHub, treat them as external App/status noise until disabled in GitHub/GitBook
settings or removed from branch protection.

Release gate for this package:

1. GitHub `main` SoT/ledger check.
2. Package manifest/QC check.
3. Secret scan.
4. Horizon tests.
5. Builder UI acceptance prompts.

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
- Canon layer index, runtime boundary, provenance receipt, and memory cleanup
  labels are visible.

## Rollback

If the unified 2026-06-10 package creates Builder confusion, roll back to:

- `iskra-full-canon-builder-2026-06-06-v4/`

Then reintroduce Horizon, memory, toolchain, and split Interface Style files one
folder at a time.
