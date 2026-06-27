-- Remote migration: 20260509074300 / iskra_backfill_status_helpers

create or replace view iskra.canon_embedding_backfill_status as
select
  (select count(*) from iskra.canon_documents) as documents_total,
  (select count(*) from iskra.canon_chunks) as chunks_total,
  (select count(*) from iskra.canon_chunks where embedding is not null) as chunks_embedded,
  (select count(*) from iskra.canon_chunks where embedding is null) as chunks_pending,
  (select count(*) from iskra.canon_memory_nodes) as memory_nodes_total,
  (select count(*) from iskra.canon_memory_nodes where embedding is not null) as memory_nodes_embedded,
  (select count(*) from iskra.canon_memory_nodes where embedding is null) as memory_nodes_pending;

grant select on iskra.canon_embedding_backfill_status to service_role;

create or replace function iskra.canon_embedding_backfill_status_json()
returns jsonb
language sql
stable
set search_path = public, extensions, iskra
as $$
  select to_jsonb(s)
  from iskra.canon_embedding_backfill_status s;
$$;

grant execute on function iskra.canon_embedding_backfill_status_json() to service_role;
