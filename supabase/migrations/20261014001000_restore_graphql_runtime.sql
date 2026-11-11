-- Local restore parity: the PostgreSQL image has pg_graphql available, but the
-- platform-data restore intentionally does not replay managed extension DDL.
-- Preserve the backup's security annotation before enabling the runtime.
-- The standard Supabase extension event hook configures graphql_public.graphql.
-- This changes neither table privileges nor the Realtime publication.

begin;

comment on schema public is e'@graphql({"introspection": false})';
create extension if not exists pg_graphql with schema graphql;

commit;
