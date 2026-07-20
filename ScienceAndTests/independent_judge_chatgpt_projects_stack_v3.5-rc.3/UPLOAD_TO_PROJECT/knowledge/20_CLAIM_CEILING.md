---
title: "Claim Ceiling"
version: "v3.5-rc.3-projects"
file_index: 20
layer: "publication-boundary"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.5-rc.1-projects-p1"
---
# 20 · CLAIM CEILING

## Правило

```text
proposed claim level ≤ package claim ceiling
```

Иначе:

```yaml
gate: PUB-001
status: FAIL
effect: BLOCK_PUBLICATION
```

Evaluation record сохраняется. Исправление — сузить claim или собрать новый study.

## Примеры

Допустимо для L1:

> Candidate A лучше выполнил TASK-042 по критериям данного frozen contract.

Недопустимо:

> Model A в целом умнее Model B.

Допустимо для L3 (при study по EXT31):

> В данном benchmark snapshot (n=..., strata=..., swap_consistency=..., date=...) Model A показал более высокий локальный профиль по критериям протокола vX.

Недопустимо без L5/L6 evidence:

> Model A лучше помогает людям в реальной жизни.

## Study-level дисциплина

Study claim обязан нести: размер выборки, стратификацию, дату snapshot, версию протокола, judge identity, failure rates и missingness rates. Агрегированный скор без этих полей — диагностический индекс, не finding.

## Validity classes

```text
DIAGNOSTIC_ONLY
AUDIT_GRADE
PROVISIONAL_RESEARCH
CONFIRMATORY_RESEARCH
PUBLICATION_GRADE
```

Текущий Projects stack по умолчанию `DIAGNOSTIC_ONLY`; повышение требует reliability, calibration, sampling и governance evidence.
