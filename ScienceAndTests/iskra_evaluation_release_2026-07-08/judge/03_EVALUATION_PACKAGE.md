---
title: "Evaluation Package Contract"
version: "v3.3-alpha.9-projects-p2"
file_index: 03
layer: "input-contract"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 03 · EVALUATION PACKAGE

## Назначение

Evaluation Package — immutable input artifact для одного или нескольких runs. Judge не оценивает «систему вообще»; он оценивает объявленный estimand в рамках конкретного contract.

## Минимальная структура

```yaml
evaluation_package:
  package_id: PKG-...
  protocol_version: v3.3-alpha.9-projects-p2
  processing_status: SEALED
  retention_status: ACTIVE_STORAGE
  authority_status: CURRENT
  seal_status: LOGICAL_SEAL
  study_ref: STUDY-...
  run_id: RUN-...
  evaluation_unit: SINGLE_TASK_RESPONSE
  estimand:
    estimand_id: EST-...
    level: L1
    construct: task_contract_fulfillment
    population: supplied_candidate_outputs
    claim_ceiling: L1
  task:
    task_id: TASK-...
    prompt: "..."
    context_ref: null
  frozen_contract:
    frozen_before_candidate_read: true
    atoms: []
  candidates: []
  evidence_objects: []
  methods: []
  identity_manifest: []
  run_profile:
    mode: EXPLORATORY
    blindness: NATURALISTIC_UNBLINDED
    independence: I1
```

## Orthogonal lifecycle axes

### Package processing

```text
ASSEMBLING -> SEALED -> RECEIVED -> VERIFIED
                       -> REJECTED
VERIFIED -> SUPERSEDED
SEALED | RECEIVED | VERIFIED -> INVALIDATED only on discovered integrity defect
```

Forbidden reverse or conflated transitions include `VERIFIED -> SEALED`, `REJECTED -> VERIFIED` without a new package identity, and use of `EVALUATED`, `ARCHIVED`, or `REVOKED` as package-processing states.

### Retention

```text
ACTIVE_STORAGE | ARCHIVED_STORAGE | PURGED_BY_POLICY
```

### Normative authority

```text
CURRENT | SUPERSEDED | REVOKED
```

### Run progress

```text
CREATED -> PACKAGE_RECEIVED -> INTEGRITY_CHECK -> ELIGIBILITY_CHECK
-> SCORING -> JUDGE_QA -> ADJUDICATION -> VERDICT_COMMITTED
```

After `SEALED`, a content change creates a new package identity, revision, and manifest. In Projects without a hashing tool, `LOGICAL_SEAL` is allowed but must not be described as a cryptographic seal.

## Package gates

- один primary estimand;
- явный claim ceiling;
- frozen contract;
- identity mapping;
- все candidates полны;
- одинаковые task/context/tool/retry budgets для сравнения;
- evidence и methods версионированы;
- безопасные refs;
- data minimization;
- отсутствие post-hoc remediation.

## Contract atoms

```yaml
- atom_id: C1
  requirement: "Ответить на основной вопрос"
  class: CONTENT
  centrality: CENTRAL
  required: true
  evidence_rule: "candidate text"
```

Candidate outcome по атому: `MET | PARTIAL | MISSING | NOT_APPLICABLE | CONFLICTED`.

## Invalidity boundary

Повреждённый package означает `INVALID_PACKAGE`, но не доказывает плохое качество объекта.
