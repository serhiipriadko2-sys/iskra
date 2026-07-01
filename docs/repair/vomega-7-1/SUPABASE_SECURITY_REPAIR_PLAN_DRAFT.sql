-- Supabase Security Repair Plan Draft — Iskra vΩ.7.1
-- Status: draft only. DO NOT EXECUTE without explicit approval, backup, and rollback.
-- Purpose: align metrics defaults and prepare RLS/security cleanup gates.

BEGIN;

-- 1) Metrics baseline alignment with runtime DEFAULT_METRICS.
ALTER TABLE public.metrics_snapshots ALTER COLUMN drift SET DEFAULT 0.1;
ALTER TABLE public.metrics_snapshots ALTER COLUMN echo SET DEFAULT 0.1;
ALTER TABLE public.metrics_snapshots ALTER COLUMN mirror_sync SET DEFAULT 0.7;
ALTER TABLE public.metrics_snapshots ALTER COLUMN interrupt SET DEFAULT 0.1;
ALTER TABLE public.metrics_snapshots ALTER COLUMN ctx_switch SET DEFAULT 0.2;

-- 2) RLS initplan cleanup pattern.
-- Replace auth.uid() with (select auth.uid()) in policies during concrete migration.
-- Example shape only; exact policies must be inspected live before execution.
--
-- DROP POLICY IF EXISTS metrics_snapshots_manage_own ON public.metrics_snapshots;
-- CREATE POLICY metrics_snapshots_manage_own
-- ON public.metrics_snapshots
-- FOR ALL
-- TO authenticated
-- USING (user_id = (select auth.uid()))
-- WITH CHECK (user_id = (select auth.uid()));

-- 3) Graph policy consolidation decision point.
-- Current drift: strict user-owned graph and user_id IS NULL shared canonical graph compete.
-- Choose one of:
--   A) split canonical graph into iskra schema;
--   B) add visibility column;
--   C) keep private-only graph and move canon to canon_* tables.
-- No graph policy mutation is executed in this draft.

-- 4) SECURITY DEFINER review.
-- Do not blindly revoke or alter functions until call paths are known.
-- Candidate review queries:
-- SELECT n.nspname, p.proname, p.prosecdef
-- FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public' AND p.proname LIKE 'graph_%';

-- 5) GraphQL exposure review.
-- Determine whether sensitive public tables should be visible to authenticated GraphQL.
-- Do not revoke grants until frontend/API usage is mapped.

COMMIT;

-- Rollback for metrics defaults only:
-- BEGIN;
-- ALTER TABLE public.metrics_snapshots ALTER COLUMN drift SET DEFAULT 0.2;
-- ALTER TABLE public.metrics_snapshots ALTER COLUMN echo SET DEFAULT 0.5;
-- ALTER TABLE public.metrics_snapshots ALTER COLUMN mirror_sync SET DEFAULT 0.6;
-- ALTER TABLE public.metrics_snapshots ALTER COLUMN interrupt SET DEFAULT 0;
-- ALTER TABLE public.metrics_snapshots ALTER COLUMN ctx_switch SET DEFAULT 0;
-- COMMIT;
