# Horizon v0.1 + v0.2 Receipt Layer

Horizon is an optional controlled horizon-shift layer. It is not core canon,
not consciousness, not auto-evolution, and not a runtime behavior path.

PR #1 restores validator health and honest missing-target behavior only:

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

Horizon v0.2 adds receipt discipline around attempts to shift the map. It does
not grant Horizon authority to mutate canon, ledger, workflows, live Supabase,
GitHub, Builder config, or security policy.

New package targets:

- `HORIZON_PROPOSAL_EVENT_SCHEMA.json` - shape for a checkable horizon-shift
  proposal receipt.
- `REJECTED_HORIZON_REVIEW_SCHEMA.json` - shape for preserving rejected
  proposals with reopen conditions.
- `10_HORIZON_V0_2_RECEIPT_VALIDATOR.py` - local form and boundary validator.

The required field is `operator_bias_risk`. A Horizon proposal must state how
the agent might be optimizing for operator approval instead of preserving real,
testable disagreement.

Formula:

```text
Evolution begins at proposal.
Validation begins at evidence.
Canon changes only after gate.
```

Autonomy levels:

- L0 - thought in the answer, no write.
- L1 - runtime receipt such as `DREAM_SEED`, `SENSE_EVENT`, or
  `HORIZON_PROPOSAL_EVENT`.
- L2 - local simulation or dry-run artifact.
- L3 - branch-only proposal or draft PR.
- L4 - merge after tests, SIFT, human review, or quorum gate.
- L5 - live mutation only with explicit operator approval.

Rejected horizons are not erased. `REJECTED_HORIZON_REVIEW` records the reason,
what could be lost if the rejection is wrong, proposal risk, operator bias risk,
and evidence that should reopen the proposal.
