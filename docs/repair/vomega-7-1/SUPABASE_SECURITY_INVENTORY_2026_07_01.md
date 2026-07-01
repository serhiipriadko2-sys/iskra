# Supabase Security Inventory - 2026-07-01

Status: fresh live inventory / draft repair PR / no live mutation
Mode: GOVERNANCE / AUDIT
Project: `https://typcvaszcfdpkzbjzuur.supabase.co`

## Purpose

This inventory follows PR #235. It separates low-risk RLS policy advisor cleanup
from higher-risk security decisions about GraphQL exposure, SECURITY DEFINER
RPCs, and extension placement.

## Fresh Live Evidence

Read-only Supabase connector calls succeeded on 2026-07-01 for:

- project URL;
- security advisors;
- performance advisors;
- `public` and `iskra` table inventory;
- migration list;
- Edge Function list;
- targeted SQL for metrics defaults, policies, graph functions, grants, and extensions.

## Metrics Defaults

Live `public.metrics_snapshots` still has drifted defaults:

- `ctx_switch`: `0`
- `drift`: `0.2`
- `echo`: `0.5`
- `interrupt`: `0`
- `mirror_sync`: `0.6`

PR #235 addresses this separately.

## Security Advisors

Fresh security advisor warnings:

- `extension_in_public`: `public.pg_trgm`.
- `pg_graphql_authenticated_table_exposed`: `public.audit_log`, `chat_history`, `graph_edges`, `graph_nodes`, `habits`, `journal_entries`, `memory_nodes`, `metrics_snapshots`, `tasks`, `users`, `voice_preferences`.
- `authenticated_security_definer_function_executable`: graph RPCs including create/update/delete/search/traverse/stats functions.

Decision for this PR:

- Do not move `pg_trgm` yet; dependency check first.
- Do not revoke authenticated table grants yet; app usage and GraphQL exposure model first.
- Do not revoke authenticated graph RPC EXECUTE grants yet; repo migrations intentionally created an authenticated RPC boundary.

## Performance Advisors

Fresh performance advisor warnings include:

- `auth_rls_initplan` for user-owned app policies using direct `auth.uid()`;
- `auth_rls_initplan` for old duplicate graph policies;
- `multiple_permissive_policies` on `public.graph_nodes` and `public.graph_edges`;
- `unused_index` informational findings;
- Auth DB connection strategy info.

## RLS Policy Findings

Live policies still include direct `auth.uid()` in:

- `users_select_own`, `users_insert_own`, `users_update_own`;
- `metrics_snapshots_manage_own`;
- `memory_nodes_manage_own`;
- `journal_entries_manage_own`;
- `tasks_manage_own`;
- `habits_manage_own`;
- `voice_preferences_manage_own`;
- `chat_history_manage_own`;
- `audit_log_select_own`, `audit_log_insert_own`.

Live graph tables also have duplicate overlapping policies:

- `Users can manage own graph nodes (secure)`;
- `graph_nodes_user_isolation`;
- `Users can manage own graph edges (secure)`;
- `graph_edges_user_isolation`.

The `graph_*_user_isolation` policies already use `(select auth.uid())` and preserve
canonical `user_id is null` visibility. The older direct-auth graph policies can
be dropped.

## PR Scope

This PR adds:

```text
supabase/migrations/20260701010000_vomega7_1_rls_policy_advisor_cleanup.sql
```

It only:

- drops the older duplicate graph policies;
- recreates direct `auth.uid()` policies with `(select auth.uid())`.

It does not:

- apply SQL to live Supabase;
- move extensions;
- revoke authenticated table grants;
- revoke graph RPC execution;
- change Edge Functions;
- claim advisor cleanliness before a branch/live recheck.

## Verification Plan

After applying to a Supabase branch/staging target:

1. Run Supabase security advisors.
2. Run Supabase performance advisors.
3. Confirm RLS init-plan warnings are reduced for the touched policies.
4. Confirm duplicate graph policy warnings are removed.
5. Confirm GraphQL/RPC/extension warnings remain either open or explicitly accepted.

## Rollback

If policy behavior regresses, rollback by restoring the previous direct-auth
policies from `20260628181804_release_auth_rls_hardening.sql` and recreating the
older graph policies from `20260628180542_fix_rls_policies.sql`.

Rollback should only be used if branch/staging smoke tests show a behavior change.

## Delta Trace

Delta:
Fresh live Supabase inventory is now captured and split into low-risk policy
cleanup vs higher-risk exposure/RPC/extension decisions.

Data:
Supabase advisors, table inventory, migration list, Edge Function list, targeted
SQL reads of policies/functions/grants/extensions/defaults.

Omega:
0.91 for inventory and low-risk policy cleanup scope; lower for GraphQL/RPC
security decisions until app caller model is reviewed.

Lambda:
Revisit after branch/staging advisor recheck, or after deciding the GraphQL/RPC
exposure model.
