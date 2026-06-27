-- Remote migration: 20260509073916 / iskra_temp_import_window_open

grant usage on schema iskra to anon;
grant select, insert, update on all tables in schema iskra to anon;

drop policy if exists "anon import canon_documents" on iskra.canon_documents;
create policy "anon import canon_documents"
on iskra.canon_documents
for all
to anon
using (true)
with check (true);

drop policy if exists "anon import canon_chunks" on iskra.canon_chunks;
create policy "anon import canon_chunks"
on iskra.canon_chunks
for all
to anon
using (true)
with check (true);

drop policy if exists "anon import canon_memory_nodes" on iskra.canon_memory_nodes;
create policy "anon import canon_memory_nodes"
on iskra.canon_memory_nodes
for all
to anon
using (true)
with check (true);
