# Supabase Migration Provenance Map — 2026-06-27

Status: reconciled-non-graph + RLS/security hardening applied live
Mode: AUDIT / GOVERNANCE
Project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Scope: migration-history receipts for non-graph objects; selected RLS/security hardening applied live

## Reconciliation Result

All **remote-only non-graph migration receipts** are now mirrored in `supabase/migrations/`.
`supabase migration list --linked` shows **no unmatched remote entries**.

## Live ↔ Repo Inventory (non-graph)

| Live version | Live name | Repo file | Status |
|---|---|---|---|
| `20260309091308` | `20260308000000_legacy_data_migration` | `supabase/migrations/20260309091308_20260308000000_legacy_data_migration.sql` | matched |
| `20260309091342` | `20260308000001_rate_limiting` | `supabase/migrations/20260309091342_20260308000001_rate_limiting.sql` | matched |
| `20260509073756` | `iskra_canon_schema_1536_v2` | `supabase/migrations/20260509073756_iskra_canon_schema_1536_v2.sql` | matched |
| `20260509073916` | `iskra_temp_import_window_open` | `supabase/migrations/20260509073916_iskra_temp_import_window_open.sql` | matched |
| `20260509074021` | `iskra_canon_import_helpers` | `supabase/migrations/20260509074021_iskra_canon_import_helpers.sql` | matched |
| `20260509074235` | `iskra_temp_import_window_close` | `supabase/migrations/20260509074235_iskra_temp_import_window_close.sql` | matched |
| `20260509074300` | `iskra_backfill_status_helpers` | `supabase/migrations/20260509074300_iskra_backfill_status_helpers.sql` | matched |
| `20260509092738` | `iskra_temp_rpc_import_open` | `supabase/migrations/20260509092738_iskra_temp_rpc_import_open.sql` | matched |
| `20260509092953` | `enable_pg_net_for_iskra_import` | `supabase/migrations/20260509092953_enable_pg_net_for_iskra_import.sql` | matched |
| `20260509093312` | `iskra_temp_rpc_import_close_again` | `supabase/migrations/20260509093312_iskra_temp_rpc_import_close_again.sql` | matched |
| `20260626141034` | `voice_metrics_drift_repair` | `supabase/migrations/20260626141034_voice_metrics_drift_repair.sql` | matched |
| `20260626155850` | `residual_advisors_rls_fk_hardening` | `supabase/migrations/20260626155850_residual_advisors_rls_fk_hardening.sql` | matched |
| `20260628175506` | `claim_legacy_data_service_role_only` | `supabase/migrations/20260628175506_claim_legacy_data_service_role_only.sql` | matched |
| `20260628180542` | `fix_rls_policies` | `supabase/migrations/20260628180542_fix_rls_policies.sql` | matched |
| `20260628180654` | `truth_boundary_p0_security_hardening` | `supabase/migrations/20260628180654_truth_boundary_p0_security_hardening.sql` | matched |

Graph-specific receipts (`graph_schema_contract_*`, `graph_anon_select_revoke`, `graph_rpc_boundary*`) are matched and tracked separately; they were already in repo.

## Superseded / Archived Local Files

The following local files represented the same logical receipts as remote versions but with different versions and (for legacy data) different security posture. They were moved to `supabase/migration_archive/` and are no longer part of the active migration list:

- `20260308000000_legacy_data_migration.sql` → `supabase/migration_archive/`
- `20260308000001_rate_limiting.sql` → `supabase/migration_archive/`
- `20260301141500_memory_nodes_pgvector_hnsw.sql` → `supabase/migration_archive/` (legacy `public.memory_nodes` shape superseded by live shape and `iskra.canon_*` path)

## Applied Security Hardening

`claim_legacy_data` was applied live via Management API migration endpoint on 2026-06-28 as version `20260628175506_claim_legacy_data_service_role_only`. Live `proacl` now shows execute only for `postgres` and `service_role`; `authenticated` and `anon` access is revoked.

## Intentional Pending / Local-Only Migrations

These files remain in `supabase/migrations/` but are not yet recorded live. They are classified as pending or superseded, not as drift:

| Local file | Classification | Note |
|---|---|---|
| `20260101000000_schema.sql` | pending/bootstrap | Base public app tables; live tables exist but were created before consistent migration tracking. |
| `20260305000000_graph_nodes.sql` | graph-scope / historical | Original graph schema; graph contract repairs brought it up to date. |
| `20260528_release_auth_rls_hardening.sql` | pending | Skipped: массово сбрасывает graph-политики и удаляет `user_id IS NULL` для seed-узлов; требует отдельного решения. |

## Verification

```bash
npx supabase migration list --linked
```

Expected: all `Remote` entries have a matching `Local` entry; the only `Local`-only entries are the pending/superseded files listed above.

## ΔDΩΛ

Δ: Remote-only non-graph migration receipts are now committed in Git; migration-history drift for non-graph receipts is eliminated.  
D: Management API read-only query of `supabase_migrations.schema_migrations.statements`, `supabase migration list --linked`, repo migration files.  
Ω: 0.97 for migration inventory alignment; 0.75 for full schema reproducibility because pending/superseded local migrations remain.  
Λ: Revise after resolving `20260528_release_auth_rls_hardening.sql` graph conflict or applying a graph-safe replacement.
