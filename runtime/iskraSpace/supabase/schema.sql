-- =============================================================================
-- ISKRA SPACE APP - Supabase Database Schema
-- =============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/typcvaszcfdpkzbjzuur/sql
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    tutorial_complete BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- METRICS SNAPSHOTS - Track user metrics over time
-- =============================================================================
CREATE TABLE IF NOT EXISTS metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rhythm REAL DEFAULT 60,
    trust REAL DEFAULT 0.7,
    clarity REAL DEFAULT 0.8,
    pain REAL DEFAULT 0.1,
    drift REAL DEFAULT 0.2,
    chaos REAL DEFAULT 0.2,
    foresight REAL DEFAULT 0,
    echo REAL DEFAULT 0.5,
    silence_mass REAL DEFAULT 0.1,
    mirror_sync REAL DEFAULT 0.6,
    interrupt REAL DEFAULT 0,
    ctx_switch REAL DEFAULT 0,
    phase TEXT DEFAULT 'CLARITY',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_user_id ON metrics_snapshots(user_id);
CREATE INDEX idx_metrics_created_at ON metrics_snapshots(created_at DESC);

-- =============================================================================
-- MEMORY NODES - Three-layer memory system (Mantra, Archive, Shadow)
-- =============================================================================
CREATE TABLE IF NOT EXISTS memory_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    layer TEXT NOT NULL CHECK (layer IN ('mantra', 'archive', 'shadow')),
    type TEXT NOT NULL CHECK (type IN ('event', 'feedback', 'decision', 'insight', 'artifact')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    doc_type TEXT CHECK (doc_type IN ('canon', 'draft', 'code', 'log', 'personal')),
    trust_level REAL DEFAULT 1.0,
    tags TEXT[] DEFAULT '{}',
    section TEXT,
    facet TEXT CHECK (facet IN ('KAIN', 'PINO', 'SAM', 'ANHANTRA', 'HUYNDUN', 'ISKRIV', 'ISKRA', 'MAKI', 'SIBYL')),
    evidence JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_user_id ON memory_nodes(user_id);
CREATE INDEX idx_memory_layer ON memory_nodes(layer);
CREATE INDEX idx_memory_type ON memory_nodes(type);
CREATE INDEX idx_memory_tags ON memory_nodes USING GIN(tags);

-- =============================================================================
-- JOURNAL ENTRIES
-- =============================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    prompt_question TEXT,
    prompt_why TEXT,
    analysis_reflection TEXT,
    analysis_mood TEXT,
    analysis_signature TEXT,
    user_mood INTEGER CHECK (user_mood >= 0 AND user_mood <= 100),
    user_energy INTEGER CHECK (user_energy >= 0 AND user_energy <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_created_at ON journal_entries(created_at DESC);

-- =============================================================================
-- TASKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ritual_tag TEXT DEFAULT 'FIRE' CHECK (ritual_tag IN ('FIRE', 'WATER', 'SUN', 'BALANCE', 'DELTA')),
    done BOOLEAN DEFAULT FALSE,
    date DATE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_done ON tasks(done);

-- =============================================================================
-- HABITS
-- =============================================================================
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ritual_tag TEXT DEFAULT 'FIRE' CHECK (ritual_tag IN ('FIRE', 'WATER', 'SUN', 'BALANCE', 'DELTA')),
    streak INTEGER DEFAULT 0,
    completed_today BOOLEAN DEFAULT FALSE,
    last_completed DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON habits(user_id);

-- =============================================================================
-- VOICE PREFERENCES - User preferences for each voice
-- =============================================================================
CREATE TABLE IF NOT EXISTS voice_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voice_name TEXT NOT NULL CHECK (voice_name IN ('KAIN', 'PINO', 'SAM', 'ANHANTRA', 'HUYNDUN', 'ISKRIV', 'ISKRA', 'MAKI', 'SIBYL')),
    weight REAL DEFAULT 1.0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, voice_name)
);

CREATE INDEX idx_voice_prefs_user_id ON voice_preferences(user_id);

-- =============================================================================
-- CHAT HISTORY
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    text TEXT NOT NULL,
    voice_name TEXT CHECK (voice_name IN ('KAIN', 'PINO', 'SAM', 'ANHANTRA', 'HUYNDUN', 'ISKRIV', 'ISKRA', 'MAKI', 'SIBYL')),
    delta_signature JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_created_at ON chat_history(created_at DESC);

-- =============================================================================
-- AUDIT LOG - System audit trail
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own data via auth.uid()
-- NOTE: this schema is intended for authenticated requests only.

-- Users table
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can manage own metrics_snapshots"
    ON metrics_snapshots FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own memory_nodes"
    ON memory_nodes FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own journal_entries"
    ON journal_entries FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own tasks"
    ON tasks FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own habits"
    ON habits FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own voice_preferences"
    ON voice_preferences FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage own chat_history"
    ON chat_history FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- audit_log is append-only: users may read and insert their own audit rows,
-- but never UPDATE or DELETE them (no such policies => RLS denies those actions).
CREATE POLICY "Users can view own audit_log"
    ON audit_log FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own audit_log"
    ON audit_log FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_memory_nodes_updated_at
    BEFORE UPDATE ON memory_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_voice_preferences_updated_at
    BEFORE UPDATE ON voice_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- SEED DEFAULT DATA (Optional)
-- =============================================================================

-- Create a default anonymous user for testing
INSERT INTO users (id, name, onboarding_complete, tutorial_complete)
VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous', false, false)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- DONE!
-- =============================================================================
-- Schema created successfully.
-- Next: Run the Edge Function setup for Gemini API proxy.

-- =============================================================================
-- GRAPH LAYER - Nodes and Edges
-- =============================================================================

CREATE TABLE IF NOT EXISTS graph_nodes (
    id TEXT PRIMARY KEY,
    layer TEXT NOT NULL CHECK (layer IN ('mantra', 'archive', 'shadow')),
    type TEXT NOT NULL CHECK (type IN (
        'EVENT', 'DECISION', 'INSIGHT', 'CANON',
        'CONFLICT', 'QUESTION', 'ACTION', 'REFLECTION',
        'event', 'feedback', 'decision', 'insight', 'artifact'
    )),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metrics_snapshot JSONB,
    related_ids TEXT[],
    resonance_score REAL CHECK (resonance_score >= 0.0 AND resonance_score <= 1.0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_layer_type ON graph_nodes(layer, type);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_timestamp ON graph_nodes(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_resonance ON graph_nodes(resonance_score DESC)
    WHERE resonance_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_graph_nodes_user ON graph_nodes(user_id)
    WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS graph_edges (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    target TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'CAUSAL', 'SIMILARITY', 'RESONANCE', 'SUPPORTS',
        'CONTRADICTS', 'DERIVES_FROM', 'RELATED_TO'
    )),
    weight REAL NOT NULL DEFAULT 0.5
        CHECK (weight >= 0.0 AND weight <= 1.0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_edge UNIQUE (source, target, type)
);

CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON graph_edges(source);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON graph_edges(target);
CREATE INDEX IF NOT EXISTS idx_graph_edges_type ON graph_edges(type);
CREATE INDEX IF NOT EXISTS idx_graph_edges_weight ON graph_edges(weight DESC);
CREATE INDEX IF NOT EXISTS idx_graph_edges_source_type ON graph_edges(source, type);

-- RLS for Graph Tables
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS graph_nodes_user_isolation ON graph_nodes;
DROP POLICY IF EXISTS graph_edges_user_isolation ON graph_edges;
DROP POLICY IF EXISTS graph_nodes_manage_own ON graph_nodes;
DROP POLICY IF EXISTS graph_edges_manage_own ON graph_edges;

CREATE POLICY graph_nodes_manage_own
ON graph_nodes
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY graph_edges_manage_own
ON graph_edges
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION update_graph_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_graph_nodes_updated_at
    BEFORE UPDATE ON graph_nodes
    FOR EACH ROW EXECUTE FUNCTION update_graph_nodes_updated_at();


-- =============================================================================
-- GRAPH RPC BOUNDARY (synchronized with supabase/migrations/20260626164633_graph_rpc_boundary.sql)
-- =============================================================================
-- Drop legacy function shapes before recreating with SECURITY DEFINER signatures.
drop function if exists public.graph_bfs_traversal(text, int, real);
drop function if exists public.graph_find_resonant(real, int);
drop function if exists public.graph_get_node_with_edges(text);

-- Drop current RPCs so the file is idempotent when re-applied.
drop function if exists public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb);
drop function if exists public.graph_create_edge(text, text, text, text, real, jsonb);
drop function if exists public.graph_get_user_nodes(text, text, text[], int);
drop function if exists public.graph_search_nodes(text, int);
drop function if exists public.graph_delete_node(text);
drop function if exists public.graph_update_node_resonance(text, jsonb, real);
drop function if exists public.graph_get_connection_candidates(text, int);
drop function if exists public.graph_get_stats();
drop function if exists public.graph_traverse_bfs_nodes(text, int, real);
drop function if exists public.graph_find_resonant_nodes(real, int);

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

create or replace function public.graph_get_node_with_edges(p_node_id text)
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
      and n.id = p_node_id
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

-- Revoke public access and grant to authenticated role only.
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
