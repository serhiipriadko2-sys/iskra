type IskraAgentRequest = {
  message?: string;
  input?: unknown;
  route?: string;
  phase?: string;
  request_id?: string;
  context?: Record<string, unknown>;
};

type IskraAgentResponse = {
  reply: string;
  status: "ok" | "partial" | "blocked" | "error";
  actions: unknown[];
  trace: {
    facts: unknown[];
    hypotheses: unknown[];
    risks: unknown[];
  };
  delta: Record<string, unknown>;
  artifact_receipt: Record<string, unknown> | null;
  request_id: string;
};

const AGENT_API_BASE = "https://api.chatgpt.com/v1/workspace_agents";
const DEFAULT_ALLOWED_METHODS = "POST, OPTIONS";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

type AllowedOriginMode = "any" | "explicit";

function requestId(): string {
  return crypto.randomUUID();
}

function getAllowedOrigins(): { mode: AllowedOriginMode; origins: Set<string> } {
  const raw = Deno.env.get("ISKRA_AGENT_ALLOWED_ORIGINS") ?? "";
  const trimmed = raw.trim();
  if (trimmed === "*") {
    // Explicit dev opt-in only. Production must set an explicit allow-list.
    return { mode: "any", origins: new Set<string>() };
  }
  return {
    mode: "explicit",
    origins: new Set(
      trimmed
        .split(",")
        .map((o) => o.trim().toLowerCase())
        .filter(Boolean),
    ),
  };
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  const { mode, origins } = getAllowedOrigins();
  if (mode === "any") return true;
  return origins.has(origin.toLowerCase());
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": DEFAULT_ALLOWED_METHODS,
    "vary": "Origin",
  };
  if (isOriginAllowed(origin)) {
    headers["access-control-allow-origin"] = origin ?? "";
  }
  return headers;
}

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders(origin),
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

async function validateJwt(token: string): Promise<{ sub: string; user?: Record<string, unknown> } | null> {
  // Local/dev bypass: if Supabase env vars are missing we cannot validate.
  // In production these are injected by Supabase and validation is enforced.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[iskra-agent] SUPABASE_URL or SUPABASE_ANON_KEY missing; JWT validation skipped (dev mode)");
    return { sub: "dev" };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Record<string, unknown> | undefined;
    if (!data || typeof data.id !== "string") return null;

    return { sub: data.id, user: data };
  } catch (err) {
    console.error("[iskra-agent] JWT validation error:", err);
    return null;
  }
}

function getClientIdentifier(req: Request, userSub?: string): string {
  if (userSub) return `user:${userSub}`;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return `ip:${ip}`;
}

const RL_WINDOW_MS = Number(Deno.env.get("ISKRA_AGENT_RL_WINDOW_MS") ?? "") || 60_000;
const RL_MAX = Number(Deno.env.get("ISKRA_AGENT_RL_MAX") ?? "") || 30;
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
      { error: "Rate limit exceeded. Slow down." },
      { status: 429 },
      req.headers.get("origin"),
    );
  }
  return null;
}

function normalizePayload(payload: IskraAgentRequest, userId: string | null): Record<string, unknown> {
  return {
    mode: "iskraSpace",
    route: payload.route ?? "chat",
    phase: payload.phase ?? "runtime",
    request_id: payload.request_id ?? requestId(),
    message: payload.message ?? payload.input ?? "",
    user_id: userId,
    context: {
      sift: true,
      delta_receipt: true,
      ...(payload.context ?? {}),
    },
  };
}

function normalizeAgentResponse(raw: unknown, fallbackRequestId: string): IskraAgentResponse {
  const source = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const trace = source.trace && typeof source.trace === "object" ? source.trace as Record<string, unknown> : {};

  const replyCandidate = source.reply ?? source.output_text ?? source.message ?? source.content;
  const statusCandidate = source.status;

  return {
    reply: typeof replyCandidate === "string" ? replyCandidate : JSON.stringify(raw),
    status: statusCandidate === "partial" || statusCandidate === "blocked" || statusCandidate === "error" ? statusCandidate : "ok",
    actions: Array.isArray(source.actions) ? source.actions : [],
    trace: {
      facts: Array.isArray(trace.facts) ? trace.facts : [],
      hypotheses: Array.isArray(trace.hypotheses) ? trace.hypotheses : [],
      risks: Array.isArray(trace.risks) ? trace.risks : [],
    },
    delta: source.delta && typeof source.delta === "object" ? source.delta as Record<string, unknown> : {},
    artifact_receipt: source.artifact_receipt && typeof source.artifact_receipt === "object"
      ? source.artifact_receipt as Record<string, unknown>
      : null,
    request_id: typeof source.request_id === "string" ? source.request_id : fallbackRequestId,
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  // CORS preflight
  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(origin)) {
      return json({ error: "Origin not allowed" }, { status: 403 }, origin);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, { status: 405 }, origin);
  }

  // Origin check for actual requests
  if (origin && !isOriginAllowed(origin)) {
    return json({ error: "Origin not allowed" }, { status: 403 }, origin);
  }

  // Authentication: require a valid Supabase JWT (signature verified via /auth/v1/user)
  const token = extractBearerToken(req);
  if (!token) {
    return json({ error: "Missing Authorization bearer token" }, { status: 401 }, origin);
  }

  const jwt = await validateJwt(token);
  if (!jwt) {
    return json({ error: "Invalid or expired token" }, { status: 401 }, origin);
  }

  // Rate limiting (per user, fallback to IP) — protects the billed upstream agent API
  const rl = rateLimit(req, jwt.sub);
  if (rl) return rl;

  const agentId = Deno.env.get("AGENT_ID");
  const agentToken = Deno.env.get("AGENT_ACCESS_TOKEN");

  if (!agentId || !agentToken) {
    return json({ error: "agent_not_configured" }, { status: 500 }, origin);
  }

  const payload = await req.json().catch(() => null) as IskraAgentRequest | null;
  if (!payload || typeof payload !== "object") {
    return json({ error: "invalid_json" }, { status: 400 }, origin);
  }

  const input = normalizePayload(payload, jwt.sub);
  const rid = typeof input.request_id === "string" ? input.request_id : requestId();

  const agentResponse = await fetch(`${AGENT_API_BASE}/${agentId}/trigger`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${agentToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  const raw = await agentResponse.json().catch(() => ({}));

  if (!agentResponse.ok) {
    return json({
      reply: "Agent API request failed.",
      status: "error",
      actions: [],
      trace: { facts: [], hypotheses: [], risks: [raw] },
      delta: {},
      artifact_receipt: null,
      request_id: rid,
    }, { status: 502 }, origin);
  }

  return json(normalizeAgentResponse(raw, rid), {}, origin);
});
