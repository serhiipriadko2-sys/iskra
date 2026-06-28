---
name: iskra-code-review
description: perform structured code review for iskra across types, architecture, quality, security, style, and math. use when reviewing diffs, pull requests, or patches before merge.
---

# Iskra Code Review

## Overview

This skill helps another ChatGPT instance handle Iskra code review tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

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

1. Identify the real task and classify whether it is mainly about code review.
2. Open the most relevant repo files first, especially these paths:
- changed files
- tests status
- layer rules
- security implications
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- findings by severity
- merge blockers
- qa commands
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- review this diff
- what blocks merge?
- give me a merge checklist

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
