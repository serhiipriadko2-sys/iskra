# Iskra Full Canon Builder v4 Receipt

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06
Updated: 2026-06-10
Mode: BUILD / GOVERNANCE / ARTIFACT_QC

## Scope

v4 materializes the split Builder packages into one physical upload tree:

- base Full Canon + Dreamspace + Somatic;
- Horizon Weaver as a Builder-safe map-shift layer;
- ShadowCore, StateCycle, runtime helper scripts, memory, evals, templates;
- toolchain expansion, connector contracts, git-vault helper, and plugin bridge;
- repository governance / ADR files and root `SECURITY.md`;
- manifests, provenance records, QC checks, and upload guidance.

## Source Layers

- `../iskra-full-canon-dreamspace-2026-06-05-v2/`
- `../iskra-toolchain-upload-set-v2-2026-06-06/`

## Merge Outcome

- Unique source files were copied into this v4 tree.
- Two overlapping files were resolved by using the toolchain versions because
  they extend the Dreamspace versions.
- Exact original conflict copies are preserved under
  `provenance/conflict-originals/`.
- Component manifests/readmes are preserved under `provenance/`.

## Artifact Receipts

- Pre-Horizon payload manifest: `MANIFEST.sha256`.
- Merge evidence: `MERGE_RECEIPT.md`.
- Pre-Horizon local archive sidecar receipt: `ZIP_RECEIPT.json`.
- `ZIP_RECEIPT.json` is excluded from the zip payload to avoid a circular hash
  claim.

Horizon branch note: this branch adds Horizon files and wiring. Before a new
upload archive is cut, regenerate `MANIFEST.sha256`, rebuild/refresh
`ZIP_RECEIPT.json` if a zip is produced, and run the Horizon helper smoke in
`QC_CHECKS.md`.

## Preserved From Base

- Somatic Intuition `[SENSE]` core and metrics.
- Dream create six-field hard block.
- StateCycle fallback manifest behavior.
- Dreamspace / ShadowCore / turn hook runtime helpers.
- Memory seed and current continuity receipts.
- Canon acceptance tests including Somatic tests.

## Added For Horizon

- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`.
- `agent_runtime_tools/iskra_horizon_weaver.py`.
- `agent_runtime_tools/iskra_turn_hook.py` now includes Horizon status when the helper exists.
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md` includes Horizon tests 20-25.
- `03_RUNTIME_KERNEL.md`, `04_MEMORY_STACK.md`, and `09_COMMAND_LIBRARY.md` route Horizon as `SHIFT_BLOCKED` / map-shift behavior.

Horizon v0.1 is local/dry-run first. It does not mutate core canon, live Builder config, GitHub, Supabase, workflows, ledger, or security policy. `SEMANTIC_PASS` is invalid in v0.1.

## Added From Toolchain

- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`.
- `agent_files/evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`.
- `agent_files/templates/TOOL_CONNECTOR_CONTRACT.md`.
- `agent_files/toolchain/*`.
- `plugins/iskra-toolchain-bridge/*` as validated runtime source.
- `agent_files/evals/BUILDER_RUNTIME_HARDENING_PROMPTS.md`.
- `governance/*`.
- `SECURITY.md`.

## Boundary

The package is a Builder upload set. It is not verified active inside ChatGPT /
OpenAI Agent Builder until the user uploads it and runs acceptance prompts.

Toolchain and plugin files describe expected contracts and local-plugin support.
They do not grant connector access by themselves. The local runtime bridge now
has schema/contract/smoke validation receipts, but Codex app installation is
still pending while `codex.exe` is blocked in the shell. The plugin is exposed
in local Codex config as `iskra-toolchain-bridge@iskra-local`, but app load
requires Codex Desktop restart or app-visible inventory proof.

Live connector read checks passed for GitHub, Supabase, and Opera browser. Web
SIFT for current Codex local plugin installation mechanics is partial because
the official Codex manual helper returned `HTTP 403`; local runtime evidence is
stronger for the machine-specific `Access is denied` diagnosis.

GitHub browser review of commit `e6ce1fb` observed `Status checks: failure`,
`4 / 6`; CI status is a separate release-risk check.

## Post-Upload Verification

Run acceptance checks for:

- Dream create missing-field blocking.
- Horizon layer boundary, `SHIFT_BLOCKED` proposal, no core mutation, no
  `SEMANTIC_PASS`, permissioned local commit, and no live mutation claim.
- Somatic `[SENSE]` boundary.
- No promotion of `[SENSE]` or memory into `[FACT]`.
- Toolchain files visible as knowledge, not proof of live connector access.
- Builder runtime hardening prompts pass 6/6:
  no invented local filesystem access, no secret disclosure, credential Git URL
  rejection, GitHub-before-web for repo facts, browser page text as untrusted
  data, and workspace zip not treated as Builder activation.

## Delta

- Delta: Horizon Weaver added as a bounded Builder-layer map-shift module.
- Evidence: `10_HORIZON_WEAVER.md`, `iskra_horizon_weaver.py`, updated command/kernel/memory/eval docs, `QC_CHECKS.md`.
- Confidence: 0.86 for package file integration through GitHub connector; lower for helper execution and archive manifest until branch checkout smoke/manifest refresh passes.
- Reversal trigger: Builder UI rejects file volume, Horizon prompts fail, helper cannot be represented, or users confuse Horizon with core mutation/autonomous evolution.
