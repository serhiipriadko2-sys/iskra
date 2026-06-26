# ADR 2026-06-26: Supabase graph schema drift repair and gate

## Context

The minimal live memory-write pilot on `AgiIskra / typcvaszcfdpkzbjzuur` exposed a graph-schema mismatch between repo snapshots and live Supabase metadata.

During the pilot, the first graph write attempts rolled back because the drafting source used an older UUID graph shape, while live `public.graph_nodes` and `public.graph_edges` use text graph IDs and stricter CHECK constraints.

Read-only live graph snapshot at `2026-06-26T14:53:20.014187+00:00` showed:

- `graph_nodes.id` is `text`, no default, not nullable.
- `graph_edges.id`, `graph_edges.source`, and `graph_edges.target` are `text`, no defaults, not nullable.
- `graph_nodes.timestamp` is `timestamptz not null default now()`.
- `graph_nodes.user_id` and `graph_edges.user_id` are nullable `uuid` columns referencing `public.users(id)`.
- `graph_nodes.type` allows the uppercase GraphRAG set plus lowercase `event`, `feedback`, `decision`, `insight`, and `artifact`.
- `graph_edges.type` allows `RELATED_TO`.
- RLS is enabled on both graph tables.
- GraphRAG RPCs exist: `graph_bfs_traversal`, `graph_find_resonant`, and `graph_get_node_with_edges`.

Repo drift before this repair:

- `runtime/iskraSpace/supabase/schema.sql` described graph IDs and edge endpoints as UUIDs.
- `runtime/iskraSpace/supabase_graphrag_migration.sql` and `supabase/migrations/20260305000000_graph_nodes.sql` used text IDs, but still omitted the lowercase node types, omitted `RELATED_TO`, used a bigint timestamp, and referenced `auth.users`.
- No dedicated repo/live graph schema gate existed, so ledger verification could still pass while this contract drift stayed hidden.

## Finding / Decision

Repair source truth first and add a dedicated graph contract gate:

- align `runtime/iskraSpace/supabase/schema.sql` with the live GraphRAG table/RPC shape;
- align the standalone GraphRAG migration snapshot with the same structural contract;
- add `supabase/migrations/20260626145500_graph_schema_contract_repair.sql` as an idempotent future-environment repair path;
- add `tools/verify_supabase_graph_contract.ts`;
- wire package scripts and CI workflow alongside the existing voice/metrics gate.

The graph gate checks structural schema invariants: columns, defaults, nullability, type CHECK values, required indexes, RPC presence, and RLS-enabled metadata.

The graph gate does not declare the current live graph policy names to be canon. Current live graph policies still allow `user_id is null`; access-model hardening remains a separate Supabase security review, not part of this structural drift repair.

## Evidence

- Live read-only graph snapshot at `2026-06-26T14:53:20.014187+00:00`.
- `runtime/iskraSpace/supabase/schema.sql` previously had `graph_nodes.id UUID`, `graph_edges.source UUID`, and `graph_edges.target UUID`.
- `runtime/iskraSpace/supabase_graphrag_migration.sql` and `supabase/migrations/20260305000000_graph_nodes.sql` previously lacked `RELATED_TO` and lowercase memory-node graph types.
- `docs/operations/iskraspace_minimal_memory_write_protocol_2026-06-26.md` records the rolled-back failed attempts and corrected text-ID live write.
- Supabase CLI was unavailable in this workspace (`supabase` command not found), so the new migration filename was created manually using the repo timestamp convention rather than `supabase migration new`.

## Risk

This step is source-only. It does not apply live DDL.

The added migration is intentionally idempotent for future environments, but applying it to live is still a live DDL operation and requires separate explicit approval naming `AgiIskra / typcvaszcfdpkzbjzuur`.

The remaining known risk is policy/access drift: live graph policies are not the desired long-term security posture. That belongs to a separate graph RLS hardening pass so it can be reviewed with auth, public canonical nodes, and app read requirements together.

## Next

Run:

```bash
pnpm check:supabase-graph-contract:repo
pnpm check:supabase-graph-contract
```

The live gate needs either `SUPABASE_DB_URL` / `DATABASE_URL` or a read-only JSON snapshot produced from:

```bash
npx tsx tools/verify_supabase_graph_contract.ts --print-sql
```

Use `--require-migration-history` only after `graph_schema_contract_repair` is explicitly approved and applied live.

## Status

Source repair prepared. Live DDL not applied in this step.
