# Supabase Residual Advisors Approval Packet - 2026-06-26

Status: approval packet only. No live DDL in this document.
Project: AgiIskra / `typcvaszcfdpkzbjzuur`

## Context

The low-risk residual advisor work is already applied and verified:

- `graph_schema_contract_repair`
- `graph_schema_contract_hardening`
- `residual_advisors_rls_fk_hardening`

The remaining Supabase advisor findings have wider runtime/API blast radius and need an explicit compatibility decision before live changes.

## Current Evidence

### GraphQL / table exposure grants

Live grants inventory shows direct `SELECT` grants to API roles:

- `anon`: `public.graph_nodes`, `public.graph_edges`
- `authenticated`: `public.audit_log`, `public.chat_history`, `public.graph_edges`, `public.graph_nodes`, `public.habits`, `public.journal_entries`, `public.memory_nodes`, `public.metrics_snapshots`, `public.tasks`, `public.users`, `public.voice_preferences`

Repo evidence: `runtime/iskraSpace/services/graphServiceSupabase.ts` uses Supabase PostgREST table calls such as:

- `.from('graph_nodes').insert(...).select().single()`
- `.from('graph_edges').insert(...).select().single()`
- `.from('graph_nodes').select('*')`
- `.from('graph_edges').select('id')`

Repo evidence: `runtime/iskraSpace/services/supabaseClient.ts` uses the anon publishable key and anonymous Supabase Auth. Anonymous Auth sessions use the `authenticated` Postgres role with a JWT.

Interpretation: revoking `authenticated` direct table `SELECT` grants would likely break the current PostgREST client path. Revoking only `anon` grants for graph tables is less risky, but still needs an unauthenticated UI/API smoke because graph reads may happen before anonymous auth is established.

### `pg_trgm` in public

Live extension inventory:

- `pg_trgm` version `1.6`
- current schema: `public`
- dependent live index: `iskra.canon_chunks_content_trgm` using `content_text gin_trgm_ops`

Repo search found no direct runtime calls to `similarity`, `word_similarity`, `show_trgm`, or trigram operators outside docs/audits, but the live GIN index depends on the extension operator class.

Interpretation: moving the extension is possible only as a controlled migration with verification that the trigram index remains valid and search queries still work.

### Unused indexes

Performance advisor still reports unused indexes. This is not immediate proof that an index is safe to drop: stats may be young, reset, or the app may have low traffic.

Interpretation: do not drop unused indexes until there is a retention window and a usage baseline.

### Auth DB connection strategy

Performance advisor reports Auth configured with an absolute connection count. This is a dashboard/config decision, not a SQL migration.

## Decision Options

### Option A - Preserve current API grants, accept GraphQL exposure warnings temporarily

Keep current grants. This preserves the PostgREST client path and avoids breaking runtime while the app still uses direct `.from(...)` calls.

PASS criteria:

- Runtime GraphRAG paths keep working.
- Warnings remain documented as accepted risk.

Rollback: not applicable; no change.

### Option B - Revoke `anon` graph table `SELECT` only

Candidate SQL:

```sql
begin;
revoke select on table public.graph_nodes from anon;
revoke select on table public.graph_edges from anon;
commit;
```

Expected effect:

- Clears or reduces anon GraphQL exposure for graph tables.
- Keeps authenticated PostgREST graph path intact.

Required pre-apply smoke:

- Confirm unauthenticated page load does not need graph table reads before anonymous auth.
- Confirm anonymous-auth runtime session can still read/write graph tables as `authenticated`.

Rollback SQL:

```sql
begin;
grant select on table public.graph_nodes to anon;
grant select on table public.graph_edges to anon;
commit;
```

### Option C - Remove direct table exposure through RPC/Edge boundary

Move graph reads/writes behind RPC or Edge Functions, then revoke direct table grants from `anon` and selected `authenticated` tables.

This is the cleaner security posture, but it is a runtime refactor, not a one-line DDL fix.

Required implementation steps:

1. Add typed RPC/Edge API for graph reads/writes.
2. Update `GraphServiceSupabase` to use that API.
3. Add client smoke tests for anonymous-auth and signed-in users.
4. Revoke direct grants only after compatibility proof.

Rollback: restore direct grants and client `.from(...)` code path.

### Option D - Move `pg_trgm` to `extensions` schema

Candidate SQL:

```sql
begin;
create schema if not exists extensions;
alter extension pg_trgm set schema extensions;
commit;
```

Required verification:

```sql
select n.nspname as extension_schema, e.extversion
from pg_extension e
join pg_namespace n on n.oid = e.extnamespace
where e.extname = 'pg_trgm';

select schemaname, tablename, indexname, indexdef
from pg_indexes
where indexname = 'canon_chunks_content_trgm';

select indexrelid::regclass as index_name, indisvalid, indisready
from pg_index
where indexrelid = 'iskra.canon_chunks_content_trgm'::regclass;
```

Rollback SQL:

```sql
begin;
alter extension pg_trgm set schema public;
commit;
```

Risk:

- Any unqualified SQL using trigram functions/operators may need `extensions` in `search_path` or schema qualification.
- Existing GIN index must be validated after the move.

### Option E - Unused index retention window

Do not drop indexes now.

Proposed retention rule:

- Keep all primary/unique/FK-covering/vector/Gin/trigram indexes.
- Record `pg_stat_user_indexes` baseline.
- Recheck after a real usage window, minimum 7 days or after a representative workload.
- Drop candidates only if `idx_scan=0`, not primary/unique/FK-covering, not used by documented query paths, and rollback/recreate SQL is recorded.

## Recommended Next Step

Use Option B only if the product does not need unauthenticated graph browsing before anonymous auth. Otherwise choose Option A until Option C exists.

Run Option D as a separate live migration only after a one-command verification packet is ready and the team accepts the extension-schema risk.

Do not drop unused indexes yet.

## Receipt

- GraphQL grants: inventory complete; no revoke applied.
- `pg_trgm`: dependency inventory complete; no extension move applied.
- Unused indexes: retention rule proposed; no indexes dropped.
- Auth DB connection strategy: dashboard/config follow-up only.
