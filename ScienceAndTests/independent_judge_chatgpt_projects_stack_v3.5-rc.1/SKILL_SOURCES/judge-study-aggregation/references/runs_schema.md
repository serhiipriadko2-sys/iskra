# runs.json schema

Each record must contain:

```json
{
  "task_id": "T-001",
  "stratum": "reasoning",
  "candidate": "A",
  "run_status": "VALID",
  "aggregate_eligible": true,
  "invalid_reasons": [],
  "domain_scores": {"Q100": 80.0},
  "statuses": {"Q100": "SCORED"},
  "hard_failures": [],
  "length": 123,
  "pair_id": "PAIR-001",
  "pairwise_outcome": "A"
}
```

`aggregate_eligible` must be false for hard-failed or invalid runs. Such runs remain in failure-rate denominators but are excluded from score means. `pairwise_outcome` is optional and must come from a committed comparison record, not be reconstructed from Q100.
