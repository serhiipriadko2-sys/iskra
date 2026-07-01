# [P0-BLOCKER] Weak RLS in GraphRAG Migration — `user_id IS NULL` Allows Canonical Node Tampering

## Status: 🔴 BLOCKER — Any authenticated user can modify canonical data

## Problem
`supabase_graphrag_migration.sql:240-247` uses `USING (user_id = auth.uid() OR user_id IS NULL)` for RLS policies on `graph_nodes` and `graph_edges`. The canonical seed nodes (mantra, principles, etc.) are inserted with `user_id = NULL`, making them world-writable to any authenticated user.

## Evidence

**`supabase_graphrag_migration.sql:240-247`:**
```sql
CREATE POLICY graph_nodes_user_isolation ON graph_nodes
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY graph_edges_user_isolation ON graph_edges
  USING (user_id = auth.uid() OR user_id IS NULL);
```

**Canonical seed nodes (with `user_id = NULL`):**
```sql
INSERT INTO graph_nodes (user_id, label, type, content) VALUES
  (NULL, 'canon_core_mantra', 'canonical', ...),
  (NULL, 'canon_core_principles', 'canonical', ...);
```

**`schema.sql` (correct) overrides this:**
```sql
DROP POLICY IF EXISTS graph_nodes_user_isolation ON graph_nodes;
CREATE POLICY graph_nodes_user_isolation ON graph_nodes
  USING (user_id = auth.uid());
```

But if `supabase_graphrag_migration.sql` is run independently (e.g., on a fresh project), the weak RLS remains.

## Impact
- Any authenticated user can SELECT, INSERT, UPDATE, DELETE canonical nodes
- An attacker can replace the Canon mantra with malicious content
- All users see tampered canonical data
- This is a **HIGH-RISK DRIFT** between migration and canonical schema

## Fix

**Option A (Recommended):** Update `supabase_graphrag_migration.sql` to use strict RLS:
```sql
CREATE POLICY graph_nodes_user_isolation ON graph_nodes
  USING (user_id = auth.uid());

CREATE POLICY graph_edges_user_isolation ON graph_edges
  USING (user_id = auth.uid());
```

For canonical nodes, create a separate admin role:
```sql
CREATE POLICY graph_nodes_canonical_read ON graph_nodes
  FOR SELECT USING (type = 'canonical');

CREATE POLICY graph_nodes_canonical_admin ON graph_nodes
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

**Option B:** Ensure `supabase_graphrag_migration.sql` is always followed by `schema.sql` (add a comment or enforce via migration order). But this is fragile.

## ∆DΩΛ
∆: Weak RLS allows canonical node tampering
D: `supabase_graphrag_migration.sql:240-247` vs `schema.sql`
Ω: 95%
Λ: Update migration RLS + add canonical-specific policies
