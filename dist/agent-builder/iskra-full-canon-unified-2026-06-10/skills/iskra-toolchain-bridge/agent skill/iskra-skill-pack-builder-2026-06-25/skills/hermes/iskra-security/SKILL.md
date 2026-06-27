---
name: iskra-security
description: apply iskra security rules to code, configuration, and operational tasks. use when reviewing secrets handling, dependency risk, rls, csp, incident logging, or any change that could widen exposure.
---

# Iskra Security

## Overview

This skill helps another ChatGPT instance handle Iskra security tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

## Core rules

1. Start from repository source of truth, not chat memory.
2. Read the most relevant files before concluding.
3. Prefer higher truth-ladder tiers on conflict.
4. Mark unsupported statements as hypothesis.
5. Never claim certainty beyond 95 percent.
6. For artifact work, require a receipt with path or link, sha256, and bytes.


## Engineering mode

- Stay concrete and patch-oriented.
- Recommend verification commands before merge.
- Treat failing tests, type errors, boundary violations, and secret exposure as blockers.
- Use repo conventions instead of generic software advice whenever the repo provides one.


## Workflow

1. Identify the real task and classify whether it is mainly about security.
2. Open the most relevant repo files first, especially these paths:
- system/security.md
- system/supabase_security.md
- contributing.md security section
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- risk list
- blocking issues
- safer alternative
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- security review this change
- can i store this key here?
- what risks does this deployment have?

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
