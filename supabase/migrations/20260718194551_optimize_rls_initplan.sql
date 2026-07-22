-- Optimize RLS policies by wrapping auth.uid() in a subquery
-- This resolves the "Auth RLS InitPlan" performance warning by ensuring
-- the function is only called once per query rather than once per row.
--
-- Production applied a drift-dependent body whose LF-normalized SHA-256 is
-- 1b773fdd0ec82486754cceccacf15dc5c1f882b8d9a2a98ffb9939cf4af145ef.
-- A clean canonical replay does not contain the two legacy broad Graph
-- policies. Keep their live behavior when they exist, but do not make a fresh
-- database depend on historical DDL drift.

begin;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'graph_nodes'
      and policyname = 'Users can manage own graph nodes (secure)'
  ) then
    execute 'alter policy "Users can manage own graph nodes (secure)" on public.graph_nodes using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'graph_edges'
      and policyname = 'Users can manage own graph edges (secure)'
  ) then
    execute 'alter policy "Users can manage own graph edges (secure)" on public.graph_edges using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))';
  end if;
end;
$$;
alter policy "users_update_own" on public.users using (id = (select auth.uid())) with check (id = (select auth.uid()));
alter policy "metrics_snapshots_manage_own" on public.metrics_snapshots using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "memory_nodes_manage_own" on public.memory_nodes using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "journal_entries_manage_own" on public.journal_entries using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "tasks_manage_own" on public.tasks using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "habits_manage_own" on public.habits using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "voice_preferences_manage_own" on public.voice_preferences using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy "chat_history_manage_own" on public.chat_history using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

commit;
