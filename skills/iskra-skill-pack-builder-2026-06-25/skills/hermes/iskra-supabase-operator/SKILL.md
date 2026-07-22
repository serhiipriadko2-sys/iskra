---
name: iskra-supabase-operator
description: Primary Supabase owner for Iskra agents, including schema, SQL, RLS, migrations, Edge Functions, auth, storage, realtime, pgvector, logs, advisors, environment handling, and live/repository drift. Use for requests previously routed to iskra-supabase-ops and whenever both Supabase connector surfaces are exposed; select one mutation surface and use the other only for read-only parity evidence.
---

# Iskra Supabase Operator

Diagnose and modify Supabase-backed project state without leaking secrets, duplicating writes, or confusing MCP access with end-user application paths.

## Alias and dual-surface consolidation

```text
iskra-supabase-ops → iskra-supabase-operator
```

When both `Supabase` and `supabase` tools are exposed:

1. Resolve the target project and operation once.
2. Select one primary mutation surface.
3. Use the second surface only for bounded read-only parity evidence when useful.
4. Never repeat a migration, SQL write, branch mutation, function deployment, or destructive action through both surfaces.
5. Record which surface produced each receipt.

Tool naming does not create two independent databases. Connector parity is evidence, not permission for duplicate execution.

## Surface declaration

Before a live operation, name the actual surface:

- project-aware Supabase connector;
- bound Supabase MCP connector;
- repository migration/source only;
- HTTP Edge Function or gateway, only when an invocation tool is actually exposed.

Remember:

```text
Supabase MCP call ≠ HTTP gateway invocation
Edge Function deployed ≠ invoked
RLS enabled ≠ policy coverage
```

## Default diagnostic flow

1. Restate the symptom and target project.
2. Read current tables/schema, policies, migrations, logs, advisors, and relevant source before changing state.
3. Classify the cause: `client | auth | policy | schema | environment | data | function | deployment`.
4. Compare live state with repository source and mark high-risk drift.
5. Produce the smallest reversible SQL, migration, or function diff.
6. Execute only with explicit mutation intent and one selected surface.
7. Read back the changed object and emit a receipt.

## Mutation discipline

```text
READ current state → scope → minimal diff → execute once → read-back → receipt
```

- Use migrations for durable DDL.
- Use raw SQL for bounded diagnostics or DML, not hidden schema changes.
- Include rollback or an explicit irreversible-risk statement.
- Never expose service-role keys, JWTs, connection strings, cookies, passwords, or secret values.
- Never place service-role credentials in frontend code.
- Do not claim a write succeeded without read-back.
- Do not infer gateway identity or JWT role from privileged MCP access.

## RLS checklist

- Is RLS enabled?
- Does an applicable policy exist for the intended role and operation?
- Does the policy use `auth.uid()` or another identity source correctly?
- Is the caller authenticated as expected?
- Are table grants and privileged roles understood?
- Is frontend code using a publishable/anon key rather than service role?

## Edge Function checklist

- Correct project and function version.
- `verify_jwt` matches the documented auth model.
- Secrets are stored in Supabase, not committed.
- CORS is explicit.
- Logs and advisors are inspected.
- Deployment, invocation, and verified response are reported as separate stages.

## Output

```text
Surface:
Target project:
Symptom:
Evidence:
Cause class:
Live vs repo drift:
Minimal fix:
Rollback:
Read-back:
PASS | PARTIAL | FAIL | BLOCKED:
ΔDΩΛ:
```

## References

Load `references/supabase-workflow.md`, `references/connector-security.md`, `references/iskra-anchors.md`, and `references/output-contract.md` as needed.
