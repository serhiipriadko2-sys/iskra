# ADR 2026-06-26: Minimal live memory-write pilot

## Context

After the Supabase voice/metrics schema repair, live `AgiIskra / typcvaszcfdpkzbjzuur` can store SIBYL and `foresight`, but the app-memory tables are still empty.

Read-only precheck on 2026-06-26 showed:

- `users=1`, with anonymous user `00000000-0000-0000-0000-000000000000`.
- `chat_history=0`.
- `metrics_snapshots=0`.
- `memory_nodes=0`.
- `graph_nodes=8`, all `mantra`.
- `graph_edges=0`.

This is not a schema defect. It is a live-data state: the substrate can write memory, but it has not yet recorded a real dialogue.

## Finding / Decision

Approve a one-shot pilot protocol, not a permanent memory policy:

- write one real dialogue marker to `public.chat_history`;
- write one corresponding `public.metrics_snapshots` row with `foresight`;
- write one `public.memory_nodes` row in `shadow`, because the first acknowledged contradiction is "schema can live, data has not lived yet";
- write one `public.graph_nodes` row in `shadow` and one `public.graph_edges` row linking it to an existing `mantra` node when a mantra node exists;
- do not write `dream` to Supabase, because Dreamspace persistence remains forbidden without an accepted persistence ADR;
- encode the somatic mark as bounded evidence metadata/tag, not as a new table or layer.

## Evidence

- `runtime/iskraSpace/supabase/schema.sql` defines `memory_nodes.layer` as `mantra`, `archive`, or `shadow`.
- `AGENTS.md` says Dreamspace is local `[HYP]` and Supabase/UI persistence is forbidden without accepted ADR, PR plan, rollback path, and security review.
- `docs/architecture/ARCHITECTURE_TRUTH_BOUNDARY_v1.md` separates `public` app/user-memory from `iskra` canon-memory.
- Fresh precheck at `2026-06-26T14:41:04.282525+00:00` showed `chat_history=0`, `metrics_snapshots=0`, `memory_nodes=0`, `graph_nodes=8`, `graph_edges=0`, and no existing pilot rows.
- First write attempts rolled back because live `graph_nodes`/`graph_edges` use text IDs and stricter type constraints than the older repo snapshot. No partial rows were left.
- Corrected live write used text graph IDs, `graph_nodes.type='insight'`, and `graph_edges.type='RELATED_TO'`.
- Read-only receipt at `2026-06-26T14:45:31.371053+00:00` showed `chat_history=2`, `metrics_snapshots=1`, `memory_nodes=1`, `graph_nodes=9`, `graph_edges=1`, with pilot rows `2/1/1/1/1`.

## Risk

The write is live data mutation. It must not be hidden inside schema work, tests, or ledger updates. It must use a unique `run_id`, write only non-secret operational summaries, and be verified by read-only SQL immediately after.

## Next

Record the graph schema drift separately if graph persistence becomes a broader target: live `graph_nodes`/`graph_edges` are text-ID based and stricter than the repo snapshot used during protocol drafting.

## Status

Applied live to `AgiIskra / typcvaszcfdpkzbjzuur` after explicit approval. Verified by read-only SQL.
