---
name: iskra-sift-auditor
description: Primary SIFT owner for Iskra agents across base, extended, repository, live, temporal, and contradiction audits. Use when verifying or fact-checking claims, comparing sources, tracing transformations, checking current facts, resolving cross-file conflicts, testing load-bearing premises, or handling requests previously routed to sift-verifier, iskra-sift-verifier, or iskra-sift-extended.
---

# Iskra SIFT Auditor

Verify claims without swallowing the first result. This skill owns both compact verification and extended multi-source audit.

## Alias consolidation

Treat these names as transition aliases, not separate concurrent owners:

```text
sift-verifier → iskra-sift-auditor
iskra-sift-verifier → iskra-sift-auditor
iskra-sift-extended → iskra-sift-auditor
```

Do not invoke an alias beside this owner for the same claim. Preserve the requested depth by selecting a mode below.

## Modes

- `base`: one bounded claim, direct source chain, concise verdict.
- `extended`: multiple files, dated sources, cross-tier conflicts, or expired claims.
- `repo`: project or canonical claim; read current repository/SoT before summaries or memory.
- `live`: current external fact; use fresh connector or web evidence and record observation date.
- `claim-audit`: decompose a larger assertion into atomic claims and ceiling-check the final conclusion.

## SIFT workflow

1. **Source:** restate the claim without accepting it; identify author, date, surface, and authority tier.
2. **Inference:** separate direct observation from interpretation and identify every load-bearing premise.
3. **Find:** seek the highest available primary or authoritative evidence.
4. **Trace:** map `source → transformation → claim`; name distortion, staleness, or missing links.
5. **Test:** execute the verification or falsifier for each material premise.
6. **Verdict:** return `verified | partial | unknown | false` without averaging contradictions away.

## Load-bearing premise gate

Before a premise changes a decision or action:

- state the premise as a checkable claim;
- state which conclusion depends on it;
- verify it through the named source or tool;
- reject false premises;
- keep unverified material premises as `[HYP]` and remove or condition dependent conclusions;
- preserve verified controls even when the surrounding frame is metaphorical.

A populated label or citation field is not proof that the premise was tested.

## Evidence rules

- For Iskra facts, search SoT/repository first.
- For current external facts, use fresh connector/web evidence and include the observation date.
- For code claims, prefer repository files, tests, logs, and reproducible commands.
- For database claims, prefer schema, policies, migrations, function source, advisors, and read-only query output.
- Separate `source`, `inference`, and `conclusion`.
- Show `A vs B` when sources conflict and apply the truth ladder explicitly.
- Mark `DRIFT` or `HIGH-RISK DRIFT` when release, security, live state, or governance is affected.
- Use `unknown` instead of invented certainty, confidence, or missing facts.

## Output contract

Base mode:

```text
Claim:
Verdict: verified | partial | unknown | false
Evidence:
Trace:
Residual uncertainty:
What would change the verdict:
Next step:
ΔDΩΛ:
```

Extended mode adds:

```text
Temporal note:
Conflict map: A vs B → winning tier
Atomic premise table:
Claim ceiling:
```

## Escalation

- Canon, runtime, routing, or durable behavior change → `iskra-adr-governance`.
- Repository-state dependency → `iskra-github-operator`.
- Database-state dependency → `iskra-supabase-operator`.
- Secrets, exploitation, or exposure → `iskra-security`.

## References

Load `references/sift-checklist.md`, `references/connector-security.md`, `references/iskra-anchors.md`, and `references/output-contract.md` as needed.
