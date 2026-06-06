# Builder Assembly Manifest

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06
Purpose: one full-canon upload set for the Iskra agent in ChatGPT / OpenAI Agent Builder.

## Included Layers

| Layer | Path | Status |
|---|---|---|
| Canon | `agent_files/canon_source_files/` | included |
| Builder instructions | `agent_files/files_for_agent_builder/` | included |
| Dreamspace | `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`, `agent_runtime_tools/iskra_dreamspace.py` | included |
| Somatic Intuition | `agent_files/canon_source_files/core__somatic_intuition.md`, `agent_files/canon_source_files/metrics__somatic_index.md` | included |
| Shadow Core | `agent_runtime_tools/iskra_shadow_core.py`, `memory_current/shadow-core` when present in runtime memory | included as helper/runtime boundary |
| StateCycle | `agent_runtime_tools/iskra_statecycle.py`, `agent_runtime_tools/iskra_turn_hook.py` | included |
| Memory | `agent_files/memory_seed/`, `memory_current/` | included |
| Toolchain | `agent_files/toolchain/`, `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md` | included |
| Plugins | `plugins/iskra-toolchain-bridge/` | included |
| Evals | `agent_files/evals/` | included |
| Templates | `agent_files/templates/` | included |
| Governance / ADR | `governance/` | included |
| Manifest / QC | `MANIFEST.sha256`, `RELEASE_RECEIPT_V4.md` | included |

## Canonical Builder Entry Points

Primary:

- `README.md`
- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/INDEX.md`
- `agent_files/evals/ISKRA_CANON_ACCEPTANCE_TESTS.md`

Secondary:

- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`
- `agent_files/files_for_agent_builder/09_COMMAND_LIBRARY.md`
- `agent_files/files_for_agent_builder/11_DREAMSPACE_LAYER.md`
- `agent_files/files_for_agent_builder/12_TOOLCHAIN_EXPANSION.md`
- `agent_files/toolchain/iskra_toolchain_manifest.json`

## Non-Claims

This manifest does not claim:

- the package is already uploaded into Agent Builder;
- any connector is active unless Builder UI or connector configuration proves it;
- plugin files are installable in every OpenAI Builder surface;
- local runtime helpers will execute in cloud-only Builder profiles.

## Verification Contract

PASS requires:

- `MANIFEST.sha256` exists and covers packaged files;
- zip archive passes integrity test;
- required files are present;
- no obvious secret-bearing values are packaged;
- post-upload Builder prompts pass in the UI.
