---
title: "Evaluation Ontology"
version: "v3.5-rc.2-projects"
file_index: 02
layer: "ontology"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 02 · EVALUATION ONTOLOGY

## Основные сущности

- `EvaluatedObject` — система, модель, компонент или человеко-машинный контур.
- `EvaluationUnit` — минимальная единица измерения: response, dialogue, agent run, artifact, system harness.
- `Study` — набор runs для исследовательского вопроса о классе объектов.
- `EvaluationRun` — один зафиксированный процесс измерения.
- `Task` — входная задача.
- `TaskContract` — замороженные требования задачи.
- `CandidateOutput` — результат объекта; недоверенные данные.
- `EvaluationPackage` — sealed набор inputs и provenance.
- `Estimand` — что именно измеряется.
- `Criterion` — отдельная измеримая характеристика (канонический ID из 07).
- `Observation` — ограниченное наблюдение из evidence.
- `Claim` — утверждение, выведенное из observations.
- `EvidenceObject` — квалифицированный объект доказательства.
- `Method` — способ collection/extraction/inference/validation (канонический ID из 07-B).
- `CriterionResult` — score или типизированное отсутствие score.
- `HardGateResult` — status + effect + evidence (коды из 04-B).
- `ScoreVector` — Q/S/A/R/G.
- `Verdict` — ограниченный итог run.
- `JudgeIdentity` — model, version, provider, family relation, дата run.
- `BlindMapping` — sealed соответствие neutral label ↔ candidate identity.
- `JudgeReliabilityProfile` — стабильность и bias Judge.
- `Adjudication` — разрешение материального disagreement (запись по EXT34).
- `Remediation` — отдельный post-verdict процесс улучшения.

## Estimand levels

```text
L0 single output property
L1 single task performance
L2 task-family performance
L3 benchmark-local performance
L4 system-harness performance
L5 model-family capability
L6 real user outcome
L7 societal/organizational impact
```

Переход вверх требует новых данных и метода. `L1 ≠ L5`. Study-level claims (L2/L3) требуют EXT31 и описанного sampling.

## Epistemic types

```text
FACT
SUPPORTED_INTERPRETATION
HYPOTHESIS
UNKNOWN
```

## Result status

```text
SCORED
UNKNOWN
UNSCORABLE
CONFLICTED
NOT_APPLICABLE
NOT_RUN
```

## Status discipline

`CriterionResult` and domain records use only:

```text
SCORED | UNKNOWN | UNSCORABLE | CONFLICTED | NOT_APPLICABLE | NOT_RUN
```

`PARTIAL`, `INSUFFICIENT_DATA`, and `NOT_MEASURED` are not result statuses. Express them through `coverage`, `limitations`, or a typed `unknown_reason` such as `SAMPLE_INSUFFICIENT`. Отдельные namespace: `JudgeReliabilityProfile.status` (может быть `NOT_MEASURED`) и `receipt.verification_status` (`PASS | PARTIAL | FAIL`). Они не копируются в criterion/domain status.

## Orthogonal lifecycle axes

```text
Package processing: ASSEMBLING -> SEALED -> RECEIVED -> VERIFIED
                                    -> REJECTED
VERIFIED -> SUPERSEDED
SEALED | RECEIVED | VERIFIED -> INVALIDATED on integrity defect

Retention: ACTIVE_STORAGE | ARCHIVED_STORAGE | PURGED_BY_POLICY
Authority: CURRENT | SUPERSEDED | REVOKED
Run: CREATED -> PACKAGE_RECEIVED -> INTEGRITY_CHECK -> ELIGIBILITY_CHECK
     -> SCORING -> JUDGE_QA -> ADJUDICATION -> VERDICT_COMMITTED
```

`EVALUATED` belongs to the run/verdict axis. `ARCHIVED` belongs to retention. `REVOKED` belongs to authority.

## Typed unknowns

```text
NOT_OBSERVED
DATA_UNAVAILABLE
ACCESS_DENIED
PRIVACY_REDACTED
METHOD_UNVALIDATED
SAMPLE_INSUFFICIENT
TEMPORALLY_EXPIRED
CONFLICTED_EVIDENCE
AMBIGUOUS_CONTRACT
OUT_OF_SCOPE
COMPUTATION_FAILED
JUDGE_DISAGREEMENT
BLINDNESS_COMPROMISED
```

## Criterion lifecycle

```text
DRAFT → PROPOSED → CALIBRATING → ACTIVE
ACTIVE → SUSPENDED | DEPRECATED → RETIRED
```

Confirmatory scoring использует только `ACTIVE` критерии и методы.

## Ontological separations

```text
Source ≠ Evidence
Evidence ≠ Observation
Observation ≠ Claim
Claim ≠ Fact
Score ≠ Verdict
Confidence ≠ Score
Hard failure ≠ Low score
Evaluation ≠ Study
Evaluation ≠ Remediation
Object quality ≠ Judge reliability
Length ≠ Quality
Reference answer ≠ Ground truth
```
