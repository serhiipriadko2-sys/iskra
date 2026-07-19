# runs.json schema — v3.5-rc.3 fail-closed contract

`runs.json` MUST be a JSON array. Every element MUST be an object with all required fields below; absent fields are not defaulted.

```json
{
  "task_id": "T-001",
  "stratum": "reasoning",
  "candidate": "A",
  "run_status": "VALID",
  "aggregate_eligible": true,
  "invalid_reasons": [],
  "domain_scores": {"Q100": 80.0, "R100": null},
  "statuses": {"Q100": "SCORED", "R100": "UNSCORABLE"},
  "hard_failures": [],
  "length": 123,
  "pair_id": "PAIR-001",
  "pairwise_outcome": "A"
}
```

## Required fields and types

- `task_id`, `stratum`, `candidate`: non-empty strings.
- `run_status`: exactly `VALID` or `INVALID`.
- `aggregate_eligible`: JSON boolean, never a string or number.
- `invalid_reasons`, `hard_failures`: arrays of non-empty strings.
- `domain_scores`, `statuses`: objects keyed only by `Q100`, `S100`, `A100`, `R100`, `G100`, or `C100`.
- `length`: non-negative JSON integer.
- `pair_id`, `pairwise_outcome`: optional; if outcome exists, pair ID must exist.

## Result status and score constraints

Allowed statuses are `SCORED`, `UNKNOWN`, `UNSCORABLE`, `CONFLICTED`, `NOT_APPLICABLE`, and `NOT_RUN`. `C100` alone may use `NOT_ACTIVATED` with a null or absent score when no composite profile is active; that status is invalid for Q/S/A/R/G.

- `SCORED` requires a finite numeric score in `[0,100]`.
- All other statuses require `score=null` or no score key.
- `NaN`, `Infinity`, booleans, strings, and out-of-range values are invalid scores.
- Unknown status or domain values invalidate the record.

## Fail-closed aggregation

A record enters score means only when all schema checks pass, `run_status=VALID`, `aggregate_eligible=true`, and `hard_failures=[]`.

Missing fields, wrong types, invalid enums, non-finite/out-of-range scores, hard failures, or inconsistent eligibility metadata produce an invalid record. Invalid records remain visible in validation/failure reporting when attributable to a candidate, but never enter score means or pairwise outcomes.

`pairwise_outcome` is optional and must come from a committed comparison record; it must never be reconstructed from Q100 or another domain score.
