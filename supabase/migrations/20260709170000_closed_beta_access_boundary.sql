-- =============================================================================
-- IskraSpace closed-beta access boundary
-- =============================================================================
-- This migration is repository-only until reviewed and applied through the
-- approved Supabase reconciliation workflow. It contains no invitee addresses.
--
-- Closed-beta operators provision permanent Auth users and add an allowlisted
-- private.beta_invites row through a server-side administrative path. Browser
-- clients have no access to the private schema or to any privileged key.
-- =============================================================================

begin;

create schema if not exists private;
revoke all on schema private from public;

create table if not exists private.beta_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  accepted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  constraint beta_invites_email_normalized check (email = lower(btrim(email))),
  constraint beta_invites_expiry_after_creation check (expires_at is null or expires_at > created_at)
);

create unique index if not exists beta_invites_pending_email_unique
  on private.beta_invites (email)
  where revoked_at is null and accepted_at is null;

create table if not exists private.beta_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  invite_id uuid references private.beta_invites(id) on delete set null,
  status text not null default 'active',
  activated_at timestamptz not null default now(),
  deactivated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beta_members_status_check check (status in ('active', 'suspended', 'revoked'))
);

create index if not exists beta_members_active_user_idx
  on private.beta_members (user_id)
  where status = 'active';

alter table private.beta_invites enable row level security;
alter table private.beta_members enable row level security;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all sequences in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant all on all tables in schema private to service_role;
grant all on all sequences in schema private to service_role;

-- The helper makes no membership decision from user-editable metadata. It is
-- intentionally not exposed through the Data API: it exists only for RLS.
create or replace function private.is_active_beta_member()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, private, auth
as $$
  select
    auth.uid() is not null
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) is false
    and exists (
      select 1
      from private.beta_members member
      where member.user_id = auth.uid()
        and member.status = 'active'
        and member.deactivated_at is null
    );
$$;

revoke all on function private.is_active_beta_member() from public;
grant execute on function private.is_active_beta_member() to authenticated;

-- The authenticated user can learn only their own beta state. A pre-provisioned
-- pending invite may be atomically bound to that account after a magic-link
-- login. No invitee identity is returned to the browser.
create or replace function public.resolve_beta_access()
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, private, auth
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(nullif(btrim(auth.jwt() ->> 'email'), ''));
  invite uuid;
  membership_status text;
begin
  if current_user_id is null
    or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
    or current_email is null then
    return jsonb_build_object('active', false, 'membership_status', 'unavailable');
  end if;

  select member.status
    into membership_status
    from private.beta_members member
   where member.user_id = current_user_id;

  if membership_status is null then
    select beta_invite.id
      into invite
      from private.beta_invites beta_invite
     where beta_invite.email = current_email
       and beta_invite.revoked_at is null
       and beta_invite.accepted_at is null
       and (beta_invite.expires_at is null or beta_invite.expires_at > now())
     order by beta_invite.created_at
     for update skip locked
     limit 1;

    if invite is not null then
      insert into private.beta_members (user_id, invite_id, status)
      values (current_user_id, invite, 'active')
      on conflict (user_id) do nothing;

      update private.beta_invites
         set accepted_at = coalesce(accepted_at, now())
       where id = invite;

      select member.status
        into membership_status
        from private.beta_members member
       where member.user_id = current_user_id;
    end if;
  end if;

  return jsonb_build_object(
    'active', coalesce(
      membership_status = 'active' and private.is_active_beta_member(),
      false
    ),
    'membership_status', coalesce(membership_status, 'not-invited')
  );
end;
$$;

revoke all on function public.resolve_beta_access() from public;
grant execute on function public.resolve_beta_access() to authenticated;

-- Existing ownership policies remain the permissive ownership layer. This
-- restrictive layer adds active beta membership, so an anonymous Auth user
-- (which otherwise carries the `authenticated` Postgres role) cannot pass RLS.
do $$
declare
  table_name text;
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
    'graph_edges'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('drop policy if exists beta_membership_required on public.%I', table_name);
      execute format(
        'create policy beta_membership_required on public.%I as restrictive for all to authenticated using ((select private.is_active_beta_member())) with check ((select private.is_active_beta_member()))',
        table_name
      );
    end if;
  end loop;
end;
$$;

-- Graph RPC closed-beta membership guards
--
-- These functions intentionally remain SECURITY DEFINER because the graph
-- contract uses pinned search_path and explicit auth.uid() ownership checks.
-- `authenticated` also includes Supabase anonymous users, therefore each body
-- must make the active-membership check itself; grants alone are insufficient.
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
  select node.*
  from public.graph_nodes node
  where (select private.is_active_beta_member())
    and auth.uid() is not null
    and (node.user_id = auth.uid() or node.user_id is null)
    and (p_layer is null or node.layer = p_layer)
    and (p_type is null or node.type = p_type)
    and (p_node_ids is null or node.id = any(p_node_ids))
  order by node."timestamp" desc, node.id
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
  select node.*
  from public.graph_nodes node
  where (select private.is_active_beta_member())
    and auth.uid() is not null
    and nullif(trim(p_query), '') is not null
    and (node.user_id = auth.uid() or node.user_id is null)
    and to_tsvector('english', node.content) @@ websearch_to_tsquery('english', p_query)
  order by ts_rank_cd(to_tsvector('english', node.content), websearch_to_tsquery('english', p_query)) desc,
           node."timestamp" desc,
           node.id
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

  if not private.is_active_beta_member() then
    raise exception 'graph_delete_node requires an active closed-beta member'
      using errcode = '42501';
  end if;

  delete from public.graph_nodes node
  where node.id = p_node_id
    and (node.user_id = v_uid or node.user_id is null);

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

  if not private.is_active_beta_member() then
    raise exception 'graph_update_node_resonance requires an active closed-beta member'
      using errcode = '42501';
  end if;

  update public.graph_nodes node
     set resonance_score = p_resonance_score,
         metrics_snapshot = p_metrics_snapshot
   where node.id = p_node_id
     and (node.user_id = v_uid or node.user_id is null)
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
    select node.*
    from public.graph_nodes node
    where (select private.is_active_beta_member())
      and auth.uid() is not null
      and node.id = p_node_id
      and (node.user_id = auth.uid() or node.user_id is null)
  )
  select candidate.*
  from source_node node
  join public.graph_nodes candidate
    on candidate.id <> node.id
   and (candidate.layer = node.layer or candidate.type = node.type)
  where candidate.user_id = auth.uid()
     or candidate.user_id is null
  order by candidate."timestamp" desc, candidate.id
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
    select node.*
    from public.graph_nodes node
    where (select private.is_active_beta_member())
      and auth.uid() is not null
      and (node.user_id = auth.uid() or node.user_id is null)
  ),
  visible_edges as (
    select edge.*
    from public.graph_edges edge
    where (select private.is_active_beta_member())
      and auth.uid() is not null
      and (edge.user_id = auth.uid() or edge.user_id is null)
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
    select node.*
    from public.graph_nodes node
    where (select private.is_active_beta_member())
      and auth.uid() is not null
      and (node.user_id = auth.uid() or node.user_id is null)
  ),
  visible_edges as (
    select edge.*
    from public.graph_edges edge
    join visible_nodes source_node on source_node.id = edge.source
    join visible_nodes target_node on target_node.id = edge.target
    where edge.user_id = auth.uid()
       or edge.user_id is null
  ),
  traversal as (
    select node.id as node_id, 0 as depth, array[node.id] as path
    from visible_nodes node
    where node.id = p_start_id

    union all

    select edge.target as node_id, traversal.depth + 1 as depth, traversal.path || edge.target as path
    from traversal
    join visible_edges edge on edge.source = traversal.node_id
    where traversal.depth < p_max_depth
      and edge.weight >= p_min_weight
      and not (edge.target = any(traversal.path))
  ),
  ranked as (
    select distinct on (node_id) node_id, depth
    from traversal
    order by node_id, depth
  )
  select node.*
  from ranked
  join visible_nodes node on node.id = ranked.node_id
  order by ranked.depth, node.id;
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
  select node.*
  from public.graph_nodes node
  where (select private.is_active_beta_member())
    and auth.uid() is not null
    and (node.user_id = auth.uid() or node.user_id is null)
    and node.resonance_score >= p_min_resonance
  order by node.resonance_score desc, node."timestamp" desc, node.id
  limit least(coalesce(p_limit_count, 10), 100);
$$;

create or replace function public.graph_get_node_with_edges(node_id text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with visible_node as (
    select node.*
    from public.graph_nodes node
    where (select private.is_active_beta_member())
      and auth.uid() is not null
      and node.id = $1
      and (node.user_id = auth.uid() or node.user_id is null)
  )
  select coalesce((
    select jsonb_build_object(
      'node', to_jsonb(node.*),
      'outgoing_edges', coalesce((
        select jsonb_agg(to_jsonb(edge.*) order by edge.created_at, edge.id)
        from public.graph_edges edge
        join public.graph_nodes target_node on target_node.id = edge.target
        where edge.source = node.id
          and (edge.user_id = auth.uid() or edge.user_id is null)
          and (target_node.user_id = auth.uid() or target_node.user_id is null)
      ), '[]'::jsonb),
      'incoming_edges', coalesce((
        select jsonb_agg(to_jsonb(edge.*) order by edge.created_at, edge.id)
        from public.graph_edges edge
        join public.graph_nodes source_node on source_node.id = edge.source
        where edge.target = node.id
          and (edge.user_id = auth.uid() or edge.user_id is null)
          and (source_node.user_id = auth.uid() or source_node.user_id is null)
      ), '[]'::jsonb)
    )
    from visible_node node
  ), jsonb_build_object('node', null, 'outgoing_edges', '[]'::jsonb, 'incoming_edges', '[]'::jsonb));
$$;

comment on schema private is 'IskraSpace closed-beta membership records. Do not expose through the Data API.';
comment on function public.resolve_beta_access() is 'Authenticated self-only closed-beta membership resolver; no user metadata authorization.';

commit;
