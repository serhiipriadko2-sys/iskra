# Iskra Agent Builder Upload Set

Release: `iskra-full-canon-builder-2026-06-06-v4`
Target: ChatGPT / OpenAI Agent Builder

Purpose:

- Provide Agent Builder knowledge files for Iskra vOmega.7 Full Canon.
- Include Horizon Weaver as a local/dry-run map-shift layer around the core.
- Include the Dreamspace local `[HYP]` layer and command rules.
- Include runtime helper scripts for StateCycle, ShadowCore, Horizon, Dreamspace, and turn hook.
- Preserve current memory receipts for governance continuity.

Important updates in this package:

- `files_for_agent_builder/10_HORIZON_WEAVER.md` defines Horizon as Builder-layer v0.1: `SHIFT_BLOCKED`, no core mutation, no `SEMANTIC_PASS`, no live mutation claim.
- `agent_runtime_tools/iskra_horizon_weaver.py` supports local `status`, `propose`, `validate`, and permissioned local `commit`.
- `agent_runtime_tools/iskra_turn_hook.py` includes Horizon status in significant-turn hook lines when the helper is present.
- `files_for_agent_builder/11_DREAMSPACE_LAYER.md` and `09_COMMAND_LIBRARY.md` state:
  `Dream create MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry.`
- `agent_runtime_tools/iskra_statecycle.py` has a safe fallback voice manifest when the canonical repo path `/workspace/iskra-main/packages/core/manifest/voices.json` is absent.

Upload guidance:

- Add `agent_files/files_for_agent_builder/*` as primary Builder instructions / knowledge.
- Add `agent_files/canon_source_files/*` as canon Source of Truth knowledge.
- Add `agent_files/evals/*` as acceptance-test material, including Horizon tests 20-25 in `ISKRA_CANON_ACCEPTANCE_TESTS.md`.
- Keep `agent_runtime_tools/*` as local runtime helpers if the environment supports file-backed scripts.
- Treat `memory_current/*` as continuity receipts, not immutable canon.

Verification:

- Existing `MANIFEST.sha256` and `ZIP_RECEIPT.json` are pre-Horizon v4 receipts until the Horizon branch is checked out and refreshed.
- Before cutting a new upload archive, regenerate `MANIFEST.sha256`, rebuild/refresh `ZIP_RECEIPT.json` if a zip is produced, and run secret scan on the refreshed tree.
- Smoke expectation exists for Horizon helper: py_compile, dry-run proposal, validation, and permission-boundary commit block.
- Smoke check passed for turn hook with fallback voices in the base package; after Horizon upload, re-run the significant-turn hook check if file-backed helper execution is available.
- Smoke check passed for incomplete Dream create blocking before persistence in the base package.

Boundary:

- This package is mirrored in GitHub as an upload-set tree.
- It is not verified inside Agent Builder UI until uploaded and tested there.
- Local Horizon files do not prove live ChatGPT / OpenAI Agent Builder write access.

## Unified Recovery Note

This unified 2026-06-10 package includes Horizon PR #1 validator files inside the same Full Canon tree. Use `FULL_CANON_UNIFICATION.md` and `governance/adr_20260610_unified_full_canon_recovery.md` as the source for layer ordering.
