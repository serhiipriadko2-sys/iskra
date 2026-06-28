# Provenance Receipt

Context
: Package `iskra-workspace-agent-full-canon-synthesis-2026-06-27`.

Finding / Decision
: The package has three provenance classes:
  source archive, derived validator copy, and supplemental current-package
  support.

Evidence
: `SOURCE_ARCHIVE_INVENTORY.json`; `MANIFEST.sha256`; clean zip receipt;
  conflict originals when present.

Risk
: Supplemental files must not be described as coming from either zip archive.

Next
: Preserve this separation in Builder upload notes and live receipts.

Status
: provenance-recorded.

## Source Classes

- `canon_zip`: immutable canon source archive.
- `agent_files_zip`: Workspace Agent operational overlay archive.
- `derived_from_canon_zip_horizon`: root Horizon validator copy derived from
  the mounted canon source files.
- `current_package_supplement`: AGENTS/SECURITY/LICENSE/.gitattributes/icon and
  `agents-sdk/` fallback material.

Delta: source classes are explicit and auditable.
Data: archive hashes, file hashes, supplemental copy records.
Omega: 0.92 for local provenance.
Lambda: revise if any source is replaced or a conflict is introduced.
