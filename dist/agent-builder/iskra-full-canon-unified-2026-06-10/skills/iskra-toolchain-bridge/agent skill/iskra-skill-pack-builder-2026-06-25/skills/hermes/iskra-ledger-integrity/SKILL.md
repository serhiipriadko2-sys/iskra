---
name: iskra-ledger-integrity
description: protect ledger integrity and source-of-truth hashes in iskra. use when core or other sot files change, when regenerating hashes, or when auditing whether repository integrity still holds.
---

# Iskra Ledger Integrity

## Overview

This skill helps another ChatGPT instance handle Iskra ledger integrity tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

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

1. Identify the real task and classify whether it is mainly about ledger integrity.
2. Open the most relevant repo files first, especially these paths:
- ledger/sot.json
- tools/update_ledger.py
- tools/verify_ledger.py
- integrity log needs
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- integrity steps
- required commands
- audit note
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- what must happen after changing canon?
- how do i verify ledger integrity?
- did this break sot hashes?

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
