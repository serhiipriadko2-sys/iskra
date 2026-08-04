-- Least-privilege completion for the closed-beta Graph API.
--
-- The browser runtime uses SELECT/INSERT/UPDATE/DELETE through PostgREST and
-- pg_graphql under RLS. It does not require schema-changing or table-wide
-- privileges. PostgreSQL RLS does not protect TRUNCATE, so retaining that
-- privilege on the authenticated role would bypass the row-ownership model.

begin;

revoke truncate, references, trigger
  on table public.graph_nodes, public.graph_edges
  from public, anon, authenticated;

grant select, insert, update, delete
  on table public.graph_nodes, public.graph_edges
  to authenticated;

commit;
