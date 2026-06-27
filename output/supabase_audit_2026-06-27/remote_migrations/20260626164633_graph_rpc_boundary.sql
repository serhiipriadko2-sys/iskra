-- Remote migration: 20260626164633 / graph_rpc_boundary

-- =============================================================================
-- ISKRA SPACE - GRAPH RPC BOUNDARY
-- =============================================================================
-- Migration name: graph_rpc_boundary
--
-- Purpose:
--   Add an authenticated RPC boundary for graph_nodes / graph_edges before any
--   future revoke of authenticated direct table SELECT grants.
--
-- Security shape:
--   - RPC functions are SECURITY DEFINER so the runtime can later use RPC after
--     table grants are revoked.
--   - Every function pins search_path and explicitly scopes access with auth.uid().
--   - Table grants are intentionally unchanged in this migration.
--
-- Rollback:
--   begin;
--   drop function if exists public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb);
--   drop function if exists public.graph_create_edge(text, text, text, text, real, jsonb);
--   drop function if exists public.graph_get_user_nodes(text, text, text[], int);
--   drop function if exists public.graph_search_nodes(text, int);
--   drop function if exists public.graph_delete_node(text);
--   drop function if exists public.graph_update_node_resonance(text, jsonb, real);
--   drop function if exists public.graph_get_connection_candidates(text, int);
--   drop function if exists public.graph_get_stats();
--   drop function if exists public.graph_traverse_bfs_nodes(text, int, real);
--   drop function if exists public.graph_find_resonant_nodes(real, int);
--   -- Optional: restore the previous graph_get_node_with_edges body from
--   -- 20260626145500_graph_schema_contract_repair.sql if strict rollback is needed.
--   commit;
-- =============================================================================

begin;

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

  insert into public.graph_nodes (
    id,
    layer,
    type,
    content,
    "timestamp",
    metrics_snapshot,
    related_ids,
    resonance_score,
    metadata,
    user_id
  ) values (
    p_id,
    p_layer,
    p_type,
    p_content,
    coalesce(p_timestamp, now()),
    p_metrics_snapshot,
    coalesce(p_related_ids, '{}'::text[]),
    p_resonance_score,
    coalesce(p_metadata, '{}'::jsonb),
    v_uid
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

  if not exists (
    select 1
    from public.graph_nodes n
    where n.id = p_source
      and (n.user_id = v_uid or n.user_id is null)
  ) then
    raise exception 'source graph node is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.graph_nodes n
    where n.id = p_target
      and (n.user_id = v_uid or n.user_id is null)
  ) then
    raise exception 'target graph node is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  insert into public.graph_edges (
    id,
    source,
    target,
    type,
    weight,
    metadata,
    user_id
  ) values (
    p_id,
    p_source,
    p_target,
    p_type,
    coalesce(p_weight, 0.5),
    coalesce(p_metadata, '{}'::jsonb),
    v_uid
  )
  on conflict (source, target, type) do update
    set weight = excluded.weight,
        metadata = excluded.metadata
    where public.graph_edges.user_id = v_uid
       or public.graph_edges.user_id is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'graph edge is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  return v_row;
end;
$$;

create or replace function public.graph_get_user_nodes(
  p_layer text default null,
  p_type text default null,
  p_node_ids text[] default null,
  p_limit_count int default null
)
returns setof public.graph_nodes
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select n.*
  from public.graph_nodes n
  where auth.uid() is not null
    and (n.user_id = auth.uid() or n.user_id is null)
    and (p_layer is null or n.layer = p_layer)
    and (p_type is null or n.type = p_type)
    and (p_node_ids is null or n.id = any(p_node_ids))
  order by n."timestamp" desc, n.id
  limit least(coalesce(p_limit_count, 2147483647), 500);
$$;

create or replace function public.graph_search_nodes(
  p_query text,
  p_limit_count int default 10
)
returns setof public.graph_nodes
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select n.*
  from public.graph_nodes n
  where auth.uid() is not null
    and nullif(trim(p_query), '') is not null
    and (n.user_id = auth.uid() or n.user_id is null)
    and to_tsvector('english', n.content) @@ websearch_to_tsquery('english', p_query)
  order by ts_rank_cd(to_tsvector('english', n.content), websearch_to_tsquery('english', p_query)) desc,
           n."timestamp" desc,
           n.id
  limit least(coalesce(p_limit_count, 10), 100);
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

  delete from public.graph_nodes n
  where n.id = p_node_id
    and (n.user_id = v_uid or n.user_id is null);

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'graph node is not visible to the authenticated user'
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

  update public.graph_nodes n
  set resonance_score = p_resonance_score,
      metrics_snapshot = p_metrics_snapshot
  where n.id = p_node_id
    and (n.user_id = v_uid or n.user_id is null)
  returning * into v_row;

  if v_row.id is null then
    raise exception 'graph node is not visible to the authenticated user'
      using errcode = '42501';
  end if;

  return v_row;
end;
$$;

create or replace function public.graph_get_connection_candidates(
  p_node_id text,
  p_limit_count int default 20
)
returns setof public.graph_nodes
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with source_node as (
    select n.*
    from public.graph_nodes n
    where auth.uid() is not null
      and n.id = p_node_id
      and (n.user_id = auth.uid() or n.user_id is null)
  )
  select c.*
  from source_node n
  join public.graph_nodes c
    on c.id <> n.id
   and (c.layer = n.layer or c.type = n.type)
  where c.user_id = auth.uid()
     or c.user_id is null
  order by c."timestamp" desc, c.id
  limit least(coalesce(p_limit_count, 20), 100);
$$;

create or replace function public.graph_get_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with visible_nodes as (
    select n.*
    from public.graph_nodes n
    where auth.uid() is not null
      and (n.user_id = auth.uid() or n.user_id is null)
  ),
  visible_edges as (
    select e.*
    from public.graph_edges e
    where auth.uid() is not null
      and (e.user_id = auth.uid() or e.user_id is null)
  ),
  layer_counts as (
    select layer, count(*) as count
    from visible_nodes
    group by layer
  ),
  type_counts as (
    select type, count(*) as count
    from visible_nodes
    group by type
  )
  select jsonb_build_object(
    'totalNodes', (select count(*) from visible_nodes),
    'totalEdges', (select count(*) from visible_edges),
    'nodesByLayer', coalesce((select jsonb_object_agg(layer, count) from layer_counts), '{}'::jsonb),
    'nodesByType', coalesce((select jsonb_object_agg(type, count) from type_counts), '{}'::jsonb)
  );
$$;

create or replace function public.graph_traverse_bfs_nodes(
  p_start_id text,
  p_max_depth int default 3,
  p_min_weight real default 0.3
)
returns setof public.graph_nodes
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with recursive visible_nodes as (
    select n.*
    from public.graph_nodes n
    where auth.uid() is not null
      and (n.user_id = auth.uid() or n.user_id is null)
  ),
  visible_edges as (
    select e.*
    from public.graph_edges e
    join visible_nodes s on s.id = e.source
    join visible_nodes t on t.id = e.target
    where e.user_id = auth.uid()
       or e.user_id is null
  ),
  traversal as (
    select n.id as node_id, 0 as depth, array[n.id] as path
    from visible_nodes n
    where n.id = p_start_id

    union all

    select e.target as node_id, tr.depth + 1 as depth, tr.path || e.target as path
    from traversal tr
    join visible_edges e on e.source = tr.node_id
    where tr.depth < p_max_depth
      and e.weight >= p_min_weight
      and not (e.target = any(tr.path))
  ),
  ranked as (
    select distinct on (node_id) node_id, depth
    from traversal
    order by node_id, depth
  )
  select n.*
  from ranked r
  join visible_nodes n on n.id = r.node_id
  order by r.depth, n.id;
$$;

create or replace function public.graph_find_resonant_nodes(
  p_min_resonance real default 0.3,
  p_limit_count int default 10
)
returns setof public.graph_nodes
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select n.*
  from public.graph_nodes n
  where auth.uid() is not null
    and (n.user_id = auth.uid() or n.user_id is null)
    and n.resonance_score >= p_min_resonance
  order by n.resonance_score desc, n."timestamp" desc, n.id
  limit least(coalesce(p_limit_count, 10), 100);
$$;

drop function if exists public.graph_get_node_with_edges(text);

create function public.graph_get_node_with_edges(node_id text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with visible_node as (
    select n.*
    from public.graph_nodes n
    where auth.uid() is not null
      and n.id = $1
      and (n.user_id = auth.uid() or n.user_id is null)
  )
  select coalesce((
    select jsonb_build_object(
      'node', to_jsonb(n.*),
      'outgoing_edges', coalesce((
        select jsonb_agg(to_jsonb(e.*) order by e.created_at, e.id)
        from public.graph_edges e
        join public.graph_nodes target_node on target_node.id = e.target
        where e.source = n.id
          and (e.user_id = auth.uid() or e.user_id is null)
          and (target_node.user_id = auth.uid() or target_node.user_id is null)
      ), '[]'::jsonb),
      'incoming_edges', coalesce((
        select jsonb_agg(to_jsonb(e.*) order by e.created_at, e.id)
        from public.graph_edges e
        join public.graph_nodes source_node on source_node.id = e.source
        where e.target = n.id
          and (e.user_id = auth.uid() or e.user_id is null)
          and (source_node.user_id = auth.uid() or source_node.user_id is null)
      ), '[]'::jsonb)
    )
    from visible_node n
  ), jsonb_build_object('node', null, 'outgoing_edges', '[]'::jsonb, 'incoming_edges', '[]'::jsonb));
$$;

revoke all on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) from public;
revoke all on function public.graph_create_edge(text, text, text, text, real, jsonb) from public;
revoke all on function public.graph_get_user_nodes(text, text, text[], int) from public;
revoke all on function public.graph_search_nodes(text, int) from public;
revoke all on function public.graph_delete_node(text) from public;
revoke all on function public.graph_update_node_resonance(text, jsonb, real) from public;
revoke all on function public.graph_get_connection_candidates(text, int) from public;
revoke all on function public.graph_get_stats() from public;
revoke all on function public.graph_traverse_bfs_nodes(text, int, real) from public;
revoke all on function public.graph_find_resonant_nodes(real, int) from public;
revoke all on function public.graph_get_node_with_edges(text) from public;

grant execute on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) to authenticated;
grant execute on function public.graph_create_edge(text, text, text, text, real, jsonb) to authenticated;
grant execute on function public.graph_get_user_nodes(text, text, text[], int) to authenticated;
grant execute on function public.graph_search_nodes(text, int) to authenticated;
grant execute on function public.graph_delete_node(text) to authenticated;
grant execute on function public.graph_update_node_resonance(text, jsonb, real) to authenticated;
grant execute on function public.graph_get_connection_candidates(text, int) to authenticated;
grant execute on function public.graph_get_stats() to authenticated;
grant execute on function public.graph_traverse_bfs_nodes(text, int, real) to authenticated;
grant execute on function public.graph_find_resonant_nodes(real, int) to authenticated;
grant execute on function public.graph_get_node_with_edges(text) to authenticated;

commit;

