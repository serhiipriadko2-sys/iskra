# Merge Receipt

Context
: Build a single ChatGPT Workspace Agent package from `canon.zip` and
  `agent_files.zip`.

Finding / Decision
: Canon content is preserved under `agent_files/canon_source_files/`. Workspace
  Agent operational content is overlaid into `agent_files/**` and root runtime
  surfaces. Supplemental material is separately labeled.

Evidence
: `SOURCE_ARCHIVE_INVENTORY.json` records every source archive entry, target
  path, byte count, and SHA256. Manifest, surface inventory, and clean zip
  receipts are generated after assembly.

Risk
: Local package readiness is not live Builder verification. Supplemental
  `agents-sdk/` and derived `canon/horizon/` are not source-archive parity.

Next
: Run local gates, create clean zip, then request separate approval before any
  Workspace Agent upload/publish.

Status
: packaged-as-upload-set; verified-live-builder not claimed.

Delta: archive union materialized with provenance and non-claims.
Data: canon.zip (86), agent_files.zip (266), build records.
Omega: 0.9 after local QC gates pass.
Lambda: revise on conflict, missing file, live upload, or docs drift.
