-- =============================================================================
-- IskraSpace Graph shared-row write guard
-- =============================================================================
-- Purpose:
--   Preserve active closed-beta members' read access to canonical graph rows,
--   while making every client-initiated graph mutation strictly owner-scoped.
--
-- Safety:
--   - forward-only repository migration; do not apply outside the approved
--     Supabase reconciliation workflow;
--   - no graph data is changed by this migration;
--   - SECURITY DEFINER graph RPCs retain pinned search_path, auth.uid(), and
--     private.is_active_beta_member() checks.
-- =============================================================================

begin;

-- The legacy FOR ALL policies made canonical rows (user_id IS NULL) both
-- readable and mutable. Replace them with an explicit read policy and separate
-- owner-only mutation policies. The pre-existing restrictive
-- beta_membership_required policy remains a second membership gate.
drop policy if exists graph_nodes_user_isolation on public.graph_nodes;
drop policy if exists graph_edges_user_isolation on public.graph_edges;

drop policy if exists graph_nodes_active_beta_read_visible on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_insert_own on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_update_own on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_delete_own on public.graph_nodes;
drop policy if exists graph_edges_active_beta_read_visible on public.graph_edges;
drop policy if exists graph_edges_active_beta_insert_own on public.graph_edges;
drop policy if exists graph_edges_active_beta_update_own on public.graph_edges;
drop policy if exists graph_edges_active_beta_delete_own on public.graph_edges;

create policy graph_nodes_active_beta_read_visible
  on public.graph_nodes
  for select
  to authenticated
  using (
    (select private.is_active_beta_member())
    and (user_id = (select auth.uid()) or user_id is null)
  );

create policy graph_nodes_active_beta_insert_own
  on public.graph_nodes
  for insert
  to authenticated
  with check (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  );

create policy graph_nodes_active_beta_update_own
  on public.graph_nodes
  for update
  to authenticated
  using (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  )
  with check (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  );

create policy graph_nodes_active_beta_delete_own
  on public.graph_nodes
  for delete
  to authenticated
  using (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  );

create policy graph_edges_active_beta_read_visible
  on public.graph_edges
  for select
  to authenticated
  using (
    (select private.is_active_beta_member())
    and (user_id = (select auth.uid()) or user_id is null)
  );

create policy graph_edges_active_beta_insert_own
  on public.graph_edges
  for insert
  to authenticated
  with check (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
    and exists (
      select 1
      from public.graph_nodes source_node
      where source_node.id = source
        and (source_node.user_id = (select auth.uid()) or source_node.user_id is null)
    )
    and exists (
      select 1
      from public.graph_nodes target_node
      where target_node.id = target
        and (target_node.user_id = (select auth.uid()) or target_node.user_id is null)
    )
  );

create policy graph_edges_active_beta_update_own
  on public.graph_edges
  for update
  to authenticated
  using (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  )
  with check (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
    and exists (
      select 1
      from public.graph_nodes source_node
      where source_node.id = source
        and (source_node.user_id = (select auth.uid()) or source_node.user_id is null)
    )
    and exists (
      select 1
      from public.graph_nodes target_node
      where target_node.id = target
        and (target_node.user_id = (select auth.uid()) or target_node.user_id is null)
    )
  );

create policy graph_edges_active_beta_delete_own
  on public.graph_edges
  for delete
  to authenticated
  using (
    (select private.is_active_beta_member())
    and user_id = (select auth.uid())
  );

-- Mutating RPCs. Shared rows may be referenced as visible endpoints for a new
-- caller-owned edge, but no branch below permits changing or deleting a shared
-- row. A global edge uniqueness conflict that belongs to another caller or to
-- the shared graph returns no row and is denied.
create or replace function public.graph_create_node(
  p_id text,
  p_layer text,
  p_type text,
  p_content text,
  p_timestamp timestamptz default now(),
  p_metrics_snapshot jsonb default null,
  p_related_ids text[] default '{}'::text[],
  p_resonance_score real default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.graph_nodes
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.graph_nodes%rowtype;
begin
  if v_uid is null then
    raise exception 'graph_create_node requires an authenticated user'
      using errcode = '28000';
  end if;

  if not private.is_active_beta_member() then
    raise exception 'graph_create_node requires an active closed-beta member'
      using errcode = '42501';
  end if;

  insert into public.graph_nodes (
    id, layer, type, content, "timestamp", metrics_snapshot, related_ids,
    resonance_score, metadata, user_id
  ) values (
    p_id, p_layer, p_type, p_content, coalesce(p_timestamp, now()),
    p_metrics_snapshot, coalesce(p_related_ids, '{}'::text[]),
    p_resonance_score, coalesce(p_metadata, '{}'::jsonb), v_uid
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.graph_create_edge(
  p_id text,
  p_source text,
  p_target text,
  p_type text,
  p_weight real default 0.5,
  p_metadata jsonb default '{}'::jsonb
)
returns public.graph_edges
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.graph_edges%rowtype;
begin
  if v_uid is null then
    raise exception 'graph_create_edge requires an authenticated user'
      using errcode = '28000';
  end if;

  if not private.is_active_beta_member() then
    raise exception 'graph_create_edge requires an active closed-beta member'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.graph_nodes node
    where node.id = p_source
      and (node.user_id = v_uid or node.user_id is null)
  ) then
    raise exception 'source graph node is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.graph_nodes node
    where node.id = p_target
      and (node.user_id = v_uid or node.user_id is null)
  ) then
    raise exception 'target graph node is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  insert into public.graph_edges (id, source, target, type, weight, metadata, user_id)
  values (
    p_id, p_source, p_target, p_type, coalesce(p_weight, 0.5),
    coalesce(p_metadata, '{}'::jsonb), v_uid
  )
  on conflict (source, target, type) do update
    set weight = excluded.weight,
        metadata = excluded.metadata
    where public.graph_edges.user_id = v_uid
  returning * into v_row;

  if v_row.id is null then
    raise exception 'graph edge is not owned by the authenticated user'
      using errcode = '42501';
  end if;

  return v_row;
end;
$$;

create or replace function public.graph_delete_node(p_node_id text)
returns void
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_deleted int := 0;
begin
  if v_uid is null then
    raise exception 'graph_delete_node requires an authenticated user'
      using errcode = '28000';
  end if;

  if not private.is_active_beta_member() then
    raise exception 'graph_delete_node requires an active closed-beta member'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.graph_edges edge
    where (edge.source = p_node_id or edge.target = p_node_id)
      and edge.user_id is distinct from v_uid
  ) then
    raise exception 'graph node is connected to a non-owned edge'
      using errcode = '42501';
  end if;

  delete from public.graph_nodes node
  where node.id = p_node_id
    and node.user_id = v_uid;

  get diagnostics v_deleted = row_count;
  if v_deleted = 0 then
    raise exception 'graph node is not owned by the authenticated user'
      using errcode = '42501';
  end if;
end;
$$;

create or replace function public.graph_update_node_resonance(
  p_node_id text,
  p_metrics_snapshot jsonb,
  p_resonance_score real
)
returns public.graph_nodes
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.graph_nodes%rowtype;
begin
  if v_uid is null then
    raise exception 'graph_update_node_resonance requires an authenticated user'
      using errcode = '28000';
  end if;

  if not private.is_active_beta_member() then
    raise exception 'graph_update_node_resonance requires an active closed-beta member'
      using errcode = '42501';
  end if;

  update public.graph_nodes node
     set resonance_score = p_resonance_score,
         metrics_snapshot = p_metrics_snapshot
   where node.id = p_node_id
     and node.user_id = v_uid
  returning * into v_row;

  if v_row.id is null then
    raise exception 'graph node is not owned by the authenticated user'
      using errcode = '42501';
  end if;

  return v_row;
end;
$$;

-- graph_edges has ON DELETE CASCADE FKs to graph_nodes. Without this guard, a
-- direct delete of an owned node could cascade into an unexpected shared or
-- foreign edge. Service-role and migration operations have no auth.uid() and
-- remain available for reviewed canonical administration.
create or replace function public.prevent_graph_node_cross_owner_cascade()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is not null and exists (
    select 1
    from public.graph_edges edge
    where (edge.source = old.id or edge.target = old.id)
      and edge.user_id is distinct from v_uid
  ) then
    raise exception 'graph node deletion would cascade into a non-owned edge'
      using errcode = '42501';
  end if;

  return old;
end;
$$;

revoke all on function public.prevent_graph_node_cross_owner_cascade() from public;

drop trigger if exists graph_nodes_block_cross_owner_cascade on public.graph_nodes;
create trigger graph_nodes_block_cross_owner_cascade
  before delete on public.graph_nodes
  for each row
  execute function public.prevent_graph_node_cross_owner_cascade();

revoke all on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) from public;
revoke all on function public.graph_create_edge(text, text, text, text, real, jsonb) from public;
revoke all on function public.graph_delete_node(text) from public;
revoke all on function public.graph_update_node_resonance(text, jsonb, real) from public;

grant execute on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) to authenticated;
grant execute on function public.graph_create_edge(text, text, text, text, real, jsonb) to authenticated;
grant execute on function public.graph_delete_node(text) to authenticated;
grant execute on function public.graph_update_node_resonance(text, jsonb, real) to authenticated;

comment on function public.prevent_graph_node_cross_owner_cascade() is
  'Prevents JWT-scoped graph-node deletion from cascading into shared or foreign graph edges.';

commit;
