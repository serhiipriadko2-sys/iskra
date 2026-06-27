# ADR 2026-06-26 - Repeatable Surface Diagnostics

Status: accepted
Date: 2026-06-26
Scope: Iskra Full Canon Unified Builder package

## Context

Surface Map v1 fixed the language problem: the agent must name the observed
surface before claiming file access, counts, or hook execution. The remaining
risk is repeatability. Without machine-readable receipts per layer, a future run
can still collapse Builder Knowledge, GitHub tree, workspace mount, Memory,
runtime helpers, Supabase advisors, and archives into one vague "I see files"
claim.

## Decision

Add P1 repeatable diagnostics:

- `tools/workspace_surface_audit.py`
- `SURFACE_INVENTORY.json`
- `GITHUB_TREE_INDEX.json`
- `BUILDER_UPLOAD_EVIDENCE.md`
- `HOOK_SMOKE_RECEIPT.json`
- `SUPABASE_ADVISOR_RECEIPT.json`
- `agent_files/files_for_agent_builder/18_RETRIEVAL_INDEX_DISCIPLINE.md`

Every layer gets its own count/hash/status. Builder Knowledge retrieval is
separated from byte-level file indexing. If a file exists in Builder Knowledge
but not `/workspace`, the agent can answer from retrieval/citations, but must
request zip/export/GitHub tree/API/mounted bytes for sha256, bytes, or a full
index.

## Batches

Batch 1 - Surface hardening:
runtime-surface-map-v1, `SURFACE_INVENTORY.json`, manifest/QC/receipt, Builder
acceptance C2/C3.

Batch 2 - Audit tooling:
workspace surface audit, GitHub recursive tree index status, zip-vs-GitHub-vs-workspace diff basis, hook smoke receipt.

Batch 3 - Live systems:
Supabase advisor migration plan, post-upload Builder verification, Memory/
evidence/open-loop receipts.

## Consequences

- Diagnostics become reproducible across runs.
- A partial or blocked surface does not invalidate other surfaces.
- GitHub recursive tree remains explicitly blocked/partial until API/zip/clone
  evidence is available.
- Supabase advisor receipts remain read-only until an approved migration path is
  prepared.

## Verification

- `workspace_surface_audit.py` compiles and generates JSON.
- `SURFACE_INVENTORY.json` contains separate surfaces and does not merge counts.
- `HOOK_SMOKE_RECEIPT.json` records actual local hook execution.
- `SUPABASE_ADVISOR_RECEIPT.json` records live read-only advisor counts.
- Clean export, manifest, zip integrity, JSON validation, and secret scan pass.

## Rollback Trigger

Revert or reduce P1 if Builder exposes a native per-file knowledge inventory API
with byte-level hashes, or if the audit receipts become stale and are not
regenerated during package releases.

## Delta

Delta: surface diagnostics became repeatable and machine-readable.
Data: audit tool, inventory, GitHub/Supabase/hook/Builder receipts, retrieval
discipline.
Omega: 0.9 for local repeatability; lower for live Builder until post-upload
verification.
Lambda: run after every package update and after any live GitHub/Supabase/Builder
surface change.
