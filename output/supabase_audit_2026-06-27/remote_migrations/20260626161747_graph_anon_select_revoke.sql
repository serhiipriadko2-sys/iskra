-- Remote migration: 20260626161747 / graph_anon_select_revoke

-- =============================================================================
-- ISKRA SPACE - GRAPH ANON SELECT REVOKE
-- =============================================================================
-- Migration name: graph_anon_select_revoke
--
-- Purpose:
--   Reduce public GraphQL/PostgREST exposure for graph tables while preserving
--   the authenticated runtime path used by Supabase anonymous Auth sessions.
--
-- Evidence before apply:
--   - Runtime graph service uses authenticated PostgREST table access.
--   - No repo usage was found for pre-auth graph table reads outside the service.
--   - Authenticated role rollback smoke could insert/read graph rows with JWT claims.
--
-- Rollback:
--   begin;
--   grant select on table public.graph_nodes to anon;
--   grant select on table public.graph_edges to anon;
--   commit;
-- =============================================================================

begin;

revoke select on table public.graph_nodes from anon;
revoke select on table public.graph_edges from anon;

commit;

