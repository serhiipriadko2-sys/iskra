# 2026-06-28 - Horizon v0.2 Receipt Layer

## Added

- `HORIZON_PROPOSAL_EVENT` and `REJECTED_HORIZON_REVIEW` schemas.
- Canonical v0.2 receipt validator and wrapper.
- Example proposal and rejected-review receipts.
- Unit tests for malformed records, malformed identity fields, unknown fields,
  empty batches, ADOML contents, forbidden boundaries, and live mutation text.

## Changed

- Horizon Builder guidance now includes full v0.2 receipt metadata.
- Canon Layer Index restores Sense/Dream rows while adding Horizon v0.2.
- Consolidated RAG governance and eval volumes include the v0.2 ADR and tests.

## Boundary

This change is package-local. It does not upload to Builder, mutate live
Workspace Agent configuration, change Supabase, or authorize GitHub/workflow
mutation through Horizon.
