/**
 * Supabase Edge Function: Voice KAIN Repair Signal
 *
 * This function receives Iskra metrics and determines whether the
 * "anti‑echo" contour should be triggered. Lives on the edge so the
 * formula can be updated without recompiling the frontend.
 *
 * Security boundary (mirrors `gemini` Edge Function):
 * - Explicit origin allow-list via KAIN_ALLOWED_ORIGINS.
 * - Supabase JWT validation via /auth/v1/user.
 * - Per-user/IP in-memory rate limiting.
 */

type AllowedOriginMode = 'any' | 'explicit';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

function getAllowedOrigins(): { mode: AllowedOriginMode; origins: Set<string> } {
  const raw = Deno.env.get('KAIN_ALLOWED_ORIGINS') ?? '';
  const trimmed = raw.trim();
  if (trimmed === '*') {
    return { mode: 'any', origins: new Set<string>() };
  }
  return {
    mode: 'explicit',
    origins: new Set(
      trimmed
        .split(',')
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean),
    ),
  };
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const { mode, origins } = getAllowedOrigins();
  if (mode === 'any') return true;
  return origins.has(origin.toLowerCase());
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
    'vary': 'origin',
  };
  if (isOriginAllowed(origin)) {
    headers['access-control-allow-origin'] = origin ?? '';
  }
  return headers;
}

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(origin),
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

type VerifiedKainUser = {
  sub: string;
  isAnonymous: boolean;
};

async function validateJwt(token: string): Promise<VerifiedKainUser | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, unknown> | undefined;
    if (!data || typeof data.id !== 'string') return null;

    const appMetadata = data.app_metadata;
    const anonymousProvider = appMetadata && typeof appMetadata === 'object'
      && (appMetadata as Record<string, unknown>).provider === 'anonymous';
    return { sub: data.id, isAnonymous: data.is_anonymous === true || anonymousProvider };
  } catch {
    return null;
  }
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function getClientIdentifier(req: Request, userSub?: string): string {
  if (userSub) return `user:${userSub}`;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  return `ip:${ip}`;
}

const RL_WINDOW_MS = Number(Deno.env.get('KAIN_RL_WINDOW_MS') ?? '') || 60_000;
const RL_MAX = Number(Deno.env.get('KAIN_RL_MAX') ?? '') || 60;
const rlBuckets = new Map<string, { windowStart: number; count: number }>();

function cleanupExpiredBuckets(now: number): void {
  for (const [key, bucket] of rlBuckets.entries()) {
    if (now - bucket.windowStart >= RL_WINDOW_MS) {
      rlBuckets.delete(key);
    }
  }
}

function rateLimit(req: Request, userSub?: string): Response | null {
  const now = Date.now();
  if (rlBuckets.size > 10_000) cleanupExpiredBuckets(now);

  const key = getClientIdentifier(req, userSub);
  const bucket = rlBuckets.get(key);

  if (!bucket || now - bucket.windowStart >= RL_WINDOW_MS) {
    rlBuckets.set(key, { windowStart: now, count: 1 });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > RL_MAX) {
    return json(
      { error: 'Rate limit exceeded. Slow down.' },
      { status: 429 },
      req.headers.get('origin'),
    );
  }
  return null;
}

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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  // Handle CORS preflight (reject disallowed origins, mirror gemini/iskra-agent: 204 no body)
  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return json({ error: 'forbidden_origin' }, { status: 403 }, origin);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, { status: 405 }, origin);
  }

  // Origin enforcement
  if (!isOriginAllowed(origin)) {
    return json({ error: 'forbidden_origin' }, { status: 403 }, origin);
  }

  // JWT authentication
  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: 'missing_authorization' }, { status: 401 }, origin);
  }

  const user = await validateJwt(token);
  if (!user) {
    return json({ error: 'invalid_token' }, { status: 401 }, origin);
  }

  if (user.isAnonymous) {
    return json({ error: 'anonymous_sessions_are_not_allowed' }, { status: 401 }, origin);
  }

  // Rate limiting
  const rateLimited = rateLimit(req, user.sub);
  if (rateLimited) return rateLimited;

  try {
    const body = await req.json();
    const metrics = body?.metrics as Partial<Metrics> | undefined;

    if (!metrics) {
      return json({ error: 'missing_metrics' }, { status: 400 }, origin);
    }

    const result = checkRepair(metrics);

    return json(result, { status: 200 }, origin);
  } catch (error) {
    console.error('Voice KAIN edge function error:', error);
    return json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 },
      origin,
    );
  }
});
