-- =============================================================================
-- ISKRA SPACE - GRAPH SCHEMA CONTRACT REPAIR
-- =============================================================================
-- Migration name: graph_schema_contract_repair
--
-- Purpose:
--   Align graph_nodes / graph_edges with the live GraphRAG contract surfaced by
--   the 2026-06-26 memory-write pilot:
--   - text graph IDs and edge endpoints;
--   - timestamptz node timestamp;
--   - public.users user_id references;
--   - graph node/edge CHECK values used by runtime persistence;
--   - required graph indexes and RPC functions.
--
-- Data scope:
--   Metadata/DDL repair only. This migration does not insert or delete graph
--   rows. Existing values must already satisfy the final CHECK constraints.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Convert old UUID graph contracts to text IDs if needed.
-- ---------------------------------------------------------------------------

alter table if exists public.graph_edges drop constraint if exists graph_edges_source_fkey;
alter table if exists public.graph_edges drop constraint if exists graph_edges_target_fkey;
alter table if exists public.graph_edges drop constraint if exists graph_edges_user_id_fkey;
alter table if exists public.graph_nodes drop constraint if exists graph_nodes_user_id_fkey;

alter table if exists public.graph_nodes
  alter column id drop default,
  alter column id type text using id::text;

alter table if exists public.graph_edges
  alter column id drop default,
  alter column id type text using id::text,
  alter column source type text using source::text,
  alter column target type text using target::text;

-- ---------------------------------------------------------------------------
-- 2. Align graph_nodes column defaults, nullability, and timestamp type.
-- ---------------------------------------------------------------------------

alter table if exists public.graph_nodes
  add column if not exists updated_at timestamptz default now(),
  add column if not exists user_id uuid;

do $$
declare
  v_udt_name text;
begin
  select udt_name
  into v_udt_name
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'graph_nodes'
    and column_name = 'timestamp';

  if v_udt_name is null then
    raise exception 'public.graph_nodes.timestamp is missing';
  elsif v_udt_name = 'int8' then
    alter table public.graph_nodes
      alter column "timestamp" type timestamptz using to_timestamp("timestamp");
  elsif v_udt_name <> 'timestamptz' then
    alter table public.graph_nodes
      alter column "timestamp" type timestamptz using "timestamp"::timestamptz;
  end if;
end $$;

alter table if exists public.graph_nodes
  alter column layer set not null,
  alter column type set not null,
  alter column content set not null,
  alter column "timestamp" set default now(),
  alter column "timestamp" set not null,
  alter column metrics_snapshot drop default,
  alter column related_ids drop default,
  alter column resonance_score drop default,
  alter column resonance_score type real using resonance_score::real,
  alter column metadata set default '{}'::jsonb,
  alter column user_id drop not null;

alter table if exists public.graph_nodes
  add constraint graph_nodes_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 3. Align graph_edges column defaults, nullability, and public.users FK.
-- ---------------------------------------------------------------------------

alter table if exists public.graph_edges
  add column if not exists user_id uuid;

alter table if exists public.graph_edges
  alter column source set not null,
  alter column target set not null,
  alter column type set not null,
  alter column weight type real using weight::real,
  alter column weight set default 0.5,
  alter column weight set not null,
  alter column metadata set default '{}'::jsonb,
  alter column user_id drop not null;

alter table if exists public.graph_edges
  add constraint graph_edges_source_fkey
  foreign key (source) references public.graph_nodes(id) on delete cascade,
  add constraint graph_edges_target_fkey
  foreign key (target) references public.graph_nodes(id) on delete cascade,
  add constraint graph_edges_user_id_fkey
  foreign key (user_id) references public.users(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 4. Replace graph CHECK contracts with the runtime/live contract.
-- ---------------------------------------------------------------------------

alter table if exists public.graph_nodes drop constraint if exists graph_nodes_layer_check;
alter table if exists public.graph_nodes drop constraint if exists graph_nodes_type_check;
alter table if exists public.graph_nodes drop constraint if exists graph_nodes_resonance_score_check;
alter table if exists public.graph_edges drop constraint if exists graph_edges_type_check;
alter table if exists public.graph_edges drop constraint if exists graph_edges_weight_check;

alter table if exists public.graph_nodes
  add constraint graph_nodes_layer_check
  check (layer = any (array['mantra'::text, 'archive'::text, 'shadow'::text])),
  add constraint graph_nodes_type_check
  check (type = any (array[
    'EVENT'::text, 'DECISION'::text, 'INSIGHT'::text, 'CANON'::text,
    'CONFLICT'::text, 'QUESTION'::text, 'ACTION'::text, 'REFLECTION'::text,
    'event'::text, 'feedback'::text, 'decision'::text, 'insight'::text,
    'artifact'::text
  ])),
  add constraint graph_nodes_resonance_score_check
  check (resonance_score >= 0.0 and resonance_score <= 1.0);

alter table if exists public.graph_edges
  add constraint graph_edges_type_check
  check (type = any (array[
    'CAUSAL'::text, 'SIMILARITY'::text, 'RESONANCE'::text, 'SUPPORTS'::text,
    'CONTRADICTS'::text, 'DERIVES_FROM'::text, 'RELATED_TO'::text
  ])),
  add constraint graph_edges_weight_check
  check (weight >= 0.0 and weight <= 1.0);

-- ---------------------------------------------------------------------------
-- 5. Ensure graph indexes, trigger, RPCs, and RLS exist.
-- ---------------------------------------------------------------------------

create index if not exists idx_graph_nodes_layer_type
  on public.graph_nodes(layer, type);
create index if not exists idx_graph_nodes_timestamp
  on public.graph_nodes("timestamp" desc);
create index if not exists idx_graph_nodes_resonance
  on public.graph_nodes(resonance_score desc)
  where resonance_score is not null;
create index if not exists idx_graph_nodes_user
  on public.graph_nodes(user_id)
  where user_id is not null;

create index if not exists idx_graph_edges_source
  on public.graph_edges(source);
create index if not exists idx_graph_edges_target
  on public.graph_edges(target);
create index if not exists idx_graph_edges_type
  on public.graph_edges(type);
create index if not exists idx_graph_edges_weight
  on public.graph_edges(weight desc);
create index if not exists idx_graph_edges_source_type
  on public.graph_edges(source, type);

create or replace function public.update_graph_nodes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trigger_graph_nodes_updated_at'
      and tgrelid = 'public.graph_nodes'::regclass
  ) then
    create trigger trigger_graph_nodes_updated_at
      before update on public.graph_nodes
      for each row
      execute function public.update_graph_nodes_updated_at();
  end if;
end $$;

create or replace function public.graph_bfs_traversal(
  start_id text,
  max_depth int default 3,
  min_weight real default 0.3
)
returns table (
  node_id text,
  depth int,
  path text[]
)
language sql
stable
as $$
with recursive traversal as (
  select id as node_id, 0 as depth, array[id] as path
  from public.graph_nodes
  where id = start_id

  union

  select e.target as node_id, t.depth + 1 as depth, t.path || e.target as path
  from traversal t
  join public.graph_edges e on e.source = t.node_id
  where t.depth < max_depth
    and e.weight >= min_weight
    and not (e.target = any(t.path))
)
select distinct node_id, min(depth) as depth, path
from traversal
group by node_id, path
order by depth, node_id;
$$;

create or replace function public.graph_find_resonant(
  min_resonance real default 0.3,
  limit_count int default 10
)
returns table (
  id text,
  layer text,
  type text,
  content text,
  resonance_score real
)
language sql
stable
as $$
select id, layer, type, content, resonance_score
from public.graph_nodes
where resonance_score >= min_resonance
order by resonance_score desc
limit limit_count;
$$;

create or replace function public.graph_get_node_with_edges(node_id text)
returns json
language sql
stable
as $$
select json_build_object(
  'node', row_to_json(n.*),
  'outgoing_edges', (
    select json_agg(row_to_json(e.*))
    from public.graph_edges e
    where e.source = node_id
  ),
  'incoming_edges', (
    select json_agg(row_to_json(e.*))
    from public.graph_edges e
    where e.target = node_id
  )
)
from public.graph_nodes n
where n.id = node_id;
$$;

alter table if exists public.graph_nodes enable row level security;
alter table if exists public.graph_edges enable row level security;

commit;
