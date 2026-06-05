# Supabase Migration Provenance Map — 2026-06-05

Status: verified-partial
Mode: AUDIT / GOVERNANCE
Project: `AgiIskra` / `typcvaszcfdpkzbjzuur`
Scope: read-only provenance map; no live migration applied

## Purpose

This document maps the currently observed live Supabase migration/schema state against the repository migration path. It is intentionally not a remediation migration. It exists to make the next SQL change reviewable and reversible.

## Current Verdict

`HIGH-RISK DRIFT:` live Supabase state and the verified Git migration path do not currently form one complete, reproducible migration chain.

Working canon until reconciliation:

- Live Supabase metadata is the source of actual backend state.
- Git migrations are the source of intended reproducible change history.
- New live DDL without a Git migration path remains `HIGH-RISK DRIFT`.

## Live Migration Inventory

Observed via Supabase migration inventory:

| Live version | Live migration name | Repo provenance status |
|:--|:--|:--|
| `20260309091308` | `20260308000000_legacy_data_migration` | unresolved; likely related to legacy data migration but exact repo file/version does not match verified file names |
| `20260309091342` | `20260308000001_rate_limiting` | unresolved; live object `public.rate_limits` exists, but exact Git source was not proven in this pass |
| `20260509073756` | `iskra_canon_schema_1536_v2` | live-only or not yet mapped; likely current canon-ingestion path referenced by `supabase/README.md` |
| `20260509073916` | `iskra_temp_import_window_open` | live-only or not yet mapped |
| `20260509074021` | `iskra_canon_import_helpers` | live-only or not yet mapped |
| `20260509074235` | `iskra_temp_import_window_close` | live-only or not yet mapped |
| `20260509074300` | `iskra_backfill_status_helpers` | live-only or not yet mapped |
| `20260509092738` | `iskra_temp_rpc_import_open` | live-only or not yet mapped |
| `20260509092953` | `enable_pg_net_for_iskra_import` | live-only or not yet mapped |
| `20260509093312` | `iskra_temp_rpc_import_close_again` | live-only or not yet mapped |

## Verified Git Migration / Migration-Adjacent Files

| Repo file | Observed purpose | Live relationship |
|:--|:--|:--|
| `supabase/migrations/20260101000000_schema.sql` | Base public app tables: `users`, `metrics_snapshots`, `journal_entries`, `tasks`, `habits`, `voice_preferences`, `chat_history`, `audit_log`, RLS policies | Partially represented live: these public tables exist with RLS enabled |
| `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql` | Legacy public GraphRAG path: `public.memory_nodes` with `vector(384)` and RPCs | Drift: live `public.memory_nodes` exists but observed live columns do not include the `embedding vector(384)` shape from this file |
| `supabase/migrations/20260305000000_graph_nodes.sql` | `public.graph_nodes`, `public.graph_edges`, graph RPCs, permissive-ish `user_id = auth.uid() OR user_id IS NULL` graph policies, canonical seed nodes | Partially represented live: `graph_nodes` and `graph_edges` exist; live advisors still flag graph function `search_path` and graph GraphQL exposure |
| `supabase/migrations/20260307_fix_rls_policies.sql` | Tightens public app-table RLS to authenticated `auth.uid()` policies; grants service role | Partially represented live: many current policies match older owner-scoped names, but graph policies still allow `public` with `user_id IS NULL` |
| `supabase/migrations/README_LEGACY_DATA_MIGRATION.sql` | Manual legacy device_id -> auth.uid() data migration script | Migration-adjacent, not a normal tracked applied migration |
| `supabase/migrations/20260528182000_truth_boundary_p0_security_hardening.sql` | Sprint 2 security hardening: revoke anon/authenticated grants, lock internal tables, remove broad policies, revoke privileged RPC execute | Not reflected by current live advisors/grants: WARNs and broad grants remain for several objects |

## Live Public Schema Snapshot

Observed live tables:

| Table | RLS | Rows | Provenance note |
|:--|:--|--:|:--|
| `public.users` | true | 0 | base app schema |
| `public.metrics_snapshots` | true | 0 | base app schema |
| `public.memory_nodes` | true | 0 | live shape differs from older pgvector migration |
| `public.journal_entries` | true | 0 | base app schema |
| `public.tasks` | true | 0 | base app schema |
| `public.habits` | true | 0 | base app schema |
| `public.voice_preferences` | true | 0 | base app schema |
| `public.chat_history` | true | 0 | base app schema |
| `public.audit_log` | true | 0 | base app schema; current grants/advisors still need review |
| `public.rate_limits` | true | 0 | live migration exists; exact Git source unresolved |
| `public.graph_nodes` | true | 8 | graph migration represented live; seeded data likely present |
| `public.graph_edges` | true | 0 | graph migration represented live |

Important observed live shape differences:

- Live `public.memory_nodes` uses fields such as `layer`, `type`, `title`, `content jsonb`, `doc_type`, `trust_level`, `tags`, `section`, `facet`, `evidence`.
- Repo migration `20260301141500_memory_nodes_pgvector_hnsw.sql` defines a different legacy vector shape with `content text`, `layer in ('core','memory','dream')`, `ts`, `fractal`, and `embedding vector(384)`.
- Repo `supabase/README.md` already marks this as a truth-boundary issue and says the current target for canon ingestion is a newer `1536`-dimension contract.

## Security / Access Provenance

Read-only live checks found:

### Function config

| Function | Security definer | search_path config | Note |
|:--|:--|:--|:--|
| `public.check_rate_limit(text,text,integer,integer)` | true | `search_path=public` | privileged helper exists live |
| `public.claim_legacy_data(text)` | true | `search_path=public` | privileged helper exists live |
| `public.graph_bfs_traversal(text,integer,real)` | false | empty | advisor flags mutable search_path |
| `public.graph_find_resonant(real,integer)` | false | empty | advisor flags mutable search_path |
| `public.graph_get_node_with_edges(text)` | false | empty | advisor flags mutable search_path |
| `public.update_graph_nodes_updated_at()` | false | empty | advisor flags mutable search_path |

### Policy/grant drift

Observed live policy/grant state does not reflect the full intended effect of `20260528182000_truth_boundary_p0_security_hardening.sql`:

- `graph_nodes` and `graph_edges` policies still use role `{public}` and allow `(user_id = auth.uid()) OR (user_id IS NULL)`.
- `graph_nodes` and `graph_edges` still grant broad privileges to `anon` and `authenticated`.
- `audit_log` still grants broad privileges to `authenticated`.
- Several app tables still have broad table grants to `authenticated`, even where RLS narrows row access.

## Advisor Findings To Remediate Later

Supabase advisors returned WARN findings for:

- `0011_function_search_path_mutable`
- `0014_extension_in_public` for `pg_trgm`
- `0026_pg_graphql_anon_table_exposed` for graph tables
- `0027_pg_graphql_authenticated_table_exposed` for multiple public tables

This PR does not remediate those findings. It documents them so a follow-up migration can be reviewed against actual live state.

## Proposed Next PRs

### PR A — Provenance inventory closure

Goal: produce a complete, reviewed table of every file under `supabase/migrations/` and every live migration.

Actions:

1. Add a machine-readable repo migration inventory if GitHub tree listing is available.
2. Mark each live migration as `matched`, `live-only`, `renamed/manual`, `legacy`, or `unknown`.
3. Decide whether May 2026 `iskra_canon_*` migrations should be imported into Git as historical SQL or documented as external/manual.

### PR B — Public graph hardening migration

Goal: fix graph-specific advisor warnings without changing data.

Candidate operations for review only:

1. Set explicit `search_path` on graph functions.
2. Remove `anon` grants from `public.graph_nodes` and `public.graph_edges` unless public graph read is intentionally required.
3. Replace graph policies that allow `user_id IS NULL` to public roles with a reviewed canon-read model or server-only path.

### PR C — Truth-boundary public memory decision

Goal: decide whether `public.memory_nodes` remains app user-memory, legacy public GraphRAG, or deprecated in favor of `iskra.*` canon path.

Actions:

1. Document the live `public.memory_nodes` shape.
2. Link callers to app-memory vs canon-memory paths.
3. Decide whether to freeze writes, migrate callers, or keep as user-memory with owner-only RLS.

### PR D — Advisor remediation migration

Goal: after PR A/B/C decisions, apply one reviewed SQL migration to reduce advisor warnings.

Requirements:

- explicit rollback note
- no service-role exposure
- RLS/GraphQL checks before and after
- Supabase advisor check after migration

## Definition of Done for Provenance Closure

PASS when:

- every live migration has a Git source or an explicit legacy/manual classification
- every repo migration is classified as applied/current, pending, superseded, or legacy
- `public.memory_nodes`, `graph_nodes`, and `graph_edges` each have one documented owner/caller model
- follow-up hardening SQL can be reviewed without guessing provenance

FAIL when:

- live-only migrations remain unexplained
- Git migrations are assumed applied without live evidence
- security advisors are patched without understanding ownership/caller model

## ΔDΩΛ

Δ: Migration drift is converted into a provenance map with next PR sequence.
D: Git migration files, `supabase/README.md`, live Supabase migrations/tables/functions/policies/grants/advisors.
Ω: 0.86 for observed live and fetched Git facts; 0.74 for full migration inventory because a complete repository tree listing still needs a stronger file-list source.
Λ: Revise after full repo migration tree inventory or after importing live-only May 2026 migration SQL into Git.
