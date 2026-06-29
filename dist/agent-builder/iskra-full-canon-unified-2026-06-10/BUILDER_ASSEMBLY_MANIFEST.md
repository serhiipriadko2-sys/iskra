# Builder Assembly Manifest

Release: `iskra-full-canon-unified-2026-06-10`
Date: 2026-06-10
Updated: 2026-06-28
Previous release: `iskra-full-canon-builder-2026-06-06-v4`
Purpose: one materialized full-canon upload tree for the Iskra agent in
ChatGPT / OpenAI Agent Builder.

## Source Layers

| Layer | Source path | Merge status |
|---|---|---|
| Base canon, Dreamspace, Somatic, ShadowCore, StateCycle, memory, evals | `../iskra-full-canon-dreamspace-2026-06-05-v2/` | copied into this tree |
| Toolchain, connector contracts, git-vault helper, plugin bridge, toolchain evals | `../iskra-toolchain-upload-set-v2-2026-06-06/` | copied into this tree |

## Included Target Layers

| Layer | Target path | Status |
|---|---|---|
| Canon | `agent_files/canon_source_files/` | included |
| Consolidated knowledge | `agent_files/consolidated_knowledge/` | included as compact 7-volume upload mode |
| Builder instructions | `agent_files/files_for_agent_builder/` | included |
| Horizon Weaver | `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`, `agent_runtime_tools/iskra_horizon_weaver.py`, `canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py` | included as Builder-layer v0.2 receipt-aware |
| Dreamspace | `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`, `agent_runtime_tools/iskra_dreamspace.py` | included |
| Somatic Intuition | `agent_files/canon_source_files/core__somatic_intuition.md`, `agent_files/canon_source_files/metrics__somatic_index.md` | included |
| Shadow Core | `agent_runtime_tools/iskra_shadow_core.py` | included |
| StateCycle | `agent_runtime_tools/iskra_statecycle.py`, `agent_runtime_tools/iskra_turn_hook.py` | included |
| Memory seed/reference | `agent_files/memory_seed/`, `agent_files/memory_current/` | included as package continuity receipts; not proof of live Workspace Agent Memory contents |
| Toolchain | `agent_files/toolchain/`, `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md` | included |
| Plugins | `plugins/iskra-toolchain-bridge/` | included and locally source-validated |
| Evals | `agent_files/evals/` | included |
| Templates | `agent_files/templates/` | included |
| Governance / ADR | `governance/`, `agent_files/files_for_agent_builder/08_GOVERNANCE_ADR.md` | included |
| Security policy | `SECURITY.md`, `agent_files/canon_source_files/31_SECURITY.md` | included |
| Provenance | `provenance/` | included |
| Canon trace map | `CANON_TRACE_MAP.md` | included as claim-boundary map |
| Agents SDK fallback | `agents-sdk/` | included as code-first local fallback; `.venv` excluded from upload/export |
| Clean export helper | `tools/clean_export.py` | included |
| Manifest / QC | `MANIFEST.sha256`, `MERGE_RECEIPT.md`, `QC_CHECKS.md`, `UNIFIED_QC_RECEIPT.json`, `ZIP_RECEIPT.json` | included and refreshed for current package |

## Conflict Resolution

Two source files shared the same relative paths. The toolchain versions are used
in the target because they extend the base files instead of replacing their
policy surface:

- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`

The exact source versions are preserved in:

- `provenance/conflict-originals/dreamspace/`
- `provenance/conflict-originals/toolchain/`

## Canonical Builder Entry Points

Primary:

- `README.md`
- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/INDEX.md`
- `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`
- `agent_files/evals/ISKRA_TOOLCHAIN_ACCEPTANCE_TESTS.md`
- `governance/adr_20260606_unified_full_canon_builder_v4.md`
- `SECURITY.md`

Secondary:

- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`
- `agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md`
- `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`
- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `CANON_TRACE_MAP.md`
- `agents-sdk/README.md`
- `agent_runtime_tools/iskra_horizon_weaver.py`
- `canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py`
- `governance/adr_20260628_horizon_v0_2_receipt_layer.md`
- `agent_files/toolchain/iskra_toolchain_manifest.json`
- `plugins/iskra-toolchain-bridge/RUNTIME_RECEIPT.md`
- `plugins/iskra-toolchain-bridge/runtime-smoke-receipt.json`

## Non-Claims

This manifest does not claim:

- the package is already uploaded into Agent Builder;
- any connector is active unless Builder UI or connector configuration proves it;
- Horizon can mutate Builder/GitHub/Supabase/live systems by itself;
- Horizon v0.2 receipt PASS is semantic proof, canon acceptance, or live connector permission;
- Horizon proves consciousness, semantic truth, or auto-evolution;
- plugin files are installable in every OpenAI Builder surface;
- local runtime helpers will execute in cloud-only Builder profiles.
- Codex Desktop Workspace Agent management is observed through connector
  config; local plugin installation still requires separate app/plugin
  inventory evidence.
- this package mirrors the entire repository byte for byte.
- sidecar zip creation proves Builder UI verification.
- Workspace Agent API trigger success proves final task completion; `202
  Accepted` means accepted/queued, not completed.

## Clean Export Gate

The release upload set must be exported from `MANIFEST.sha256` manifest paths.
`agents-sdk/.venv`, `__pycache__`, test caches, local screenshots, raw archives,
and transient artifacts are excluded from the upload boundary. A sidecar clean
zip can be generated with `tools/clean_export.py`, but the zip itself is not an
upload-folder member.

The selected knowledge mode must be explicit:

- `compact_7_volume`: upload `agent_files/consolidated_knowledge/` as the
  compact Builder/Custom GPT style knowledge base.
- `expanded_corpus`: upload the broader multi-file corpus under
  `agent_files/`.

The selected mode must match `agent.yaml`, `MANIFEST.sha256`, clean zip
inventory, `UNIFIED_QC_RECEIPT.json`, and Builder UI evidence.

## Verification Contract

PASS requires:

- `MANIFEST.sha256` exists and covers packaged files except itself,
  `ZIP_RECEIPT.json`, and the sidecar clean archive;
- clean zip inventory equals manifest paths plus the allowed
  `MANIFEST.sha256` extra;
- source component manifests are preserved under `provenance/`;
- required target files are present;
- no obvious secret-bearing values are packaged;
- Horizon helper source compiles and its dry-run/validate/permission-boundary smoke passes;
- Horizon v0.2 receipt validator examples and negative tests pass;
- Agents SDK fallback installs editably and passes local unit tests without a
  live OpenAI call;
- the optional sidecar zip archive passes integrity if generated;
- post-upload Builder prompts pass in the UI.
