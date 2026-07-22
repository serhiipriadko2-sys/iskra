# Supabase workflow

## One-owner rule

`iskra-supabase-ops` is a transition alias. Route new work to `iskra-supabase-operator`.

When both Supabase tool namespaces exist, choose one mutation surface and use the second only for read-only parity checks. Never duplicate a write, migration, branch action, deployment, or destructive command.

## Diagnostic order

1. Target project and surface.
2. Environment and identity.
3. Auth and grants.
4. Schema and migrations.
5. RLS enablement and applicable policies.
6. Query or client code.
7. Edge Function config, logs, and advisors.
8. Live/repository drift.

## Mutation order

```text
read current state
→ define exact scope
→ create minimal reversible diff
→ execute once
→ read back
→ emit receipt
```

Prefer migrations for DDL. Never put service-role keys in frontend code. MCP access does not prove gateway invocation or end-user JWT identity.
