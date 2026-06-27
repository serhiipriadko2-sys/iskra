-- Remote migration: 20260509073756 / iskra_canon_schema_1536_v2

create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm;

create schema if not exists iskra;

create table if not exists iskra.canon_documents (
  id uuid primary key default extensions.uuid_generate_v4(),
  doc_id text not null unique,
  filename text not null,
  title text not null,
  layer text,
  doc_type text,
  metadata jsonb not null default '{}'::jsonb,
  source_sha256 text not null,
  source_bytes integer not null,
  body_markdown text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists iskra.canon_chunks (
  id uuid primary key default extensions.uuid_generate_v4(),
  chunk_id text not null unique,
  document_id uuid not null references iskra.canon_documents(id) on delete cascade,
  doc_id text not null,
  section_title text,
  content_text text not null,
  summary text,
  layer text,
  tags text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  embedding_model text,
  embedding_dimensions integer,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists iskra.canon_memory_nodes (
  id uuid primary key default extensions.uuid_generate_v4(),
  external_id text not null unique,
  chunk_id uuid references iskra.canon_chunks(id) on delete set null,
  layer text not null check (layer in ('archive', 'shadow', 'mantra')),
  node_type text not null check (node_type in ('event', 'feedback', 'decision', 'insight', 'artifact')),
  title text not null,
  doc_type text not null default 'canon' check (doc_type in ('canon', 'draft', 'code', 'log', 'personal')),
  trust_level real not null default 1.0,
  tags text[] not null default '{}'::text[],
  section text,
  facet text not null default 'ISKRA' check (facet in ('KAIN', 'PINO', 'SAM', 'ANHANTRA', 'HUYNDUN', 'ISKRIV', 'ISKRA', 'MAKI')),
  content jsonb not null default '{}'::jsonb,
  evidence jsonb,
  embedding_model text,
  embedding_dimensions integer,
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists canon_documents_doc_id_idx on iskra.canon_documents (doc_id);
create index if not exists canon_documents_layer_idx on iskra.canon_documents (layer);
create index if not exists canon_documents_metadata_gin on iskra.canon_documents using gin (metadata);
create index if not exists canon_chunks_doc_id_idx on iskra.canon_chunks (doc_id);
create index if not exists canon_chunks_tags_gin on iskra.canon_chunks using gin (tags);
create index if not exists canon_chunks_metadata_gin on iskra.canon_chunks using gin (metadata);
create index if not exists canon_chunks_content_trgm on iskra.canon_chunks using gin (content_text gin_trgm_ops);
create index if not exists canon_memory_nodes_tags_gin on iskra.canon_memory_nodes using gin (tags);
create index if not exists canon_memory_nodes_content_gin on iskra.canon_memory_nodes using gin (content);

create index if not exists canon_chunks_embedding_hnsw
on iskra.canon_chunks
using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists canon_memory_nodes_embedding_hnsw
on iskra.canon_memory_nodes
using hnsw (embedding extensions.vector_cosine_ops);

alter table iskra.canon_documents enable row level security;
alter table iskra.canon_chunks enable row level security;
alter table iskra.canon_memory_nodes enable row level security;

drop policy if exists "deny direct anon canon_documents" on iskra.canon_documents;
create policy "deny direct anon canon_documents"
on iskra.canon_documents
for all
to anon
using (false)
with check (false);

drop policy if exists "deny direct anon canon_chunks" on iskra.canon_chunks;
create policy "deny direct anon canon_chunks"
on iskra.canon_chunks
for all
to anon
using (false)
with check (false);

drop policy if exists "deny direct anon canon_memory_nodes" on iskra.canon_memory_nodes;
create policy "deny direct anon canon_memory_nodes"
on iskra.canon_memory_nodes
for all
to anon
using (false)
with check (false);

drop policy if exists "service role manage canon_documents" on iskra.canon_documents;
create policy "service role manage canon_documents"
on iskra.canon_documents
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role manage canon_chunks" on iskra.canon_chunks;
create policy "service role manage canon_chunks"
on iskra.canon_chunks
for all
to service_role
using (true)
with check (true);

drop policy if exists "service role manage canon_memory_nodes" on iskra.canon_memory_nodes;
create policy "service role manage canon_memory_nodes"
on iskra.canon_memory_nodes
for all
to service_role
using (true)
with check (true);

create or replace function iskra.match_canon_chunks (
  query_embedding extensions.vector(1536),
  match_count integer default 8,
  match_threshold double precision default 0.70,
  filter_doc_type text default null,
  filter_layer text default null
)
returns table (
  chunk_id text,
  doc_id text,
  title text,
  section_title text,
  summary text,
  content_text text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
set search_path = public, extensions, iskra
as $$
  select
    cc.chunk_id,
    cd.doc_id,
    cd.title,
    cc.section_title,
    cc.summary,
    cc.content_text,
    cc.metadata,
    1 - (cc.embedding OPERATOR(extensions.<=>) query_embedding) as similarity
  from iskra.canon_chunks cc
  join iskra.canon_documents cd on cd.id = cc.document_id
  where cc.embedding is not null
    and (filter_doc_type is null or cd.doc_type = filter_doc_type)
    and (filter_layer is null or cd.layer = filter_layer)
    and 1 - (cc.embedding OPERATOR(extensions.<=>) query_embedding) >= match_threshold
  order by cc.embedding OPERATOR(extensions.<=>) query_embedding asc
  limit least(match_count, 50);
$$;

revoke all on table iskra.canon_documents from anon, authenticated;
revoke all on table iskra.canon_chunks from anon, authenticated;
revoke all on table iskra.canon_memory_nodes from anon, authenticated;
grant usage on schema iskra to service_role;
grant all on all tables in schema iskra to service_role;
grant execute on function iskra.match_canon_chunks(extensions.vector(1536), integer, double precision, text, text) to service_role;
