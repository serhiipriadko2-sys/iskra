/**
 * Supabase Edge Function: Voice KAIN Repair Signal
 *
 * This function receives Iskra metrics and determines whether the
 * "anti‑echo" contour should be triggered. It lives on the edge
 * (Supabase Functions) so that the formula can be updated without
 * recompiling the frontend. Only the logic for KAIN is implemented
 * in this spike.
 *
 * Deploy with: supabase functions deploy kain
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers to allow calls from the browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Metrics {
  pain: number;
  drift: number;
  echo: number;
  chaos: number;
  [key: string]: number | undefined;
}

interface RepairResult {
  repairNeeded: boolean;
  reason?: string;
}

/**
 * Simple heuristic for repair: if any of the key metrics exceed
 * thresholds, a repair is recommended. Thresholds mirror those in
 * the KAIN voice activation function.
 */
function checkRepair(metrics: Partial<Metrics>): RepairResult {
  const { pain = 0, drift = 0, echo = 0, chaos = 0 } = metrics || {};
  let reason: string | undefined;
  if (pain >= 0.3) {
    reason = 'pain';
  } else if (drift >= 0.3) {
    reason = 'drift';
  } else if (echo >= 0.5) {
    reason = 'echo';
  } else if (chaos >= 0.4) {
    reason = 'chaos';
  }
  return {
    repairNeeded: Boolean(reason),
    reason,
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const metrics = body?.metrics as Partial<Metrics> | undefined;

    if (!metrics) {
      throw new Error('Missing metrics');
    }

    const result = checkRepair(metrics);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Voice KAIN edge function error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
