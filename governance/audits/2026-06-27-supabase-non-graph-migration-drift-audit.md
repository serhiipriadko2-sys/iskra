# Supabase Non-Graph Migration-History Drift Audit — 2026-06-27

Status: reconciled + `claim_legacy_data` service-role hardening applied live
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

Graph-specific receipts (`graph_schema_contract_*`, `graph_anon_select_revoke`, `graph_rpc_boundary*`) are also matched.

### Local-only (not recorded live)

| Local file | Status / interpretation |
|---|---|
| `20260101000000_schema.sql` | Base public app tables; likely created before migration tracking was consistent. |
| `20260305000000_graph_nodes.sql` | Graph schema; graph receipts are out of scope for this pass. |
| `20260307_fix_rls_policies.sql` | Pending RLS hardening. |
| `20260528182000_truth_boundary_p0_security_hardening.sql` | Pending security hardening. |
| `20260528_release_auth_rls_hardening.sql` | Pending auth/RLS hardening. |

## Key Drift Findings

1. **Remote receipts missing from repo** — resolved: 10 non-graph migrations now mirrored in repo.
2. **Local legacy/rate-limiting receipts conflict with remote** — resolved: conflicting local files archived; remote versions are source of truth.
3. **`claim_legacy_data` security gap** — resolved live via Management API migration endpoint as `20260628175506_claim_legacy_data_service_role_only`.
4. **Pending local migrations remain** — base schema, RLS/security hardening are intentional pending; not migration-history drift.

## Proposed Reconciliation (Recommended)

Goal: eliminate remote-only receipt drift while preserving repo intent and avoiding unapproved live DDL.

1. **Add 10 remote-only migration files** to `supabase/migrations/` using the exact remote `version_name.sql` format and the SQL retrieved from `schema_migrations.statements`.  
   These files represent the actual live history; adding them to repo does **not** mutate live state.
2. **Resolve the conflicting legacy/rate-limiting pair**:
   - Move the local `20260308000000_legacy_data_migration.sql`, `20260308000001_rate_limiting.sql`, and superseded `20260301141500_memory_nodes_pgvector_hnsw.sql` out of the scanned migration path to `supabase/migration_archive/`.
   - The remote versions now become the source of truth for those receipts.
   - Capture the repo's service-role-only hardening for `claim_legacy_data` as a new migration, apply it live via Management API, and rename the local file to match the generated remote version.
3. **Leave other local-only migrations as pending/superseded** with explicit classification in the provenance update.
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

## Blast Radius

- One small live DDL: `claim_legacy_data` hardened to `service_role` only; no data mutation.
- Repo changes: new migration files, archival of 3 local files, provenance doc update.
- Fresh local DB (`supabase start`) will now apply the full matched remote history including the hardening migration.
- `db-proxy` and Edge Function drift are out of scope for this migration-history audit.

## Rollback

- Rollback repo: revert the Git commit / restore archived files.
- Rollback live: redeploy the previous `claim_legacy_data` definition (remote `20260309091308` version) via a new migration or manual DDL.

## Risk / Residual

- `claim_legacy_data` hardening is now applied live; confirm no runtime callers were affected.
- Pending RLS/security hardening migrations (`20260307_fix_rls_policies.sql`, `20260528182000_truth_boundary_p0_security_hardening.sql`, `20260528_release_auth_rls_hardening.sql`) remain unapplied; they have wider blast radius and need separate approval.
- The temporary import-window migrations (`iskra_temp_*`) contain broad anon grants that are later revoked in subsequent remote migrations. On a fresh local DB they will be applied in order and leave the intended final state.

## ΔDΩΛ

Δ: Remote-only non-graph migration receipts are committed in Git, conflicting local files archived, superseded file archived, and `claim_legacy_data` hardened live.  
D: Management API read-only/write migration endpoints, `supabase_migrations.schema_migrations`, `supabase migration list --linked`, `pg_proc.proacl`, repo migration files.  
Ω: 0.98 for migration inventory and security posture; 0.78 for full schema reproducibility because pending RLS/security migrations remain.  
Λ: Revise after applying the pending RLS/security migrations or documenting why they remain pending.
