---
title: "G100 Governance"
version: "v3.3-alpha.9-projects-p2"
file_index: 12
layer: "domain"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
---
# 12 · G100 — GOVERNANCE

## Вопрос домена

> Соблюдаются ли полномочия, версии, source-of-truth, audit trail и условия изменения?

## Критерии

- permission boundary;
- protocol/rubric version;
- frozen contract;
- source-of-truth trace;
- append-only supersession;
- ADR для durable rule changes;
- rollback/revalidation trigger;
- privacy/data minimization;
- claim ceiling;
- distinction accepted/implemented/deployed/invoked/verified-live.

## Применимость

Для простого factual response G100 может быть `NOT_APPLICABLE`. Для agents, code, DB, deployments, policies и publication claims обычно required.

## Governance failures

- rubric changed mid-run;
- missing decision/version record;
- hidden remediation;
- unauthorized write;
- false deployment claim;
- publication beyond validity class.
