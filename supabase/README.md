# Supabase (Scientific Turn)

This folder contains **Edge Functions** used by Iskra.

## Database (pgvector + HNSW)

GraphRAG at scale needs DB-side ANN (Approximate Nearest Neighbors). We use:

- Postgres `pgvector`
- `HNSW` index for cosine distance

Schema + RPC live in:

- `supabase/migrations/20260301141500_memory_nodes_pgvector_hnsw.sql`

It creates:

- `public.memory_nodes` (embedding `vector(384)` for `gte-small`)
- HNSW index: `USING hnsw (embedding vector_cosine_ops)`
- RPC:
  - `match_memory_nodes(query_embedding real[], ...)`
  - `match_memory_causal(center_ts timestamptz, ...)`
  - `upsert_memory_node(...)`

### SECURITY

- `memory_nodes` has **RLS enabled** and default policies require an **authenticated user**.
- If you need server-side ingestion/querying, do it in trusted environments (Edge/Server) with a service role key in env.

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

### Local DB smoke (optional)

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
