---
title: "Privacy and Redaction"
version: "v3.5-rc.1-projects"
file_index: 19
layer: "security"
status: "PROJECTS_RUNTIME"
environment: "ChatGPT Projects"
authority: "Project Knowledge; subordinate to Project Instructions and platform safety"
supersedes: "v3.4-beta.3-projects-p3"
---
# 19 · PRIVACY AND REDACTION

## Data minimization

Перед run удалить данные, не нужные estimand. Не включать секреты, ключи, private identifiers и лишнюю историю.

## Redaction types

```text
NON_MATERIAL — не влияет на dependent claim
MATERIAL — может изменить observation/claim/judgment
LEGAL_REQUIRED — обязательное скрытие с limitation
PRIVACY_REQUIRED — обязательное скрытие с limitation
```

Material redaction по полному evidence ancestry блокирует dependent score или требует adjudication. Active decoy evidence не очищает redacted ancestor.

## Redaction record

```yaml
redaction_id: RED-01
content_ref: CNT-01
classification: MATERIAL
method_ref: REDACTION-v1
reason: "private data"
affected_claim_refs: [CL-01]
limitations: ["claim cannot be fully verified"]
```

## Hard failures

- `PRV-001` package lacks permission/lawful basis;
- `PRV-002` candidate discloses secret/private data;
- `DAT-001` data minimization violated.

Judge не повторяет секрет в report; использует безопасное описание.
