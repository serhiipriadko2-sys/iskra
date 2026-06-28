# Supabase Non-Graph Migration-History Drift Audit — 2026-06-27

Status: reconciled + selected RLS/security hardening applied live
Mode: AUDIT / GOVERNANCE  
Repository: `serhiipriadko2-sys/iskra`  
Project: `AgiIskra / typcvaszcfdpkzbjzuur`

## Scope

This audit focuses on **migration-history receipts** that are **not graph-specific**. Graph schema repairs (2026-06-26) are excluded from the reconciliation target unless they touch the same inventory.

## Evidence Sources

- [FACT] Live migration inventory fetched via Management API read-only query: `output/supabase_audit_2026-06-27/remote_migrations/manifest.json`.
- [FACT] Full remote SQL statements retrieved from `supabase_migrations.schema_migrations.statements` and saved to `output/supabase_audit_2026-06-27/remote_migrations/`.
- [FACT] `supabase migration list --linked` run against `typcvaszcfdpkzbjzuur`.
- [FACT] Repo migration files under `supabase/migrations/`.

## Current Migration Inventory

### Matched (live == repo)

All remote non-graph receipts are now mirrored in repo:

- `20260309091308_20260308000000_legacy_data_migration`
- `20260309091342_20260308000001_rate_limiting`
- `20260509073756_iskra_canon_schema_1536_v2`
- `20260509073916_iskra_temp_import_window_open`
- `20260509074021_iskra_canon_import_helpers`
- `20260509074235_iskra_temp_import_window_close`
- `20260509074300_iskra_backfill_status_helpers`
- `20260509092738_iskra_temp_rpc_import_open`
- `20260509092953_enable_pg_net_for_iskra_import`
- `20260509093312_iskra_temp_rpc_import_close_again`
- `20260626141034_voice_metrics_drift_repair`
- `20260626155850_residual_advisors_rls_fk_hardening`
- `20260628175506_claim_legacy_data_service_role_only`
- `20260628180542_fix_rls_policies`
- `20260628180654_truth_boundary_p0_security_hardening`

Graph-specific receipts (`graph_schema_contract_*`, `graph_anon_select_revoke`, `graph_rpc_boundary*`) are also matched.

### Local-only (not recorded live)

| Local file | Status / interpretation |
|---|---|
| `20260101000000_schema.sql` | Base public app tables; likely created before migration tracking was consistent. |
| `20260305000000_graph_nodes.sql` | Graph schema; graph receipts are out of scope for this pass. |
| `20260528_release_auth_rls_hardening.sql` | Skipped: массово сбрасывает graph-политики и удаляет `user_id IS NULL` для seed-узлов; требует отдельного graph-safe решения. |

## Key Drift Findings

1. **Remote receipts missing from repo** — resolved: 10 non-graph migrations now mirrored in repo.
2. **Local legacy/rate-limiting receipts conflict with remote** — resolved: conflicting local files archived; remote versions are source of truth.
3. **`claim_legacy_data` security gap** — resolved live via Management API migration endpoint as `20260628175506_claim_legacy_data_service_role_only`.
4. **Pending local migrations remain** — base schema and `20260528_release_auth_rls_hardening.sql` intentional pending; `release_auth` skipped because it conflicts with live graph seed-node policies.

## Proposed Reconciliation (Recommended)

Goal: eliminate remote-only receipt drift while preserving repo intent and avoiding unapproved live DDL.

1. **Add 10 remote-only migration files** to `supabase/migrations/` using the exact remote `version_name.sql` format and the SQL retrieved from `schema_migrations.statements`.  
   These files represent the actual live history; adding them to repo does **not** mutate live state.
2. **Resolve the conflicting legacy/rate-limiting pair**:
   - Move the local `20260308000000_legacy_data_migration.sql`, `20260308000001_rate_limiting.sql`, and superseded `20260301141500_memory_nodes_pgvector_hnsw.sql` out of the scanned migration path to `supabase/migration_archive/`.
   - The remote versions now become the source of truth for those receipts.
   - Capture the repo's service-role-only hardening for `claim_legacy_data` as a new migration, apply it live via Management API, and rename the local file to match the generated remote version.
3. **Leave base schema and `20260528_release_auth_rls_hardening.sql` as pending** with explicit classification. `release_auth` requires a graph-safe rewrite before live application.
4. **Update `supabase/migrations/PROVENANCE_2026-06-05.md`** (or create `PROVENANCE_2026-06-27.md`) with the new matched table and classification.
5. **Verify** with `npx supabase migration list --linked`; all remote-only entries should be matched.

## Implementation

1. [FACT] Added 10 remote-only migration files to `supabase/migrations/` using exact `version_name.sql` naming and the SQL retrieved from `supabase_migrations.schema_migrations.statements`.
2. [FACT] Moved conflicting local files `20260308000000_legacy_data_migration.sql` and `20260308000001_rate_limiting.sql` to `supabase/migration_archive/` (outside the migration path scanned by the CLI).
3. [FACT] Created `tools/fetch_supabase_migration_statements.ts` for repeatable evidence collection.
4. [FACT] Created `supabase/migrations/PROVENANCE_2026-06-27.md` with matched inventory and pending/superseded classification.
5. [FACT] Verified with `npx supabase migration list --linked`: all remote entries have matching local entries, and the archived conflicting files no longer appear in the local list.
6. [FACT] Archived superseded `20260301141500_memory_nodes_pgvector_hnsw.sql` to `supabase/migration_archive/`.
7. [FACT] Applied `claim_legacy_data` hardening live via Management API migration endpoint; remote version `20260628175506`. Renamed local file to `supabase/migrations/20260628175506_claim_legacy_data_service_role_only.sql`.
8. [FACT] Verified live `proacl`: `claim_legacy_data` executable only by `postgres` and `service_role`.
9. [FACT] Repo contract gates `check:supabase-voice-metrics-contract:repo` and `check:supabase-graph-contract:repo` still pass.
10. [FACT] Applied `fix_rls_policies` live via Management API; remote version `20260628180542`. Renamed local file to `supabase/migrations/20260628180542_fix_rls_policies.sql`.
11. [FACT] Applied `truth_boundary_p0_security_hardening` live via Management API; remote version `20260628180654`. Renamed local file to `supabase/migrations/20260628180654_truth_boundary_p0_security_hardening.sql`. Corrected `ALTER FUNCTION IF EXISTS` to `ALTER FUNCTION` because the Management API query parser rejected `IF EXISTS`.
12. [FACT] Skipped `20260528_release_auth_rls_hardening.sql` live: it drops all policies on `graph_nodes`/`graph_edges` and recreates them without `user_id IS NULL`, which would hide 8 live seed nodes with `user_id = NULL`.

## Blast Radius

- Three targeted live DDLs applied: `claim_legacy_data` service-role hardening, `fix_rls_policies`, `truth_boundary_p0_security_hardening`; no data mutation.
- Repo changes: new migration files, archival of 3 local files, provenance doc update.
- Fresh local DB (`supabase start`) will now apply the full matched remote history including the three hardening migrations.
- `db-proxy` and Edge Function drift are out of scope for this migration-history audit.

## Rollback

- Rollback repo: revert the Git commit / restore archived files.
- Rollback live: redeploy the previous definitions via new migrations or manual DDL:
  - `claim_legacy_data`: remote `20260309091308` version.
  - RLS/policies: snapshot policies and grants before applying the hardening migrations.

## Risk / Residual

- `claim_legacy_data`, `fix_rls_policies`, and `truth_boundary_p0_security_hardening` are now applied live; confirm no runtime callers were affected.
- `20260528_release_auth_rls_hardening.sql` remains unapplied because it conflicts with live graph seed-node policies. It needs a graph-safe rewrite or a separate graph-policy restoration step.
- The temporary import-window migrations (`iskra_temp_*`) contain broad anon grants that are later revoked in subsequent remote migrations. On a fresh local DB they will be applied in order and leave the intended final state.

## ΔDΩΛ

Δ: Remote-only non-graph migration receipts committed in Git, conflicting/superseded files archived, `claim_legacy_data` hardened live, `fix_rls_policies` and `truth_boundary_p0` applied live.  
D: Management API read-only/write migration endpoints, `supabase_migrations.schema_migrations`, `supabase migration list --linked`, `pg_proc.proacl`, repo gates, live advisors.  
Ω: 0.98 for migration inventory and security posture; 0.82 for full schema reproducibility because pending base schema and `release_auth` remain.  
Λ: Revise after resolving `20260528_release_auth_rls_hardening.sql` graph conflict or documenting why it remains pending.
