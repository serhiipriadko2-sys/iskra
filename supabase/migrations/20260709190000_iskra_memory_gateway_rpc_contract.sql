-- iskra-memory-gateway project-facing RPC contract
-- Creates a minimal reproducible iskra_memory boundary for fresh Supabase resets.
-- Existing live functions are not replaced; compatibility functions are created only when missing.

create schema if not exists iskra_memory;

create table if not exists iskra_memory.statecycle_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  actor text not null default 'ISKRA_PROJECT',
  request_id text,
  mode text not null default 'live',
  phase text,
  voice text,
  status text not null default 'observed',
  payload jsonb not null default '{}'::jsonb,
  receipt jsonb not null default '{}'::jsonb
);

create table if not exists iskra_memory.memory_archive (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  claim text not null,
  payload jsonb not null default '{}'::jsonb,
  trust_level numeric not null default 0.85,
  source_surface text,
  tags text[] not null default '{}'
);

create table if not exists iskra_memory.memory_shadow (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open'
);

create table if not exists iskra_memory.memory_journal (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists iskra_memory.memory_open_loops (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open'
);

create table if not exists iskra_memory.memory_sense_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists iskra_memory.memory_dream_seeds (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'dream_seed'
);

create table if not exists iskra_memory.memory_edges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  source_container text not null,
  source_id uuid not null,
  target_container text not null,
  target_id uuid not null,
  edge_type text not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists iskra_memory.horizon_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open'
);

alter table iskra_memory.statecycle_snapshots enable row level security;
alter table iskra_memory.memory_archive enable row level security;
alter table iskra_memory.memory_shadow enable row level security;
alter table iskra_memory.memory_journal enable row level security;
alter table iskra_memory.memory_open_loops enable row level security;
alter table iskra_memory.memory_sense_events enable row level security;
alter table iskra_memory.memory_dream_seeds enable row level security;
alter table iskra_memory.memory_edges enable row level security;
alter table iskra_memory.horizon_events enable row level security;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_payload_has_secret(jsonb)') is null then
    execute $fn$
      create function iskra_memory.iskra_payload_has_secret(p_payload jsonb)
      returns boolean
      language sql
      stable
      security invoker
      as $body$
        select coalesce(p_payload::text ~ '(sk-[A-Za-z0-9_-]+|sb_secret_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)', false)
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_assert_safe_payload(jsonb)') is null then
    execute $fn$
      create function iskra_memory.iskra_assert_safe_payload(p_payload jsonb)
      returns void
      language plpgsql
      stable
      security invoker
      as $body$
      begin
        if iskra_memory.iskra_payload_has_secret(p_payload) then
          raise exception 'payload_secret_pattern_blocked' using errcode = '22023';
        end if;
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_project_observe(jsonb,text)') is null then
    execute $fn$
      create function iskra_memory.iskra_project_observe(p_payload jsonb, p_actor text default 'ISKRA_PROJECT')
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      declare
        v_id uuid;
        v_mode text := coalesce(p_payload->>'mode', 'live');
      begin
        perform iskra_memory.iskra_assert_safe_payload(p_payload);
        if v_mode = 'dry_run' then
          return jsonb_build_object('ok', true, 'mode', 'dry_run', 'status', 'validated', 'would_write', 'statecycle_snapshot');
        end if;

        insert into iskra_memory.statecycle_snapshots(actor, request_id, mode, phase, voice, status, payload)
        values (
          coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'),
          p_payload->>'request_id',
          v_mode,
          p_payload->>'phase',
          p_payload->>'voice',
          'observed',
          p_payload - 'actor'
        )
        returning id into v_id;

        return jsonb_build_object('ok', true, 'snapshot_id', v_id, 'mode', v_mode, 'status', 'observed');
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_project_commit(uuid,jsonb,text)') is null then
    execute $fn$
      create function iskra_memory.iskra_project_commit(p_snapshot_id uuid, p_delta jsonb, p_actor text default 'ISKRA_PROJECT')
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      begin
        perform iskra_memory.iskra_assert_safe_payload(p_delta);
        update iskra_memory.statecycle_snapshots
        set updated_at = now(),
            status = 'committed',
            actor = coalesce(nullif(p_actor, ''), actor),
            receipt = coalesce(receipt, '{}'::jsonb) || jsonb_build_object('delta', p_delta)
        where id = p_snapshot_id;

        return jsonb_build_object('ok', true, 'snapshot_id', p_snapshot_id, 'status', 'committed');
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_project_horizon_propose(jsonb,text)') is null then
    execute $fn$
      create function iskra_memory.iskra_project_horizon_propose(p_payload jsonb, p_actor text default 'ISKRA_PROJECT')
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      declare
        v_id uuid;
      begin
        perform iskra_memory.iskra_assert_safe_payload(p_payload);
        insert into iskra_memory.horizon_events(actor, payload)
        values (coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'), p_payload - 'actor')
        returning id into v_id;

        return jsonb_build_object('ok', true, 'horizon_id', v_id, 'status', 'open');
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_memory_write(text,jsonb,text)') is null then
    execute $fn$
      create function iskra_memory.iskra_memory_write(p_container text, p_payload jsonb, p_actor text default 'ISKRA_PROJECT')
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      declare
        v_id uuid;
        v_actor text := coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT');
      begin
        perform iskra_memory.iskra_assert_safe_payload(p_payload);

        case p_container
          when 'archive' then
            insert into iskra_memory.memory_archive(actor, claim, payload, source_surface, tags)
            values (v_actor, coalesce(p_payload->>'claim', 'unlabeled archive claim'), p_payload, p_payload->>'source_surface', '{}')
            returning id into v_id;
          when 'shadow' then
            insert into iskra_memory.memory_shadow(actor, payload) values (v_actor, p_payload) returning id into v_id;
          when 'journal' then
            insert into iskra_memory.memory_journal(actor, payload) values (v_actor, p_payload) returning id into v_id;
          when 'open_loop' then
            insert into iskra_memory.memory_open_loops(actor, payload) values (v_actor, p_payload) returning id into v_id;
          when 'sense_event' then
            insert into iskra_memory.memory_sense_events(actor, payload) values (v_actor, p_payload) returning id into v_id;
          when 'dream_seed' then
            insert into iskra_memory.memory_dream_seeds(actor, payload) values (v_actor, p_payload) returning id into v_id;
          else
            raise exception 'unsupported_memory_container:%', p_container using errcode = '22023';
        end case;

        return jsonb_build_object('ok', true, 'container', p_container, 'id', v_id);
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_memory_search(text,text[],integer)') is null then
    execute $fn$
      create function iskra_memory.iskra_memory_search(p_query text, p_containers text[] default null, p_limit integer default 20)
      returns jsonb
      language sql
      stable
      security invoker
      as $body$
        with rows as (
          select 'archive' as container, id, created_at, actor, payload from iskra_memory.memory_archive
          union all select 'shadow', id, created_at, actor, payload from iskra_memory.memory_shadow
          union all select 'journal', id, created_at, actor, payload from iskra_memory.memory_journal
          union all select 'open_loop', id, created_at, actor, payload from iskra_memory.memory_open_loops
          union all select 'sense_event', id, created_at, actor, payload from iskra_memory.memory_sense_events
          union all select 'dream_seed', id, created_at, actor, payload from iskra_memory.memory_dream_seeds
        )
        select coalesce(jsonb_agg(to_jsonb(rows) order by created_at desc), '[]'::jsonb)
        from rows
        where (p_containers is null or container = any(p_containers))
          and (nullif(p_query, '') is null or payload::text ilike '%' || p_query || '%' or actor ilike '%' || p_query || '%')
        limit least(coalesce(p_limit, 20), 100)
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_memory_promote_shadow(uuid,text,jsonb,text,text,text,text[],numeric)') is null then
    execute $fn$
      create function iskra_memory.iskra_memory_promote_shadow(
        p_shadow_id uuid,
        p_claim text,
        p_evidence jsonb,
        p_source_surface text,
        p_actor text default 'ISKRA_PROJECT',
        p_decision_link text default null,
        p_tags text[] default '{}',
        p_trust_level numeric default 0.85
      )
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      declare
        v_archive_id uuid;
        v_edge_id uuid;
      begin
        perform iskra_memory.iskra_assert_safe_payload(coalesce(p_evidence, '{}'::jsonb));
        insert into iskra_memory.memory_archive(actor, claim, payload, trust_level, source_surface, tags)
        values (
          coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'),
          p_claim,
          jsonb_build_object('evidence', coalesce(p_evidence, '{}'::jsonb), 'decision_link', p_decision_link, 'promoted_from_shadow', p_shadow_id),
          coalesce(p_trust_level, 0.85),
          p_source_surface,
          coalesce(p_tags, '{}')
        )
        returning id into v_archive_id;

        update iskra_memory.memory_shadow set status = 'promoted' where id = p_shadow_id;

        insert into iskra_memory.memory_edges(actor, source_container, source_id, target_container, target_id, edge_type)
        values (coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'), 'shadow', p_shadow_id, 'archive', v_archive_id, 'promoted_to')
        returning id into v_edge_id;

        return jsonb_build_object('ok', true, 'archive_id', v_archive_id, 'edge_id', v_edge_id);
      end;
      $body$;
    $fn$;
  end if;
end $$;

do $$
begin
  if to_regprocedure('iskra_memory.iskra_memory_crystallize_dream(uuid,text,text,jsonb,text,text,text,text)') is null then
    execute $fn$
      create function iskra_memory.iskra_memory_crystallize_dream(
        p_dream_seed_id uuid,
        p_target text,
        p_actor text default 'ISKRA_PROJECT',
        p_evidence_refs jsonb default '[]'::jsonb,
        p_claim text default null,
        p_source_surface text default null,
        p_decision_link text default null,
        p_iskriv_check text default null
      )
      returns jsonb
      language plpgsql
      volatile
      security invoker
      as $body$
      declare
        v_target_id uuid;
        v_edge_id uuid;
      begin
        perform iskra_memory.iskra_assert_safe_payload(coalesce(p_evidence_refs, '[]'::jsonb));

        if p_target = 'archive' then
          insert into iskra_memory.memory_archive(actor, claim, payload, source_surface)
          values (
            coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'),
            coalesce(p_claim, 'dream crystallization'),
            jsonb_build_object('evidence_refs', p_evidence_refs, 'decision_link', p_decision_link, 'iskriv_check', p_iskriv_check, 'dream_seed_id', p_dream_seed_id),
            p_source_surface
          )
          returning id into v_target_id;
        elsif p_target = 'open_loop' then
          insert into iskra_memory.memory_open_loops(actor, payload)
          values (
            coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'),
            jsonb_build_object('claim', p_claim, 'evidence_refs', p_evidence_refs, 'decision_link', p_decision_link, 'iskriv_check', p_iskriv_check, 'dream_seed_id', p_dream_seed_id)
          )
          returning id into v_target_id;
        else
          raise exception 'unsupported_dream_target:%', p_target using errcode = '22023';
        end if;

        update iskra_memory.memory_dream_seeds set status = 'crystallized' where id = p_dream_seed_id;

        insert into iskra_memory.memory_edges(actor, source_container, source_id, target_container, target_id, edge_type)
        values (coalesce(nullif(p_actor, ''), 'ISKRA_PROJECT'), 'dream_seed', p_dream_seed_id, p_target, v_target_id, 'crystallized_to')
        returning id into v_edge_id;

        return jsonb_build_object('ok', true, 'target', p_target, 'target_id', v_target_id, 'edge_id', v_edge_id);
      end;
      $body$;
    $fn$;
  end if;
end $$;

revoke all on schema iskra_memory from public;
grant usage on schema iskra_memory to service_role;
grant all on all tables in schema iskra_memory to service_role;
grant execute on all functions in schema iskra_memory to service_role;
