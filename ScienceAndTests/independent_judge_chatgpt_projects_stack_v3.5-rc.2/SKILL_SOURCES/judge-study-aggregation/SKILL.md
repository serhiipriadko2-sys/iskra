---
name: judge-study-aggregation
description: Aggregate many evaluation runs into a study-level verdict (estimand L2/L3, e.g. the unified-1000 bank) under the Independent Judge protocol — stratified per-family aggregates, missingness rates, hard-failure propagation (never averaged into scores), descriptive effect sizes with descriptive intervals, swap_consistency across pairs, and claim-ceiling enforcement (benchmark-local L3 only, never model-family L5). Trigger when the judge must summarize a task bank, produce a study claim, compare candidates across a corpus, or compute study statistics. Requires EXT31 in the runtime slot when working inside the ChatGPT Project.
---

# Judge Study Aggregation

## Preconditions

- Every task has its own committed run (L1). Study never re-scores from scratch.
- Study header fixed: bank_ref, protocol_version, judge identity, run window, strata, claim_ceiling L3.

## Procedure

1. Collect per-run records (candidate label, stratum, domain scores, statuses, hard failures, lengths, swap outcomes).
2. Run `scripts/study_stats.py` for deterministic aggregates — do not hand-compute means.
3. Report per stratum and overall: n, n_valid, n_invalid (with reasons), domain means over aggregate-eligible SCORED runs only; hard-failed/invalid runs are excluded from means, missingness rate per criterion, hard-failure rate per candidate, descriptive deltas, swap_consistency.
4. Pairwise outcomes must come from committed comparison records, not be inferred from Q100 alone. Bootstrap intervals are DESCRIPTIVE — label `DESCRIPTIVE_INTERVAL`, never statistical confidence.
5. Claim ceiling: study supports L3 phrasing only. "Model X is better in general" → `EVI-004`/`PUB-001` BLOCK_PUBLICATION.
6. Study claim must carry: n, strata, window, judge identity, protocol version, failure rates, missingness rates, validity class.

## Script

```bash
python3 scripts/study_stats.py --runs runs.json
```

`runs.json`: list of {"task_id","stratum","candidate","domain_scores":{"Q100":..},"statuses":{...},"hard_failures":[...],"length":int}. See `references/runs_schema.md`.
