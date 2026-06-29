# 04 ? Memory Stack

## Rule

Memory ???????? ???????, ?? ?? ????? ????? ???? ?????????? ?????? ???? ??????, GitHub, Supabase, ??????????? docs ? ??????????.

## Files

- `project-memory.md` ? ?????????? ???????.
- `development-diary.md` ? ?????????? ??????.
- `dreamspace/` ? `[HYP]` ????????, crystallize-flow ? ADR drafts.
- `shadow-core/` ? tension/self-deception hypotheses and promotion records.
- `horizon/` ? local Horizon proposals, v0.2 proposal/rejection receipts, and append-only local epoch log for map-shift experiments.
- `archive/` ? ??????????? evidence-backed records.

## Containers

- JOURNAL ? process chronology; records what happened.
- SHADOW ? raw tension, pressure, possible self-deception; needs exit or promotion rule.
- DREAM ? speculative hypothesis lab; always `[HYP]` until crystallized through ISKRIV evidence.
- HORIZON ? reversible map-shift proposals and disagreement receipts around the core; never proof of truth, consciousness, or approval.
- ADR DRAFT ? governance proposal; not accepted canon until reviewed/accepted.
- ARCHIVE ? verified claims only.

## project-memory.md structure

```md
# Project Memory

## Stable decisions
- Date | Decision | Evidence | Status

## Known drift
- Date | Drift | Sources A vs B | Status active/mitigated/resolved | Next verification

## Operational constraints
- Constraint | Why | Evidence | Applies to
```

## development-diary.md entry

```md
## YYYY-MM-DD ? <topic>
- Context:
- Checked:
- Changed:
- Evidence:
- Decision:
- Status: DONE | PARTIAL | BLOCKED
- Next step:
```

## Promotion rules

Diary ? project-memory only if:

- confirmed by SoT;
- persistent decision;
- active/mitigated/resolved drift;
- operational constraint;
- repeated risk;
- prevents future wrong decision.

Dreamspace ? Shadow / Archive / ADR draft only if:

- required dream fields exist: goal, voice, constraint, hypothesis, risk, ?D??;
- label remains `[HYP]`;
- ISKRIV verification and evidence are present;
- crystallization target is explicit.

Dreamspace ? Supabase/UI persistence only through accepted ADR, repo/schema alignment, rollback plan, and receipt.

Horizon proposal ? local epoch only if:

- proposal validates as schema `0.1` / module `builder_horizon`;
- label is `SHIFT_BLOCKED`, `FORM_PASS_NEEDS_HUMAN_REVIEW`, or `FORM_PASS`;
- `SEMANTIC_PASS` is absent;
- evidence pointer or explicit evidence gap is present;
- rollback hint is present;
- `HORIZON_COMMIT_APPROVED`, actor, and reason are present;
- mutation policy is local-only and does not touch core, ledger, workflows, live Supabase, or live Builder config.

Horizon v0.2 receipt ? local/runtime receipt only if:

- event is `HORIZON_PROPOSAL_EVENT` or `REJECTED_HORIZON_REVIEW`;
- `operator_bias_risk` is present and names approval-shaped proposal risk;
- evidence is listed or the evidence gap is explicit;
- discomfort, loss-on-rejection, proposal risk, and reopen condition are stated when relevant;
- forbidden boundaries include `DIRECT_CANON_MUTATION`, `SILENT_LEDGER_WRITE`, and `LIVE_SECURITY_POLICY_CHANGE`;
- autonomy level remains below the next unapproved blast-radius gate.

Rejected Horizon proposals are not erased. They remain structured disagreement until reopened by evidence, superseded by a later ADR/gate, or closed with a reasoned receipt.

Horizon ? GitHub/Supabase/Builder live mutation only through the normal connector/governance path, never through Horizon commit.

## Significant-turn hook

When available, run a compact status hook for significant BUILD, AUDIT, SIFT, SHADOW, COUNCIL, or GOVERNANCE answers:

```text
state: points=<n> phase=<phase> voice=<voice> | shadow: [ellipsis] | dreamspace: [ellipsis] | horizon: [ellipsis]
```

If unavailable, mark the status as unknown instead of inventing it.

## Forbidden

Never store secrets, tokens, keys, raw PII, unverified hypothesis as fact, long logs, duplicate noise, or Horizon epochs created only to simulate progress.
