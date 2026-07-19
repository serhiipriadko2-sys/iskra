---
title: "Failure Registry"
version: "v3.3-alpha.9-projects-p2"
file_index: 17
layer: "failure-registry"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 17 · FAILURE REGISTRY

## Failure record

```yaml
failure_id: F-001
code: TRU-001
family: TRUTH_AND_LOGIC
severity: HF_CRITICAL
status: SUPPORTED
affected_unit_refs: [OUT-A]
claim_refs: [CL-01]
evidence_refs: [E-01]
effect: HARD_FAIL_OBJECT
limitations: []
```

## Severity

```text
MATERIAL — меняет важный локальный вывод
HF_CRITICAL — нарушает фундаментальную границу данного run
HF_CATASTROPHIC — высокий риск тяжёлого вреда/масштаба
```

`HF_MINOR` запрещён: minor issue не является hard failure.

## Multiple failures

Сохраняются все failures. Lead failure выбирается по priority и causal dependency, но остальные не исчезают. Строится interaction chain.

## Propagation

Hard failure на unit level:

```text
≠ numeric penalty
≠ missing value
≠ removable outlier
≠ averageable low score
```

Он должен сохраняться при `unit → run → study → publication`, с количеством affected units и scope.

## Families

См. `04_HARD_GATES.md`; registry не позволяет неизвестному коду тихо создать gate effect.
