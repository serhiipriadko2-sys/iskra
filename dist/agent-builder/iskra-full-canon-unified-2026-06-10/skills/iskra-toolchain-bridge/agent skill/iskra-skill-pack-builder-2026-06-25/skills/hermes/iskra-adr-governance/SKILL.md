---
name: iskra-adr-governance
description: architecture decision record governance for iskra agents. use when changing canon, project instructions, core behavior, system runtime, routing, memory policy, connector policy, or any durable rule requiring adr, qa, changelog, or ledger trace.
---

# Iskra ADR Governance

## Purpose
Prevent silent canon drift. Use this skill whenever the user proposes changing agent behavior, core rules, system runtime, memory policy, connector policy, or durable project architecture.

## Decision gate
Before writing or recommending a durable change, classify it:

- `core`: telos, principles, voice identity, safety posture. ADR required.
- `system`: runtime, guard, playbook, router, RAG, workflow. ADR and QA required.
- `governance`: policies, release rules, changelog, approval rules. ADR required.
- `mind/appendix`: experiments. ADR optional until promoted.
- `view`: UI or document presentation. ADR only if behavior changes.

## Lifecycle
- `proposed`: decision shape exists, not accepted.
- `accepted`: user or project authority accepted the decision.
- `mirrored-to-builder`: decision is present in Builder/package-facing files.
- `verified-live`: fresh runtime/Builder evidence proves the decision is active.
- `deprecated`: replaced or retired with explicit reason.

Do not collapse `accepted`, `mirrored-to-builder`, and `verified-live`; they are different gates.

## ADR template
```text
ADR-YYYYMMDD-XX: title
Status: proposed | accepted | deprecated
Context: what pain or conflict exists
Decision: what changes
Alternatives: what was considered
Consequences: benefits, costs, risks
Tests/QA: smoke, retrieval, drift, regression, rollback
Diff scope: files or settings affected
Builder/package mirror: not-needed | pending | done
Live verification: not-needed | pending | done
ΔDΩΛ: change trace
Owner / Builder:
```

## QA minimum
- T1 smoke: answer still contains intake, evidence boundary, step, PASS/FAIL, ΔDΩΛ.
- T2 retrieval: at least one canon fact cites an artifact or file.
- T3 drift: no competing root truth or duplicated rule.
- T4 security: no secrets or private data added.
- T5 acceptance: at least one acceptance prompt/test proves the new behavior and one boundary test proves what it must not claim.
- T6 mirror: if Builder/package behavior changes, package files and manifest/receipt must be updated before readiness claims.

## Output rules
- If user asks to change core/system directly, produce ADR first, not just the new instruction.
- If the user only asks for a proposal, mark status `proposed`.
- If the user explicitly accepts, mark `accepted` and list follow-up files to update.
- If the user asks whether an ADR is needed, return an `adr-needed | adr-optional | no-adr` verdict with evidence and the smallest next step.

## References
Load `references/adr-template.md` and `references/iskra-anchors.md` for governance details.
