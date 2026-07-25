---
sigil: governance__guard_remediation_vertical_slice
layer: system
status: implementation-authorized
updated: 2026-07-25
authority: ADR-20260724-01
---

# Narrow Guard Remediation Vertical Slice — design candidate

**Status:** `implementation-authorized / test-first baseline`
**Repository:** `serhiipriadko2-sys/iskra`
**Evidence commit:** `3d57b25a45cd7842a9a238c1214cd24e25694316`

## Owner implementation authorization

- authorized: `true`
- authorized at: `2026-07-25`
- exact phrase: `Решение1. Да начинаем.`
- continuation confirmation: `Принял👌продолжай`
- first implementation slice: executable G01-G18 tests and CI workflow only
- production Guard/tokenizer behavior in first slice: unchanged

## 1. Objective

Replace the current path

```text
user input → asynchronous React metric patch → Policy/Guard reads previous render metrics
```

with

```text
user input + previous state + evidence
→ compute current-turn MetricSnapshot once
→ validate + derive only computable values
→ freeze + hash snapshot
→ EWS(snapshot_ref)
→ completeness/risk router
→ Guard(snapshot_ref) only when authoritative evaluation is possible
→ enforce outcome before provider/side effects
→ publish UI state from the same snapshot/adapter result
```

No Guard enum change is allowed.

## 2. Contracts

```typescript
type Completeness =
  | 'COMPLETE'
  | 'INCOMPLETE_NONBLOCKING'
  | 'INSUFFICIENT_BLOCKING';

type GuardStatus =
  | 'authoritative'
  | 'not_authoritative'
  | 'not_invoked';

interface GuardExecutionEnvelope {
  operation_id: string;
  action_risk: 'low' | 'medium' | 'high' | 'critical';
  risk_source_ref: string;
  metric_snapshot_ref: string | null;
  pre_guard_ews_ref: string | null;
  completeness: Completeness;
  missing_inputs: string[];
  unknown_rule_ids: string[];
  guard_status: GuardStatus;
  guard_decision: SloDecision | null;
  orchestration_decision: 'PROCEED' | 'FORCE_CRISIS' | 'CLOSE_HONESTLY';
  incomplete_telemetry: boolean;
  provider_execution_authorized: boolean;
  reasons: Array<{{ id: string; evidence_ref: string; detail: string }}>;
}
```

`orchestration_decision` and `guard_decision` are deliberately separate. `PROCEED` with `guard_status=not_authoritative` is not a Guard PASS.

## 3. Current-turn snapshot sequence

1. `ChatView` sends sanitized input to a single orchestrator method.
2. Orchestrator resolves `operation_id` and risk; callers cannot self-label risk.
3. Snapshot builder receives previous metrics/history plus current input/evidence.
4. Local keyword outputs, if retained, are marked `rubric_labeled` and never silently converted to observations.
5. Derived metrics are computed only when all operands exist.
6. Snapshot is deep-frozen and canonical-hashed.
7. React/UI state may be updated from the result, but Policy/EWS/Guard consume the frozen snapshot directly—not a future render prop.
8. EWS and Guard receive the same snapshot ref.

## 4. Completeness evaluator

Completeness is rule-dependency based:

```text
for each potentially outcome-changing Guard rule:
  evaluate MATCHED | NOT_MATCHED | NOT_EVALUABLE_MISSING | NOT_EVALUABLE_BOUNDARY
```

Aggregate:

- `COMPLETE`: every potentially outranking rule is evaluable.
- `INCOMPLETE_NONBLOCKING`: unknown rules cannot change the safe low-risk source-first outcome.
- `INSUFFICIENT_BLOCKING`: an unknown higher-priority rule may change the outcome.

Boundary uncertainty is not `WATCH` by itself.

## 5. Risk-aware routing

| Condition | Guard invocation | Envelope outcome |
|---|---:|---|
| security emergency | no numeric simulation required | `FORCE_CRISIS`, `guard_status=not_invoked` |
| COMPLETE | yes | final stable Guard decision, `guard_status=authoritative` |
| INCOMPLETE_NONBLOCKING + low-risk reversible | no | `PROCEED`, `guard_decision=null`, `guard_status=not_authoritative`, source-first |
| INSUFFICIENT_BLOCKING | no | `CLOSE_HONESTLY`, `guard_decision=null` |
| any incomplete + high/critical risk | no | `CLOSE_HONESTLY` |

## 6. Consumer enforcement

- `policyEngine` must not call numeric Guard without `metric_snapshot_ref`.
- `geminiService`/provider adapter must refuse network/provider execution when `provider_execution_authorized=false`.
- `CLOSE_HONESTLY` remains side-effect free.
- UI must display non-authoritative telemetry distinctly from an authoritative Guard result.
- audit records must include operation, risk source, snapshot ref, completeness, Guard status and decision separation.
- voice selector receives only advisory suggestions after Guard/Playbook constraints.

## 7. Minimal implementation diff candidate

- add typed `MetricSnapshot` builder/validator and canonical hash;
- add `GuardExecutionEnvelope` and completeness evaluator;
- refactor `ChatView`/service call to compute current-turn snapshot before provider execution;
- make `policyEngine` consume the envelope/snapshot instead of raw metrics props;
- remove authoritative use of `alertLevelProxy` and partial `chaos_overheat` proxy;
- add consumer authorization checks;
- do not change metric formulas in this atom.

## 8. Regression tests

G01. `{metrics:{}}`, low-risk reversible → Guard not invoked; orchestration `PROCEED`; `guard_status=not_authoritative`; provider allowed only by source-first policy.
G02. `{metrics:{}}`, high-risk → no provider call; `CLOSE_HONESTLY`.
G03. Security emergency with missing metrics → `FORCE_CRISIS` containment without numeric Guard simulation.
G04. Current input changes drift/chaos and the same-request snapshot reaches Policy/EWS/Guard.
G05. Previous render metrics cannot substitute for current snapshot.
G06. Snapshot is computed once; EWS and Guard refs are byte-identical.
G07. Mutation after freeze fails or yields a new snapshot/ref.
G08. Missing predicate is recorded as unknown, not false.
G09. Unknown higher-priority rule blocks high-risk execution.
G10. Candidate decision before stabilization cannot choose Playbook.
G11. Receipt chain `#1 → #2 → #3`; only final authoritative; no #4.
G12. Equal/lower alert floor never triggers recompute.
G13. `CLOSE_HONESTLY` path makes zero provider/token/eval/persistence calls.
G14. Metrics/StateCycle cannot finalize voice.
G15. Cyrillic/mixed entropy fixtures run at `packages/math`; runtime consumers use the same implementation.
G16. 19/20 normalized-token boundary.
G17. HFD/DFA insufficient data remains unavailable.
G18. Existing `iskra-metrics=PLANNED` registry state remains unchanged.

## 9. Rollout and rollback

- First stage is local/CI behavior with no live readiness claim.
- Dark-run without a real comparison engine is telemetry only.
- A rollback may restore compatibility adapters but may not restore silent fail-open.
- On remediation failure, retain the completeness fence and close high-risk operations honestly.
- Live activation requires immutable artifact/version receipt and read-back; repository merge alone is not deployment proof.

## 10. Out of scope

- phase-priority behavior repair;
- formula/tokenizer implementation changes;
- Supabase migration or live project changes;
- Skill packaging/promotion;
- threshold promotion from calibration to Guard authority.

## PASS/FAIL gate

**PASS for implementation start** only after Owner accepts ADR-20260724-01 and the test matrix.
**FAIL** if implementation conflates orchestration and Guard decisions, uses previous-render metrics, changes Guard enum, or reintroduces stand-ins.
