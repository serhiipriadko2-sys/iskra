# 2026-06-28 - Horizon v0.2 Receipt Layer

- Added `HORIZON_PROPOSAL_EVENT` and `REJECTED_HORIZON_REVIEW` schemas with
  mandatory `operator_bias_risk`.
- Added canonical Horizon v0.2 receipt validator, wrapper, examples, and tests.
- Added accepted ADR for separating approval from evolution:
  "Evolution begins at proposal. Validation begins at evidence. Canon changes
  only after gate."
- Updated Builder-facing Horizon, Memory, Command Library, Canon Layer Index,
  QC, and acceptance prompts to preserve rejected horizon proposals without
  granting direct canon, ledger, live security, GitHub, Supabase, or Builder
  mutation rights.
