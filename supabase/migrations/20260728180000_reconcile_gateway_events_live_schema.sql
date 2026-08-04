-- Forward-only reconciliation for an untracked production object required by
-- 20260728183421_parallax_memory_gate.
--
-- Provenance boundary:
--   * this is NOT a recovered original migration body;
--   * the table shape, constraints, indexes, RLS, policy, grants and comment
--     are reconstructed from read-only production catalog evidence captured on
--     2026-07-31;
--   * an existing table must match the expected column contract or the
--     migration fails closed.

begin;

do $shape$
declare
  actual_columns jsonb;
  expected_columns constant jsonb := jsonb_build_array(
    jsonb_build_object('ordinal', 1, 'name', 'id', 'type', 'uuid', 'nullable', false, 'default', 'gen_random_uuid()'),
    jsonb_build_object('ordinal', 2, 'name', 'created_at', 'type', 'timestamp with time zone', 'nullable', false, 'default', 'now()'),
    jsonb_build_object('ordinal', 3, 'name', 'request_id', 'type', 'text', 'nullable', true, 'default', null),
    jsonb_build_object('ordinal', 4, 'name', 'actor', 'type', 'text', 'nullable', false, 'default', '''ISKRA_PROJECT''::text'),
    jsonb_build_object('ordinal', 5, 'name', 'action', 'type', 'text', 'nullable', false, 'default', null),
    jsonb_build_object('ordinal', 6, 'name', 'mode', 'type', 'text', 'nullable', false, 'default', '''live''::text'),
    jsonb_build_object('ordinal', 7, 'name', 'status', 'type', 'text', 'nullable', false, 'default', '''ok''::text'),
    jsonb_build_object('ordinal', 8, 'name', 'snapshot_id', 'type', 'uuid', 'nullable', true, 'default', null),
    jsonb_build_object('ordinal', 9, 'name', 'target_container', 'type', 'text', 'nullable', true, 'default', null),
    jsonb_build_object('ordinal', 10, 'name', 'target_id', 'type', 'uuid', 'nullable', true, 'default', null),
    jsonb_build_object('ordinal', 11, 'name', 'receipt', 'type', 'jsonb', 'nullable', false, 'default', '''{}''::jsonb'),
    jsonb_build_object('ordinal', 12, 'name', 'payload_redacted', 'type', 'jsonb', 'nullable', false, 'default', '''{}''::jsonb'),
    jsonb_build_object('ordinal', 13, 'name', 'error', 'type', 'text', 'nullable', true, 'default', null)
  );
begin
  if to_regclass('iskra_memory.gateway_events') is not null then
    select jsonb_agg(
      jsonb_build_object(
        'ordinal', ordinal_position,
        'name', column_name,
        'type', data_type,
        'nullable', is_nullable = 'YES',
        'default', column_default
      ) order by ordinal_position
    )
    into actual_columns
    from information_schema.columns
    where table_schema = 'iskra_memory'
      and table_name = 'gateway_events';

    if actual_columns is distinct from expected_columns then
      raise exception 'gateway_events column contract differs from the 2026-07-31 production receipt';
    end if;
  end if;
end
$shape$;

create table if not exists iskra_memory.gateway_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id text,
  actor text not null default 'ISKRA_PROJECT'
    constraint gateway_events_actor_check check (length(actor) > 0),
  action text not null
    constraint gateway_events_action_check check (length(action) > 0),
  mode text not null default 'live'
    constraint gateway_events_mode_check
      check (mode in ('live', 'dark_run', 'dry_run', 'horizon', 'dreamspace')),
  status text not null default 'ok'
    constraint gateway_events_status_check
      check (status in ('ok', 'validated', 'blocked', 'error')),
  snapshot_id uuid references iskra_memory.statecycle_snapshots(id) on delete set null,
  target_container text,
  target_id uuid,
  receipt jsonb not null default '{}'::jsonb
    constraint gateway_events_receipt_check check (jsonb_typeof(receipt) = 'object'),
  payload_redacted jsonb not null default '{}'::jsonb,
  error text
);

create index if not exists gateway_events_created_at_idx
  on iskra_memory.gateway_events (created_at desc);
create index if not exists gateway_events_request_id_idx
  on iskra_memory.gateway_events (request_id);
create index if not exists gateway_events_action_idx
  on iskra_memory.gateway_events (action);

alter table iskra_memory.gateway_events enable row level security;
revoke all on table iskra_memory.gateway_events from public, anon, authenticated;
grant all on table iskra_memory.gateway_events to service_role;

do $policy$
declare
  existing_roles name[];
  existing_cmd text;
  existing_qual text;
  existing_check text;
begin
  select roles, cmd, qual, with_check
    into existing_roles, existing_cmd, existing_qual, existing_check
  from pg_policies
  where schemaname = 'iskra_memory'
    and tablename = 'gateway_events'
    and policyname = 'gateway_events_deny_clients';

  if found then
    if existing_roles is distinct from array['anon','authenticated']::name[]
       or existing_cmd is distinct from 'ALL'
       or existing_qual is distinct from 'false'
       or existing_check is distinct from 'false' then
      raise exception 'gateway_events_deny_clients differs from the 2026-07-31 production receipt';
    end if;
  else
    create policy gateway_events_deny_clients
      on iskra_memory.gateway_events
      for all to anon, authenticated
      using (false)
      with check (false);
  end if;
end
$policy$;

comment on table iskra_memory.gateway_events is
  'Audit receipts for iskra-memory-gateway Project-facing boundary calls.';

commit;
