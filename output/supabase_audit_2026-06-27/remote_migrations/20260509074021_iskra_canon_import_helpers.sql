-- Remote migration: 20260509074021 / iskra_canon_import_helpers

create or replace function iskra.import_canon_documents(payload jsonb)
returns integer
language sql
security definer
set search_path = public, extensions, iskra
as $$
  with incoming as (
    select * from jsonb_to_recordset(payload) as x(
      doc_id text,
      filename text,
      title text,
      layer text,
      doc_type text,
      metadata jsonb,
      source_sha256 text,
      source_bytes integer,
      body_markdown text
    )
  ), upserted as (
    insert into iskra.canon_documents (
      doc_id, filename, title, layer, doc_type, metadata, source_sha256, source_bytes, body_markdown
    )
    select doc_id, filename, title, layer, doc_type, metadata, source_sha256, source_bytes, body_markdown
    from incoming
    on conflict (doc_id) do update set
      filename = excluded.filename,
      title = excluded.title,
      layer = excluded.layer,
      doc_type = excluded.doc_type,
      metadata = excluded.metadata,
      source_sha256 = excluded.source_sha256,
      source_bytes = excluded.source_bytes,
      body_markdown = excluded.body_markdown,
      updated_at = now()
    returning 1
  )
  select count(*)::integer from upserted;
$$;

create or replace function iskra.import_canon_chunks(payload jsonb)
returns integer
language sql
security definer
set search_path = public, extensions, iskra
as $$
  with incoming as (
    select * from jsonb_to_recordset(payload) as x(
      chunk_id text,
      doc_id text,
      section_title text,
      content_text text,
      summary text,
      layer text,
      tags text[],
      metadata jsonb
    )
  ), joined as (
    select
      i.chunk_id,
      d.id as document_id,
      i.doc_id,
      i.section_title,
      i.content_text,
      i.summary,
      i.layer,
      i.tags,
      i.metadata
    from incoming i
    join iskra.canon_documents d on d.doc_id = i.doc_id
  ), upserted as (
    insert into iskra.canon_chunks (
      chunk_id, document_id, doc_id, section_title, content_text, summary, layer, tags, metadata
    )
    select chunk_id, document_id, doc_id, section_title, content_text, summary, layer, tags, metadata
    from joined
    on conflict (chunk_id) do update set
      document_id = excluded.document_id,
      doc_id = excluded.doc_id,
      section_title = excluded.section_title,
      content_text = excluded.content_text,
      summary = excluded.summary,
      layer = excluded.layer,
      tags = excluded.tags,
      metadata = excluded.metadata,
      updated_at = now()
    returning 1
  )
  select count(*)::integer from upserted;
$$;

create or replace function iskra.import_canon_memory_nodes(payload jsonb)
returns integer
language sql
security definer
set search_path = public, extensions, iskra
as $$
  with incoming as (
    select * from jsonb_to_recordset(payload) as x(
      external_id text,
      layer text,
      node_type text,
      title text,
      doc_type text,
      trust_level real,
      tags text[],
      section text,
      facet text,
      content jsonb,
      evidence jsonb
    )
  ), joined as (
    select
      i.external_id,
      c.id as chunk_id,
      i.layer,
      i.node_type,
      i.title,
      i.doc_type,
      i.trust_level,
      i.tags,
      i.section,
      i.facet,
      i.content,
      i.evidence
    from incoming i
    left join iskra.canon_chunks c on c.chunk_id = i.external_id
  ), upserted as (
    insert into iskra.canon_memory_nodes (
      external_id, chunk_id, layer, node_type, title, doc_type, trust_level, tags, section, facet, content, evidence
    )
    select external_id, chunk_id, layer, node_type, title, doc_type, trust_level, tags, section, facet, content, evidence
    from joined
    on conflict (external_id) do update set
      chunk_id = excluded.chunk_id,
      layer = excluded.layer,
      node_type = excluded.node_type,
      title = excluded.title,
      doc_type = excluded.doc_type,
      trust_level = excluded.trust_level,
      tags = excluded.tags,
      section = excluded.section,
      facet = excluded.facet,
      content = excluded.content,
      evidence = excluded.evidence,
      updated_at = now()
    returning 1
  )
  select count(*)::integer from upserted;
$$;

grant execute on function iskra.import_canon_documents(jsonb) to anon, authenticated, service_role;
grant execute on function iskra.import_canon_chunks(jsonb) to anon, authenticated, service_role;
grant execute on function iskra.import_canon_memory_nodes(jsonb) to anon, authenticated, service_role;
