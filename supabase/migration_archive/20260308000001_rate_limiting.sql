-- Migration: Rate Limiting Table and RPC (Task 2)
-- Moves rate limiting out of in-memory Edge Functions to an atomic DB implementation.

CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip text NOT NULL,
    endpoint text NOT NULL,
    hits int NOT NULL DEFAULT 1,
    reset_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (ip, endpoint)
);

-- Enable RLS (though only Service Role will access it)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    client_ip text,
    target_endpoint text,
    max_hits int,
    window_minutes int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_hits int;
    current_reset timestamptz;
BEGIN
    -- Atomic upsert to handle concurrent requests
    INSERT INTO public.rate_limits (ip, endpoint, hits, reset_time)
    VALUES (
        client_ip,
        target_endpoint,
        1,
        now() + (window_minutes || ' minutes')::interval
    )
    ON CONFLICT (ip, endpoint) DO UPDATE
    SET
        hits = CASE
            WHEN rate_limits.reset_time < now() THEN 1
            ELSE rate_limits.hits + 1
        END,
        reset_time = CASE
            WHEN rate_limits.reset_time < now() THEN now() + (window_minutes || ' minutes')::interval
            ELSE rate_limits.reset_time
        END
    RETURNING hits, reset_time INTO current_hits, current_reset;

    -- Return true if under/at limit, false if exceeded
    IF current_hits <= max_hits THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;

-- Only service role (Edge Functions) should typically execute this, but we allow authenticated/anon
-- if they call it directly (though IP spoofing is a risk if called from client side).
-- It is highly recommended to ONLY call this from Deno Edge Functions using Service Role Key.
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, int, int) TO service_role;
