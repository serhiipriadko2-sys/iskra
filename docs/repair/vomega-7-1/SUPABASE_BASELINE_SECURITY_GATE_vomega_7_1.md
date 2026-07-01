# Supabase Baseline + Security Gate vOmega7.1

Status: draft repair PR / no live Supabase mutation
Date: 2026-07-01
Mode: GOVERNANCE / AUDIT

## Purpose

This gate follows the vOmega7.1 router repair. It turns the Supabase metrics
baseline drift into a small migration and keeps broader security hardening behind
fresh inventory.

## Boundary

This PR does not apply SQL to live Supabase. It only adds Git-tracked migration
material and a review plan.

Do not claim advisor cleanup, live database repair, or Builder parity from this
file alone.

## ADR Candidate

ADR-DRAFT-20260701-vomega7-1-supabase-baseline-security

Decision:

1. Repair the remaining metrics defaults in a narrow migration.
2. Keep graph/RLS/GraphQL/function hardening as inventory-first work.
3. Require before/after Supabase advisors before promoting security cleanup.

## Evidence

Runtime baseline:

- `drift: 0.1`
- `echo: 0.1`
- `mirror_sync: 0.7`
- `interrupt: 0.1`
- `ctxSwitch: 0.2`

Existing repo migration `20260626141034_voice_metrics_drift_repair.sql` already
sets `rhythm`, `trust`, `clarity`, `chaos`, and `foresight`, but it does not set
these five remaining defaults.

Prior Supabase receipts record live drift and advisor debt. Fresh connector
recheck during the local Memory gate timed out, so this PR must still be
validated against live Supabase before execution.

## Migration A

File:

```text
supabase/migrations/20260701000000_vomega7_1_metrics_baseline_defaults.sql
```

Forward change:

```sql
alter table public.metrics_snapshots
  alter column drift set default 0.1,
  alter column echo set default 0.1,
  alter column mirror_sync set default 0.7,
  alter column interrupt set default 0.1,
  alter column ctx_switch set default 0.2;
```

Expected effect:

- Existing rows are unchanged.
- Future rows inserted without explicit values start from the runtime baseline.

Rollback SQL:

```sql
begin;

alter table public.metrics_snapshots
  alter column drift set default 0.2,
  alter column echo set default 0.5,
  alter column mirror_sync set default 0.6,
  alter column interrupt set default 0,
  alter column ctx_switch set default 0;

commit;
```

## Verification Query

```sql
select
  column_name,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'metrics_snapshots'
  and column_name in (
    'drift',
    'echo',
    'mirror_sync',
    'interrupt',
    'ctx_switch'
  )
order by column_name;
```

PASS:

- `drift` default is `0.1`.
- `echo` default is `0.1`.
- `mirror_sync` default is `0.7`.
- `interrupt` default is `0.1`.
- `ctx_switch` default is `0.2`.
- Supabase advisors show no regression after the migration.

FAIL:

- Any target column is missing or renamed.
- Defaults remain at prior drift values.
- SQL is applied outside a tracked migration path.

## Migration B - Security Hardening Gate

Security hardening remains inventory-first. Do not write a final hardening
migration until these are refreshed from live Supabase:

- extension placement for `pg_trgm` and `pg_graphql`;
- graph RPC function signatures, owners, `security_definer`, and `search_path`;
- function EXECUTE grants for `anon` and `authenticated`;
- graph and memory RLS policies;
- table grants visible to API roles;
- security and performance advisor results.

The repair direction remains:

- document or move `pg_trgm` out of `public` after dependency check;
- keep SECURITY DEFINER functions on explicit `search_path`;
- revoke unnecessary RPC EXECUTE grants;
- consolidate duplicate permissive graph policies only after caller model review;
- keep GraphQL exposure decisions tied to grants, RLS, and app usage.

## Advisor Recheck

Before live promotion:

1. Capture pre-migration security and performance advisors.
2. Apply Migration A on branch/staging or approved live target.
3. Run the verification query.
4. Rerun advisors.
5. Record PASS/PARTIAL/FAIL with advisor IDs and rollback notes.

## Non-Claims

This gate does not prove:

- live Supabase has been changed;
- advisors are clean;
- GraphRAG is mature;
- Builder live behavior is verified;
- Workspace Agent Memory UI has consumed this file.

## Delta Trace

Delta:
Metrics baseline repair moved from broad drift warning into a concrete migration.

Data:
Runtime `DEFAULT_METRICS`, existing migration inventory, prior Supabase receipts,
and local Memory gate evidence.

Omega:
0.88 for the metrics migration scope; lower for security hardening until live
inventory succeeds.

Lambda:
Revisit after branch/staging advisor evidence or after live Supabase read-only
inventory succeeds.
