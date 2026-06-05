# Supabase ↔ Git Migration Drift Audit — 2026-06-05

Status: verified-partial
Mode: AUDIT / GOVERNANCE
Repository: `serhiipriadko2-sys/iskra`
Supabase project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Region: `eu-west-1`
Database: Postgres 17, project status `ACTIVE_HEALTHY`

## Summary

Read-only audit confirms that the live Supabase project and the Git migration path are not fully aligned. This remains `HIGH-RISK DRIFT` because schema governance, rollback, and security review cannot rely on a single reproducible migration chain yet.

No live database changes were made in this audit.

## Evidence Checked

### Live Supabase migrations

Supabase migration inventory returned:

```text
20260309091308  20260308000000_legacy_data_migration
20260309091342  20260308000001_rate_limiting
20260509073756  iskra_canon_schema_1536_v2
20260509073916  iskra_temp_import_window_open
20260509074021  iskra_canon_import_helpers
20260509074235  iskra_temp_import_window_close
20260509074300  iskra_backfill_status_helpers
20260509092738  iskra_temp_rpc_import_open
20260509092953  enable_pg_net_for_iskra_import
20260509093312  iskra_temp_rpc_import_close_again
```

### Live public tables

Supabase `public` schema table summary returned:

| Table | RLS | Rows |
|:--|:--|--:|
| `public.users` | true | 0 |
| `public.metrics_snapshots` | true | 0 |
| `public.memory_nodes` | true | 0 |
| `public.journal_entries` | true | 0 |
| `public.tasks` | true | 0 |
| `public.habits` | true | 0 |
| `public.voice_preferences` | true | 0 |
| `public.chat_history` | true | 0 |
| `public.audit_log` | true | 0 |
| `public.rate_limits` | true | 0 |
| `public.graph_nodes` | true | 8 |
| `public.graph_edges` | true | 0 |

### Git migration evidence

Current Git path confirms at least:

```text
supabase/migrations/20260101000000_schema.sql
supabase/migrations/20260307_fix_rls_policies.sql
```

Search evidence also surfaced `supabase/migrations/20260307_fix_rls_policies.sql` and previous project memory references to `20260305000000_graph_nodes.sql`.

The live migration inventory does not show the same names/versions as the visible Git migration path. Live has May 2026 `iskra_canon_*` and temp import/RPC migrations not mirrored in the currently verified Git migration list.

## Drift Verdict

`HIGH-RISK DRIFT:` live schema contains current operational tables and migrations that are not explained by a single verified Git migration chain in this audit.

Updated nuance from this pass:

- Earlier memory noted `graph_nodes` / `graph_edges` as repo-visible but not live-confirmed.
- This pass confirms `public.graph_nodes` and `public.graph_edges` now exist live, with RLS enabled.
- The drift remains because the migration provenance still does not align: live migration names/versions differ from the currently verified Git path.

## Security Advisor Findings

Supabase security advisors returned WARN-level findings:

1. `function_search_path_mutable` for:
   - `public.update_graph_nodes_updated_at`
   - `public.graph_bfs_traversal`
   - `public.graph_find_resonant`
   - `public.graph_get_node_with_edges`
2. `extension_in_public`:
   - `pg_trgm` installed in `public` schema.
3. `pg_graphql_anon_table_exposed`:
   - `public.graph_edges`
   - `public.graph_nodes`
4. `pg_graphql_authenticated_table_exposed` for multiple tables, including:
   - `public.audit_log`
   - `public.chat_history`
   - `public.graph_edges`
   - `public.graph_nodes`
   - `public.habits`
   - `public.journal_entries`
   - `public.memory_nodes`
   - `public.metrics_snapshots`
   - `public.tasks`
   - `public.users`
   - `public.voice_preferences`

Advisor remediation references are Supabase database-linter URLs returned by the advisor output, including lint IDs:

```text
0011_function_search_path_mutable
0014_extension_in_public
0026_pg_graphql_anon_table_exposed
0027_pg_graphql_authenticated_table_exposed
```

## Risk

- Live state may be ahead of Git migration history.
- Git migrations may be incomplete, renamed, imported manually, or partially superseded by live import migrations.
- Rollback planning is weak until migration provenance is reconstructed.
- GraphQL exposure warnings may be acceptable for some tables, but that decision is not documented here and should not be assumed safe.
- Function `search_path` warnings can become security-relevant if functions execute with elevated privileges or rely on unqualified object names.

## Safe Remediation Plan

Do not patch live immediately. First create a migration-provenance PR:

1. List all files under `supabase/migrations/` and map them to live migration inventory.
2. For each live-only migration, identify source SQL or reconstruct from schema/function definitions.
3. For each repo-only migration, determine whether it is obsolete, renamed, or unapplied.
4. Create a Git migration reconciliation document and, if needed, SQL migration files that match current live state.
5. Add explicit ADR: what is the working schema canon and rollback model.
6. Only then apply remediation migrations for advisor warnings, with RLS/GraphQL exposure review.

## Current Working Canon

Until reconciliation is complete:

- Supabase live metadata is the source of actual backend state.
- Git migration path is the source of intended reproducible change history.
- Any new live schema change without Git migration path is `HIGH-RISK DRIFT`.

## ΔDΩΛ

Δ: Drift audit updated with current live migrations, public table state, and security advisor warnings.
D: Supabase project metadata, migration inventory, table list, security advisors, Git migration file checks.
Ω: 0.86 for live-state findings; 0.72 for full provenance because complete Git migration file inventory still needs a dedicated tree listing.
Λ: Revise after a migration provenance PR maps every live migration to Git source or explicitly marks it as legacy/manual.
