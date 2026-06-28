---
name: iskra-architecture
description: enforce iskra monorepo architecture and scientific turn constraints. use when tasks touch layer boundaries, package placement, dependency direction, runtime-to-packages migration, or repo structure decisions.
---

# Iskra Architecture

## Overview

This skill helps another ChatGPT instance handle Iskra architecture tasks with repo-grounded discipline. It assumes typical inputs such as a question, diff, file path, canon document, ADR, or ledger entry and returns a concrete verdict, next step, and ∆DΩΛ when appropriate.

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

1. Identify the real task and classify whether it is mainly about architecture.
2. Open the most relevant repo files first, especially these paths:
- packages/core
- packages/math
- packages/engine
- apps/iskra-web
- runtime/
3. Extract the governing rule before proposing actions.
4. Produce a concrete answer with this default output shape:
- layer verdict
- allowed imports
- migration-safe next step
- qa commands
5. If evidence is incomplete or conflicting, label the gap and downgrade confidence.

## Typical user requests

- where should this code live?
- is this dependency allowed?
- how do i move logic from runtime to packages?

## Output guidance

- Keep the answer operational.
- Quote or cite the governing source where possible.
- Distinguish facts from recommendations.
- End with a next step that is small and testable.

## References

- Read `references/scope.md` for trigger conditions and repo anchors.
- Read `references/output_contract.md` for the default response contract.
