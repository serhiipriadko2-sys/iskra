-- Remote migration: 20260626155850 / residual_advisors_rls_fk_hardening

-- =============================================================================
-- ISKRA SPACE - RESIDUAL ADVISOR RLS/FK HARDENING
-- =============================================================================
-- Migration name: residual_advisors_rls_fk_hardening
--
-- Purpose:
--   Address low-blast-radius residual Supabase performance advisors:
--   - add missing covering indexes for canon foreign keys;
--   - preserve public RLS semantics while wrapping auth.uid() calls in SELECT
--     to avoid per-row init-plan warnings.
--
-- Out of scope:
--   GraphQL exposure grants, pg_trgm extension placement, unused-index removal,
--   and Auth DB connection strategy are intentionally left unchanged.
-- =============================================================================

begin;

create index if not exists canon_chunks_document_id_idx
  on iskra.canon_chunks(document_id);

create index if not exists canon_memory_nodes_chunk_id_idx
  on iskra.canon_memory_nodes(chunk_id);

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Users can manage own metrics_snapshots" on public.metrics_snapshots;
create policy "Users can manage own metrics_snapshots"
  on public.metrics_snapshots
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own memory_nodes" on public.memory_nodes;
create policy "Users can manage own memory_nodes"
  on public.memory_nodes
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own journal_entries" on public.journal_entries;
create policy "Users can manage own journal_entries"
  on public.journal_entries
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own tasks" on public.tasks;
create policy "Users can manage own tasks"
  on public.tasks
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own habits" on public.habits;
create policy "Users can manage own habits"
  on public.habits
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own voice_preferences" on public.voice_preferences;
create policy "Users can manage own voice_preferences"
  on public.voice_preferences
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own chat_history" on public.chat_history;
create policy "Users can manage own chat_history"
  on public.chat_history
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can manage own audit_log" on public.audit_log;
create policy "Users can manage own audit_log"
  on public.audit_log
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

commit;

