# ADR 2026-06-28 - Horizon v0.2 Receipt Layer

## Status

Accepted for the Agent Builder package mirror.

## Context

Horizon v0.1 can validate and describe local map-shift proposals, but it does
not preserve enough review metadata for uncomfortable or rejected proposals.
That gap creates two risks:

- useful disagreement can disappear when it fails first review;
- a dry-run Horizon proposal can be misread as permission to mutate live
  systems.

## Decision

Add a v0.2 local receipt layer with two record shapes:

- `HORIZON_PROPOSAL_EVENT`
- `REJECTED_HORIZON_REVIEW`

Both records must preserve boundary fields, operator-bias risk, evidence state,
review identity, and reopen triggers. Validation is strict and rejects unknown
fields, malformed identity values, malformed ADOML receipts, empty batches, and
live connector mutation language.

## Alternatives

- Keep v0.1 only. Rejected because it loses review pressure and operator-bias
  evidence.
- Let Horizon commit directly to canon or live tools. Rejected because Horizon
  is a map-shift proposal layer, not a governance or connector write channel.
- Preserve rejected ideas as free-form notes. Rejected because free-form notes
  are hard to deduplicate, validate, or reopen safely.

## Consequences

- Horizon can preserve rejected disagreement without pretending it is canon.
- Builder guidance must include full schema metadata when drafting receipts.
- Consolidated RAG volumes must include this ADR and the updated acceptance
  tests.
- Generated package receipts must be regenerated whenever v0.2 files change.

## Verification

- `python -m unittest discover -s tests/horizon`
- `python canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py canon/horizon/horizon_proposal_event.example.json canon/horizon/rejected_horizon_review.example.json`
- `python tools/consolidate_rag_knowledge.py`
- `python tools/generate_manifest.py`
- `python tools/clean_export.py --source manifest`

## Rollback Trigger

Rollback if v0.2 receipt validation is interpreted as permission for direct
canon mutation, silent ledger write, live security policy change, GitHub,
Supabase, Builder config, workflow, or runtime config mutation.
