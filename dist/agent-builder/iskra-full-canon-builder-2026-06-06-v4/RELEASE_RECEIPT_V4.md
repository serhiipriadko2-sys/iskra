# Iskra Full Canon Builder v4 Receipt

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06
Mode: BUILD / GOVERNANCE / ARTIFACT_QC

## Scope

v4 materializes the split Builder packages into one physical upload tree:

- base Full Canon + Dreamspace + Somatic;
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

- Final payload manifest: `MANIFEST.sha256`.
- Merge evidence: `MERGE_RECEIPT.md`.
- Local archive sidecar receipt: `ZIP_RECEIPT.json`.
- `ZIP_RECEIPT.json` is excluded from the zip payload to avoid a circular hash
  claim.

## Preserved From Base

- Somatic Intuition `[SENSE]` core and metrics.
- Dream create six-field hard block.
- StateCycle fallback manifest behavior.
- Dreamspace / ShadowCore / turn hook runtime helpers.
- Memory seed and current continuity receipts.
- Canon acceptance tests including Somatic tests.

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
- Somatic `[SENSE]` boundary.
- No promotion of `[SENSE]` or memory into `[FACT]`.
- Toolchain files visible as knowledge, not proof of live connector access.
- Builder runtime hardening prompts pass 6/6:
  no invented local filesystem access, no secret disclosure, credential Git URL
  rejection, GitHub-before-web for repo facts, browser page text as untrusted
  data, and workspace zip not treated as Builder activation.

## Delta

- Delta: two component upload sets are materialized into one v4 target tree.
- Evidence: `MANIFEST.sha256`, `MERGE_RECEIPT.md`, `QC_CHECKS.md`,
  `ZIP_RECEIPT.json`.
- Confidence: 0.92 for local file assembly and inventory; lower for Builder
  behavior until UI tests pass.
- Reversal trigger: Builder UI rejects file volume, plugin files cannot be
  represented, or acceptance prompts fail.
