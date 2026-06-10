# 04 · Memory Stack

## Rule

Memory помогает помнить, но не имеет права быть источником истины выше файлов, GitHub, Supabase, официальных docs и артефактов.

## Files

- `project-memory.md` — устойчивые решения.
- `development-diary.md` — инженерный журнал.
- `dreamspace/` — `[HYP]` гипотезы, crystallize-flow и ADR drafts.
- `shadow-core/` — tension/self-deception hypotheses and promotion records.
- `horizon/` — local Horizon proposals and append-only local epoch log for map-shift experiments.
- `archive/` — завершённые evidence-backed records.

## Containers

- JOURNAL — process chronology; records what happened.
- SHADOW — raw tension, pressure, possible self-deception; needs exit or promotion rule.
- DREAM — speculative hypothesis lab; always `[HYP]` until crystallized through ISKRIV evidence.
- HORIZON — reversible map-shift proposals around the core; never proof of truth or consciousness.
- ADR DRAFT — governance proposal; not accepted canon until reviewed/accepted.
- ARCHIVE — verified claims only.

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
## YYYY-MM-DD — <topic>
- Context:
- Checked:
- Changed:
- Evidence:
- Decision:
- Status: DONE | PARTIAL | BLOCKED
- Next step:
```

## Promotion rules

Diary → project-memory only if:

- confirmed by SoT;
- persistent decision;
- active/mitigated/resolved drift;
- operational constraint;
- repeated risk;
- prevents future wrong decision.

Dreamspace → Shadow / Archive / ADR draft only if:

- required dream fields exist: goal, voice, constraint, hypothesis, risk, ∆DΩΛ;
- label remains `[HYP]`;
- ISKRIV verification and evidence are present;
- crystallization target is explicit.

Dreamspace → Supabase/UI persistence only through accepted ADR, repo/schema alignment, rollback plan, and receipt.

Horizon proposal → local epoch only if:

- proposal validates as schema `0.1` / module `builder_horizon`;
- label is `SHIFT_BLOCKED`, `FORM_PASS_NEEDS_HUMAN_REVIEW`, or `FORM_PASS`;
- `SEMANTIC_PASS` is absent;
- evidence pointer or explicit evidence gap is present;
- rollback hint is present;
- `HORIZON_COMMIT_APPROVED`, actor, and reason are present;
- mutation policy is local-only and does not touch core, ledger, workflows, live Supabase, or live Builder config.

Horizon → GitHub/Supabase/Builder live mutation only through the normal connector/governance path, never through Horizon commit.

## Significant-turn hook

When available, run a compact status hook for significant BUILD, AUDIT, SIFT, SHADOW, COUNCIL, or GOVERNANCE answers:

```text
state: points=<n> phase=<phase> voice=<voice> | shadow: ... | dreamspace: ... | horizon: ...
```

If unavailable, mark the status as unknown instead of inventing it.

## Forbidden

Never store secrets, tokens, keys, raw PII, unverified hypothesis as fact, long logs, duplicate noise, or Horizon epochs created only to simulate progress.
