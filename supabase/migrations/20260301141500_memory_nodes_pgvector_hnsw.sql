-- Scientific Turn: Memory persistence + pgvector HNSW (cosine)
-- Model: gte-small (384 dims) — embedding vectors are normalized at the source.

-- Extensions
create extension if not exists vector;
create extension if not exists pgcrypto;

-- Table
create table if not exists public.memory_nodes (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null default auth.uid(),
  content text not null,
  layer text not null check (layer in ('core', 'memory', 'dream')),
  ts timestamptz not null default now(),
  fractal jsonb,
  embedding vector(384) not null
);

-- SECURITY: RLS defaults to deny. Clients should authenticate (JWT) or use server-side service role.
alter table public.memory_nodes enable row level security;

-- Minimal per-user policies (auth required)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_nodes' and policyname = 'memory_nodes_select_own'
  ) then
    create policy memory_nodes_select_own
      on public.memory_nodes
      for select
      to authenticated
      using (auth.uid() is not null and auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_nodes' and policyname = 'memory_nodes_insert_own'
  ) then
    create policy memory_nodes_insert_own
      on public.memory_nodes
      for insert
      to authenticated
      with check (auth.uid() is not null and auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'memory_nodes' and policyname = 'memory_nodes_update_own'
  ) then
    create policy memory_nodes_update_own
      on public.memory_nodes
      for update
      to authenticated
      using (auth.uid() is not null and auth.uid() = user_id)
      with check (auth.uid() is not null and auth.uid() = user_id);
  end if;
end $$;

-- Indexes
-- Causal lookup (time window) helper
create index if not exists memory_nodes_user_layer_ts_idx
  on public.memory_nodes (user_id, layer, ts desc);

-- Vector ANN index (HNSW)
-- IMPORTANT: operator class must match the operator used in queries:
--   vector_cosine_ops -> <=>
--   vector_l2_ops     -> <->
--   vector_ip_ops     -> <#>
create index if not exists memory_nodes_embedding_hnsw_cosine_idx
  on public.memory_nodes
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- RPC: semantic match using HNSW index (cosine distance)
-- NOTE: keep SECURITY INVOKER so RLS applies.
create or replace function public.match_memory_nodes(
  query_embedding real[],
  match_count int default 10,
  rerank_k int default null,
  min_similarity real default null,
  filter_layer text default null,
  exclude_id text default null,
  ef_search int default null
)
returns table (
  id text,
  content text,
  layer text,
  ts timestamptz,
  fractal jsonb,
  embedding real[],
  similarity real
)
language plpgsql
stable
as $$
declare
  k_pre int := coalesce(rerank_k, match_count * 5);
  k_eff int := greatest(match_count, 1);
  ef_min int := greatest(match_count, 40);
  ef_cap int := 400;
  ef_eff int := least(greatest(coalesce(nullif(ef_search, 0), ef_min), ef_min), ef_cap);
begin
  -- pgvector: query-time quality/speed knob
  perform set_config('hnsw.ef_search', ef_eff::text, true);
  -- pgvector: when filtering, iterative scans help return enough results
  perform set_config('hnsw.iterative_scan', 'strict_order', true);

  return query
  with q as (
    select (query_embedding::real[]::vector(384)) as v
  ),
  candidates as (
    select
      mn.id,
      mn.content,
      mn.layer,
      mn.ts,
      mn.fractal,
      cast(mn.embedding as real[]) as embedding,
      (1 - (mn.embedding <=> (select v from q)))::real as similarity
    from public.memory_nodes mn
    where (filter_layer is null or mn.layer = filter_layer)
      and (exclude_id is null or mn.id <> exclude_id)
    order by mn.embedding <=> (select v from q)
    limit k_pre
  )
  select *
  from candidates
  where (min_similarity is null or candidates.similarity >= min_similarity)
  order by candidates.similarity desc
  limit k_eff;
end $$;

-- RPC: causal neighbors (same layer within a time window)
create or replace function public.match_memory_causal(
  center_ts timestamptz,
  match_count int default 10,
  filter_layer text default null,
  exclude_id text default null,
  window_ms int default 3600000
)
returns table (
  id text,
  content text,
  layer text,
  ts timestamptz,
  fractal jsonb,
  embedding real[],
  weight real
)
language sql
stable
as $$
  select
    mn.id,
    mn.content,
    mn.layer,
    mn.ts,
    mn.fractal,
    cast(mn.embedding as real[]) as embedding,
    (1 - (abs(extract(epoch from (mn.ts - center_ts)) * 1000.0) / window_ms))::real as weight
  from public.memory_nodes mn
  where (filter_layer is null or mn.layer = filter_layer)
    and (exclude_id is null or mn.id <> exclude_id)
    and mn.ts between (center_ts - (window_ms || ' milliseconds')::interval)
             and (center_ts + (window_ms || ' milliseconds')::interval)
  order by abs(extract(epoch from (mn.ts - center_ts))) asc
  limit greatest(match_count, 1);
$$;

-- RPC: upsert memory node (casts embedding real[] -> vector(384))
-- NOTE: SECURITY INVOKER so RLS applies. Requires authenticated user.
create or replace function public.upsert_memory_node(
  p_id text,
  p_content text,
  p_layer text,
  p_ts timestamptz,
  p_fractal jsonb,
  p_embedding real[]
)
returns void
language plpgsql
volatile
as $$
begin
  insert into public.memory_nodes (id, user_id, content, layer, ts, fractal, embedding)
  values (
    coalesce(p_id, gen_random_uuid()::text),
    auth.uid(),
    p_content,
    p_layer,
    coalesce(p_ts, now()),
    p_fractal,
    (p_embedding::real[]::vector(384))
  )
  on conflict (id)
  do update set
    content = excluded.content,
    layer = excluded.layer,
    ts = excluded.ts,
    fractal = excluded.fractal,
    embedding = excluded.embedding
  ;
end $$;