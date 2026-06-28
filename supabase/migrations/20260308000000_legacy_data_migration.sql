-- Migration: Legacy Data Migration Script (Task 1)
-- Allows users with an old localStorage device_id to claim their unowned memory_nodes.

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
  -- (Assuming old architecture stored device_id in the content JSON or similar metadata)
  UPDATE public.memory_nodes
  SET user_id = auth.uid(), updated_at = now()
  WHERE user_id IS NULL
    AND content->>'device_id' = legacy_device_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- We only focus on memory_nodes for now based on Task 1 description
  RETURN jsonb_build_object('success', true, 'claimed_memory_nodes', updated_count);
END;
$$;

-- Grant execute permission to authenticated users
REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM anon;
REVOKE ALL ON FUNCTION public.claim_legacy_data(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_legacy_data(text) TO service_role;
