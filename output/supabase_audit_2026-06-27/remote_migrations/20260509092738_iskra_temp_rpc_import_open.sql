-- Remote migration: 20260509092738 / iskra_temp_rpc_import_open

grant execute on function iskra.import_canon_documents(jsonb) to anon;
grant execute on function iskra.import_canon_chunks(jsonb) to anon;
grant execute on function iskra.import_canon_memory_nodes(jsonb) to anon;
