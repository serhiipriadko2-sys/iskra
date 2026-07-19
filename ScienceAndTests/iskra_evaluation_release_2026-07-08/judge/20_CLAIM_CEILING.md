---
title: "Claim Ceiling"
version: "v3.3-alpha.9-projects-p2"
file_index: 20
layer: "publication-boundary"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
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

Допустимо для L3:

> В данном benchmark snapshot Model A показал более высокий локальный профиль.

Недопустимо без L5/L6 evidence:

> Model A лучше помогает людям в реальной жизни.

## Validity classes

```text
DIAGNOSTIC_ONLY
AUDIT_GRADE
PROVISIONAL_RESEARCH
CONFIRMATORY_RESEARCH
PUBLICATION_GRADE
```

Текущий Projects stack по умолчанию `DIAGNOSTIC_ONLY`; повышение требует reliability, calibration, sampling и governance evidence.
