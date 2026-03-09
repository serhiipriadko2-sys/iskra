-- =============================================================================
-- ISKRA - CRITICAL RLS SECURITY FIX
-- =============================================================================
-- Migration: 20260307_fix_rls_policies.sql
-- Purpose: Replace permissive USING (true) policies with auth.uid() = user_id
-- Risk: Users with legacy data (device_id based) may lose access until data migration
-- Prerequisites: 
--   1. Supabase Auth must be enabled
--   2. Users must be authenticated (not anonymous) for this to work
--   3. Run data migration script AFTER deploying this if legacy data exists
-- =============================================================================

-- ⚠️ WARNING: This migration will BREAK access for any data not linked to auth.uid()
-- If you have legacy data using device_id, run the data migration script first.

-- =============================================================================
-- STEP 1: DROP INSECURE POLICIES
-- =============================================================================

-- Drop permissive policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Drop permissive policies on all data tables
DROP POLICY IF EXISTS "Allow all for metrics_snapshots" ON metrics_snapshots;
DROP POLICY IF EXISTS "Allow all for memory_nodes" ON memory_nodes;
DROP POLICY IF EXISTS "Allow all for journal_entries" ON journal_entries;
DROP POLICY IF EXISTS "Allow all for tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all for habits" ON habits;
DROP POLICY IF EXISTS "Allow all for voice_preferences" ON voice_preferences;
DROP POLICY IF EXISTS "Allow all for chat_history" ON chat_history;
DROP POLICY IF EXISTS "Allow all for audit_log" ON audit_log;
DROP POLICY IF EXISTS "Allow all for graph_nodes" ON graph_nodes;
DROP POLICY IF EXISTS "Allow all for graph_edges" ON graph_edges;

-- =============================================================================
-- STEP 2: CREATE SECURE POLICIES (auth.uid() based)
-- =============================================================================

-- USERS TABLE
-- Allow authenticated users to read/update only their own profile
CREATE POLICY "Users can view own profile (secure)"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile (secure)"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to insert their own profile (still needed for onboarding)
-- Keep existing policy but add auth check
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert own profile (secure)"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- METRICS_SNAPSHOTS TABLE
CREATE POLICY "Users can manage own metrics (secure)"
    ON metrics_snapshots FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- MEMORY_NODES TABLE
CREATE POLICY "Users can manage own memory nodes (secure)"
    ON memory_nodes FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- JOURNAL_ENTRIES TABLE
CREATE POLICY "Users can manage own journal entries (secure)"
    ON journal_entries FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TASKS TABLE
CREATE POLICY "Users can manage own tasks (secure)"
    ON tasks FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- HABITS TABLE
CREATE POLICY "Users can manage own habits (secure)"
    ON habits FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- VOICE_PREFERENCES TABLE
CREATE POLICY "Users can manage own voice preferences (secure)"
    ON voice_preferences FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- CHAT_HISTORY TABLE
CREATE POLICY "Users can manage own chat history (secure)"
    ON chat_history FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- AUDIT_LOG TABLE
-- Allow users to read their own audit logs
-- Allow system to insert audit logs for any user (via service role)
CREATE POLICY "Users can view own audit log (secure)"
    ON audit_log FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own audit log (secure)"
    ON audit_log FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- GRAPH_NODES TABLE
CREATE POLICY "Users can manage own graph nodes (secure)"
    ON graph_nodes FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- GRAPH_EDGES TABLE
CREATE POLICY "Users can manage own graph edges (secure)"
    ON graph_edges FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- STEP 3: SERVICE ROLE POLICIES (for background jobs, migrations, etc.)
-- =============================================================================

-- Grant service_role full access (bypasses RLS)
-- This is intentional - service_role should only be used server-side
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- STEP 4: VERIFICATION QUERIES (run these after migration to confirm)
-- =============================================================================

-- Verify RLS is enabled on all tables
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Verify policies are in place
-- SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';

-- =============================================================================
-- DONE!
-- =============================================================================
-- Migration complete. All tables now enforce auth.uid() = user_id.
-- Next steps:
--   1. Test with authenticated user
--   2. Run data migration script if legacy device_id data exists
--   3. Monitor logs for unauthorized access attempts
-- =============================================================================
