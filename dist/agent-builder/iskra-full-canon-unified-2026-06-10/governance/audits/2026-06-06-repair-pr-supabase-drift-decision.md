# Repair PR Supabase Drift Decision — 2026-06-06

Status: proposed
Mode: AUDIT / GOVERNANCE
Repository: `serhiipriadko2-sys/iskra`
Supabase project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Live mutation: none

## Context

The 2026-06-06 full repository verification found three repair targets:

1. `ledger/sot.json` was stale for `README.md` and `CONTRIBUTING.md`.
2. `supabase/functions/embed/index.ts` imported `../_shared/cors.ts`, but that shared file was missing from the repository.
3. Live Supabase still contains migrations and Edge Functions that are not fully represented by the Git migration/function path.

## Decision

This repair PR fixes only repo-local integrity and import breakage:

- resync the ledger hashes for `README.md` and `CONTRIBUTING.md`
- add `supabase/functions/_shared/cors.ts` so `embed` has its declared dependency
- keep Supabase live state untouched

Supabase drift remains an explicit follow-up, not a hidden side effect of this PR.

## Supabase Drift Boundary

`HIGH-RISK DRIFT:` live Supabase state and Git are still not one reproducible chain.

Read-only evidence on 2026-06-06 still showed live-only or not-yet-mapped Edge Functions:

- `db-proxy`
- `iskra-canon-backfill-1536`
- `iskra-canon-import-1536`
- `iskra-canon-import-diagnostic`

It also showed live migrations that need provenance closure before safe SQL remediation:

- `iskra_canon_schema_1536_v2`
- `iskra_temp_import_window_open`
- `iskra_canon_import_helpers`
- `iskra_temp_import_window_close`
- `iskra_backfill_status_helpers`
- `iskra_temp_rpc_import_open`
- `enable_pg_net_for_iskra_import`
- `iskra_temp_rpc_import_close_again`

## Why This PR Does Not Patch Live Supabase

Changing live Supabase now would mix two different jobs:

1. repairing a broken repository dependency and stale ledger entries
2. deciding the production owner/caller model for live functions, graph tables, memory tables, and canon-ingestion paths

Those jobs have different blast radius. The first is safe and reviewable. The second needs a dedicated migration/function provenance PR and before/after Supabase advisor evidence.

## Required Follow-up

1. Complete migration/function provenance inventory.
2. Classify every live-only function as `import to Git`, `retire`, or `document as external/manual`.
3. Decide the owner/caller model for `public.memory_nodes`, `graph_nodes`, and `graph_edges`.
4. Only then prepare a SQL/function remediation PR with rollback notes and Supabase advisor checks.

## Verification

This PR should pass when:

- ledger verification reports no mismatches for tracked files
- the import scan reports no missing relative import for `supabase/functions/embed/index.ts`
- `tools/check_supabase_edge_security.py` still passes
- no Supabase live mutation occurred

## Rollback

If the shared CORS helper is incorrect for Supabase Edge Runtime, revert `supabase/functions/_shared/cors.ts` and either inline the CORS headers in `embed/index.ts` or update the import to the canonical shared helper path.

If the ledger hashes are disputed, rerun the ledger update command from the current `main` file contents and replace only the mismatched entries.

## ΔDΩΛ

Δ: Repo-local breakage is separated from live Supabase drift.
D: GitHub `main`, local full snapshot, `ledger/sot.json`, `supabase/functions/embed/index.ts`, read-only Supabase migration/function inventory.
Ω: 0.90 for repo repair scope; 0.78 for Supabase drift classification until every live function body and migration source is mapped.
Λ: Revise after the dedicated provenance PR imports or retires live-only Supabase functions/migrations.
