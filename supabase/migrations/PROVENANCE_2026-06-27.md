# Supabase Migration Provenance Map — 2026-06-27

Status: reconciled-non-graph
Mode: AUDIT / GOVERNANCE
Project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Scope: migration-history receipts for non-graph objects; no live DDL applied

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

Graph-specific receipts (`graph_schema_contract_*`, `graph_anon_select_revoke`, `graph_rpc_boundary*`) are matched and tracked separately; they were already in repo.

## Superseded / Archived Local Files

The following local files represented the same logical receipts as remote versions but with different versions and (for legacy data) different security posture. They were moved to `supabase/migrations/archive/` and are no longer part of the active migration list:

- `20260308000000_legacy_data_migration.sql` → archived
- `20260308000001_rate_limiting.sql` → archived

The archived legacy-data file restricts `claim_legacy_data` to `service_role`; the live function currently allows `authenticated`. This security gap is documented in `governance/audits/2026-06-27-supabase-non-graph-migration-drift-audit.md` and can be closed by a future pending migration.

## Intentional Pending / Local-Only Migrations

These files remain in `supabase/migrations/` but are not yet recorded live. They are classified as pending or superseded, not as drift:

| Local file | Classification | Note |
|---|---|---|
| `20260101000000_schema.sql` | pending/bootstrap | Base public app tables; live tables exist but were created before consistent migration tracking. |
| `20260301141500_memory_nodes_pgvector_hnsw.sql` | superseded | Legacy `public.memory_nodes` shape; live shape and the `iskra.canon_*` path supersede it. |
| `20260305000000_graph_nodes.sql` | graph-scope / historical | Original graph schema; graph contract repairs brought it up to date. |
| `20260307_fix_rls_policies.sql` | pending | RLS hardening not yet applied live. |
| `20260528182000_truth_boundary_p0_security_hardening.sql` | pending | Sprint 2 hardening not yet applied live. |
| `20260528_release_auth_rls_hardening.sql` | pending | Release auth/RLS hardening not yet applied live. |

## Verification

```bash
npx supabase migration list --linked
```

Expected: all `Remote` entries have a matching `Local` entry; the only `Local`-only entries are the pending/superseded files listed above.

## ΔDΩΛ

Δ: Remote-only non-graph migration receipts are now committed in Git; migration-history drift for non-graph receipts is eliminated.  
D: Management API read-only query of `supabase_migrations.schema_migrations.statements`, `supabase migration list --linked`, repo migration files.  
Ω: 0.96 for migration inventory alignment; 0.70 for full schema reproducibility because pending/superseded local migrations and the `claim_legacy_data` security gap remain.  
Λ: Revise after closing the service-role hardening gap or applying the pending RLS/security migrations.
