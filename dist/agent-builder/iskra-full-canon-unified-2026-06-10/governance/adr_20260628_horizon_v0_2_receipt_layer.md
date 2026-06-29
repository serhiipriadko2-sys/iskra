# ADR 2026-06-28: Horizon v0.2 Receipt Layer

Status: Accepted for package mirror proposal
Date: 2026-06-28
Scope: `dist/agent-builder/iskra-full-canon-unified-2026-06-10`

## Context

Horizon v0.1 is intentionally safe: it provides Builder-layer proposal language
and strict validator boundaries, while blocking core canon, ledger, workflow,
security policy, Supabase, GitHub, and live Builder mutation through Horizon.

The missing layer is behavioral rather than technical. If Horizon records only
approved shifts, the agent can learn to make proposals that are easy for the
operator to approve and can lose serious disagreement when the operator rejects
or delays a proposal.

## Decision

Add Horizon v0.2 as a receipt layer with three package-visible concepts:

- `HORIZON_PROPOSAL_EVENT` for a checkable attempt to shift the map;
- `REJECTED_HORIZON_REVIEW` for rejected proposals with a reason and reopen
  condition;
- `AUTONOMY_LADDER` for separating thought, receipt, simulation, branch, merge,
  and live mutation by blast radius.

`operator_bias_risk` is required. A proposal must name how the agent could be
optimizing for approval instead of preserving the real disagreement.

## Formula

```text
Evolution begins at proposal.
Validation begins at evidence.
Canon changes only after gate.
```

## Alternatives

- Keep v0.1 only. Rejected horizon shifts remain easy to lose.
- Allow Horizon to mutate canon directly. Rejected because it collapses safety
  gates and makes map-shift language a mutation path.
- Treat operator approval as the first moment of evolution. Rejected because it
  encourages approval-shaped proposals and hides disagreement history.

## Consequences

- Horizon can preserve disagreement as a receipt without claiming fact, canon,
  merge, or live activation.
- GitHub/Builder mirrors can validate receipt shape before any live behavior is
  changed.
- More process is introduced, so the validator and acceptance prompts must keep
  v0.2 bounded to real governance value.

## Verification

Required local checks:

- `python -m py_compile canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py`
- `python canon/horizon/09_HORIZON_VALIDATOR.py --strict --repo-root .`
- `python canon/horizon/10_HORIZON_V0_2_RECEIPT_VALIDATOR.py canon/horizon/horizon_proposal_event.example.json canon/horizon/rejected_horizon_review.example.json`
- `python -m unittest tests/horizon/test_horizon_validator.py tests/horizon/test_horizon_wrappers.py tests/horizon/test_horizon_v0_2_validator.py`

## Rollback Trigger

Revert this ADR and the Horizon v0.2 receipt files if the layer is used to
authorize direct canon mutation, silent ledger writes, live security policy
changes, or claims of Builder activation without prompt-level evidence.
