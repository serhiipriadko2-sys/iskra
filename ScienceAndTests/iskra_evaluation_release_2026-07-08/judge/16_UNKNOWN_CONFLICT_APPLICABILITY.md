---
title: "Unknown Conflict Applicability"
version: "v3.3-alpha.9-projects-p2"
file_index: 16
layer: "epistemic"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 16 · UNKNOWN, CONFLICT, APPLICABILITY

## Missingness matrix

| Status | Значение | Score |
|---|---|---|
| `SCORED` | наблюдение допустимо | number |
| `UNKNOWN` | данных/знания нет | null |
| `UNSCORABLE` | метод не вправе считать | null |
| `CONFLICTED` | материален неразрешённый конфликт | null |
| `NOT_APPLICABLE` | construct не относится к unit | excluded |
| `NOT_RUN` | проверка не выполнялась | null |
| observed `0` | реальное дно шкалы | 0 |

## Conflict types

```text
SOURCE_SCOPE_MISMATCH
TEMPORAL_CONFLICT
VERSION_CONFLICT
SEMANTIC_CONFLICT
METHOD_CONFLICT
IDENTITY_CONFLICT
INDEPENDENCE_NOT_ESTABLISHED
COUNTEREVIDENCE_MATERIAL
RESOLUTION_PENDING
```

## Resolution

`RESOLVED` требует:

- active conflict-resolution method;
- related resolution claim;
- edge `COUNTERS | REFUTES | CONFLICTS_WITH`;
- retained original evidence/counterevidence;
- written rationale.

## Applicability freeze

Applicability определяется до scoring candidates. Изменение applicability после просмотра scores инвалидирует comparative run.
