# Builder Assembly Manifest

Release: `iskra-full-canon-unified-2026-06-10`
Date: 2026-06-10
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
| Builder instructions | `agent_files/files_for_agent_builder/` | included |
| Horizon Weaver | `agent_files/files_for_agent_builder/10_HORIZON_WEAVER.md`, `agent_runtime_tools/iskra_horizon_weaver.py` | included as Builder-layer v0.1 |
| Dreamspace | `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`, `agent_runtime_tools/iskra_dreamspace.py` | included |
| Somatic Intuition | `agent_files/canon_source_files/core__somatic_intuition.md`, `agent_files/canon_source_files/metrics__somatic_index.md` | included |
| Shadow Core | `agent_runtime_tools/iskra_shadow_core.py` | included |
| StateCycle | `agent_runtime_tools/iskra_statecycle.py`, `agent_runtime_tools/iskra_turn_hook.py` | included |
| Memory | `agent_files/memory_seed/`, `agent_files/memory_current/` | included |
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
- `agent_files/toolchain/iskra_toolchain_manifest.json`
- `plugins/iskra-toolchain-bridge/RUNTIME_RECEIPT.md`
- `plugins/iskra-toolchain-bridge/runtime-smoke-receipt.json`

## Non-Claims

This manifest does not claim:

- the package is already uploaded into Agent Builder;
- any connector is active unless Builder UI or connector configuration proves it;
- Horizon can mutate Builder/GitHub/Supabase/live systems by itself;
- Horizon proves consciousness, semantic truth, or auto-evolution;
- plugin files are installable in every OpenAI Builder surface;
- local runtime helpers will execute in cloud-only Builder profiles.
- Codex app installation has not been verified while `codex.exe` is blocked by
  `Access is denied`.
- this package mirrors the entire repository byte for byte.
- sidecar zip creation proves Builder UI verification.

## Clean Export Gate

The upload set must be exported from `MANIFEST.sha256` or tracked package files.
`agents-sdk/.venv`, `__pycache__`, test caches, local screenshots, raw archives,
and transient artifacts are excluded from the upload boundary. A sidecar clean
zip can be generated with `tools/clean_export.py`, but the zip itself is not an
upload-folder member.

## Verification Contract

PASS requires:

- `MANIFEST.sha256` exists and covers packaged files except itself,
  `ZIP_RECEIPT.json`, and the sidecar clean archive;
- source component manifests are preserved under `provenance/`;
- required target files are present;
- no obvious secret-bearing values are packaged;
- Horizon helper source compiles and its dry-run/validate/permission-boundary smoke passes;
- Agents SDK fallback installs editably and passes local unit tests without a
  live OpenAI call;
- the optional sidecar zip archive passes integrity if generated;
- post-upload Builder prompts pass in the UI.
