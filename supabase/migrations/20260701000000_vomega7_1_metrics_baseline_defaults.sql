-- =============================================================================
-- ISKRA SPACE - vOmega7.1 Metrics Baseline Defaults
-- =============================================================================
-- Migration name: vomega7_1_metrics_baseline_defaults
--
-- Purpose:
--   Finish the metrics default alignment started by
--   20260626141034_voice_metrics_drift_repair.sql.
--
-- Scope:
--   Metadata/default repair only. This migration does not insert, update, or
--   delete user rows. Existing metrics snapshots keep their stored values.
--
-- Runtime source:
--   packages/core/src/types.ts DEFAULT_METRICS
--
-- Rollback:
--   See docs/repair/vomega-7-1/SUPABASE_BASELINE_SECURITY_GATE_vomega_7_1.md.
-- =============================================================================

begin;

alter table public.metrics_snapshots
  alter column drift set default 0.1,
  alter column echo set default 0.1,
  alter column mirror_sync set default 0.7,
  alter column interrupt set default 0.1,
  alter column ctx_switch set default 0.2;

commit;
