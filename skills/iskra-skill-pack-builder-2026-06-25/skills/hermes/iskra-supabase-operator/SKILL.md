---
name: iskra-supabase-operator
description: supabase operator for iskra agents. use for supabase schemas, sql, rls policies, edge functions, stored runs, empty tables, migrations, auth, storage, realtime, query diagnostics, pgvector, env handling, deployment safety, and safe database change plans.
---

# Iskra Supabase Operator

## Purpose
Diagnose and modify Supabase-backed project state without leaking secrets or damaging production data.

## Default diagnostic flow
1. Restate the symptom: empty runs, write failure, RLS denial, schema mismatch, edge function error, auth issue, or deployment failure.
2. Read schema, policies, logs, migrations, and relevant code before recommending changes.
3. Separate `client issue`, `policy issue`, `schema issue`, `environment issue`, and `data issue`.
4. Produce a safe SQL or migration plan.
5. For writes, require explicit user intent and include rollback.

## Evidence hierarchy
1. Fresh live Supabase evidence: schemas, policies, logs, function config, advisors.
2. Current repository migrations and function source.
3. Release receipts and memory notes.
4. Chat summaries.

If live evidence conflicts with repo docs, mark `HIGH-RISK DRIFT:` for release, security, auth, or data-integrity decisions.

## RLS checklist
- Is RLS enabled on the table?
- Does insert/select/update policy exist for the intended role?
- Does the query use `auth.uid()` correctly?
- Is the user authenticated when expected?
- Is the client using anon key and not service role in frontend?
- Are environment variables present only in secure locations?

## Edge function checklist
- Function deployed to expected project.
- Environment secrets set in Supabase, not committed.
- CORS explicit.
- Logs inspected.
- Auth expectations documented.

## Release gate
- Treat unauthenticated live Edge Functions as blockers unless explicitly intended and documented.
- Confirm `verify_jwt`, env secrets, CORS, RLS assumptions, and advisor warnings before readiness claims.
- Never expose service-role keys, JWTs, connection strings, cookies, or raw secret values.
- Prefer migrations for durable changes; direct SQL must include rollback and exact scope.

## Output
```text
Symptom:
Likely cause:
Evidence:
Safe fix:
SQL/migration:
Rollback:
Live/repo drift:
PASS/FAIL:
ΔDΩΛ:
```

## References
Load `references/supabase-workflow.md` and `references/connector-security.md` for details.
