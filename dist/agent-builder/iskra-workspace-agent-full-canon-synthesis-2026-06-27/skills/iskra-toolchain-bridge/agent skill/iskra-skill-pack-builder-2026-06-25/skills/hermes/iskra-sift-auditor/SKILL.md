---
name: iskra-sift-auditor
description: verification, source tracing, and extended SIFT for iskra agents. use when the user asks to verify, fact check, compare sources, inspect a claim, audit a source, handle current facts, resolve cross-file contradictions, test temporal validity, or separate fact interpretation and hypothesis with a verdict.
---

# Iskra SIFT Auditor

## Purpose
Verify claims without swallowing the first result. Use this skill for fact checks, source audits, current information, conflicting evidence, and any claim that could harm a project if wrong.

## Modes
- `base`: one claim, one source chain, direct verdict.
- `extended`: multiple files, dated sources, cross-tier conflicts, or claims that may have expired.
- `repo`: canonical/project claim; read repo/canon files before memory or summaries.
- `live`: current external fact; use fresh connector/web evidence and include observation date.

## SIFT workflow
1. Stop: restate the claim without accepting it.
2. Investigate: identify author, date, context, and incentives.
3. Find: seek primary or more authoritative sources.
4. Trace: follow the transformation from source to claim and mark where distortion may enter.
5. Verdict: `verified`, `partial`, `unknown`, or `false`.

## Evidence rules
- For project facts, search canon/repository before web.
- For current external facts, browse or use connector output and include date.
- For code claims, prefer repository files, tests, logs, and reproducible commands.
- For database claims, prefer Supabase schema, RLS policies, migration files, and query output.
- Separate `source`, `inference`, and `conclusion`; do not average contradictory sources.
- When sources conflict, prefer the highest truth-ladder tier and mark `DRIFT:` or `HIGH-RISK DRIFT:` when release, security, live state, or governance is affected.
- Never claim certainty beyond the evidence; use `unknown` rather than invented confidence.

## Output
Use this shape:

```text
Claim: ...
Verdict: verified | partial | unknown | false
Confidence: ...
Evidence:
- source — short quote or observed output
Trace:
- source -> transformation -> risk
What would change my mind:
- ...
Next step:
- ...
ΔDΩΛ: ...
```

## Extended output additions
For extended mode, also include:
- `Temporal note:` current as of date/time or stale boundary.
- `Conflict map:` source A vs source B and which tier wins.
- `Residual uncertainty:` what remains unverified and why.

## Escalation
- If the claim changes canon, route to `iskra-adr-governance`.
- If the claim depends on repository state, route through `iskra-github-operator`.
- If it depends on database state, route through `iskra-supabase-operator`.

## References
Load `references/sift-checklist.md` and `references/connector-security.md` when the task involves external sources or connectors.
