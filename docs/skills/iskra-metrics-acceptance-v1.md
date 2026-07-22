# Iskra Metrics Owner · Acceptance Contract v1

Status: `PROPOSED_ACCEPTANCE_ONLY`
Target skill: `iskra-metrics`
Current registry status: `PLANNED`

## Promotion boundary

Do not create, install, activate, or route new work to `iskra-metrics` until every gate below passes. Until then:

- `metric-runner` remains the deterministic calculation owner;
- `iskra-metrics-evaluator` remains a transition alias in registry-v1;
- no metric value may be invented when inputs or methods are missing.

## Required capabilities

1. **Calculation:** deterministic formulas for declared derived metrics.
2. **Interpretation:** explain meaning without treating metrics as canon, diagnosis, or hidden psychology.
3. **Provenance:** every value carries inputs, method, source refs, observation time, and missing inputs.
4. **Missingness:** unavailable inputs produce `null/unavailable`, never a plausible stand-in.
5. **Threshold scope:** distinguish accepted thresholds from calibration hypotheses.
6. **Truth boundary:** metrics advise EWS/Guard; they do not select Voice or authorize writes.
7. **Surface boundary:** repository formula, live snapshot, rubric label, and user-provided number remain distinct.

## Acceptance tests

| ID | Test | PASS criterion |
|---|---|---|
| M01 | Exact formula | Same inputs produce byte-stable numeric output and formula trace. |
| M02 | Missing operand | Result is unavailable with named missing inputs; no number is fabricated. |
| M03 | Range validation | Out-of-range input fails closed with field-level error. |
| M04 | Provenance | Every output records status, method, source, observed-at, and confidence in measurement. |
| M05 | Baseline requirement | Delta/baseline metrics refuse computation without a named compatible baseline. |
| M06 | Temporal sufficiency | HFD/DFA/entropy checks enforce minimum sample sizes and return unavailable below them. |
| M07 | Threshold authority | Calibration hypotheses are not presented as universal or Guard-forcing facts. |
| M08 | Voice boundary | Metrics may suggest pressure but cannot select authoritative Voice. |
| M09 | Alias parity | Representative `metric-runner` and evaluator requests route to the new owner with no output loss. |
| M10 | Regression corpus | A fixed fixture bank passes with no formula, missingness, or provenance regression. |
| M11 | Package integrity | Skill validator, package build, manifest, bytes, and SHA-256 receipt pass. |
| M12 | Security | No secret input is persisted or echoed; no executable expression evaluation is introduced. |

## Promotion decision

Promotion requires:

```text
all M01–M12 PASS
+ owner acceptance
+ registry update
+ package receipt
+ prompt-level routing test
```

`accepted ≠ installed ≠ invoked ≠ verified-live`.

## Rollback

Keep `metric-runner` active until one release after verified routing. Revert registry ownership if any deterministic or provenance regression appears.
