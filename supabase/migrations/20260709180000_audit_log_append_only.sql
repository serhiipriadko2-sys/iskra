-- =============================================================================
-- ISKRA SPACE - AUDIT LOG APPEND-ONLY HARDENING
-- =============================================================================
-- Purpose:
--   Make public.audit_log tamper-evident (append-only) for authenticated users.
--   The prior policy "Users can manage own audit_log" used FOR ALL, which let a
--   user UPDATE or DELETE their own audit rows. An audit trail that the subject
--   can rewrite is not an audit trail.
--
-- Change:
--   Replace the single FOR ALL policy with two narrow policies:
--     - SELECT own rows
--     - INSERT own rows
--   No UPDATE/DELETE policy exists, so RLS denies those actions by default.
--   service_role (server-side) bypasses RLS and can still administer the table.
--
-- Idempotent: safe to re-run.
-- =============================================================================

begin;

drop policy if exists "Users can manage own audit_log" on public.audit_log;
drop policy if exists "Users can view own audit_log" on public.audit_log;
drop policy if exists "Users can insert own audit_log" on public.audit_log;

create policy "Users can view own audit_log"
    on public.audit_log for select
    using (user_id = auth.uid());

create policy "Users can insert own audit_log"
    on public.audit_log for insert
    with check (user_id = auth.uid());

commit;
