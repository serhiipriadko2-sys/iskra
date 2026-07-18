-- Source-only hardening. Do not apply this migration to a live project until
-- the staging magic-link and two-user Graph isolation contracts have passed.
--
-- Scope:
--   * remove anon execution of closed-beta helper functions;
--   * preserve authenticated Graph RPC grants and their SECURITY DEFINER guards;
--   * pin the two mutable iskra_memory helper search paths;
--   * disable GraphQL introspection, not the Data API used by supabase-js.
--
-- This migration neither changes iskra-memory-gateway nor deploys an Edge
-- Function. `pg_trgm` relocation and table privilege reductions require a
-- separate staging dependency/query-plan decision.

begin;

revoke execute on function public.consume_ai_quota(text) from anon;
revoke execute on function public.resolve_beta_access() from anon;
revoke execute on function public.prevent_graph_node_cross_owner_cascade() from anon;

grant execute on function public.consume_ai_quota(text) to authenticated;
grant execute on function public.resolve_beta_access() to authenticated;

alter function iskra_memory.iskra_payload_has_secret(jsonb) set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_assert_safe_payload(jsonb) set search_path = pg_catalog, iskra_memory;

-- Graph RPC EXECUTE grants remain unchanged: their fixed search_path, auth.uid()
-- and active-membership guards are covered by the Graph contract and require
-- staging two-user read/write/delete isolation before any further change.

-- Supabase GraphQL derives discoverability from database privileges. Revoking
-- table privileges would also break the REST Data API used by supabase-js, so
-- this minimal safe change disables introspection only.
comment on schema public is e'@graphql({"introspection": false})';

commit;
