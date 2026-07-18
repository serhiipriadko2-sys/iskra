-- Consolidate duplicate permissive policies for audit_log, graph_nodes, and graph_edges.
-- The restrictive policy "beta_membership_required" already enforces beta membership.
-- The permissive policies only need to enforce ownership/visibility.

begin;

-- audit_log
-- Drop redundant duplicates
drop policy if exists "Users can insert own audit_log" on public.audit_log;
drop policy if exists "Users can view own audit_log" on public.audit_log;
-- Keep "audit_log_insert_own" and "audit_log_select_own" but ensure they are clean
-- They already only check user_id = auth.uid()

-- graph_nodes
-- Drop the verbose redundant policies that duplicate the ALL policy and restrictive policy
drop policy if exists "graph_nodes_active_beta_delete_own" on public.graph_nodes;
drop policy if exists "graph_nodes_active_beta_insert_own" on public.graph_nodes;
drop policy if exists "graph_nodes_active_beta_update_own" on public.graph_nodes;
-- Alter the read_visible policy to remove redundant beta check, rename for clarity
drop policy if exists "graph_nodes_active_beta_read_visible" on public.graph_nodes;
create policy "graph_nodes_read_public" on public.graph_nodes for select using (user_id is null);

-- graph_edges
drop policy if exists "graph_edges_active_beta_delete_own" on public.graph_edges;
drop policy if exists "graph_edges_active_beta_insert_own" on public.graph_edges;
drop policy if exists "graph_edges_active_beta_update_own" on public.graph_edges;
drop policy if exists "graph_edges_active_beta_read_visible" on public.graph_edges;
create policy "graph_edges_read_public" on public.graph_edges for select using (user_id is null);

commit;
