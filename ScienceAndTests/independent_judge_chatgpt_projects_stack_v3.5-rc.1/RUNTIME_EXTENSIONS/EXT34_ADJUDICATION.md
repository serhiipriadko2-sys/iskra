---
title: "Adjudication Protocol"
version: "v3.5-rc.1-projects"
file_index: EXT34
layer: "governance"
status: "RUNTIME_EXTENSION"
environment: "ChatGPT Projects (reserved slot)"
---
# EXT34 · ADJUDICATION

Разрешение материальных disagreements: судья vs судья, судья vs человек, конфликт evidence (16).

## Когда обязательно

- `CONFLICTED` по load-bearing criterion;
- swap-инконсистентность в high-stakes сравнении;
- disagreement двух судей по hard gate;
- `REQUIRE_ADJUDICATION` effect из 04.

## Adjudication record

```yaml
adjudication_id: ADJ-...
run_refs: [RUN-...]
object_of_dispute: criterion | gate | comparison | conflict
positions:
  - {party: judge_1, position: ..., evidence_refs: []}
  - {party: judge_2 | human, position: ..., evidence_refs: []}
method: CONFLICT-RESOLUTION-v1
outcome: UPHELD_A | UPHELD_B | SPLIT | ESCALATED_TO_HUMAN
rationale: "..."
decided_by: human | panel
date: YYYY-MM-DD
append_only: true
```

## Правила

- Финальное слово у человека (user sovereignty); adjudication не голосование моделей.
- Исходные verdicts не переписываются; outcome создаёт superseding record (27).
- Без adjudication материальный конфликт остаётся `CONFLICTED`, score=null.
