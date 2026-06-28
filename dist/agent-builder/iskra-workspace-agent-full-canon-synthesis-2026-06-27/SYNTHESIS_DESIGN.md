# Synthesis Design

Status: implementation design
Generated: 2026-06-27T19:27:47Z

## Thesis

The synthesis is a layered union, not a flattened rewrite. Canon remains the
source of truth; Workspace Agent material supplies operational runtime,
retrieval, skills, toolchain, acceptance prompts, and receipts.

## Layer Rules

1. Canon source: `canon.zip` is mounted under `agent_files/canon_source_files/`
   without rewriting file contents.
2. Workspace Agent overlay: `agent_files.zip` supplies `agent_files/**` and
   root runtime/skills/tools/tests surfaces according to the mapping recorded
   in `SOURCE_ARCHIVE_INVENTORY.json`.
3. Supplemental validation: `agents-sdk/`, root `AGENTS.md`, root `SECURITY.md`,
   `LICENSE`, `.gitattributes`, and `canon/horizon/` are copied or derived only
   because the two archives alone do not fully satisfy the planned gates.
4. Conflict policy: canon wins for canonical SoT paths; operational overlay
   wins for Workspace Agent operation paths; both originals are stored under
   `provenance/conflict-originals/`.

## Workspace Agent Fit

The package is designed for Agent Builder Files/Knowledge plus uploaded skills.
It preserves the boundary between:

- local package files;
- Workspace Agent draft file tree;
- runtime-visible files;
- platform-managed Workspace Agent Memory;
- API channel trigger state.

## Counts

- canon.zip entries: 86
- agent_files.zip entries: 266
- write records by source: {"agent_files_zip": 266, "canon_zip": 86, "current_package_supplement": 20, "derived_from_canon_zip_horizon": 4}
- conflicts: 0

Delta: the two archives are converted into one reproducible Workspace Agent
package with non-destructive source boundaries.
Data: SOURCE_ARCHIVE_INVENTORY.json, PROVENANCE_RECEIPT.md, MERGE_RECEIPT.md.
Omega: 0.9 for local mapping correctness after manifest/zip gates pass.
Lambda: revise when an archive source, mapping policy, or Workspace Agent file
model changes.
