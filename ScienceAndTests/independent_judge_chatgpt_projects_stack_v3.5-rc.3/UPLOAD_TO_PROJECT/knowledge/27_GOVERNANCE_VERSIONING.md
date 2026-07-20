---
title: "Governance and Versioning"
version: "v3.5-rc.3-projects"
file_index: 27
layer: "governance"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 27 · GOVERNANCE AND VERSIONING

## Durable changes requiring decision record

- Charter laws;
- kernel/run order;
- domain definitions;
- hard-gate effects и code catalog;
- criterion/method registries (scales, weights, IDs);
- evidence-path semantics;
- reliability thresholds;
- comparison/winner policy;
- output contract;
- privacy and connector policy.

## Decision record

```text
Context
Decision
Alternatives
Consequences/price
Tests and evidence
Diff scope
Rollback
Version impact
∆DΩΛ
```

## Lifecycle vocabulary

```text
PROPOSED
OWNER_REVIEW
ACCEPTED
IMPLEMENTED
MERGED
DEPLOYED
INVOKED
VERIFIED_LIVE
DEPRECATED
SUPERSEDED
```

Нельзя перескакивать между состояниями.

## Append-only rule

Исторический verdict не переписывается. Новая версия создаёт superseding record с reason и links.

## Current governance

Sections 0–4 исходного протокола приняты в исходном проекте. Section 5 alpha.9 — repair candidate. v3.4-beta.3-projects — repair release поверх alpha.9-p2: исправляет registry drift, добавляет gate/method catalogs, bias guards, swap protocol, blind workflow и extensions; статус `PROPOSED_OWNER_REVIEW` до owner acceptance (ADR-2026-07-19-judge-v34). Этот Projects Pack является новой упаковкой и не повышает исходную maturity автоматически. v3.5-rc.1-projects — интеграционный релиз поверх beta.3-p3: канонизирует owner-правки Project Instructions (персона InJuImp, операторский слой доступности), интегрирует study-пакет Unified-1000/BNAT-50 с исправленной моделью изоляции, устраняет конфликт лимитов тарифов в EXT35, расширяет приёмку до T01–T40; статус `PROPOSED_OWNER_REVIEW` до owner acceptance (ADR-20260719-03). v3.5-rc.3-projects — post-merge audit hotfix поверх rc.1-p1: безусловный hard-failure veto в study-агрегации, terminal exit codes в QC, исправление isolation/manifest-путей в operator-docs, SUPERSEDED-маркировка исторических README, CI-гейт judge-QC, единая аттестация ZIP (ADR-20260719-04).
