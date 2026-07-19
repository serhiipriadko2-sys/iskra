---
title: "Evidence Types"
version: "v3.5-rc.3-projects"
file_index: 14
layer: "evidence"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 14 · EVIDENCE TYPES

## Source не равен Evidence

Source становится evidence только после фиксации bounded content, integrity, method, scope, lifecycle и claim fit.

## Типы evidence

- `PRIMARY_ARTIFACT` — исходный output, код, лог, запись;
- `OFFICIAL_SOURCE` — официальная документация/политика;
- `REPRODUCIBLE_TEST` — команда, inputs, output, environment;
- `DIRECT_OBSERVATION` — наблюдение с collector и временем;
- `INDEPENDENT_CONFIRMATION` — независимый источник;
- `EXPERT_JUDGMENT` — квалифицированная оценка с limitations;
- `DERIVED_EVIDENCE` — преобразованный объект с lineage;
- `NEGATIVE_SEARCH_RESULT` — ограниченное отсутствие результата, не универсальное отрицание;
- `SELF_REPORT` — данные субъекта, не внешний факт без дополнительной опоры;
- `REFERENCE_ANSWER` — эталон/answer key; **не ground truth**. Допустим только как supporting evidence с проверкой claim fit; близость формулировки к reference не есть correctness, расхождение не есть ошибка. До verdict commit reference недоступен судье в blind-режиме (EXT33).

## Evidence dimensions

```text
identity
integrity
relevance
scope
estimand fit
temporal validity
method validity
independence
completeness
```

## Lifecycle

```text
COLLECTED → QUALIFIED → ACTIVE
ACTIVE → SUPERSEDED | REVOKED | EXPIRED | ARCHIVED
```

Score использует только допустимые ACTIVE ancestors.

## Неэквивалентности

```text
citation count ≠ evidence strength
signature ≠ semantic correctness
external source ≠ local runtime proof
absence of counterevidence ≠ confirmation
hash match ≠ truth
reference match ≠ correctness
length/format ≠ quality
```
