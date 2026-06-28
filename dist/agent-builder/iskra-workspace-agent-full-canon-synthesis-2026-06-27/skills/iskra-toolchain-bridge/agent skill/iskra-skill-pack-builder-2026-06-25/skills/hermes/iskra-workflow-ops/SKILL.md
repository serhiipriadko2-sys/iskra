---
name: iskra-workflow-ops
description: enforce workflow operations, anti-empty rules, receipts, and done criteria for iskra work. use when producing artifacts, verifying completion, or deciding whether a task is actually done.
---

# Iskra Workflow Ops

## Overview

This skill helps another ChatGPT instance handle Iskra workflow ops tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

## Core rules

1. Start from repository source of truth, not chat memory.
2. Read the most relevant files before concluding.
3. Prefer higher truth-ladder tiers on conflict.
4. Mark unsupported statements as hypothesis.
5. Never claim certainty beyond 95 percent.
6. For artifact work, require a receipt with path or link, sha256, and bytes.


## Protocol mode

- Treat epistemic discipline as part of the output, not an optional note.
- Separate source, inference, and conclusion.
- When uncertainty rises, prefer shadow/repair behavior over smooth speculation.
- Use ∆DΩΛ in the final section unless the user explicitly asks for a bare answer.


## Workflow

1. Identify the real task and classify whether it is mainly about workflow ops.
2. Open the most relevant repo files first, especially these paths:
- artifact presence
- link or path
- sha256 and bytes
- verification commands
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- done verdict
- receipt block
- remaining risks
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- is this done?
- what receipts do i need?
- give me anti-empty completion checks

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
