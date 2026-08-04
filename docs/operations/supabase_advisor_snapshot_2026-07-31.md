# Supabase production advisor and migration-drift snapshot — 2026-07-31

Status: `read-only-live-observation`; no remediation executed.

Target: production project `typcvaszcfdpkzbjzuur`.

## Boundary

This snapshot was taken after the successful IskraSpace function-only
production promotion. It covers database/auth advisors, selected policies,
SECURITY DEFINER metadata and migration-history provenance. It is not part of
the Edge deployment proof and does not alter that release verdict.

No SQL write, migration, Auth setting change, grant change, index operation or
extension move was performed while collecting this evidence.

## Advisor categories

The connector snapshot returned 29 security notices and 50 performance notices.
Counts are point-in-time advisor output, not a claim that every notice is a
confirmed vulnerability or a required code change.

Security categories:

| Category | Count | Initial interpretation |
| --- | ---: | --- |
| `rls_enabled_no_policy` | 3 | private tables; fail-closed direct access may be intentional |
| `extension_in_public` | 1 | `pg_trgm`; relocation requires a staged migration |
| `pg_graphql_authenticated_table_exposed` | 11 | object discoverability; row access still depends on grants/RLS |
| `authenticated_security_definer_function_executable` | 13 | intentional RPCs require semantic least-privilege review |
| `auth_leaked_password_protection` | 1 | separate Auth control, not a database migration |

Performance categories:

| Category | Count | Initial interpretation |
| --- | ---: | --- |
| `unindexed_foreign_keys` | 4 | candidate indexes need workload and write-cost review |
| `auth_rls_initplan` | 4 | exact policies can be normalized in a forward migration |
| `unused_index` | 39 | observation only; never a sufficient reason to drop an index |
| `multiple_permissive_policies` | 2 | Graph policies require consolidation and regression tests |
| `auth_db_connections_absolute` | 1 | capacity setting; relevant when instance size changes |

## High-risk migration provenance drift

Repository `main` contains:

- `20260718200634_restore_closed_beta_graph_acl.sql`.

Production migration history does not record that version. Instead it records
two later migrations absent from repository `main`:

- `20260728171718_revoke_direct_execute_on_graph_trigger_function`;
- `20260728183421_parallax_memory_gate`.

Therefore neither side is a complete release source of truth by itself:

- live production wins for what is currently installed;
- the repository wins for reviewed future intent;
- reconciliation requires recovering the exact live-only SQL bodies or an
  equivalent schema-diff receipt before another production migration.

Applying repository migration `20260718200634` directly to production is
blocked until this provenance conflict is resolved and replayed on staging.

## Selected live policy evidence

Production still reports these Graph SELECT policies:

- `graph_nodes_read_public`, role `{public}`, predicate `user_id is null`;
- `graph_edges_read_public`, role `{public}`, predicate `user_id is null`.

It also reports owner policies and restrictive active-beta policies on the same
Graph tables. Current table-grant read-back lists `authenticated` and
`service_role`, but no direct `anon` grant, so the public-role policies do
not by themselves prove a current anonymous read path through the standard API.
They remain a latent widening risk if grants change and contradict the reviewed
closed-beta source intent.

The same grant snapshot shows `authenticated` with CRUD plus `REFERENCES`,
`TRIGGER` and `TRUNCATE` on Graph tables. RLS governs row DML but is not a
substitute for least-privilege table grants; the remediation must prove which
privileges the supported API actually needs.

`users_select_own`, `users_insert_own`, `audit_log_select_own` and
`audit_log_insert_own` still call `auth.uid()` directly rather than through a
single-row subquery. These are the four current `auth_rls_initplan` findings.

The three private tables named by `rls_enabled_no_policy` have no client policy
rows in `pg_policies`. That is fail-closed for ordinary clients and should not
be "fixed" by adding permissive policies unless a concrete access contract
requires them.

## SECURITY DEFINER evidence

The 13 warned public RPCs are executable by `authenticated` and
`service_role`. Read-back shows explicit function-level `search_path` values:

- `consume_ai_quota` and `resolve_beta_access`:
  `pg_catalog, private, auth`;
- the Graph RPC set: `public, pg_temp`.

This removes one common search-path class of vulnerability, but does not prove
that every RPC performs correct identity, beta-membership, ownership, argument
and result filtering. Each grant must be retained or revoked based on a
function-body and two-principal test, not on the advisor title alone.

## Decision boundary

This snapshot supports ADR-20260731-001. The smallest safe next action is
provenance recovery and a reproducible staging branch or local clean replay.
It is not a production-mutation authorization.

## ∆DΩΛ

∆: remaining Supabase advisor work is separated from the successful Edge
release and converted into an evidence-backed database/auth workstream.
D: connector advisors, migration history, `pg_policies`, `pg_proc`, repository
migration files and production read-back.
Ω: 0.94 for the listed live metadata and drift; lower for the unknown SQL body
of the two live-only migrations.
Λ: refresh this snapshot after any production migration, grant/policy change,
Auth protection change, extension move or advisor-engine update.
