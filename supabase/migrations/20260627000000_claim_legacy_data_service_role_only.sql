-- Migration: Harden claim_legacy_data to service_role only
-- Closes the security gap where the remote legacy migration granted EXECUTE to authenticated.
-- This is a follow-up delta to 20260309091308_20260308000000_legacy_data_migration.sql.

CREATE OR REPLACE FUNCTION public.claim_legacy_data(legacy_device_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count int;
BEGIN
  -- 1. Restrict execution to trusted backend callers only.
  -- Legacy device_id is caller-supplied and cannot be safely verified in client context.
  IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
    RAISE EXCEPTION 'claim_legacy_data must be executed by service_role';
  END IF;

  -- 2. Update memory_nodes that have no owner and match the old device_id in content
  UPDATE public.memory_nodes
  SET user_id = auth.uid(), updated_at = now()
  WHERE user_id IS NULL
    AND content->>'device_id' = legacy_device_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'claimed_memory_nodes', updated_count);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM anon;
REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_legacy_data(text) TO service_role;
