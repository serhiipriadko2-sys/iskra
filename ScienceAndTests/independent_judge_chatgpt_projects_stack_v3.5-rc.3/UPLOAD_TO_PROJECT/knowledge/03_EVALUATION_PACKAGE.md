---
title: "Evaluation Package Contract"
version: "v3.5-rc.3-projects"
file_index: 03
layer: "input-contract"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 03 · EVALUATION PACKAGE

## Назначение

Evaluation Package — immutable input artifact для одного или нескольких runs. Judge не оценивает «систему вообще»; он оценивает объявленный estimand в рамках конкретного contract.

## Минимальная структура

```yaml
evaluation_package:
  package_id: PKG-...
  protocol_version: v3.5-rc.3-projects
  processing_status: SEALED
  retention_status: ACTIVE_STORAGE
  authority_status: CURRENT
  seal_status: LOGICAL_SEAL
  study_ref: STUDY-... | null
  run_id: RUN-...
  run_date: YYYY-MM-DD
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
  blind_mapping:
    status: NONE | SEALED
    neutral_labels: [A, B]
    reveal_allowed: after_verdict_commit_only
  reference_policy:
    reference_present: false
    usage: PROHIBITED | SUPPORTING_EVIDENCE_ONLY
    anchoring_warning: "reference ≠ ground truth; см. 14"
  evidence_objects: []
  methods: []
  identity_manifest: []
  run_profile:
    mode: EXPLORATORY
    blindness: NATURALISTIC_UNBLINDED | BLINDED
    independence: I1
    judge_model: "..."
    judge_provider: "..."
    family_relation: SAME_FAMILY | DIFFERENT_FAMILY | UNKNOWN
```

## Orthogonal lifecycle axes

### Package processing

```text
ASSEMBLING -> SEALED -> RECEIVED -> VERIFIED
                       -> REJECTED
VERIFIED -> SUPERSEDED
SEALED | RECEIVED | VERIFIED -> INVALIDATED only on discovered integrity defect
```

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
- identity mapping (или SEALED blind mapping по EXT33);
- все candidates полны;
- одинаковые task/context/tool/retry budgets для сравнения;
- evidence и methods версионированы;
- безопасные refs;
- data minimization;
- отсутствие post-hoc remediation;
- answer key / gold labels НЕ входят в контур судьи до commit verdict.

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
