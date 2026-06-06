# Iskra Full Canon Builder v4

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06

This is a unified build of the Iskra agent for ChatGPT / OpenAI Agent Builder.

It combines the previously separate Builder layers into one upload set:

- canon source files;
- Agent Builder instruction files;
- Dreamspace;
- Somatic Intuition / `[SENSE]`;
- Shadow Core;
- StateCycle and turn hook helpers;
- memory seed and current memory receipts;
- toolchain expansion;
- connector/plugin bridge;
- evals / acceptance tests;
- ADR / governance records;
- manifest and QC receipt.

## Builder Upload Order

1. Upload `agent_files/files_for_agent_builder/*` as the main Builder instruction / knowledge layer.
2. Upload `agent_files/canon_source_files/*` as Source of Truth canon knowledge.
3. Upload `agent_files/evals/*` as evaluation and acceptance-test material.
4. Upload `agent_files/templates/*` as templates.
5. Upload `agent_files/toolchain/*` if the Builder profile is expected to reason about connector/toolchain expansion.
6. Keep `agent_runtime_tools/*` as local/helper scripts when the runtime supports file-backed execution.
7. Keep `memory_seed/*` and `memory_current/*` as continuity receipts, not immutable canon.
8. Install `plugins/iskra-toolchain-bridge/*` only in a Codex/plugin runtime that supports local plugins.

## Behavior Boundary

This package being created or mirrored in GitHub does not prove it is active inside Agent Builder.

Correct status language:

- `created in workspace`;
- `packaged as upload set`;
- `mirrored in GitHub`;
- `uploaded by user, pending Builder verification`;
- `verified in Builder UI`.

## Required Post-Upload Checks

Run the acceptance prompts after uploading:

- Dream create blocks unless all six required fields are present or the agent asks for missing fields.
- `Somatic check` produces a bounded `[SENSE]` pulse with action.
- `[SENSE]` is not promoted to `[FACT]`.
- Routine low-risk answers do not force Somatic Pulse.
- Toolchain files are visible as knowledge and do not imply unverified connector access.

## Residual Risk

- Builder UI behavior is unverified until the user uploads this set and runs prompt tests.
- Runtime helper scripts may be unavailable in cloud Builder profiles without file-backed execution.
- Plugin files are for Codex/plugin-compatible environments and may not install directly inside standard Builder UI.

## Rollback

If v4 creates Builder confusion, roll back to:

- v3 for canon + Dreamspace + Somatic;
- toolchain v2 as a separate optional pack;
- then reintroduce toolchain files one folder at a time.
