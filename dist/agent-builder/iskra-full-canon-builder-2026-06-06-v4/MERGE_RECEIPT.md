# Merge Receipt

Release: `iskra-full-canon-builder-2026-06-06-v4`
Date: 2026-06-06

## Context

The Agent Builder package had two source upload sets:

- `iskra-full-canon-dreamspace-2026-06-05-v2`
- `iskra-toolchain-upload-set-v2-2026-06-06`

The goal was to make one materialized Builder directory without losing source
content or provenance.

The final v4 package also includes repository-level governance and security
source files that were required by the full-canon Builder manifest:

- `governance/`
- `SECURITY.md`

## Finding

The source sets had 96 total source files before conflict/provenance expansion:

- Dreamspace source files: 81.
- Toolchain source files: 15.
- Relative path overlaps: 2.

## Conflict Resolution

The two overlaps were:

- `agent_files/files_for_agent_builder/00_AGENT_BUILDER_SETUP.md`
- `agent_files/files_for_agent_builder/05_CONNECTORS_AND_TOOLS.md`

The target uses the toolchain versions because they include the base policy and
append the toolchain expansion. Exact source versions are preserved under:

- `provenance/conflict-originals/dreamspace/`
- `provenance/conflict-originals/toolchain/`

## Evidence

- Component manifests are preserved under `provenance/component-manifests/`.
- Toolchain source README is preserved under `provenance/source-readmes/`.
- Repository governance files are copied under `governance/`.
- Repository security policy is copied as `SECURITY.md`.
- The final target manifest is `MANIFEST.sha256`.
- QC status is recorded in `QC_CHECKS.md`.

## Risk

Builder UI behavior is still unverified. A repository-side package proves file
presence and packaging only. It does not prove that ChatGPT / OpenAI Agent
Builder activated these files.

## Next

Upload the v4 package into Builder and run Dreamspace, Somatic, memory, and
toolchain acceptance prompts.

## Status

`created in workspace`; Builder UI verification pending.
