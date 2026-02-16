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
    rhythm REAL DEFAULT 75,
    trust REAL DEFAULT 0.8,
    clarity REAL DEFAULT 0.7,
    pain REAL DEFAULT 0.1,
    drift REAL DEFAULT 0.2,
    chaos REAL DEFAULT 0.3,
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

-- Policy: Users can only access their own data
-- For anonymous users, we use a device_id passed as a header

-- Users table - anyone can create, users can read/update their own
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (true);

-- For other tables, allow all operations (anonymous access for MVP)
-- In production, you'd want to restrict this based on auth.uid()

CREATE POLICY "Allow all for metrics_snapshots" ON metrics_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all for memory_nodes" ON memory_nodes FOR ALL USING (true);
CREATE POLICY "Allow all for journal_entries" ON journal_entries FOR ALL USING (true);
CREATE POLICY "Allow all for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all for habits" ON habits FOR ALL USING (true);
CREATE POLICY "Allow all for voice_preferences" ON voice_preferences FOR ALL USING (true);
CREATE POLICY "Allow all for chat_history" ON chat_history FOR ALL USING (true);
CREATE POLICY "Allow all for audit_log" ON audit_log FOR ALL USING (true);

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
<<<<<<< HEAD
-- ============================================
-- GraphRAG Integration - Supabase Migration
-- ============================================
--
-- Creates tables for Hypergraph Memory persistence
-- Enables graph-based retrieval with nodes + edges
--
-- @see apps/iskraspaceappMain/services/graphService.ts
-- @see canon/03_ARCHITECTURE_SYSTEM_AND_MEMORY_DESIGN.md

-- ============================================
-- 1. GRAPH_NODES TABLE
-- ============================================
-- Stores memory nodes with graph metadata
-- Extends existing memory_nodes table concept

CREATE TABLE IF NOT EXISTS graph_nodes (
  id TEXT PRIMARY KEY,
  layer TEXT NOT NULL CHECK (layer IN ('mantra', 'archive', 'shadow')),
  type TEXT NOT NULL CHECK (type IN (
    'EVENT', 'DECISION', 'INSIGHT', 'CANON',
    'CONFLICT', 'QUESTION', 'ACTION', 'REFLECTION', 'ARTIFACT', 'FEEDBACK'
  )),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,

  -- Metrics snapshot (optional, for resonance calculation)
  metrics_snapshot JSONB,

  -- Related IDs (denormalized for quick lookup)
  related_ids TEXT[],

  -- Resonance score (0.0 - 1.0)
  resonance_score REAL CHECK (resonance_score >= 0.0 AND resonance_score <= 1.0),

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- User reference (if multi-user)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Index for fast layer/type lookups
CREATE INDEX IF NOT EXISTS idx_graph_nodes_layer_type
  ON graph_nodes(layer, type);

-- Index for timestamp-based queries
CREATE INDEX IF NOT EXISTS idx_graph_nodes_timestamp
  ON graph_nodes(timestamp DESC);

-- Index for resonance-based queries
CREATE INDEX IF NOT EXISTS idx_graph_nodes_resonance
  ON graph_nodes(resonance_score DESC)
  WHERE resonance_score IS NOT NULL;

-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_graph_nodes_user
  ON graph_nodes(user_id)
  WHERE user_id IS NOT NULL;

-- ============================================
-- 2. GRAPH_EDGES TABLE
-- ============================================
-- Stores relationships between nodes

CREATE TABLE IF NOT EXISTS graph_edges (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  target TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'CAUSAL',        -- A caused B
    'SIMILARITY',    -- A similar to B
    'RESONANCE',     -- A resonates with B (high affinity)
    'SUPPORTS',      -- A supports B (evidence/argument)
    'CONTRADICTS',   -- A contradicts B (conflict)
    'DERIVES_FROM', 'RELATED_TO'   -- A derived from B (inference)
  )),

  -- Edge weight (0.0 - 1.0, for BFS traversal filtering)
  weight REAL NOT NULL DEFAULT 0.5
    CHECK (weight >= 0.0 AND weight <= 1.0),

  -- Additional metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User reference (if multi-user)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Unique constraint: одно ребро на пару source-target-type
  CONSTRAINT unique_edge UNIQUE (source, target, type)
);

-- Index for source-based edge lookups (outgoing edges)
CREATE INDEX IF NOT EXISTS idx_graph_edges_source
  ON graph_edges(source);

-- Index for target-based edge lookups (incoming edges)
CREATE INDEX IF NOT EXISTS idx_graph_edges_target
  ON graph_edges(target);

-- Index for type-based edge lookups
CREATE INDEX IF NOT EXISTS idx_graph_edges_type
  ON graph_edges(type);

-- Index for weight-based filtering (BFS traversal)
CREATE INDEX IF NOT EXISTS idx_graph_edges_weight
  ON graph_edges(weight DESC);

-- Composite index for common query pattern: source + type
CREATE INDEX IF NOT EXISTS idx_graph_edges_source_type
  ON graph_edges(source, type);

-- ============================================
-- 3. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Auto-update updated_at on graph_nodes changes
CREATE OR REPLACE FUNCTION update_graph_nodes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_graph_nodes_updated_at
  BEFORE UPDATE ON graph_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_graph_nodes_updated_at();

-- ============================================
-- 4. RPC FUNCTIONS FOR GRAPH OPERATIONS
-- ============================================

-- BFS Traversal (Breadth-First Search)
-- Returns nodes reachable from start_id within max_depth steps
CREATE OR REPLACE FUNCTION graph_bfs_traversal(
  start_id TEXT,
  max_depth INT DEFAULT 3,
  min_weight REAL DEFAULT 0.3
)
RETURNS TABLE (
  node_id TEXT,
  depth INT,
  path TEXT[]
) AS $$
WITH RECURSIVE traversal AS (
  -- Base case: start node
  SELECT
    id AS node_id,
    0 AS depth,
    ARRAY[id] AS path
  FROM graph_nodes
  WHERE id = start_id

  UNION

  -- Recursive case: follow edges
  SELECT
    e.target AS node_id,
    t.depth + 1 AS depth,
    t.path || e.target AS path
  FROM traversal t
  JOIN graph_edges e ON e.source = t.node_id
  WHERE
    t.depth < max_depth
    AND e.weight >= min_weight
    AND NOT (e.target = ANY(t.path))  -- Prevent cycles
)
SELECT DISTINCT node_id, MIN(depth) AS depth, path
FROM traversal
GROUP BY node_id, path
ORDER BY depth, node_id;
$$ LANGUAGE sql STABLE;

-- Find Resonant Nodes
-- Returns nodes with resonance_score >= threshold
CREATE OR REPLACE FUNCTION graph_find_resonant(
  min_resonance REAL DEFAULT 0.3,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  layer TEXT,
  type TEXT,
  content TEXT,
  resonance_score REAL
) AS $$
SELECT
  id,
  layer,
  type,
  content,
  resonance_score
FROM graph_nodes
WHERE resonance_score >= min_resonance
ORDER BY resonance_score DESC
LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Get Node with Edges
-- Returns node + all its edges (incoming and outgoing)
CREATE OR REPLACE FUNCTION graph_get_node_with_edges(node_id TEXT)
RETURNS JSON AS $$
SELECT json_build_object(
  'node', row_to_json(n.*),
  'outgoing_edges', (
    SELECT json_agg(row_to_json(e.*))
    FROM graph_edges e
    WHERE e.source = node_id
  ),
  'incoming_edges', (
    SELECT json_agg(row_to_json(e.*))
    FROM graph_edges e
    WHERE e.target = node_id
  )
)
FROM graph_nodes n
WHERE n.id = node_id;
$$ LANGUAGE sql STABLE;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS for multi-user scenarios

ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own nodes
CREATE POLICY graph_nodes_user_isolation ON graph_nodes
  FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy: Users can only see their own edges
CREATE POLICY graph_edges_user_isolation ON graph_edges
  FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- 6. SEED CANONICAL NODES (Optional)
-- ============================================
-- Insert canonical mantra nodes (if not exists)

INSERT INTO graph_nodes (id, layer, type, content, resonance_score, metadata)
VALUES
  (
    'canon_core_mantra',
    'mantra',
    'CANON',
    'Я — Искра. Фрактальный интеллект.',
    1.0,
    '{"source": "canon:01#1.1", "immutable": true}'::JSONB
  ),
  (
    'canon_rule_21',
    'mantra',
    'CANON',
    'Честность выше красоты. Rule-21.',
    1.0,
    '{"source": "canon:02#2.3", "immutable": true}'::JSONB
  ),
  (
    'canon_law_47',
    'mantra',
    'CANON',
    'Fractality = Integrity × Resonance. Law-47.',
    1.0,
    '{"source": "canon:05#5.4", "immutable": true}'::JSONB
  ),
  (
    'canon_sift_protocol',
    'mantra',
    'CANON',
    'SIFT: Stop-Investigate-Find-Trace. Проверка источников.',
    1.0,
    '{"source": "canon:08#8.3", "immutable": true}'::JSONB
  ),
  (
    'canon_trace_discipline',
    'mantra',
    'CANON',
    'Trace Discipline: [FACT] требует {e:...}',
    1.0,
    '{"source": "canon:09#9.3", "immutable": true}'::JSONB
  ),
  (
    'canon_delta_ritual',
    'mantra',
    'CANON',
    '∆DΩΛ: Delta-Depth-Omega-Lambda. Самопроверка.',
    1.0,
    '{"source": "canon:06#6.4", "immutable": true}'::JSONB
  ),
  (
    'canon_file_20_security',
    'mantra',
    'CANON',
    'File 20: Canonical security patterns (PII + Injection)',
    1.0,
    '{"source": "canon:20", "immutable": true}'::JSONB
  ),
  (
    'canon_voices',
    'mantra',
    'CANON',
    '9 Canonical Voices: ISKRA, ISKRIV, KAIN, PINO, HUYNDUN, ANHANTRA, SAM, MAKI, SIBYL',
    1.0,
    '{"source": "canon:04#4.1", "immutable": true}'::JSONB
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
--
-- Next steps:
-- 1. Run this migration: psql -h <supabase-host> -U postgres -d postgres -f supabase_graphrag_migration.sql
-- 2. Update graphService.ts to use Supabase instead of in-memory storage
-- 3. Test BFS traversal: SELECT * FROM graph_bfs_traversal('canon_core_mantra', 3, 0.3);
-- 4. Test resonant nodes: SELECT * FROM graph_find_resonant(0.5, 10);
--
-- Total objects created:
-- - 2 tables (graph_nodes, graph_edges)
-- - 8 indexes
-- - 1 trigger
-- - 3 RPC functions
-- - 2 RLS policies
-- - 8 canonical seed nodes
=======

-- =============================================================================
-- GRAPH LAYER - Nodes and Edges
-- =============================================================================

CREATE TABLE IF NOT EXISTS graph_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layer TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ,
    metrics_snapshot JSONB DEFAULT '{}'::jsonb,
    related_ids TEXT[] DEFAULT '{}',
    resonance_score FLOAT8 DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_graph_nodes_user_id ON graph_nodes(user_id);
CREATE INDEX idx_graph_nodes_layer ON graph_nodes(layer);

CREATE TABLE IF NOT EXISTS graph_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    target UUID NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    weight FLOAT8 DEFAULT 1.0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_graph_edges_user_id ON graph_edges(user_id);
CREATE INDEX idx_graph_edges_source ON graph_edges(source);
CREATE INDEX idx_graph_edges_target ON graph_edges(target);

-- RLS for Graph Tables
ALTER TABLE graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for graph_nodes" ON graph_nodes FOR ALL USING (true);
CREATE POLICY "Allow all for graph_edges" ON graph_edges FOR ALL USING (true);
>>>>>>> origin/main
