-- Remote migration: 20260509074235 / iskra_temp_import_window_close

drop policy if exists "anon import canon_documents" on iskra.canon_documents;
drop policy if exists "anon import canon_chunks" on iskra.canon_chunks;
drop policy if exists "anon import canon_memory_nodes" on iskra.canon_memory_nodes;
revoke select, insert, update on all tables in schema iskra from anon;
revoke usage on schema iskra from anon;
revoke execute on function iskra.import_canon_documents(jsonb) from anon, authenticated;
revoke execute on function iskra.import_canon_chunks(jsonb) from anon, authenticated;
revoke execute on function iskra.import_canon_memory_nodes(jsonb) from anon, authenticated;
