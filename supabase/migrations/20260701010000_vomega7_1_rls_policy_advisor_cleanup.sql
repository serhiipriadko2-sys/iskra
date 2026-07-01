-- =============================================================================
-- ISKRA SPACE - vOmega7.1 RLS Policy Advisor Cleanup
-- =============================================================================
-- Migration name: vomega7_1_rls_policy_advisor_cleanup
--
-- Purpose:
--   Address fresh Supabase performance advisor findings without changing table
--   grants, GraphQL exposure, or graph RPC EXECUTE boundaries.
--
-- Scope:
--   - Wrap auth.uid() calls with (select auth.uid()) in app RLS policies.
--   - Remove duplicate graph policies that overlap graph_*_user_isolation.
--
-- Data safety:
--   Metadata/RLS policy repair only. No rows are inserted, updated, or deleted.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Remove duplicate graph policies that still call auth.uid() directly.
--    graph_nodes_user_isolation and graph_edges_user_isolation already preserve
--    the user-owned plus canonical user_id IS NULL behavior with select auth.uid().
-- -----------------------------------------------------------------------------

drop policy if exists "Users can manage own graph nodes (secure)" on public.graph_nodes;
drop policy if exists "Users can manage own graph edges (secure)" on public.graph_edges;

-- -----------------------------------------------------------------------------
-- 2. Users policies
-- -----------------------------------------------------------------------------

drop policy if exists users_select_own on public.users;
create policy users_select_own
  on public.users
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
  on public.users
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- 3. User-owned app data policies
-- -----------------------------------------------------------------------------

drop policy if exists metrics_snapshots_manage_own on public.metrics_snapshots;
create policy metrics_snapshots_manage_own
  on public.metrics_snapshots
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists memory_nodes_manage_own on public.memory_nodes;
create policy memory_nodes_manage_own
  on public.memory_nodes
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists journal_entries_manage_own on public.journal_entries;
create policy journal_entries_manage_own
  on public.journal_entries
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists tasks_manage_own on public.tasks;
create policy tasks_manage_own
  on public.tasks
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists habits_manage_own on public.habits;
create policy habits_manage_own
  on public.habits
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists voice_preferences_manage_own on public.voice_preferences;
create policy voice_preferences_manage_own
  on public.voice_preferences
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists chat_history_manage_own on public.chat_history;
create policy chat_history_manage_own
  on public.chat_history
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- 4. Audit log policies
-- -----------------------------------------------------------------------------

drop policy if exists audit_log_select_own on public.audit_log;
create policy audit_log_select_own
  on public.audit_log
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists audit_log_insert_own on public.audit_log;
create policy audit_log_insert_own
  on public.audit_log
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

commit;
