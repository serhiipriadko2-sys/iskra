# Horizon v0.2

Horizon is an optional controlled horizon-shift layer. It is not core canon,
not consciousness, not auto-evolution, and not a runtime behavior path.

## v0.1 baseline

- `canon/horizon/09_HORIZON_VALIDATOR.py` exists and validates the minimal
  Horizon contract plus proposal schema.
- `tools/horizon_validator.py` is strict by default.
- `tools/horizon_weaver.py` is also strict by default, but the canonical Weaver
  body is intentionally unavailable until PR #2.
- `--optional` remains an explicit local/manual escape hatch for degraded
  snapshots.

This PR does not implement Horizon weaving. The validator has a canonical target
and strict default; the Weaver remains intentionally unavailable in strict mode
until the follow-up implementation PR.

Out of scope for v0.1 PR #1:

- no `09_HORIZON_WEAVER.py`;
- no `horizon_epoch_log.jsonl`;
- no commit path;
- no entropy or full-density guards;
- no graph or runtime mutations;
- no ritual generation.

## v0.2 receipt layer

Horizon v0.2 adds a local receipt layer for proposal/rejection records:

- `HORIZON_PROPOSAL_EVENT_SCHEMA.json`
- `REJECTED_HORIZON_REVIEW_SCHEMA.json`
- `10_HORIZON_V0_2_RECEIPT_VALIDATOR.py`
- `horizon_proposal_event.example.json`
- `rejected_horizon_review.example.json`

The v0.2 layer exists to preserve evidence gaps, operator-bias risk, rejected
alternatives, and reopen conditions. It does not grant Horizon authority to
change GitHub, Supabase, Agent Builder config, workflows, ledger, security
policy, or canon.

Strict validator expectations:

- proposal IDs match `HORIZON-PROP-YYYYMMDD-NNN`;
- rejected-review IDs match `RHR-YYYYMMDD-NNN`;
- UTC timestamps use `YYYY-MM-DDTHH:MM:SSZ`;
- `linked_adr` points to `governance/adr_YYYYMMDD_slug.md`;
- unknown receipt fields fail;
- empty receipt batches fail;
- `adoml.delta`, `adoml.D`, and `adoml.lambda` are non-empty strings;
- `adoml.omega` is a number from 0 to 1 and booleans are rejected;
- live connector mutation language in proposal action fields fails.
