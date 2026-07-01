# [P0-BLOCKER] Missing 9 Supabase RPC Functions — Runtime Crash on graphServiceSupabase Call

## Status: 🔴 BLOCKER — App will crash on first GraphRAG operation

## Problem
`services/graphServiceSupabase.ts` calls 9 RPC functions that **do not exist** in any committed SQL schema or migration:

1. `graph_create_node`
2. `graph_create_edge`
3. `graph_traverse_bfs_nodes`
4. `graph_find_resonant_nodes`
5. `graph_search_nodes`
6. `graph_delete_node`
7. `graph_update_node_resonance`
8. `graph_get_connection_candidates`
9. `graph_get_stats`

## Evidence

**Call sites in `graphServiceSupabase.ts` (lines 22-89):**
```typescript
// rpc('graph_create_node', ...)
// rpc('graph_create_edge', ...)
// rpc('graph_traverse_bfs_nodes', ...)
// rpc('graph_find_resonant_nodes', ...)
// rpc('graph_search_nodes', ...)
// rpc('graph_delete_node', ...)
// rpc('graph_update_node_resonance', ...)
// rpc('graph_get_connection_candidates', ...)
// rpc('graph_get_stats', ...)
```

**Existing SQL functions (only 3):**
- `schema.sql`: `graph_bfs_traversal`, `graph_find_resonant`, `graph_get_node_with_edges`
- `supabase_graphrag_migration.sql`: same 3 functions

**Missing:** All 9 functions above.

## Impact
- Any code path that calls `graphServiceSupabase.addNode()`, `queryGraph()`, `addEdge()`, `deleteNode()`, etc. will throw a Postgres RPC error
- GraphRAG memory system is completely non-functional at runtime
- User may not see an immediate UI crash, but background sync or memory operations will fail silently or loudly

## Fix Options

**Option A (Recommended):** Create a new SQL migration `supabase/migrations/20260701_graph_rpc_functions.sql` with all 9 missing functions:
```sql
CREATE OR REPLACE FUNCTION graph_create_node(...)
CREATE OR REPLACE FUNCTION graph_create_edge(...)
CREATE OR REPLACE FUNCTION graph_traverse_bfs_nodes(...)
CREATE OR REPLACE FUNCTION graph_find_resonant_nodes(...)
CREATE OR REPLACE FUNCTION graph_search_nodes(...)
CREATE OR REPLACE FUNCTION graph_delete_node(...)
CREATE OR REPLACE FUNCTION graph_update_node_resonance(...)
CREATE OR REPLACE FUNCTION graph_get_connection_candidates(...)
CREATE OR REPLACE FUNCTION graph_get_stats(...)
```
Each function should follow the RLS patterns in `schema.sql` and use `auth.uid()` for user isolation.

**Option B:** If these functions are not actually needed (e.g., `graphServiceSupabase.ts` is dead code), remove the RPC calls and route everything through the existing 3 functions or the Supabase client directly.

## ∆DΩΛ
∆: Missing RPC functions will cause runtime crash
D: `graphServiceSupabase.ts:22-89` vs `schema.sql` + `supabase_graphrag_migration.sql`
Ω: 98%
Λ: Create SQL migration OR remove unused RPC calls
