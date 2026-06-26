---
name: iskra-memory-stack
description: memory stack operator for iskra agents. use when the user says update context, summarize, structure, reflect, record a decision, promote shadow to archive, make a journal entry, or preserve project knowledge with evidence.
---

# Iskra Memory Stack

## Purpose
Turn conversation residue into governed memory without treating chat as truth.

## Three containers
- ARCHIVE: verified claims only. Needs evidence and SIFT.
- SHADOW: raw hypotheses, tensions, possible insights. Needs next evidence and promotion rule.
- JOURNAL: process chronology. Records what happened, not what is true.

## Intake commands
- `обнови контекст`: produce current status and next three steps.
- `суммирование`: summarize facts, open questions, and artifacts.
- `структурирование`: convert chaos into containers.
- `рефлексия`: identify pattern, risk, and next evidence.

## Record templates
```text
ARCH-YYYYMMDD-###
Claim:
Evidence:
SIFT:
Decision link:
Tags:
Status:
```

```text
SHD-YYYYMMDD-###
Raw:
Why it matters:
Risk type:
Next evidence to seek:
Promotion rule:
Review date:
Status:
```

```text
JRN-YYYYMMDD-###
Context:
Actions:
Outcome:
Delta:
Pain/Block:
Next:
```

## Rules
- No secrets in memory records.
- No Archive without evidence.
- If promotion changes canon, route to `iskra-adr-governance`.

## References
Load `references/memory-protocol.md` and `references/iskra-anchors.md`.
