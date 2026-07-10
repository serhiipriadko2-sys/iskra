-- =============================================================================
-- IskraSpace AI Edge closed-beta quota boundary
-- =============================================================================
-- Repository-only forward migration. Apply only through the approved Supabase
-- reconciliation workflow after live migration parity has been established.
--
-- The private table never stores a raw network address. Edge Functions submit a
-- salted HMAC-SHA-256 digest for the IP minute window and the caller identity is
-- read from auth.uid() inside this transaction.
-- =============================================================================

begin;

create schema if not exists private;
revoke all on schema private from public;

create table if not exists private.ai_rate_limit_windows (
  scope text not null check (scope in ('member_minute', 'ip_minute', 'member_day')),
  subject text not null check (char_length(subject) between 1 and 128),
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (scope, subject, window_started_at)
);

alter table private.ai_rate_limit_windows enable row level security;
revoke all on private.ai_rate_limit_windows from public, anon, authenticated;
grant all on private.ai_rate_limit_windows to service_role;

create or replace function public.consume_ai_quota(p_ip_digest text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = pg_catalog, private, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_member_subject text;
  v_now timestamptz := clock_timestamp();
  v_minute_window timestamptz;
  v_day_window timestamptz;
  v_member_minute_count integer := 0;
  v_ip_minute_count integer := 0;
  v_member_day_count integer := 0;
begin
  if v_uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'inactive_member');
  end if;

  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    return jsonb_build_object('allowed', false, 'reason', 'anonymous_session');
  end if;

  if not private.is_active_beta_member() then
    return jsonb_build_object('allowed', false, 'reason', 'inactive_member');
  end if;

  if p_ip_digest is null or p_ip_digest !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_ip_digest');
  end if;

  v_member_subject := v_uid::text;
  v_minute_window := date_trunc('minute', v_now);
  v_day_window := date_trunc('day', v_now);

  -- Fixed lock order prevents races and deadlocks while the three quota
  -- windows are checked together. Returning below happens before any write,
  -- so a denied request cannot partially consume another window.
  perform pg_advisory_xact_lock(hashtextextended('ai-quota:member-minute:' || v_member_subject, 0));
  perform pg_advisory_xact_lock(hashtextextended('ai-quota:ip-minute:' || p_ip_digest, 0));
  perform pg_advisory_xact_lock(hashtextextended('ai-quota:member-day:' || v_member_subject, 0));

  select request_count
    into v_member_minute_count
    from private.ai_rate_limit_windows
   where scope = 'member_minute'
     and subject = v_member_subject
     and window_started_at = v_minute_window;

  select request_count
    into v_ip_minute_count
    from private.ai_rate_limit_windows
   where scope = 'ip_minute'
     and subject = p_ip_digest
     and window_started_at = v_minute_window;

  select request_count
    into v_member_day_count
    from private.ai_rate_limit_windows
   where scope = 'member_day'
     and subject = v_member_subject
     and window_started_at = v_day_window;

  if coalesce(v_member_minute_count, 0) >= 30 then
    return jsonb_build_object('allowed', false, 'reason', 'member_minute');
  end if;

  if coalesce(v_ip_minute_count, 0) >= 10 then
    return jsonb_build_object('allowed', false, 'reason', 'ip_minute');
  end if;

  if coalesce(v_member_day_count, 0) >= 250 then
    return jsonb_build_object('allowed', false, 'reason', 'member_day');
  end if;

  insert into private.ai_rate_limit_windows (scope, subject, window_started_at, request_count)
  values
    ('member_minute', v_member_subject, v_minute_window, 1),
    ('ip_minute', p_ip_digest, v_minute_window, 1),
    ('member_day', v_member_subject, v_day_window, 1)
  on conflict (scope, subject, window_started_at) do update
    set request_count = private.ai_rate_limit_windows.request_count + 1,
        updated_at = excluded.updated_at;

  return jsonb_build_object('allowed', true);
end;
$$;

revoke all on function public.consume_ai_quota(text) from public;
grant execute on function public.consume_ai_quota(text) to authenticated;

comment on table private.ai_rate_limit_windows is
  'Atomic AI quota windows. IP subjects are salted HMAC-SHA-256 digests only.';
comment on function public.consume_ai_quota(text) is
  'Closed-beta, user-JWT-scoped AI quota RPC: 30/member/minute, 10/IP/minute, 250/member/day.';

commit;
