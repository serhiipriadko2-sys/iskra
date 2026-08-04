-- Reconcile the production GraphQL extension dependency into the migration
-- source of truth. Production already runs pg_graphql 1.5.11 in schema
-- graphql, while fresh preview branches otherwise omit the extension and
-- cannot prove the same database API boundary.

begin;

do $pg_graphql_guard$
declare
  installed_version text;
  installed_schema text;
begin
  select e.extversion, n.nspname
    into installed_version, installed_schema
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
   where e.extname = 'pg_graphql';

  if found and (installed_version <> '1.5.11' or installed_schema <> 'graphql') then
    raise exception 'pg_graphql_drift: expected version 1.5.11 in schema graphql, found version % in schema %',
      installed_version, installed_schema;
  end if;
end
$pg_graphql_guard$;

create schema if not exists graphql;
create extension if not exists pg_graphql
  with schema graphql
  version '1.5.11';

-- Match the Supabase-managed production endpoint boundary: generic PUBLIC
-- cannot use the schema, while API roles can invoke graphql.resolve and the
-- underlying table grants/RLS remain authoritative.
revoke all on schema graphql from public, anon, authenticated;
grant usage on schema graphql to anon, authenticated, service_role;

commit;
