-- Reconcile the production GraphQL extension dependency into the migration
-- source of truth. Production already runs pg_graphql 1.5.11 in schema
-- graphql, while fresh preview branches otherwise omit the extension and
-- cannot prove the same database API boundary.

begin;

create schema if not exists graphql;
create extension if not exists pg_graphql
  with schema graphql
  version '1.5.11';

-- Match the Supabase-managed production endpoint boundary: generic PUBLIC
-- cannot use the schema, while API roles can invoke graphql.resolve and the
-- underlying table grants/RLS remain authoritative.
revoke all on schema graphql from public;
grant usage on schema graphql to anon, authenticated, service_role;

commit;
