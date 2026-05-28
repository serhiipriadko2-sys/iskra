-- =============================================================================
-- ISKRA SPACE - RELEASE AUTH + RLS HARDENING
-- =============================================================================
-- Purpose:
--   1. Remove permissive public policies from app-owned public tables.
--   2. Require Supabase Auth sessions for user-owned data.
--   3. Keep service_role server-side access explicit.
--   4. Fix mutable search_path on public.update_updated_at().
--
-- Release order:
--   A. Enable Supabase Anonymous Sign-Ins or another auth provider.
--   B. Deploy frontend patch that calls signInAnonymously and sends the user JWT.
--   C. Apply this migration in staging or a Supabase branch.
--   D. Run advisor checks and auth smoke tests.
--   E. Merge to production only after green checks.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 0. Function search_path hardening
-- -----------------------------------------------------------------------------
create or replace function public.update_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 1. Drop known permissive policies and legacy policies
-- -----------------------------------------------------------------------------
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'users',
    'metrics_snapshots',
    'memory_nodes',
    'journal_entries',
    'tasks',
    'habits',
    'voice_preferences',
    'chat_history',
    'audit_log',
    'graph_nodes',
    'graph_edges',
    'rate_limits'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);

      for policy_name in
        select p.policyname
        from pg_policies p
        where p.schemaname = 'public'
          and p.tablename = table_name
      loop
        execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      end loop;
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Privileges: no direct anonymous table access
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.metrics_snapshots to authenticated;
grant select, insert, update, delete on public.memory_nodes to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.habits to authenticated;
grant select, insert, update, delete on public.voice_preferences to authenticated;
grant select, insert, update, delete on public.chat_history to authenticated;
grant select, insert on public.audit_log to authenticated;

do $$
begin
  if to_regclass('public.graph_nodes') is not null then
    grant select, insert, update, delete on public.graph_nodes to authenticated;
  end if;
  if to_regclass('public.graph_edges') is not null then
    grant select, insert, update, delete on public.graph_edges to authenticated;
  end if;
end $$;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- -----------------------------------------------------------------------------
-- 3. Users
-- -----------------------------------------------------------------------------
create policy "users_select_own"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "users_insert_own"
on public.users
for insert
to authenticated
with check (id = auth.uid());

create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- 4. User-owned data tables
-- -----------------------------------------------------------------------------
create policy "metrics_snapshots_manage_own"
on public.metrics_snapshots
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "memory_nodes_manage_own"
on public.memory_nodes
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "journal_entries_manage_own"
on public.journal_entries
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tasks_manage_own"
on public.tasks
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "habits_manage_own"
on public.habits
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "voice_preferences_manage_own"
on public.voice_preferences
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "chat_history_manage_own"
on public.chat_history
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 5. Audit log
-- -----------------------------------------------------------------------------
create policy "audit_log_select_own"
on public.audit_log
for select
to authenticated
using (user_id = auth.uid());

create policy "audit_log_insert_own"
on public.audit_log
for insert
to authenticated
with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. Optional graph tables
-- -----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.graph_nodes') is not null then
    execute '
      create policy "graph_nodes_manage_own"
      on public.graph_nodes
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid())
    ';
  end if;

  if to_regclass('public.graph_edges') is not null then
    execute '
      create policy "graph_edges_manage_own"
      on public.graph_edges
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid())
    ';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 7. Rate limits are server-owned. Browser clients must not manage them directly.
-- -----------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.rate_limits') is not null then
    execute 'alter table public.rate_limits enable row level security';
    execute '
      create policy "rate_limits_service_role_manage"
      on public.rate_limits
      for all
      to service_role
      using (true)
      with check (true)
    ';
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 8. Verification helper
-- -----------------------------------------------------------------------------
comment on schema public is 'IskraSpace public app schema hardened on 2026-05-28: authenticated own-row RLS, no direct anon table access.';

commit;

-- Post-migration verification:
-- select schemaname, tablename, policyname, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, policyname;
--
-- select * from auth.users where is_anonymous is true order by created_at desc limit 5;
--
-- Supabase advisors expected:
--   0 permissive public RLS policies on user-owned public tables.
--   0 anon GraphQL exposure warnings for private app tables.
--   0 mutable search_path warning for public.update_updated_at.
-- =============================================================================
