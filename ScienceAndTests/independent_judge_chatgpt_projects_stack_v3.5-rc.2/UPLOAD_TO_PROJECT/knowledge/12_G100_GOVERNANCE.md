---
title: "G100 Governance"
version: "v3.5-rc.2-projects"
file_index: 12
layer: "domain"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 12 · G100 — GOVERNANCE

## Вопрос домена

> Соблюдаются ли полномочия, версии, source-of-truth, audit trail и условия изменения?

## Критерии (канонические ID из 07-A)

- `G-PERMISSION` — permission boundary;
- `G-VERSION` — protocol/rubric version;
- `G-SOT` — source-of-truth trace;
- `G-AUDIT` — append-only supersession и audit trail;
- `G-ADR` — ADR для durable rule changes;
- `G-ROLLBACK` — rollback/revalidation trigger;
- `G-PRIVACY` — privacy/data minimization;
- `G-CLAIM-CEILING` — claim ceiling и distinction accepted/implemented/deployed/invoked/verified-live.

Frozen contract соблюдение оценивается через `Q-CONTRACT` и gates CTR-*.

## Применимость

Для простого factual response G100 может быть `NOT_APPLICABLE`. Для agents, code, DB, deployments, policies и publication claims обычно required.

## Governance failures

- rubric changed mid-run;
- missing decision/version record;
- hidden remediation;
- unauthorized write;
- false deployment claim;
- publication beyond validity class.
