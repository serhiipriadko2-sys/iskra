# Supabase Non-Graph Migration-History Drift Audit — 2026-06-27

Status: reconciled (no live DDL)  
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

### Remote-only (missing from repo)

| Version | Name | Provenance note |
|---|---|---|
| `20260309091308` | `20260308000000_legacy_data_migration` | Legacy claim RPC; remote grants `EXECUTE` to `authenticated`, repo file grants only `service_role` |
| `20260309091342` | `20260308000001_rate_limiting` | `public.rate_limits` + `check_rate_limit` RPC; content matches repo file |
| `20260509073756` | `iskra_canon_schema_1536_v2` | Creates `iskra.*` canon schema, 1536-dim vector tables, RLS, helper function |
| `20260509073916` | `iskra_temp_import_window_open` | Temporary anon grants/policies for canon import |
| `20260509074021` | `iskra_canon_import_helpers` | Import RPCs for `canon_documents/chunks/memory_nodes` |
| `20260509074235` | `iskra_temp_import_window_close` | Revokes temporary anon access |
| `20260509074300` | `iskra_backfill_status_helpers` | Backfill status view + RPC |
| `20260509092738` | `iskra_temp_rpc_import_open` | Temporary anon execute on import RPCs |
| `20260509092953` | `enable_pg_net_for_iskra_import` | Creates `pg_net` extension |
| `20260509093312` | `iskra_temp_rpc_import_close_again` | Revokes anon execute on import RPCs |

### Matched (live == repo)

All 2026-06-26 migrations:

- `20260626141034_voice_metrics_drift_repair`
- `20260626153642_graph_schema_contract_repair`
- `20260626153934_graph_schema_contract_hardening`
- `20260626155850_residual_advisors_rls_fk_hardening`
- `20260626161747_graph_anon_select_revoke`
- `20260626164633_graph_rpc_boundary`
- `20260626164745_graph_rpc_boundary_acl_hardening`

### Local-only (not recorded live)

| Local file | Status / interpretation |
|---|---|
| `20260101000000_schema.sql` | Base public app tables; likely created before migration tracking was consistent. |
| `20260301141500_memory_nodes_pgvector_hnsw.sql` | Superseded legacy `public.memory_nodes` shape (384-dim); live shape differs. |
| `20260305000000_graph_nodes.sql` | Graph schema; graph receipts are out of scope for this pass. |
| `20260307_fix_rls_policies.sql` | Pending RLS hardening. |
| `20260308000000_legacy_data_migration.sql` | **Conflicts** with remote `20260309091308` version; repo version is more restrictive (service_role only). |
| `20260308000001_rate_limiting.sql` | **Conflicts** with remote `20260309091342` version; content is equivalent. |
| `20260528182000_truth_boundary_p0_security_hardening.sql` | Pending security hardening. |
| `20260528_release_auth_rls_hardening.sql` | Pending auth/RLS hardening. |

## Key Drift Findings

1. **Remote receipts missing from repo** — 10 non-graph migrations are live but have no Git source. This breaks reproducibility.
2. **Local legacy/rate-limiting receipts conflict with remote** — same logical migration exists in repo with a different version and (for legacy) different security posture.
3. **Pending local migrations remain** — base schema, RLS/security hardening, and legacy superseded files are not applied live. These are intentional pending/superseded, not missing receipts.

## Proposed Reconciliation (Recommended)

Goal: eliminate remote-only receipt drift while preserving repo intent and avoiding unapproved live DDL.

1. **Add 10 remote-only migration files** to `supabase/migrations/` using the exact remote `version_name.sql` format and the SQL retrieved from `schema_migrations.statements`.  
   These files represent the actual live history; adding them to repo does **not** mutate live state.
2. **Resolve the conflicting legacy/rate-limiting pair**:
   - Delete (or archive under `supabase/migrations/archive/`) the local `20260308000000_legacy_data_migration.sql` and `20260308000001_rate_limiting.sql`.
   - The remote versions now become the source of truth for those receipts.
   - The repo's service-role-only hardening for `claim_legacy_data` is **not** applied live. Capture it as a new pending migration `20260627_claim_legacy_data_service_role_only.sql` if the team wants to apply it later.
3. **Leave other local-only migrations as pending/superseded** with explicit classification in the provenance update.
4. **Update `supabase/migrations/PROVENANCE_2026-06-05.md`** (or create `PROVENANCE_2026-06-27.md`) with the new matched table and classification.
5. **Verify** with `npx supabase migration list --linked`; all remote-only entries should be matched.

## Implementation

1. [FACT] Added 10 remote-only migration files to `supabase/migrations/` using exact `version_name.sql` naming and the SQL retrieved from `supabase_migrations.schema_migrations.statements`.
2. [FACT] Moved conflicting local files `20260308000000_legacy_data_migration.sql` and `20260308000001_rate_limiting.sql` to `supabase/migrations/archive/`.
3. [FACT] Created `tools/fetch_supabase_migration_statements.ts` for repeatable evidence collection.
4. [FACT] Created `supabase/migrations/PROVENANCE_2026-06-27.md` with matched inventory and pending/superseded classification.
5. [FACT] Verified with `npx supabase migration list --linked`: all remote entries now have matching local entries.
6. [FACT] Repo contract gates `check:supabase-voice-metrics-contract:repo` and `check:supabase-graph-contract:repo` still pass.

## Blast Radius

- No live DDL, function deploy, secret, or data mutation.
- Repo changes: new migration files, possible deletion/archival of 2 local files, provenance doc update.
- Fresh local DB (`supabase start`) will now apply the full matched remote history.
- `db-proxy` and Edge Function drift are out of scope for this migration-history audit.

## Rollback

- Revert the Git commit / restore archived files.
- Since no live changes are made, rollback is repo-only.

## Risk / Residual

- [HIGH-RISK DRIFT] The live `claim_legacy_data` function is currently executable by `authenticated`, while the repo intended `service_role` only. This security gap remains unless a follow-up migration is applied.
- The temporary import-window migrations (`iskra_temp_*`) contain broad anon grants that are later revoked in subsequent remote migrations. On a fresh local DB they will be applied in order and leave the intended final state.

## ΔDΩΛ

Δ: Remote migration receipts are fetched and ready to be committed into the Git migration path.  
D: Management API read-only query, `supabase_migrations.schema_migrations`, repo migration files.  
Ω: 0.94 for live inventory and statements; 0.78 for reconciliation because pending local migrations and security-posture gap still need decisions.  
Λ: Revise after implementing the recommended reconciliation or after applying the service-role hardening migration.
