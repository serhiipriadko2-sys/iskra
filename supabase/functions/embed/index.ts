// Supabase Edge Function: embed
// Generates text embeddings using Supabase Edge Runtime built-in AI inference.
// Expected request: { "input": string }
// Response: { "embedding": number[] }

import { corsHeaders } from '../_shared/cors.ts';

// NOTE: In Supabase Edge Runtime, `Supabase.ai.Session` is available.
const session = new Supabase.ai.Session('gte-small');

// Best-effort, in-memory rate limiting (per worker).
// For production-grade limits, prefer the official Supabase example using Upstash Redis.
// See: https://supabase.com/docs/guides/functions/examples/rate-limiting
const RL_WINDOW_MS = Number(Deno.env.get('EMBED_RL_WINDOW_MS') ?? '') || 0;
const RL_MAX = Number(Deno.env.get('EMBED_RL_MAX') ?? '') || 0;
const rlBuckets = new Map<string, { windowStart: number; count: number }>();

function getClientKey(req: Request): string {
  // Try common proxy headers; fall back to a single shared bucket.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
  return ip;
}

function rateLimit(req: Request): Response | null {
  if (!(RL_WINDOW_MS > 0 && RL_MAX > 0)) return null;

  const now = Date.now();
  const key = getClientKey(req);
  const bucket = rlBuckets.get(key);
  if (!bucket || now - bucket.windowStart >= RL_WINDOW_MS) {
    rlBuckets.set(key, { windowStart: now, count: 1 });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > RL_MAX) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  return null;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  // Require Authorization header (Supabase invoke requires it; keep defense-in-depth).
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization bearer token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const rl = rateLimit(req);
  if (rl) return rl;

  let input = '';
  try {
    const body = (await req.json()) as { input?: unknown };
    input = typeof body.input === 'string' ? body.input : '';
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!input) {
    return new Response(JSON.stringify({ error: 'Missing input' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Guardrails: keep payload bounded.
  // (Edge Functions have runtime limits; large strings can increase latency/cost.)
  const MAX_CHARS = 8192;
  if (input.length > MAX_CHARS) {
    input = input.slice(0, MAX_CHARS);
  }

  const embedding = await session.run(input, {
    mean_pool: true,
    normalize: true
  });

  return new Response(JSON.stringify({ embedding }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
