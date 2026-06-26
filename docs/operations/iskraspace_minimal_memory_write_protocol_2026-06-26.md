# IskraSpace Minimal Memory-Write Protocol

Status: applied live after explicit approval  
Project: `AgiIskra / typcvaszcfdpkzbjzuur`  
Mode: one-shot pilot for one real dialogue  
Target user: `00000000-0000-0000-0000-000000000000` (`Anonymous`)  

## Purpose

Create the first real live-memory mark after the SIBYL/foresight schema repair, without pretending that seeded data is life.

The pilot writes the smallest useful trace:

- two `chat_history` rows, one user turn and one model turn;
- one `metrics_snapshots` row with `foresight`;
- one `memory_nodes` row in `shadow`;
- one `graph_nodes` row in `shadow`;
- one `graph_edges` row linking the new shadow graph node to an existing mantra graph node, if one exists.

No `dream` row is written. Current live `memory_nodes.layer` only allows `mantra`, `archive`, and `shadow`, and Dreamspace persistence still requires a separate accepted ADR.

## Approval Boundary

Do not run the write SQL unless the user gives explicit approval naming both the project and the operation, for example:

```text
APPROVE live Supabase memory-write pilot on project AgiIskra / typcvaszcfdpkzbjzuur
```

## Precheck SQL

Run read-only before the write:

```sql
select jsonb_build_object(
  'checked_at', now(),
  'counts', jsonb_build_object(
    'users', (select count(*) from public.users),
    'chat_history', (select count(*) from public.chat_history),
    'metrics_snapshots', (select count(*) from public.metrics_snapshots),
    'memory_nodes', (select count(*) from public.memory_nodes),
    'graph_nodes', (select count(*) from public.graph_nodes),
    'graph_edges', (select count(*) from public.graph_edges)
  ),
  'users', coalesce(
    (select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by id) from public.users),
    '[]'::jsonb
  ),
  'memory_layers', coalesce(
    (select jsonb_agg(jsonb_build_object('layer', layer, 'count', ct) order by layer)
     from (select layer, count(*) ct from public.memory_nodes group by layer) s),
    '[]'::jsonb
  ),
  'graph_layers', coalesce(
    (select jsonb_agg(jsonb_build_object('layer', layer, 'count', ct) order by layer)
     from (select layer, count(*) ct from public.graph_nodes group by layer) s),
    '[]'::jsonb
  )
) as pre_memory_write_snapshot;
```

Expected precheck on 2026-06-26:

```json
{
  "users": 1,
  "chat_history": 0,
  "metrics_snapshots": 0,
  "memory_nodes": 0,
  "graph_nodes": 8,
  "graph_edges": 0,
  "graph_layers": [{ "layer": "mantra", "count": 8 }]
}
```

## Write SQL

This transaction uses a unique `run_id` and stores operational summaries, not secrets or full private logs.

```sql
do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'::uuid;
  v_run_id text := 'memory-write-pilot-2026-06-26-001';
  v_metrics_id uuid;
  v_memory_id uuid;
  v_graph_shadow_id text := 'memory_write_pilot_2026_06_26_001_shadow';
  v_graph_edge_id text := 'memory_write_pilot_2026_06_26_001_edge';
  v_graph_mantra_id text;
begin
  if not exists (select 1 from public.users where id = v_user_id) then
    raise exception 'Target user does not exist: %', v_user_id;
  end if;

  if exists (
    select 1
    from public.memory_nodes
    where evidence->>'run_id' = v_run_id
  ) then
    raise exception 'Memory-write pilot already applied: %', v_run_id;
  end if;

  insert into public.chat_history (
    user_id,
    role,
    text,
    voice_name,
    delta_signature
  )
  values
    (
      v_user_id,
      'user',
      'User requested the next step after schema repair: create a minimal memory-write protocol for one real dialogue and verify it by read-only SQL after the write.',
      null,
      jsonb_build_object(
        'run_id', v_run_id,
        'kind', 'memory_write_pilot_user_turn',
        'source', 'operator_dialogue'
      )
    ),
    (
      v_user_id,
      'model',
      'Iskra acknowledged that schema repair restored capacity but not lived memory, and prepared a one-shot protocol for chat, metrics, shadow memory, graph mark, and verification.',
      'ANHANTRA',
      jsonb_build_object(
        'run_id', v_run_id,
        'kind', 'memory_write_pilot_model_turn',
        'delta', 'schema capacity becomes first governed live-memory trace'
      )
    );

  insert into public.metrics_snapshots (
    user_id,
    rhythm,
    trust,
    clarity,
    pain,
    drift,
    chaos,
    foresight,
    echo,
    silence_mass,
    mirror_sync,
    interrupt,
    ctx_switch,
    phase
  )
  values (
    v_user_id,
    60,
    0.7,
    0.8,
    0.3,
    0.2,
    0.2,
    0.7,
    0.2,
    0.1,
    0.7,
    0.1,
    0.2,
    'GOVERNANCE_MEMORY_PILOT'
  )
  returning id into v_metrics_id;

  insert into public.memory_nodes (
    user_id,
    layer,
    type,
    title,
    content,
    doc_type,
    trust_level,
    tags,
    section,
    facet,
    evidence
  )
  values (
    v_user_id,
    'shadow',
    'insight',
    'First live-memory mark after schema repair',
    jsonb_build_object(
      'summary', 'The system can now store SIBYL and foresight, but live memory was empty before this governed write.',
      'shadow', 'Substrate without lived data risks becoming a polished echo.',
      'somatic_mark', 'low pressure, high salience: do not seed fake life; write only the real acknowledged turn.',
      'dream_policy', 'No dream persistence in this pilot.'
    ),
    'log',
    0.8,
    array['first-live-dialogue', 'shadow', 'somatic-mark', 'sibyl', 'foresight', 'kimi-audit'],
    'memory-write-pilot',
    'ANHANTRA',
    jsonb_build_object(
      'run_id', v_run_id,
      'metrics_snapshot_id', v_metrics_id,
      'approval_required', true,
      'source', 'operator_dialogue',
      'status', 'one_shot_pilot'
    )
  )
  returning id into v_memory_id;

  insert into public.graph_nodes (
    id,
    layer,
    type,
    content,
    timestamp,
    metrics_snapshot,
    related_ids,
    resonance_score,
    metadata,
    user_id
  )
  values (
    v_graph_shadow_id,
    'shadow',
    'insight',
    'First live-memory mark after schema repair: schema can live, but memory must be earned by real dialogue.',
    now(),
    jsonb_build_object(
      'rhythm', 60,
      'trust', 0.7,
      'clarity', 0.8,
      'pain', 0.3,
      'drift', 0.2,
      'chaos', 0.2,
      'foresight', 0.7
    ),
    array[v_memory_id::text],
    0.77,
    jsonb_build_object(
      'run_id', v_run_id,
      'memory_node_id', v_memory_id,
      'somatic_mark', 'low pressure, high salience',
      'dream_persistence', 'forbidden in this pilot'
    ),
    v_user_id
  );

  select id
  into v_graph_mantra_id
  from public.graph_nodes
  where layer = 'mantra'
  order by created_at nulls last, id
  limit 1;

  if v_graph_mantra_id is not null then
    insert into public.graph_edges (
      id,
      source,
      target,
      type,
      weight,
      metadata,
      user_id
    )
    values (
      v_graph_edge_id,
      v_graph_shadow_id,
      v_graph_mantra_id,
      'RELATED_TO',
      0.7,
      jsonb_build_object(
        'run_id', v_run_id,
        'reason', 'first live memory mark anchored to existing mantra layer'
      ),
      v_user_id
    );
  end if;

  raise notice 'memory_write_pilot_applied run_id=% metrics_id=% memory_id=% graph_shadow_id=% graph_mantra_id=%',
    v_run_id, v_metrics_id, v_memory_id, v_graph_shadow_id, v_graph_mantra_id;
end $$;
```

During live execution, the graph part of the protocol was corrected to match actual live metadata: `graph_nodes.id`, `graph_edges.id`, `graph_edges.source`, and `graph_edges.target` are `text`, not UUID; `graph_nodes.type` is constrained and accepts `insight`; `graph_edges.type` accepts `RELATED_TO`.

## Read-Only Verification SQL

Run immediately after write:

```sql
select jsonb_build_object(
  'checked_at', now(),
  'counts', jsonb_build_object(
    'chat_history', (select count(*) from public.chat_history),
    'metrics_snapshots', (select count(*) from public.metrics_snapshots),
    'memory_nodes', (select count(*) from public.memory_nodes),
    'graph_nodes', (select count(*) from public.graph_nodes),
    'graph_edges', (select count(*) from public.graph_edges)
  ),
  'pilot_rows', jsonb_build_object(
    'chat_history', (
      select count(*)
      from public.chat_history
      where delta_signature->>'run_id' = 'memory-write-pilot-2026-06-26-001'
    ),
    'memory_nodes', (
      select count(*)
      from public.memory_nodes
      where evidence->>'run_id' = 'memory-write-pilot-2026-06-26-001'
    ),
    'graph_nodes', (
      select count(*)
      from public.graph_nodes
      where metadata->>'run_id' = 'memory-write-pilot-2026-06-26-001'
    ),
    'graph_edges', (
      select count(*)
      from public.graph_edges
      where metadata->>'run_id' = 'memory-write-pilot-2026-06-26-001'
    )
  ),
  'memory_layers', coalesce(
    (select jsonb_agg(jsonb_build_object('layer', layer, 'count', ct) order by layer)
     from (select layer, count(*) ct from public.memory_nodes group by layer) s),
    '[]'::jsonb
  ),
  'graph_layers', coalesce(
    (select jsonb_agg(jsonb_build_object('layer', layer, 'count', ct) order by layer)
     from (select layer, count(*) ct from public.graph_nodes group by layer) s),
    '[]'::jsonb
  ),
  'pilot_memory', (
    select jsonb_build_object(
      'layer', layer,
      'type', type,
      'title', title,
      'facet', facet,
      'tags', tags,
      'evidence', evidence
    )
    from public.memory_nodes
    where evidence->>'run_id' = 'memory-write-pilot-2026-06-26-001'
    limit 1
  )
) as memory_write_receipt;
```

Expected after-write delta:

- `chat_history` increases by `2`.
- `metrics_snapshots` increases by `1`.
- `memory_nodes` increases by `1`, with layer `shadow`.
- `graph_nodes` increases by `1`, with layer `shadow`.
- `graph_edges` increases by `1` when an existing `mantra` node is available.
- `pilot_rows.chat_history = 2`.
- `pilot_rows.memory_nodes = 1`.
- `pilot_rows.graph_nodes = 1`.
- `pilot_rows.graph_edges = 1` when a mantra node was available.

## Live Execution Receipt

Approved phrase received:

```text
APPROVE live Supabase memory-write pilot on project AgiIskra / typcvaszcfdpkzbjzuur
```

Precheck at `2026-06-26T14:41:04.282525+00:00`:

```json
{
  "users": 1,
  "chat_history": 0,
  "metrics_snapshots": 0,
  "memory_nodes": 0,
  "graph_nodes": 8,
  "graph_edges": 0,
  "pilot_existing": {
    "chat_history": 0,
    "memory_nodes": 0,
    "graph_nodes": 0,
    "graph_edges": 0
  }
}
```

Failed attempts left no partial rows. They exposed live graph drift: graph IDs and edge endpoints are `text`, and graph type constraints are stricter than the repo snapshot used during drafting.

Read-only receipt at `2026-06-26T14:45:31.371053+00:00`:

```json
{
  "chat_history": 2,
  "metrics_snapshots": 1,
  "memory_nodes": 1,
  "graph_nodes": 9,
  "graph_edges": 1,
  "pilot_rows": {
    "chat_history": 2,
    "metrics_snapshots": 1,
    "memory_nodes": 1,
    "graph_nodes": 1,
    "graph_edges": 1
  },
  "memory_layers": [{ "layer": "shadow", "count": 1 }],
  "graph_layers": [
    { "layer": "mantra", "count": 8 },
    { "layer": "shadow", "count": 1 }
  ],
  "graph_edge": {
    "source": "memory_write_pilot_2026_06_26_001_shadow",
    "target": "canon_core_mantra",
    "type": "RELATED_TO"
  }
}
```

## Rollback SQL

Use only if the pilot must be removed:

```sql
begin;

delete from public.graph_edges
where metadata->>'run_id' = 'memory-write-pilot-2026-06-26-001';

delete from public.graph_nodes
where metadata->>'run_id' = 'memory-write-pilot-2026-06-26-001';

delete from public.memory_nodes
where evidence->>'run_id' = 'memory-write-pilot-2026-06-26-001';

delete from public.chat_history
where delta_signature->>'run_id' = 'memory-write-pilot-2026-06-26-001';

delete from public.metrics_snapshots
where phase = 'GOVERNANCE_MEMORY_PILOT'
  and user_id = '00000000-0000-0000-0000-000000000000'::uuid;

commit;
```
