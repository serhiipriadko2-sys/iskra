-- Reproduce and strengthen the production function-level search-path
-- hardening for the service-role-only iskra_memory RPC surface. Function
-- bodies already qualify every project object with iskra_memory; public is
-- therefore unnecessary and must not participate in name resolution.

begin;

alter function iskra_memory.iskra_project_observe(jsonb, text)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_project_commit(uuid, jsonb, text)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_project_horizon_propose(jsonb, text)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_memory_write(text, jsonb, text)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_memory_search(text, text[], integer)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_memory_promote_shadow(uuid, text, jsonb, text, text, text, text[], numeric)
  set search_path = pg_catalog, iskra_memory;
alter function iskra_memory.iskra_memory_crystallize_dream(uuid, text, text, jsonb, text, text, text, text)
  set search_path = pg_catalog, iskra_memory;

commit;
