-- Remote migration: 20260509093312 / iskra_temp_rpc_import_close_again

revoke execute on function iskra.import_canon_documents(jsonb) from anon;
revoke execute on function iskra.import_canon_chunks(jsonb) from anon;
revoke execute on function iskra.import_canon_memory_nodes(jsonb) from anon;
