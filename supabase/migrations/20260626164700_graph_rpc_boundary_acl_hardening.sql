-- =============================================================================
-- ISKRA SPACE - GRAPH RPC BOUNDARY ACL HARDENING
-- =============================================================================
-- Migration name: graph_rpc_boundary_acl_hardening
--
-- Purpose:
--   Remove explicit anon EXECUTE grants that Supabase default function grants
--   added to graph RPC boundary functions. Runtime graph access should use
--   authenticated Supabase sessions; table grants remain unchanged.
--
-- Rollback:
--   begin;
--   grant execute on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) to anon;
--   grant execute on function public.graph_create_edge(text, text, text, text, real, jsonb) to anon;
--   grant execute on function public.graph_get_user_nodes(text, text, text[], int) to anon;
--   grant execute on function public.graph_search_nodes(text, int) to anon;
--   grant execute on function public.graph_delete_node(text) to anon;
--   grant execute on function public.graph_update_node_resonance(text, jsonb, real) to anon;
--   grant execute on function public.graph_get_connection_candidates(text, int) to anon;
--   grant execute on function public.graph_get_stats() to anon;
--   grant execute on function public.graph_traverse_bfs_nodes(text, int, real) to anon;
--   grant execute on function public.graph_find_resonant_nodes(real, int) to anon;
--   grant execute on function public.graph_get_node_with_edges(text) to anon;
--   commit;
-- =============================================================================

begin;

revoke execute on function public.graph_create_node(text, text, text, text, timestamptz, jsonb, text[], real, jsonb) from anon;
revoke execute on function public.graph_create_edge(text, text, text, text, real, jsonb) from anon;
revoke execute on function public.graph_get_user_nodes(text, text, text[], int) from anon;
revoke execute on function public.graph_search_nodes(text, int) from anon;
revoke execute on function public.graph_delete_node(text) from anon;
revoke execute on function public.graph_update_node_resonance(text, jsonb, real) from anon;
revoke execute on function public.graph_get_connection_candidates(text, int) from anon;
revoke execute on function public.graph_get_stats() from anon;
revoke execute on function public.graph_traverse_bfs_nodes(text, int, real) from anon;
revoke execute on function public.graph_find_resonant_nodes(real, int) from anon;
revoke execute on function public.graph_get_node_with_edges(text) from anon;

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

commit;
