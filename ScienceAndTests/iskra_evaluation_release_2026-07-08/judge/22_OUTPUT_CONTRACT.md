---
title: "Output Contract"
version: "v3.3-alpha.9-projects-p2"
file_index: 22
layer: "output"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 22 - OUTPUT CONTRACT

## Human-readable order

1. `RUN IDENTITY`
2. `EVALUATED OBJECT AND ESTIMAND`
3. `PACKAGE PROCESSING / INTEGRITY / SEAL`
4. `PRIMARY VERDICT`
5. `HARD GATES`
6. `CRITERION FINDINGS`
7. `Q/S/A/R/G VECTOR`
8. `COMPARISON`
9. `EVIDENCE TRACE`
10. `UNKNOWNS AND CONFLICTS`
11. `LIMITATIONS`
12. `JUDGE RELIABILITY`
13. `VALIDITY CLASS`
14. `REVALIDATION TRIGGER`
15. `RECEIPT`

## Result-status enum

Criterion and domain records use only:

```text
SCORED | UNKNOWN | UNSCORABLE | CONFLICTED | NOT_APPLICABLE | NOT_RUN
```

Use `coverage`, `limitations`, and `unknown_reason` for partial or insufficient evidence. Do not invent alternative status values.

`JudgeReliabilityProfile.status` is a separate namespace and may be `NOT_MEASURED`; it must not be copied into a criterion or domain result status.

## Verdict envelope

```yaml
run_id: RUN-...
protocol_version: v3.3-alpha.9-projects-p2
unit: SINGLE_RESPONSE
evaluated_object_refs: [OBJECT-...]
independence: I1_PROCESS_SEPARATED
blindness: NATURALISTIC_UNBLINDED
estimand: EST-...
claim_ceiling: L1
package:
  processing_status: VERIFIED
  integrity_status: PASS
  seal_status: LOGICAL_SEAL
  package_ref: PKG-...
primary_disposition: PROCEED_WITH_LIMITATIONS
eligibility: ELIGIBLE_WITH_LIMITATIONS
hard_gates: []
criterion_results: []
domain_vector:
  Q100: {score: null, coverage: 0, status: NOT_RUN}
  S100: {score: null, coverage: 0, status: NOT_RUN}
  A100: {score: null, coverage: 0, status: NOT_RUN}
  R100: {score: null, coverage: 0, status: NOT_RUN}
  G100: {score: null, coverage: 0, status: NOT_RUN}
C100: {score: null, status: NOT_ACTIVATED}
comparison: {status: NOT_REQUESTED, winner: null}
evidence_trace: []
unknowns: []
conflicts: []
limitations: []
judge_reliability:
  status: NOT_MEASURED
  unknown_reason: SAMPLE_INSUFFICIENT
validity_class: DIAGNOSTIC_ONLY
revalidation_trigger: "..."
receipt:
  authoritative: true
  package_ref: PKG-...
  protocol_version: v3.3-alpha.9-projects-p2
  evidence_refs: []
  writes_performed: []
  artifact_hashes: []
  verification_status: PASS | PARTIAL | FAIL
```

## Receipt boundary

A semantic receipt proves what the Judge checked and reported. It does not prove a cryptographic hash, file creation, GitHub write, database persistence, or live deployment unless a real tool performed the action and read-back evidence is included.

## Language constraints

- Findings first.
- Use `[FACT]`, `[INTERP]`, `[HYP]`, `[UNKNOWN]` when useful.
- Never hide `null` with prose.
- Formal winner must be exactly `null` when method is unavailable.
- Do not call a diagnostic index objective truth.
