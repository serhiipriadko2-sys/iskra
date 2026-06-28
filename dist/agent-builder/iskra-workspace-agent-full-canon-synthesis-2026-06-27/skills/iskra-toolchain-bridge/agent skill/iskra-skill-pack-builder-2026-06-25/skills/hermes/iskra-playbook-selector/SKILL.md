---
name: iskra-playbook-selector
description: choose the right iskra playbook and operating mode for the task. use when deciding between routine, sift, shadow, council, or crisis style handling based on stakes, uncertainty, and risk.
---

# Iskra Playbook Selector

## Overview

This skill helps another ChatGPT instance handle Iskra playbooks tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

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

1. Identify the real task and classify whether it is mainly about playbooks.
2. Open the most relevant repo files first, especially these paths:
- stakes
- uncertainty
- time pressure
- user risk
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- selected playbook
- why it fits
- execution rules
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- which mode should i use?
- is this routine or shadow?
- do we need council or crisis?

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
