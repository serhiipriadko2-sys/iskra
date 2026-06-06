# Iskra Agent Builder Upload Set

Release: `iskra-agent-builder-full-canon-dreamspace-2026-06-05-v2`

Purpose:

- Provide Agent Builder knowledge files for Iskra vOmega.7 Full Canon.
- Include the Dreamspace local `[HYP]` layer and command rules.
- Include runtime helper scripts for StateCycle, ShadowCore, Dreamspace, and turn hook.
- Preserve current memory receipts for governance continuity.

Important update in this package:

- `files_for_agent_builder/11_DREAMSPACE_LAYER.md` and `09_COMMAND_LIBRARY.md` now state:
  `Dream create MUST block unless all six required fields are explicitly present or the agent asks for the missing fields before creating the entry.`
- `agent_runtime_tools/iskra_statecycle.py` now has a safe fallback voice manifest when the canonical repo path `/workspace/iskra-main/packages/core/manifest/voices.json` is absent.

Upload guidance:

- Add `agent_files/files_for_agent_builder/*` as primary Builder instructions / knowledge.
- Add `agent_files/canon_source_files/*` as canon Source of Truth knowledge.
- Keep `agent_runtime_tools/*` as local runtime helpers if the environment supports file-backed scripts.
- Treat `memory_current/*` as continuity receipts, not immutable canon.

Verification:

- `MANIFEST.sha256` contains SHA-256 hashes for every packaged file except itself.
- Smoke check passed for turn hook with fallback voices.
- Smoke check passed for incomplete Dream create blocking before persistence.

Boundary:

- This package was created in workspace and exported as an upload set.
- It is not verified inside Agent Builder UI until uploaded and tested there.
