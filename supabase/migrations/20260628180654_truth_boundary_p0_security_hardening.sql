-- =============================================================================
-- Sprint 2 P0 Security Hardening
-- =============================================================================
-- Purpose:
--   1. Remove permissive client access patterns from public app-state tables
--   2. Reduce GraphQL / Data API discoverability for sensitive tables
--   3. Revoke broad EXECUTE on privileged SECURITY DEFINER RPC functions
--
-- Notes:
--   - This migration is designed to be defensive against drift in existing policy names.
--   - Service-role/server-side paths can continue to operate because service_role bypasses RLS.
--   - Follow-up work is still required for db-proxy and Edge Function auth closure.
-- =============================================================================

begin;

-- =============================================================================
-- 0. Helper hardening
-- =============================================================================

alter function public.update_updated_at()
  set search_path = public, extensions, pg_temp;

-- =============================================================================
-- 1. Revoke unnecessary table grants from anon
-- =============================================================================

revoke all on table public.users from anon;
revoke all on table public.metrics_snapshots from anon;
revoke all on table public.memory_nodes from anon;
revoke all on table public.journal_entries from anon;
revoke all on table public.tasks from anon;
revoke all on table public.habits from anon;
revoke all on table public.voice_preferences from anon;
revoke all on table public.chat_history from anon;
revoke all on table public.audit_log from anon;
revoke all on table public.rate_limits from anon;

-- =============================================================================
-- 2. Revoke authenticated access from internal-only tables
-- =============================================================================

revoke all on table public.audit_log from authenticated;
revoke all on table public.rate_limits from authenticated;

-- =============================================================================
-- 3. Re-grant minimal app access for authenticated users
-- =============================================================================

revoke all on table public.users from authenticated;
grant select, insert, update on table public.users to authenticated;

grant select, insert, update, delete on table public.metrics_snapshots to authenticated;
grant select, insert, update, delete on table public.memory_nodes to authenticated;
grant select, insert, update, delete on table public.journal_entries to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update, delete on table public.habits to authenticated;
grant select, insert, update, delete on table public.voice_preferences to authenticated;
grant select, insert, update, delete on table public.chat_history to authenticated;

-- =============================================================================
-- 4. Remove broad / legacy policies if they exist
-- =============================================================================

-- users

drop policy if exists "Allow all for users" on public.users;
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;

-- metrics_snapshots

drop policy if exists "Allow all for metrics_snapshots" on public.metrics_snapshots;
drop policy if exists "Users can manage own metrics_snapshots" on public.metrics_snapshots;

-- memory_nodes

drop policy if exists "Allow all for memory_nodes" on public.memory_nodes;
drop policy if exists "Users can manage own memory_nodes" on public.memory_nodes;

-- journal_entries

drop policy if exists "Allow all for journal_entries" on public.journal_entries;
drop policy if exists "Users can manage own journal_entries" on public.journal_entries;

-- tasks

drop policy if exists "Allow all for tasks" on public.tasks;
drop policy if exists "Users can manage own tasks" on public.tasks;

-- habits

drop policy if exists "Allow all for habits" on public.habits;
drop policy if exists "Users can manage own habits" on public.habits;

-- voice_preferences

drop policy if exists "Allow all for voice_preferences" on public.voice_preferences;
drop policy if exists "Users can manage own voice_preferences" on public.voice_preferences;

-- chat_history

drop policy if exists "Allow all for chat_history" on public.chat_history;
drop policy if exists "Users can manage own chat_history" on public.chat_history;

-- audit_log

drop policy if exists "Allow all for audit_log" on public.audit_log;
drop policy if exists "Users can manage own audit_log" on public.audit_log;

-- rate_limits

drop policy if exists "Allow all for rate_limits" on public.rate_limits;
drop policy if exists "No direct client access to rate_limits" on public.rate_limits;

-- =============================================================================
-- 5. Recreate explicit app-state policies
-- =============================================================================

create policy "users_select_own_row"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

create policy "users_insert_own_row"
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "users_update_own_row"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "metrics_snapshots_manage_own_rows"
  on public.metrics_snapshots
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "memory_nodes_manage_own_rows"
  on public.memory_nodes
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "journal_entries_manage_own_rows"
  on public.journal_entries
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tasks_manage_own_rows"
  on public.tasks
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "habits_manage_own_rows"
  on public.habits
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "voice_preferences_manage_own_rows"
  on public.voice_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "chat_history_manage_own_rows"
  on public.chat_history
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- audit_log is server-side only
create policy "audit_log_no_direct_client_access"
  on public.audit_log
  for all
  to authenticated
  using (false)
  with check (false);

-- internal helper table: keep RLS explicit and deny client access
create policy "rate_limits_no_direct_client_access"
  on public.rate_limits
  for all
  to authenticated
  using (false)
  with check (false);

-- =============================================================================
-- 6. Lock down privileged RPC execution
-- =============================================================================

revoke execute on function public.check_rate_limit(text, text, integer, integer) from anon;
revoke execute on function public.check_rate_limit(text, text, integer, integer) from authenticated;

revoke execute on function public.claim_legacy_data(text) from anon;
revoke execute on function public.claim_legacy_data(text) from authenticated;

comment on function public.check_rate_limit(text, text, integer, integer)
  is 'Sprint 2 P0 hardening: client EXECUTE revoked; function must only be reached through a trusted server-side path.';

comment on function public.claim_legacy_data(text)
  is 'Sprint 2 P0 hardening: public EXECUTE revoked pending legacy-flow redesign or retirement.';

commit;
