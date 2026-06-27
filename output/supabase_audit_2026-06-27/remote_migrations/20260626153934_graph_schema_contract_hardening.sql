-- Remote migration: 20260626153934 / graph_schema_contract_hardening

-- =============================================================================
-- ISKRA SPACE - GRAPH SCHEMA CONTRACT HARDENING
-- =============================================================================
-- Migration name: graph_schema_contract_hardening
--
-- Purpose:
--   Follow-up hardening for graph_schema_contract_repair:
--   - pin graph RPC/trigger function search_path;
--   - add covering index for graph_edges.user_id FK;
--   - keep graph RLS semantics while avoiding per-row auth.uid() init-plan warnings.
--
-- Data scope:
--   DDL/security/performance metadata only. This migration does not insert,
--   update, or delete graph rows.
-- =============================================================================

begin;

alter function public.update_graph_nodes_updated_at()
  set search_path = public, pg_temp;

alter function public.graph_bfs_traversal(text, int, real)
  set search_path = public, pg_temp;

alter function public.graph_find_resonant(real, int)
  set search_path = public, pg_temp;

alter function public.graph_get_node_with_edges(text)
  set search_path = public, pg_temp;

create index if not exists idx_graph_edges_user
  on public.graph_edges(user_id)
  where user_id is not null;

drop policy if exists graph_nodes_user_isolation on public.graph_nodes;
create policy graph_nodes_user_isolation
  on public.graph_nodes
  for all
  using ((user_id = (select auth.uid())) or user_id is null)
  with check ((user_id = (select auth.uid())) or user_id is null);

drop policy if exists graph_edges_user_isolation on public.graph_edges;
create policy graph_edges_user_isolation
  on public.graph_edges
  for all
  using ((user_id = (select auth.uid())) or user_id is null)
  with check ((user_id = (select auth.uid())) or user_id is null);

commit;

