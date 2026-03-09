# =============================================================================
# ISKRA - LEGACY DATA MIGRATION SCRIPT (device_id → auth.uid())
# =============================================================================
# Purpose: Migrate legacy data from device_id-based to auth.uid()-based ownership
# Run this BEFORE deploying the RLS security fix if you have legacy data
# 
# Prerequisites:
#   1. Users must have created accounts in Supabase Auth
#   2. You need a mapping table: device_id → user_id (auth.uid())
# 
# How to use:
#   1. Export your device_id to user_id mapping from your auth system
#   2. Create temporary mapping table
#   3. Run this script
#   4. Verify data ownership
#   5. Drop temporary table
# =============================================================================

-- =============================================================================
-- STEP 0: CREATE TEMPORARY MAPPING TABLE
-- =============================================================================
-- Replace this with your actual device_id → user_id mapping
-- Example: device_id from localStorage → auth.uid() from Supabase Auth

CREATE TEMP TABLE IF NOT EXISTS device_user_mapping (
    device_id TEXT PRIMARY KEY,
    user_id UUID NOT NULL
);

-- =============================================================================
-- POPULATE THE MAPPING TABLE
-- =============================================================================
-- IMPORTANT: You MUST populate this table with real data before running migration
-- Example inserts (replace with your actual data):

-- INSERT INTO device_user_mapping (device_id, user_id) VALUES 
--     ('device-abc-123', '11111111-1111-1111-1111-111111111111'),
--     ('device-xyz-789', '22222222-2222-2222-2222-222222222222');

-- =============================================================================
-- STEP 1: VERIFY MAPPING EXISTS
-- =============================================================================
-- Check how many records will be migrated

SELECT 
    'metrics_snapshots' as table_name, 
    COUNT(*) as rows_to_migrate
FROM metrics_snapshots m
LEFT JOIN device_user_mapping d ON m.user_id::TEXT = d.device_id
WHERE d.user_id IS NULL AND m.user_id IS NOT NULL;

-- Repeat for other tables if needed...

-- =============================================================================
-- STEP 2: MIGRATE DATA (UPDATE user_id FROM mapping)
-- =============================================================================

-- METRICS_SNAPSHOTS
UPDATE metrics_snapshots m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;  -- Only update if different

-- MEMORY_NODES
UPDATE memory_nodes m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- JOURNAL_ENTRIES
UPDATE journal_entries m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- TASKS
UPDATE tasks m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- HABITS
UPDATE habits m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- VOICE_PREFERENCES
UPDATE voice_preferences m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- CHAT_HISTORY
UPDATE chat_history m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- AUDIT_LOG
UPDATE audit_log m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- GRAPH_NODES
UPDATE graph_nodes m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- GRAPH_EDGES
UPDATE graph_edges m
SET user_id = d.user_id
FROM device_user_mapping d
WHERE m.user_id::TEXT = d.device_id
  AND m.user_id != d.user_id;

-- =============================================================================
-- STEP 3: VERIFY MIGRATION
-- =============================================================================
-- Check for any orphaned records (data without valid user_id)

SELECT 
    'metrics_snapshots' as table_name,
    COUNT(*) as orphaned_rows
FROM metrics_snapshots m
LEFT JOIN device_user_mapping d ON m.user_id::TEXT = d.device_id
WHERE m.user_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = m.user_id);

-- Repeat for other tables...

-- =============================================================================
-- STEP 4: CLEANUP
-- =============================================================================
-- Drop temporary mapping table (it's temp, so it auto-drops on session end)
-- DROP TABLE IF EXISTS device_user_mapping;

-- =============================================================================
-- DONE!
-- =============================================================================
-- Migration complete. All legacy data is now linked to auth.uid().
-- You can now safely deploy the RLS security fix migration.
-- =============================================================================
