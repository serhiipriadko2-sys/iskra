# Supabase (Scientific Turn)

This folder contains **Edge Functions** and **schema/migration artifacts** used by Iskra.

## Current Truth-Boundary Notes

[FACT] The repository currently contains both:
- a legacy `public.memory_nodes` GraphRAG path documented below
- a newer live canon-ingestion path in schema `iskra.*` with a `1536`-dimension embedding contract

[FACT] Sprint 1 fixed the planning layer for this drift with:
- `docs/architecture/ARCHITECTURE_TRUTH_BOUNDARY_v1.md`
- `governance/adr_20260528_embedding_standard_v1.md`
- `docs/operations/sprint1_remediation_matrix.md`
- `docs/operations/sprint2_implementation_backlog.md`

[RULE] Until repo and live are fully reconciled, do not assume that the older `public.memory_nodes` path is the production canon-retrieval truth.

## Database (legacy public GraphRAG path)

GraphRAG at scale needs DB-side ANN (Approximate Nearest Neighbors). The legacy repo path uses:

- Postgres `pgvector`
- `HNSW` index for cosine distance

Schema + RPC are documented in:

- `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql`

This older path describes:

- `public.memory_nodes` (embedding `vector(384)` for `gte-small`)
- HNSW index: `USING hnsw (embedding vector_cosine_ops)`
- RPC:
  - `match_memory_nodes(query_embedding real[], ...)`
  - `match_memory_causal(center_ts timestamptz, ...)`
  - `upsert_memory_node(...)`

### SECURITY

- `memory_nodes` must have **RLS enabled** with owner-scoped access if it remains part of the app-state domain.
- If `public.memory_nodes` is deprecated in favor of `iskra.*`, freeze writes and migrate callers instead of treating both domains as equivalent.

## Canon Embedding Standard (current target)

[DECISION] For canon ingestion and canon retrieval, the target standard is:
- model: `text-embedding-3-small`
- dimensions: `1536`

See:
- `governance/adr_20260528_embedding_standard_v1.md`

This means:
- canon ingestion/query paths must use one model/dimension contract
- mixed-dimension canon retrieval is not allowed as a steady state
- any future model change requires explicit reindex discipline

## embed

`supabase/functions/embed/index.ts` implements a small HTTP endpoint that accepts:

```json
{ "input": "hello world" }
```

and returns:

```json
{ "embedding": [/* numbers */] }
```

The implementation follows Supabase docs for generating embeddings with the built-in AI inference API.

### Local smoke

```bash
supabase init
supabase start
supabase functions serve

curl --request POST 'http://localhost:54321/functions/v1/embed' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{ "input": "hello world" }'

> Browser calls must handle CORS preflight (OPTIONS). See `functions/_shared/cors.ts`.
```

### Security

- Use **anon key** in the browser.
- Keep **service role key** server-side only.

Additional guardrails:

- `supabase/config.toml` pins `verify_jwt = true` for `embed`.
- `embed` rejects requests without an `Authorization: Bearer ...` header.
- Optional best-effort rate limiting can be enabled via env:
  - `EMBED_RL_WINDOW_MS` (e.g. `60000`)
  - `EMBED_RL_MAX` (e.g. `60`)

Notes:

- Supabase docs note `verify_jwt` is a legacy switch and may be incompatible with
  newer JWT Signing Keys. If you migrate to Signing Keys, implement manual JWT
  validation (see Supabase auth docs/examples).

## Truth-Boundary Security Work

The first repo-side execution pack for live security closure starts with:

- `supabase/migrations/20260528182000_truth_boundary_p0_security_hardening.sql`

It targets:
- permissive RLS removal
- unnecessary `anon` / `authenticated` table exposure revocation
- privileged RPC execute revocation

## Local DB smoke (optional)

After `supabase start`, you can apply migrations and run a quick sanity check:

```sql
-- should show the HNSW index
select indexname, indexdef
from pg_indexes
where tablename = 'memory_nodes';
```

For query-time tuning, you can set:

```sql
set hnsw.ef_search = 80;
```
