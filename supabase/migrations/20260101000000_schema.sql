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

CREATE POLICY "Users can manage own audit_log"
    ON audit_log FOR ALL
    USING (user_id = auth.uid())
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


